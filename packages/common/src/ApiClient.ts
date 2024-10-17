import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from 'axios';
import { RequestMetadata, StreamApiError, StreamClientOptions } from './types';
import { getRateLimitFromResponseHeader } from './rate-limit';
import { KnownCodes, randomId } from './utils';
import { TokenManager } from './TokenManager';
import { ConnectionIdManager } from './ConnectionIdManager';

export class ApiClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;

  constructor(
    public readonly apiKey: string,
    private readonly tokenManager: TokenManager,
    private readonly connectionIdManager: ConnectionIdManager,
    options?: StreamClientOptions,
  ) {
    this.baseUrl = options?.baseUrl ?? 'https://video.stream-io-api.com';
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: options?.timeout ?? 3000,
    });
  }

  sendRequest = async <T>(
    method: string,
    url: string,
    pathParams?: Record<string, string>,
    queryParams?: Record<string, any>,
    body?: any,
  ): Promise<{ body: T; metadata: RequestMetadata }> => {
    queryParams = queryParams ?? {};
    queryParams.api_key = this.apiKey;
    const encodedParams = this.queryParamsStringify(queryParams);
    let requestUrl = url;
    if (pathParams) {
      Object.keys(pathParams).forEach((paramName) => {
        requestUrl = requestUrl.replace(
          `{${paramName}}`,
          encodeURIComponent(pathParams[paramName]),
        );
      });
    }
    requestUrl += `?${encodedParams}`;
    const clientRequestId = randomId();

    console.log('get token', url);
    const token = await this.tokenManager.getToken();

    const headers: RawAxiosRequestHeaders = {
      ...this.commonHeaders,
      Authorization: token,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
      'x-client-request-id': clientRequestId,
    };

    try {
      const response = await this.axiosInstance.request<T>({
        url: requestUrl,
        method,
        headers,
        params: queryParams,
        data: body,
      });

      const metadata: RequestMetadata = this.getRequestMetadata(
        clientRequestId,
        response,
      );

      return { body: response.data, metadata };
    } catch (error: any) {
      if (this.isAxiosError(error)) {
        if (!error.response) {
          throw new StreamApiError(`Stream error ${error.message}`);
        } else {
          // Stream specific error response
          const data = error.response.data as StreamApiError;
          const code = data?.code ?? error.response.status;
          const message = data?.message ?? error.response.statusText;
          if (
            code === KnownCodes.TOKEN_EXPIRED &&
            error.response.status === 401 &&
            !this.tokenManager.isStatic()
          ) {
            await this.tokenManager.loadToken();
            return this.sendRequest(method, url, pathParams, queryParams, body);
          }
          throw new StreamApiError(
            `Stream error code ${code}: ${message}`,
            this.getRequestMetadata(clientRequestId, error.response),
            code,
            undefined,
          );
        }
      } else {
        throw new Error('Unknown error received during an API call', {
          cause: error,
        });
      }
    }
  };

  get webSocketBaseUrl() {
    const params = new URLSearchParams();
    params.set('api_key', this.apiKey);
    Object.keys(this.commonHeaders).forEach((key) => {
      params.set(key, this.commonHeaders[key]);
    });

    const wsBaseURL = this.baseUrl
      .replace('http', 'ws')
      .replace(':3030', ':8800');

    return `${wsBaseURL}/video/connect?${params.toString()}`;
  }

  private get commonHeaders(): Record<string, string> {
    return {
      'stream-auth-type': 'jwt',
      // TODO: add version here
      'X-Stream-Client': 'stream-feeds-js-',
    };
  }

  private isAxiosError(error: any | AxiosError): error is AxiosError {
    return typeof error.request !== 'undefined';
  }

  private queryParamsStringify = (params: Record<string, any>) => {
    const newParams = [];
    for (const k in params) {
      const param = params[k];
      if (Array.isArray(param)) {
        newParams.push(`${k}=${encodeURIComponent(param.join(','))}`);
      } else if (param instanceof Date) {
        newParams.push(param.toISOString());
      } else if (typeof param === 'object') {
        newParams.push(`${k}=${encodeURIComponent(JSON.stringify(param))}`);
      } else {
        if (
          typeof param === 'string' ||
          typeof param === 'number' ||
          typeof param === 'boolean'
        ) {
          newParams.push(`${k}=${encodeURIComponent(param)}`);
        }
      }
    }

    return newParams.join('&');
  };

  private getRequestMetadata = (requestId: string, response: AxiosResponse) => {
    const responseHeaders = response.headers as Record<string, string>;
    return {
      clientRequestId: requestId,
      responseHeaders,
      responseCode: response.status,
      rateLimit: getRateLimitFromResponseHeader(responseHeaders),
    };
  };
}
