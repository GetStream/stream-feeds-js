import { describe, it, expect, beforeEach } from 'vitest';

import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityPinned } from './handle-activity-pinned';
import {
  generateActivityPinnedEvent,
  generateActivityPinResponse,
  generateFeedResponse,
} from '../../../test-utils/response-generators';
import type { ActivityPinResponse } from '../../../gen/models';

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
});
