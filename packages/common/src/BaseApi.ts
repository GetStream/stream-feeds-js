import {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from 'axios';
import { RequestMetadata, StreamApiError } from './types';
import { v4 as uuidv4 } from 'uuid';
import { getRateLimitFromResponseHeader } from './rate-limit';

export class BaseApi {
  constructor(
    protected axios: AxiosInstance,
    public readonly apiKey: string,
    protected tokenProvider?: () => string | Promise<string>,
  ) {}

  protected sendRequest = async <T>(
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
    const clientRequestId = uuidv4();

    if (!this.tokenProvider) {
      throw new Error(`Can't send Stream API requests without token provider`);
    }

    const token = await this.tokenProvider();

    const headers: RawAxiosRequestHeaders = {
      Authorization: token,
      'stream-auth-type': 'jwt',
      'Content-Type': 'application/json',
      'X-Stream-Client': 'stream-feeds-js-',
      'Accept-Encoding': 'gzip',
      'x-client-request-id': clientRequestId,
    };

    try {
      const response = await this.axios.request<T>({
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
      error = error as AxiosError;
      if (!error.response) {
        throw new StreamApiError(`Stream error ${error.message}`);
      } else {
        // Stream specific error response
        const data = error.response.data;
        const code = data?.code ?? error.response.status;
        const message = data?.message ?? error.response.statusText;
        throw new StreamApiError(
          `Stream error code ${code}: ${message}`,
          this.getRequestMetadata(clientRequestId, error.response),
          code,
          undefined,
        );
      }
    }
  };

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
      responseHeaders: responseHeaders,
      responseCode: response.status,
      rateLimit: getRateLimitFromResponseHeader(responseHeaders),
    };
  };
}
