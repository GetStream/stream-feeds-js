import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from 'axios';
import { RequestMetadata, StreamApiError, FeedsClientOptions } from './types';
import { getRateLimitFromResponseHeader } from './rate-limit';
import { KnownCodes, randomId } from './utils';
import { TokenManager } from './TokenManager';
import { ConnectionIdManager } from './ConnectionIdManager';
// this gets replaced during the build process (var version = 'x.y.z';)
import { version } from '../../package.json';

type RequiredAtLeastOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

// Information that can be set to be sent as part of the header of each request
export type ExtraHeaderInformation = Partial<{
  sdkIdentifier: { name: string; version: string };
  deviceIdentifier: RequiredAtLeastOne<{ os: string; model: string }>;
}>;

export class ApiClient {
  public readonly baseUrl: string;
  private readonly axiosInstance: AxiosInstance;
  private timeout: number;
  public extraHeaderInformation: ExtraHeaderInformation = {};

  constructor(
    public readonly apiKey: string,
    private readonly tokenManager: TokenManager,
    private readonly connectionIdManager: ConnectionIdManager,
    options?: FeedsClientOptions,
  ) {
    this.baseUrl = options?.base_url ?? 'https://feeds.stream-io-api.com';
    this.timeout = options?.timeout ?? 3000;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
    });
  }

  sendRequest = async <T>(
    method: string,
    url: string,
    pathParams?: Record<string, string>,
    queryParams?: Record<string, any>,
    body?: any,
    requestContentType?: string,
  ): Promise<{ body: T; metadata: RequestMetadata }> => {
    queryParams = queryParams ?? {};
    queryParams.api_key = this.apiKey;

    if (
      queryParams?.watch ||
      queryParams?.presence ||
      queryParams?.payload?.watch ||
      queryParams?.payload?.presence ||
      body?.watch ||
      body?.presence
    ) {
      const connectionId = await this.connectionIdManager.getConnectionId();
      queryParams.connection_id = connectionId;
    }

    let requestUrl = url;
    if (pathParams) {
      Object.keys(pathParams).forEach((paramName) => {
        requestUrl = requestUrl.replace(
          `{${paramName}}`,
          encodeURIComponent(pathParams[paramName]),
        );
      });
    }
    const client_request_id = randomId();

    const token = await this.tokenManager.getToken();

    const headers: RawAxiosRequestHeaders = {
      ...this.commonHeaders,
      Authorization: token,
      'Content-Type': requestContentType ?? 'application/json',
      'x-client-request-id': client_request_id,
    };

    const encodedBody =
      requestContentType === 'multipart/form-data' ? new FormData() : body;
    if (requestContentType === 'multipart/form-data') {
      Object.keys(body).forEach((key) => {
        const value = body[key];
        if (value != null) {
          encodedBody.append(key, value);
        }
      });
    }

    try {
      const response = await this.axiosInstance.request<T>({
        url: requestUrl,
        method,
        headers,
        params: queryParams,
        paramsSerializer: (params) => this.queryParamsStringify(params),
        data: encodedBody,
        timeout:
          // multipart/form-data requests should not have a timeout allowing ample time for file uploads
          requestContentType === 'multipart/form-data' ? 0 : this.timeout,
      });

      const metadata: RequestMetadata = this.getRequestMetadata(
        client_request_id,
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
            return await this.sendRequest(
              method,
              url,
              pathParams,
              queryParams,
              body,
            );
          }
          throw new StreamApiError(
            `Stream error code ${code}: ${message}`,
            this.getRequestMetadata(client_request_id, error.response),
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

    return `${wsBaseURL}/api/v2/connect?${params.toString()}`;
  }

  public generateStreamClientHeader() {
    // TODO: figure out a way to inject this during the build process
    const clientBundle = import.meta.env.VITE_CLIENT_BUNDLE;

    let userAgentString = '';
    if (this.extraHeaderInformation.sdkIdentifier) {
      userAgentString = `stream-feeds-${this.extraHeaderInformation.sdkIdentifier.name}-v${this.extraHeaderInformation.sdkIdentifier.version}-llc-v${version}`;
    } else {
      userAgentString = `stream-feeds-js-v${version}`;
    }

    const { os, model } = this.extraHeaderInformation.deviceIdentifier ?? {};

    return (
      [
        // reports the device OS, if provided
        ['os', os],
        // reports the device model, if provided
        ['device_model', model],
        // reports which bundle is being picked from the exports
        ['client_bundle', clientBundle],
      ] as const
    ).reduce(
      (withArguments, [key, value]) =>
        value && value.length > 0
          ? withArguments.concat(`|${key}=${value}`)
          : withArguments,
      userAgentString,
    );
  }

  private get commonHeaders(): Record<string, string> {
    return {
      'stream-auth-type': 'jwt',
      'X-Stream-Client': this.generateStreamClientHeader(),
    };
  }

  private isAxiosError(error: any | AxiosError): error is AxiosError {
    return typeof error.request !== 'undefined';
  }

  private readonly queryParamsStringify = (params: Record<string, any>) => {
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

  private readonly getRequestMetadata = (
    requestId: string,
    response: AxiosResponse,
  ) => {
    const response_headers = response.headers as Record<string, string>;
    return {
      client_request_id: requestId,
      response_headers,
      response_code: response.status,
      rate_limit: getRateLimitFromResponseHeader(response_headers),
    };
  };
}
