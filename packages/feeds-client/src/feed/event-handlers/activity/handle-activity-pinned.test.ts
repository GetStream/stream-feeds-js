import { describe, it, expect, beforeEach } from 'vitest';

import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityPinned } from './handle-activity-pinned';
import {
  generateActivityPinnedEvent,
  generateActivityPinResponse,
  generateFeedResponse,
  generateOwnUser,
  generateUserResponseCommonFields,
  getHumanId,
} from '../../../test-utils/response-generators';
import type { ActivityPinResponse } from '../../../gen/models';
import { shouldUpdateState } from '../../../utils';

describe(handleActivityPinned.name, () => {
  let feed: Feed;
  let client: FeedsClient;
  let pinnedActivity: ActivityPinResponse;
  let otherPinnedActivity: ActivityPinResponse;
  let currentUserId: string;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    currentUserId = getHumanId();
    client.state.partialNext({
      connected_user: generateOwnUser({ id: currentUserId }),
    });

    const feedResponse = generateFeedResponse({
      id: 'main',
      group_id: 'user',
      created_by: { id: currentUserId },
    });
    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
    pinnedActivity = generateActivityPinResponse();
    otherPinnedActivity = generateActivityPinResponse();
    feed.state.next((currentState) => ({
      ...currentState,
      pinned_activities: [otherPinnedActivity],
    }));
  });

  it('adds a new activity to pinned_activities', () => {
    const event = generateActivityPinnedEvent({
      pinned_activity: pinnedActivity,
    });
    handleActivityPinned.call(feed, event);
    const { pinned_activities } = feed.currentState;
    expect(pinned_activities).toHaveLength(2);
    expect(pinned_activities![0].activity.id).toBe(pinnedActivity.activity.id);
    expect(pinned_activities![1]).toBe(otherPinnedActivity);
  });

  it('creates pinned_activities if it was undefined', () => {
    feed.state.next((currentState) => ({
      ...currentState,
      pinned_activities: undefined,
    }));
    const event = generateActivityPinnedEvent({
      pinned_activity: pinnedActivity,
    });
    handleActivityPinned.call(feed, event);
    const { pinned_activities } = feed.currentState;
    expect(pinned_activities).toHaveLength(1);
    expect(pinned_activities![0].activity.id).toBe(pinnedActivity.activity.id);
  });

  describe(`Activity pinned ${shouldUpdateState.name} integration`, () => {
    let currentUserPayload: ReturnType<typeof generateActivityPinnedEvent>;

    beforeEach(() => {
      currentUserPayload = generateActivityPinnedEvent({
        pinned_activity: pinnedActivity,
        user: generateUserResponseCommonFields({ id: currentUserId }),
      });

      feed.state.partialNext({ watch: true });
    });

    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // 1. HTTP then WS
      handleActivityPinned.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleActivityPinned.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // Reset state for reverse order test
      feed.state.partialNext({
        pinned_activities: [otherPinnedActivity],
      });

      // 2. WS then HTTP
      handleActivityPinned.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleActivityPinned.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again after clearing the stateUpdateQueue', () => {
      handleActivityPinned.call(feed, currentUserPayload, false);

      expect(feed.currentState.pinned_activities).toHaveLength(2);

      // Reset state and clear queue
      feed.state.partialNext({
        pinned_activities: [otherPinnedActivity],
      });
      (feed as any).stateUpdateQueue.clear();

      handleActivityPinned.call(feed, currentUserPayload);

      expect(feed.currentState.pinned_activities).toHaveLength(2);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the event', () => {
      const otherUserPayload = generateActivityPinnedEvent({
        pinned_activity: pinnedActivity,
        user: generateUserResponseCommonFields({ id: getHumanId() }),
      });

      handleActivityPinned.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      // Reset state so the second call has something to add
      feed.state.partialNext({
        pinned_activities: [otherPinnedActivity],
      });

      handleActivityPinned.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(feed.currentState.pinned_activities).toHaveLength(2);
    });

    it('does not deduplicate when watch is false', () => {
      feed.state.partialNext({ watch: false });

      handleActivityPinned.call(feed, currentUserPayload, false);
      handleActivityPinned.call(feed, currentUserPayload);

      expect(feed.currentState.pinned_activities).toHaveLength(3);
      expect((feed as any).stateUpdateQueue).toEqual(new Set());
    });
  });
});
