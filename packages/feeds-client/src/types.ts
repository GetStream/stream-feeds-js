import type {
  ConnectionChangedEvent,
  UnhandledErrorEvent,
} from './common/real-time/event-models';
import type { NetworkChangedEvent } from './common/types';
import type { PagerResponse, WSEvent } from './gen/models';
import type { ActivityResponse, CommentResponse } from './gen/models';
import type { FeedsClient } from './feeds-client';

export type FeedsEvent =
  | WSEvent
  | ConnectionChangedEvent
  | NetworkChangedEvent
  | UnhandledErrorEvent;
export type ActivityIdOrCommentId = string;

export type GetCommentsRequest = Parameters<FeedsClient['getComments']>[0];

export type GetCommentsRepliesRequest = Parameters<
  FeedsClient['getCommentReplies']
>[0];

export type PagerResponseWithLoadingStates = PagerResponse & LoadingStates;

export type LoadingStates = {
  loading_next_page?: boolean;
  loading_prev_page?: boolean;
};

export type TokenOrProvider = string | TokenProvider;

export type TokenProvider = () => Promise<string>;

export type StreamFile = File | { name: string; uri: string; type: string };

export type CommentParent = ActivityResponse | CommentResponse;
