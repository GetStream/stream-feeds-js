import { describe, it, expect, beforeEach } from 'vitest';

import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityUnpinned } from './handle-activity-unpinned';
import {
  generateActivityPinResponse,
  generateFeedResponse,
  generateOwnUser,
  generateUserResponseCommonFields,
  getHumanId,
} from '../../../test-utils/response-generators';
import type { ActivityPinResponse } from '../../../gen/models';
import type { EventPayload } from '../../../types-internal';
import { shouldUpdateState } from '../../../utils';

// Helper to construct the event payload for 'feeds.activity.unpinned'
function makeUnpinnedEvent(
  pinnedActivity: ActivityPinResponse,
): EventPayload<'feeds.activity.unpinned'> {
  return {
    type: 'feeds.activity.unpinned',
    created_at: pinnedActivity.created_at,
    fid: pinnedActivity.feed,
    custom: {},
    pinned_activity: {
      created_at: pinnedActivity.created_at,
      duration: '0',
      feed: pinnedActivity.feed,
      user_id: pinnedActivity.user.id,
      activity: pinnedActivity.activity,
    },
    user: pinnedActivity.user,
  };
}

describe(handleActivityUnpinned.name, () => {
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
      pinned_activities: [pinnedActivity, otherPinnedActivity],
    }));
  });

  it('removes the correct activity from pinned_activities', () => {
    const event = makeUnpinnedEvent(pinnedActivity);
    handleActivityUnpinned.call(feed, event);
    const { pinned_activities } = feed.currentState;
    expect(pinned_activities).toHaveLength(1);
    expect(pinned_activities![0]).toBe(otherPinnedActivity);
  });

  it('does nothing if the activity is not found', () => {
    const unrelatedActivity = generateActivityPinResponse();
    const event = makeUnpinnedEvent(unrelatedActivity);
    const stateBefore = feed.currentState;
    handleActivityUnpinned.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter.pinned_activities).toBe(stateBefore.pinned_activities);
  });

  it('does nothing if pinned_activities is empty', () => {
    feed.state.next((currentState) => ({
      ...currentState,
      pinned_activities: [],
    }));
    const event = makeUnpinnedEvent(pinnedActivity);
    const stateBefore = feed.currentState;
    handleActivityUnpinned.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });

  it('does nothing if pinned_activities is undefined', () => {
    feed.state.next((currentState) => ({
      ...currentState,
      pinned_activities: undefined,
    }));
    const event = makeUnpinnedEvent(pinnedActivity);
    handleActivityUnpinned.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter.pinned_activities).toBeUndefined();
  });

  describe(`Activity unpinned ${shouldUpdateState.name} integration`, () => {
    let currentUserPayload: EventPayload<'feeds.activity.unpinned'>;

    beforeEach(() => {
      currentUserPayload = {
        ...makeUnpinnedEvent(pinnedActivity),
        user: generateUserResponseCommonFields({ id: currentUserId }),
      };

      feed.state.partialNext({ watch: true });
    });

    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // 1. HTTP then WS
      handleActivityUnpinned.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleActivityUnpinned.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // Reset state for reverse order test
      feed.state.partialNext({
        pinned_activities: [pinnedActivity, otherPinnedActivity],
      });

      // 2. WS then HTTP
      handleActivityUnpinned.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleActivityUnpinned.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again after clearing the stateUpdateQueue', () => {
      handleActivityUnpinned.call(feed, currentUserPayload, false);

      expect(feed.currentState.pinned_activities).toHaveLength(1);

      // Reset state and clear queue
      feed.state.partialNext({
        pinned_activities: [pinnedActivity, otherPinnedActivity],
      });
      (feed as any).stateUpdateQueue.clear();

      handleActivityUnpinned.call(feed, currentUserPayload);

      expect(feed.currentState.pinned_activities).toHaveLength(1);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the event', () => {
      const otherUserPayload: EventPayload<'feeds.activity.unpinned'> = {
        ...makeUnpinnedEvent(pinnedActivity),
        user: generateUserResponseCommonFields({ id: getHumanId() }),
      };

      handleActivityUnpinned.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      // Reset state so the second call has something to remove
      feed.state.partialNext({
        pinned_activities: [pinnedActivity, otherPinnedActivity],
      });

      handleActivityUnpinned.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(feed.currentState.pinned_activities).toHaveLength(1);
    });

    it('does not deduplicate when watch is false', () => {
      feed.state.partialNext({ watch: false });

      // First call removes the activity
      handleActivityUnpinned.call(feed, currentUserPayload, false);
      expect(feed.currentState.pinned_activities).toHaveLength(1);

      // Reset state
      feed.state.partialNext({
        pinned_activities: [pinnedActivity, otherPinnedActivity],
      });

      // Second call also removes the activity (no dedup when watch=false)
      handleActivityUnpinned.call(feed, currentUserPayload);
      expect(feed.currentState.pinned_activities).toHaveLength(1);
      expect((feed as any).stateUpdateQueue).toEqual(new Set());
    });
  });
});
