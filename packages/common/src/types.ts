export type StreamClientOptions = {
  baseUrl?: string;
  timeout?: number;
};

export interface RateLimit {
  rateLimit?: number;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
}

export interface RequestMetadata {
  responseHeaders: Record<string, string>;
  rateLimit: RateLimit;
  responseCode: number;
  clientRequestId: string;
}

export type StreamResponse<T> = T & {
  metadata: RequestMetadata;
};

export class StreamApiError extends Error {
  constructor(
    message: string,
    public metadata?: Partial<RequestMetadata>,
    public code?: number,
    errorOptions?: ErrorOptions,
  ) {
    super(message, errorOptions);
  }
}
