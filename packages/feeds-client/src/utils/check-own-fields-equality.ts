import type { FeedState } from '../feed';
import type { FeedResponse } from '../gen/models';

export const isOwnFollowsEqual = (
  currentState: FeedState,
  newState: FeedResponse,
) => {
  const existingFollows = new Set(
    currentState.own_follows?.map(
      (f) =>
        `${f.source_feed.feed}:${f.target_feed.feed}:${f.updated_at.getTime()}`,
    ),
  );
  const newFollows = new Set(
    newState.own_follows?.map(
      (f) =>
        `${f.source_feed.feed}:${f.target_feed.feed}:${f.updated_at.getTime()}`,
    ),
  );
  if (existingFollows.size === newFollows.size) {
    const areEqual = Array.from(existingFollows).every((f) =>
      newFollows.has(f),
    );
    if (areEqual) {
      return true;
    }
  }

  return false;
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
    currentState.own_capabilities?.sort().join(',') ===
    newState.own_capabilities?.sort().join(',')
  );
};
