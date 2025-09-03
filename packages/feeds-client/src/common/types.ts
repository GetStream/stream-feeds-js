import type { Logger, LogLevel } from '../utils/logger';

export * from './search/types';

export type FeedsClientOptions = {
  base_url?: string;
  timeout?: number;
  logger?: Logger;
  log_level?: LogLevel;
};

export type RateLimit = {
  rate_limit?: number;
  rate_limit_remaining?: number;
  rate_limit_reset?: Date;
};

export type RequestMetadata = {
  response_headers: Record<string, string>;
  rate_limit: RateLimit;
  response_code: number;
  client_request_id: string;
};

export type StreamResponse<T> = T & {
  metadata: RequestMetadata;
};

export class StreamApiError extends Error {
  public name = 'StreamApiError';
  constructor(
    message: string,
    public metadata?: Partial<RequestMetadata>,
    public code?: number,
    errorOptions?: ErrorOptions,
  ) {
    super(message, errorOptions);
  }
}

export interface NetworkChangedEvent {
  type: 'network.changed';
  online: boolean;
}
