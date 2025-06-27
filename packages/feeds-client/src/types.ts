import { ConnectionChangedEvent } from './common/real-time/event-models';
import { NetworkChangedEvent } from './common/types';
import { PagerResponse, WSEvent } from './gen/models';
import { FeedsClient } from './FeedsClient';

export type FeedsEvent = WSEvent | ConnectionChangedEvent | NetworkChangedEvent;
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
