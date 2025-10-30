import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityFeedback } from './handle-activity-feedback';
import {
  generateActivityPinResponse,
  generateActivityResponse,
  generateFeedResponse,
  generateOwnUser,
  generateUserResponse,
  getHumanId,
} from '../../../test-utils/response-generators';
import type { EventPayload } from '../../../types-internal';

describe(handleActivityFeedback.name, () => {
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

  const generateActivityFeedbackEvent = (
    overrides: Partial<
      EventPayload<'feeds.activity.feedback'>['activity_feedback']
    > = {},
  ): EventPayload<'feeds.activity.feedback'> => ({
    type: 'feeds.activity.feedback',
    created_at: new Date(),
    custom: {},
    activity_feedback: {
      action: 'hide',
      activity_id: getHumanId(),
      created_at: new Date(),
      updated_at: new Date(),
      value: '',
      user: generateUserResponse({ id: currentUserId }),
      ...overrides,
    },
  });

  describe('when event belongs to current user and action is hide', () => {
    it('toggles hidden property of regular activity in activities array', () => {
      const activity = generateActivityResponse({ hidden: false });
      feed.state.partialNext({ activities: [activity] });

      const event = generateActivityFeedbackEvent({
        activity_id: activity.id,
        action: 'hide',
        value: 'true',
      });

      handleActivityFeedback.call(feed, event);

      const stateAfter = feed.currentState;
      expect(stateAfter.activities?.[0].hidden).toBe(true);
    });

    it('toggles hidden property from true to false for regular activity', () => {
      const activity = generateActivityResponse({ hidden: true });
      feed.state.partialNext({ activities: [activity] });

      const event = generateActivityFeedbackEvent({
        activity_id: activity.id,
        action: 'hide',
        value: 'false',
      });

      handleActivityFeedback.call(feed, event);

      const stateAfter = feed.currentState;
      expect(stateAfter.activities?.[0].hidden).toBe(false);
    });

    it('toggles hidden property of activity inside pinned activity', () => {
      const activity = generateActivityResponse({ hidden: false });
      const pinnedActivity = generateActivityPinResponse({
        activity,
      });
      feed.state.partialNext({ pinned_activities: [pinnedActivity] });

      const event = generateActivityFeedbackEvent({
        activity_id: activity.id,
        action: 'hide',
        value: 'true',
      });

      handleActivityFeedback.call(feed, event);

      const stateAfter = feed.currentState;
      expect(stateAfter.pinned_activities?.[0].activity.hidden).toBe(true);
    });

    it('toggles hidden property from true to false for activity inside pinned activity', () => {
      const activity = generateActivityResponse({ hidden: true });
      const pinnedActivity = generateActivityPinResponse({
        activity,
      });
      feed.state.partialNext({ pinned_activities: [pinnedActivity] });

      const event = generateActivityFeedbackEvent({
        activity_id: activity.id,
        action: 'hide',
        value: 'false',
      });

      handleActivityFeedback.call(feed, event);

      const stateAfter = feed.currentState;
      expect(stateAfter.pinned_activities?.[0].activity.hidden).toBe(false);
    });

    it('updates both activities and pinned_activities when activity exists in both', () => {
      const sharedId = getHumanId();
      const activity = generateActivityResponse({
        id: sharedId,
        hidden: false,
      });
      const pinnedActivity = generateActivityPinResponse({
        activity: { ...activity, hidden: false },
      });
      feed.state.partialNext({
        activities: [activity],
        pinned_activities: [pinnedActivity],
      });

      const event = generateActivityFeedbackEvent({
        activity_id: sharedId,
        action: 'hide',
        value: 'true',
      });

      handleActivityFeedback.call(feed, event);

      const stateAfter = feed.currentState;
      expect(stateAfter.activities?.[0].hidden).toBe(true);
      expect(stateAfter.pinned_activities?.[0].activity.hidden).toBe(true);
    });

    it('does not update state when activity is not found in either array', () => {
      const activity = generateActivityResponse();
      const pinnedActivity = generateActivityPinResponse();
      feed.state.partialNext({
        activities: [activity],
        pinned_activities: [pinnedActivity],
      });

      const event = generateActivityFeedbackEvent({
        activity_id: 'unknown-activity-id',
        action: 'hide',
        value: 'true',
      });

      const stateBefore = feed.currentState;
      handleActivityFeedback.call(feed, event);
      const stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
    });

    it('handles undefined activities array', () => {
      feed.state.partialNext({ activities: undefined });

      const event = generateActivityFeedbackEvent({
        activity_id: 'some-activity-id',
      });

      const stateBefore = feed.currentState;
      handleActivityFeedback.call(feed, event);
      const stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
    });

    it('handles undefined pinned_activities array', () => {
      feed.state.partialNext({ pinned_activities: undefined });

      const event = generateActivityFeedbackEvent({
        activity_id: 'some-activity-id',
        action: 'hide',
        value: 'true',
      });

      const stateBefore = feed.currentState;
      handleActivityFeedback.call(feed, event);
      const stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
    });
  });

  describe('when event does not belong to current user', () => {
    it('does not update state when user id does not match', () => {
      const activity = generateActivityResponse({ hidden: false });
      feed.state.partialNext({ activities: [activity] });

      const event = generateActivityFeedbackEvent({
        activity_id: activity.id,
        user: generateUserResponse({ id: 'different-user-id' }),
        action: 'hide',
        value: 'true',
      });

      const stateBefore = feed.currentState;
      handleActivityFeedback.call(feed, event);
      const stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
    });
  });

  describe('when action is not hide', () => {
    it('does not update state when action is not hide', () => {
      const activity = generateActivityResponse({ hidden: false });
      feed.state.partialNext({ activities: [activity] });

      const event = generateActivityFeedbackEvent({
        activity_id: activity.id,
        action: 'show_less',
        value: 'true',
      });

      const stateBefore = feed.currentState;
      handleActivityFeedback.call(feed, event);
      const stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
    });
  });

  describe('edge cases', () => {
    it('preserves other properties when toggling hidden for regular activity', () => {
      const custom = {
        color: 'red',
      };
      const activity = generateActivityResponse({
        id: 'test-activity',
        hidden: false,
        type: 'post',
        user: generateUserResponse(),
        custom,
      });
      feed.state.partialNext({ activities: [activity] });

      const event = generateActivityFeedbackEvent({
        activity_id: activity.id,
        action: 'hide',
        value: 'true',
      });

      handleActivityFeedback.call(feed, event);

      const stateAfter = feed.currentState;
      const updatedActivity = stateAfter.activities?.[0];
      expect(updatedActivity?.id).toBe('test-activity');
      expect(updatedActivity?.type).toBe('post');
      expect(updatedActivity?.custom).toBe(custom);
      expect(updatedActivity?.user).toBe(activity.user);
      expect(updatedActivity?.hidden).toBe(true);
    });
  });
});
