import type { Feed, FeedState } from '../../../feed';
import type { FollowResponse } from '../../../gen/models';
import type {
  EventPayload,
  PartializeAllBut,
  UpdateStateResult,
} from '../../../types-internal';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';

export const updateStateFollowCreated = (
  follow: FollowResponse,
  currentState: FeedState,
  currentFeedId: string,
  connectedUserId?: string,
): UpdateStateResult<{ data: FeedState }> => {
  // filter non-accepted follows (the way getOrCreate does by default)
  if (follow.status !== 'accepted') {
    return { changed: false, data: currentState };
  }

  let newState: FeedState = { ...currentState };

  // this feed followed someone
  if (follow.source_feed.feed === currentFeedId) {
    newState = {
      ...newState,
      // Update FeedResponse fields, that has the new follower/following count
      ...follow.source_feed,
    };

    // Only update if following array already exists
    if (currentState.following !== undefined) {
      newState.following = [follow, ...currentState.following];
    }
  } else if (
    // someone followed this feed
    follow.target_feed.feed === currentFeedId
  ) {
    const source = follow.source_feed;

    newState = {
      ...newState,
      // Update FeedResponse fields, that has the new follower/following count
      ...follow.target_feed,
    };

    if (source.created_by.id === connectedUserId) {
      newState.own_follows = currentState.own_follows
        ? currentState.own_follows.concat(follow)
        : [follow];
    }

    // Only update if followers array already exists
    if (currentState.followers !== undefined) {
      newState.followers = [follow, ...currentState.followers];
    }
  }

  return { changed: true, data: newState };
};

export function handleFollowCreated(
  this: Feed,
  eventOrResponse: PartializeAllBut<
    EventPayload<'feeds.follow.created'>,
    'follow'
  >,
) {
  const follow = eventOrResponse.follow;

  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(follow, 'created'),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
    })
  ) {
    return;
  }
  const connectedUser = this.client.state.getLatestValue().connected_user;
  const result = updateStateFollowCreated(
    follow,
    this.currentState,
    this.feed,
    connectedUser?.id,
  );
  if (result.changed) {
    this.state.next(result.data);
  }
}
