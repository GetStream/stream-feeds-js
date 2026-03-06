import type {
  ConnectionChangedEvent,
  UnhandledErrorEvent,
} from './common/real-time/event-models';
import type { NetworkChangedEvent } from './common/types';
import type { OwnUserResponse, PagerResponse, WSEvent } from './gen/models';
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

export type ConnectedUser = OwnUserResponse & { name?: string; image?: string };

/**
 * Result of the onNewActivity callback: whether to add a new activity to the feed and where.
 * - 'add-to-start': prepend to the activities list (e.g. new posts at top)
 * - 'add-to-end': append to the activities list (e.g. stories)
 * - 'ignore': do not add to the feed
 */
export type OnNewActivityResult = 'add-to-start' | 'add-to-end' | 'ignore';

/**
 * Callback invoked when a new activity is received (WebSocket event or addActivity HTTP response).
 * Return how the feed should handle it.
 */
export type OnNewActivityCallback = (params: {
  activity: ActivityResponse;
  currentUser: ConnectedUser | undefined;
}) => OnNewActivityResult;
