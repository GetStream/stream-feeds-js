import { CommonApiInterface } from './gen/common/CommonApiInterface';
import { UpdateUsersResponse, UserRequest } from './gen/models';
import { ModerationClient } from './ModerationClient';
import { StreamWSEvent } from './real-time/event-models';

export type StreamClientOptions = {
  base_url?: string;
  timeout?: number;
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
  connectUser: (
    user: UserRequest,
    tokenProvider: string | (() => Promise<string>),
  ) => Promise<void>;
  disconnectUser: () => Promise<void>;
  upsertUsers: (
    users: UserRequest[],
  ) => Promise<StreamResponse<UpdateUsersResponse>>;
}
