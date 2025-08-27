import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityDeleted } from './handle-activity-deleted';
import {
  generateActivityDeletedEvent,
  generateActivityPinResponse,
  generateActivityResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils/response-generators';

describe(handleActivityDeleted.name, () => {
  let feed: Feed;
  let client: FeedsClient;
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
  });

  it('removes the activity from activities array when present', () => {
    const activity1 = generateActivityResponse();
    const activity2 = generateActivityResponse();
    feed.state.partialNext({ activities: [activity1, activity2] });

    const event = generateActivityDeletedEvent({
      activity: { id: activity1.id },
    });

    const stateBefore = feed.currentState;
    expect(stateBefore.activities).toHaveLength(2);

    handleActivityDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities).toHaveLength(1);
    expect(stateAfter.activities?.[0].id).toBe(activity2.id);
  });

  it('removes the activity from pinned_activities when present', () => {
    const pin1 = generateActivityPinResponse();
    const pin2 = generateActivityPinResponse();
    feed.state.partialNext({ pinned_activities: [pin1, pin2] });

    const event = generateActivityDeletedEvent({
      activity: { id: pin1.activity.id },
    });

    const stateBefore = feed.currentState;
    expect(stateBefore.pinned_activities).toHaveLength(2);

    handleActivityDeleted.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter.pinned_activities).toHaveLength(1);
    expect(stateAfter.pinned_activities?.[0]).toBe(pin2);
  });

  it('updates both arrays when the activity exists in both activities and pinned_activities', () => {
    const sharedId = getHumanId();
    const activity = generateActivityResponse({ id: sharedId });
    const pinnedActivity = generateActivityPinResponse({
      activity: { id: sharedId },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [pinnedActivity],
    });

    const event = generateActivityDeletedEvent({
      activity: { id: sharedId },
    });

    handleActivityDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities).toHaveLength(0);
    expect(stateAfter.pinned_activities).toHaveLength(0);
  });

  it('does nothing if the activity is not found in either list', () => {
    const activity = generateActivityResponse();
    const pinnedActivity = generateActivityPinResponse();
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [pinnedActivity],
    });

    const event = generateActivityDeletedEvent({ activity: { id: 'unknown' } });

    const stateBefore = feed.currentState;
    handleActivityDeleted.call(feed, event);
    const stateAfter = feed.currentState;

    expect(stateAfter).toBe(stateBefore);
  });
});
