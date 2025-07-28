import type { Feed, FeedState } from '../../../feed';
import type { FollowResponse } from '../../../gen/models';
import type {
  EventPayload,
  PartializeAllBut,
  UpdateStateResult,
} from '../../../types-internal';

import { isFeedResponse } from '../../../utils';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';

export const updateStateFollowDeleted = (
  follow:
    | FollowResponse
    | { source_feed: { fid: string }; target_feed: { fid: string } },
  currentState: FeedState,
  currentFeedId: string,
  connectedUserId?: string,
): UpdateStateResult<{ data: FeedState }> => {
  let newState: FeedState = { ...currentState };

  // this feed unfollowed someone
  if (follow.source_feed.fid === currentFeedId) {
    newState = {
      ...newState,
      // Update FeedResponse fields, that has the new follower/following count
      ...follow.source_feed,
    };

    // Only update if following array already exists
    if (currentState.following !== undefined) {
      newState.following = currentState.following.filter(
        (followItem) => followItem.target_feed.fid !== follow.target_feed.fid,
      );
    }
  } else if (
    // someone unfollowed this feed
    follow.target_feed.fid === currentFeedId
  ) {
    const source = follow.source_feed;

    newState = {
      ...newState,
      // Update FeedResponse fields, that has the new follower/following count
      ...follow.target_feed,
    };

    if (
      isFeedResponse(source) &&
      source.created_by.id === connectedUserId &&
      currentState.own_follows !== undefined
    ) {
      newState.own_follows = currentState.own_follows.filter(
        (followItem) => followItem.source_feed.fid !== follow.source_feed.fid,
      );
    }

    // Only update if followers array already exists
    if (currentState.followers !== undefined) {
      newState.followers = currentState.followers.filter(
        (followItem) => followItem.source_feed.fid !== follow.source_feed.fid,
      );
    }
  }

  return { changed: true, data: newState };
};

export function handleFollowDeleted(
  this: Feed,
  eventOrResponse:
    | PartializeAllBut<EventPayload<'feeds.follow.deleted'>, 'follow'>
    | {
        follow: { source_feed: { fid: string }; target_feed: { fid: string } };
      },
) {
  const follow = eventOrResponse.follow;

  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(follow, 'deleted'),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
    })
  ) {
    return;
  }

  const connectedUser = this.client.state.getLatestValue().connected_user;
  const result = updateStateFollowDeleted(
    follow,
    this.currentState,
    this.fid,
    connectedUser?.id,
  );

  if (result.changed) {
    this.state.next(result.data);
  }
}
