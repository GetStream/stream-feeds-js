import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from 'axios';
import { RequestMetadata, StreamApiError, StreamClientOptions } from './types';
import { getRateLimitFromResponseHeader } from './rate-limit';
import { randomId } from './utils';
import { TokenManager } from './TokenManager';

export class ApiClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(
    public readonly apiKey: string,
    private readonly tokenManager: TokenManager,
    options?: StreamClientOptions,
  ) {
    this.axiosInstance = axios.create({
      baseURL: options?.baseUrl ?? 'https://chat.stream-io-api.com',
      timeout: options?.timeout ?? 3000,
    });
  }

  sendRequest = async <T>(
    method: string,
    url: string,
    pathParams?: Record<string, string>,
    queryParams?: Record<string, any>,
    body?: any,
  ) => {
    queryParams = queryParams ?? {};
    queryParams.api_key = this.apiKey;
    const encodedParams = this.queryParamsStringify(queryParams);
    if (pathParams) {
      Object.keys(pathParams).forEach((paramName) => {
        url = url.replace(
          `{${paramName}}`,
          encodeURIComponent(pathParams[paramName]),
        );
      });
    }
    url += `?${encodedParams}`;
    const clientRequestId = randomId();

    // TODO: handle expired token
    const token = await this.tokenManager.getToken();

    const headers: RawAxiosRequestHeaders = {
      Authorization: token,
      'stream-auth-type': 'jwt',
      'Content-Type': 'application/json',
      'X-Stream-Client': 'stream-feeds-js-',
      'Accept-Encoding': 'gzip',
      'x-client-request-id': clientRequestId,
    };

    try {
      const response = await this.axiosInstance.request<T>({
        url,
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

  protected isAxiosError(error: any | AxiosError): error is AxiosError {
    return typeof error.request !== 'undefined';
  }

  protected queryParamsStringify = (params: Record<string, any>) => {
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

  protected getRequestMetadata = (
    requestId: string,
    response: AxiosResponse,
  ) => {
    const responseHeaders = response.headers as Record<string, string>;
    return {
      clientRequestId: requestId,
      responseHeaders,
      responseCode: response.status,
      rateLimit: getRateLimitFromResponseHeader(responseHeaders),
    };
  };
}
