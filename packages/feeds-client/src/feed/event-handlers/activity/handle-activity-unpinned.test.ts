import { describe, it, expect, beforeEach } from 'vitest';

import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityUnpinned } from './handle-activity-unpinned';
import {
  generateActivityPinResponse,
  generateFeedResponse,
} from '../../../test-utils/response-generators';
import { ActivityPinResponse } from '../../../gen/models';
import { EventPayload } from '../../../types-internal';

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
      fid: pinnedActivity.feed,
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

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    const feedResponse = generateFeedResponse({ id: 'main', group_id: 'user' });
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
    expect(stateAfter.pinned_activities).toEqual(stateBefore.pinned_activities);
  });

  it('does nothing if pinned_activities is empty', () => {
    feed.state.next((currentState) => ({
      ...currentState,
      pinned_activities: [],
    }));
    const event = makeUnpinnedEvent(pinnedActivity);
    handleActivityUnpinned.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter.pinned_activities).toEqual([]);
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
});
