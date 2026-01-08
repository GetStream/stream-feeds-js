import type { FeedState } from '../feed';
import type { FeedResponse, FollowResponse } from '../gen/models';

const areFollowArraysEqual = (
  currentFollows: FollowResponse[] | undefined,
  newFollows: FollowResponse[] | undefined,
): boolean => {
  const existingFollows = new Set(
    currentFollows?.map(
      (f) =>
        `${f.source_feed.feed}:${f.target_feed.feed}:${f.updated_at.getTime()}`,
    ),
  );
  const newFollowsSet = new Set(
    newFollows?.map(
      (f) =>
        `${f.source_feed.feed}:${f.target_feed.feed}:${f.updated_at.getTime()}`,
    ),
  );
  if (existingFollows.size === newFollowsSet.size) {
    const areEqual = Array.from(existingFollows).every((f) =>
      newFollowsSet.has(f),
    );
    if (areEqual) {
      return true;
    }
  }

  return false;
};

export const isOwnFollowsEqual = (
  currentState: FeedState,
  newState: FeedResponse,
) => {
  return areFollowArraysEqual(currentState.own_follows, newState.own_follows);
};

export const isOwnMembershipEqual = (
  currentState: FeedState,
  newState: FeedResponse,
) => {
  return (
    (currentState.own_membership?.updated_at.getTime() ?? 0) ===
    (newState.own_membership?.updated_at.getTime() ?? 0)
  );
};

export const isOwnCapabilitiesEqual = (
  currentState: FeedState,
  newState: FeedResponse,
) => {
  return (
    currentState.own_capabilities?.toSorted().join(',') ===
    newState.own_capabilities?.toSorted().join(',')
  );
};

export const isOwnFollowingsEqual = (
  currentState: FeedState,
  newState: FeedResponse,
) => {
  return areFollowArraysEqual(
    currentState.own_followings,
    newState.own_followings,
  );
};
