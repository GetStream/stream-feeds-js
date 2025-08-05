import { describe, it, expect, beforeEach } from 'vitest';

import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityPinned } from './handle-activity-pinned';
import {
  generateActivityPinResponse,
  generateFeedResponse,
} from '../../../test-utils/response-generators';
import { ActivityPinResponse } from '../../../gen/models';
import { EventPayload } from '../../../types-internal';

// Helper to construct the event payload for 'feeds.activity.pinned'
function makePinnedEvent(
  pinnedActivity: ActivityPinResponse,
): EventPayload<'feeds.activity.pinned'> {
  return {
    type: 'feeds.activity.pinned',
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

describe(handleActivityPinned.name, () => {
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
      pinned_activities: [otherPinnedActivity],
    }));
  });

  it('adds a new activity to pinned_activities', () => {
    const event = makePinnedEvent(pinnedActivity);
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
    const event = makePinnedEvent(pinnedActivity);
    handleActivityPinned.call(feed, event);
    const { pinned_activities } = feed.currentState;
    expect(pinned_activities).toHaveLength(1);
    expect(pinned_activities![0].activity.id).toBe(pinnedActivity.activity.id);
  });
});
