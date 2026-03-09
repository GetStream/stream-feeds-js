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
  generateUserResponseCommonFields,
  getHumanId,
} from '../../../test-utils/response-generators';
import { shouldUpdateState } from '../../../utils';
import type { ActivityResponse } from '../../../gen/models';

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

  describe(`Activity deleted ${shouldUpdateState.name} integration`, () => {
    const activityId = 'deleted-activity';
    let existingActivity: ActivityResponse;
    let currentUserPayload: ReturnType<typeof generateActivityDeletedEvent>;

    beforeEach(() => {
      existingActivity = generateActivityResponse({ id: activityId });
      currentUserPayload = generateActivityDeletedEvent({
        activity: { id: activityId },
        user: generateUserResponseCommonFields({ id: currentUserId }),
      });

      feed.state.partialNext({ activities: [existingActivity] });
      feed.state.partialNext({ watch: true });
    });

    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // 1. HTTP then WS
      handleActivityDeleted.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleActivityDeleted.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // Reset state for reverse order test
      feed.state.partialNext({ activities: [existingActivity] });

      // 2. WS then HTTP
      handleActivityDeleted.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleActivityDeleted.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again after clearing the stateUpdateQueue', () => {
      handleActivityDeleted.call(feed, currentUserPayload, false);

      expect(feed.currentState.activities).toHaveLength(0);

      // Reset state and clear queue
      const newActivity = generateActivityResponse({ id: activityId });
      feed.state.partialNext({ activities: [newActivity] });
      (feed as any).stateUpdateQueue.clear();

      handleActivityDeleted.call(feed, currentUserPayload);

      expect(feed.currentState.activities).toHaveLength(0);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the event', () => {
      const otherUserPayload = generateActivityDeletedEvent({
        activity: { id: activityId },
        user: generateUserResponseCommonFields({ id: getHumanId() }),
      });

      handleActivityDeleted.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      // Reset state so the second call has something to delete
      feed.state.partialNext({ activities: [existingActivity] });

      handleActivityDeleted.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(feed.currentState.activities).toHaveLength(0);
    });
  });
});
