import { FeedState } from '../Feed';
import { FollowResponse, FeedResponse } from '../gen/models';
import { UpdateStateResult } from '../types-internal';

const isFeedResponse = (
  follow: FeedResponse | { fid: string },
): follow is FeedResponse => {
  return 'created_by' in follow;
};

export const handleFollowCreated = (
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
  if (follow.source_feed.fid === currentFeedId) {
    newState = {
      ...newState,
      ...follow.source_feed,
    };

    // Only update if following array already exists
    if (currentState.following !== undefined) {
      newState.following = [follow, ...currentState.following];
    }
  } else if (
    // someone followed this feed
    follow.target_feed.fid === currentFeedId
  ) {
    const source = follow.source_feed;

    newState = {
      ...newState,
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

export const handleFollowDeleted = (
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

export const handleFollowUpdated = (
  currentState: FeedState,
): UpdateStateResult<{ data: FeedState }> => {
  // For now, we'll treat follow updates as no-ops since the current implementation does
  // This can be enhanced later if needed
  return { changed: false, data: currentState };
};
