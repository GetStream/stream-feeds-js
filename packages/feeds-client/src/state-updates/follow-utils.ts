import {
  FollowCreatedEvent,
  FollowDeletedEvent,
  FollowUpdatedEvent,
  FollowResponse,
} from '../gen/models';
import { UpdateStateResult } from '../types-internal';

export type FollowState = {
  followers?: FollowResponse[];
  following?: FollowResponse[];
  own_follows?: FollowResponse[];
  followers_pagination?: { next?: string; sort?: any };
  following_pagination?: { next?: string; sort?: any };
};

export const handleFollowCreated = (
  event: FollowCreatedEvent,
  currentState: FollowState,
  currentFeedId: string,
  connectedUserId?: string,
): UpdateStateResult<FollowState> => {
  // filter non-accepted follows (the way getOrCreate does by default)
  if (event.follow.status !== 'accepted') {
    return { changed: false, ...currentState };
  }

  let newState: FollowState = { ...currentState };

  // this feed followed someone
  if (event.follow.source_feed.fid === currentFeedId) {
    newState = {
      ...newState,
      ...event.follow.source_feed,
    };

    // Only update if following array already exists
    if (currentState.following !== undefined) {
      newState.following = [event.follow, ...currentState.following];
    }
  } else if (
    // someone followed this feed
    event.follow.target_feed.fid === currentFeedId
  ) {
    const source = event.follow.source_feed;

    newState = {
      ...newState,
      ...event.follow.target_feed,
    };

    if (source.created_by.id === connectedUserId) {
      newState.own_follows = currentState.own_follows
        ? currentState.own_follows.concat(event.follow)
        : [event.follow];
    }

    // Only update if followers array already exists
    if (currentState.followers !== undefined) {
      newState.followers = [event.follow, ...currentState.followers];
    }
  }

  return { changed: true, ...newState };
};

export const handleFollowDeleted = (
  event: FollowDeletedEvent,
  currentState: FollowState,
  currentFeedId: string,
  connectedUserId?: string,
): UpdateStateResult<FollowState> => {
  let newState: FollowState = { ...currentState };

  // this feed unfollowed someone
  if (event.follow.source_feed.fid === currentFeedId) {
    newState = {
      ...newState,
      ...event.follow.source_feed,
    };

    // Only update if following array already exists
    if (currentState.following !== undefined) {
      newState.following = currentState.following.filter(
        (follow) => follow.target_feed.fid !== event.follow.target_feed.fid,
      );
    }
  } else if (
    // someone unfollowed this feed
    event.follow.target_feed.fid === currentFeedId
  ) {
    const source = event.follow.source_feed;

    newState = {
      ...newState,
      ...event.follow.target_feed,
    };

    if (
      source.created_by.id === connectedUserId &&
      currentState.own_follows !== undefined
    ) {
      newState.own_follows = currentState.own_follows.filter(
        (follow) => follow.source_feed.fid !== event.follow.source_feed.fid,
      );
    }

    // Only update if followers array already exists
    if (currentState.followers !== undefined) {
      newState.followers = currentState.followers.filter(
        (follow) => follow.source_feed.fid !== event.follow.source_feed.fid,
      );
    }
  }

  return { changed: true, ...newState };
};

export const handleFollowUpdated = (
  event: FollowUpdatedEvent,
  currentState: FollowState,
  currentFeedId: string,
  connectedUserId?: string,
): UpdateStateResult<FollowState> => {
  // For now, we'll treat follow updates as no-ops since the current implementation does
  // This can be enhanced later if needed
  return { changed: false, ...currentState };
};
