import { CommonApiInterface } from './gen/common/CommonApiInterface';
import { UserRequest } from './gen/models';
import { ModerationClient } from './ModerationClient';
import { StreamWSEvent } from './real-time/event-models';

export type StreamClientOptions = {
  baseUrl?: string;
  timeout?: number;
};

export type RateLimit = {
  rateLimit?: number;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
};

export type RequestMetadata = {
  responseHeaders: Record<string, string>;
  rateLimit: RateLimit;
  responseCode: number;
  clientRequestId: string;
};

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

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface NetworkChangedEvent {
  type: 'network.changed';
  online: boolean;
}

export type StreamEvent = StreamWSEvent | NetworkChangedEvent;

export interface ProductApiInferface extends CommonApiInterface {
  moderation: ModerationClient;
  connectUser(
    user: UserRequest,
    tokenProvider: string | (() => Promise<string>),
  ): Promise<void>;
  disconnectUser(): Promise<void>;
}
