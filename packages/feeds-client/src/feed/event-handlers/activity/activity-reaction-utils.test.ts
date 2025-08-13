import { describe, it, expect } from 'vitest';
import {
  ActivityReactionAddedEvent,
  ActivityReactionDeletedEvent,
  ActivityResponse,
  FeedsReactionResponse,
} from '../../../gen/models';
import { addReactionToActivities, removeReactionFromActivities } from './';
import {
  generateActivityResponse,
  generateFeedReactionResponse,
} from '../../../test-utils';

const addReactionToActivity = (
  event: ActivityReactionAddedEvent,
  activity: ActivityResponse,
  eventBelongsToCurrentUser: boolean,
) => {
  const result = addReactionToActivities(
    event,
    [activity],
    eventBelongsToCurrentUser,
  );

  return {
    changed: result.changed,
    ...result.entities![0],
  };
};

const removeReactionFromActivity = (
  event: ActivityReactionAddedEvent,
  activity: ActivityResponse,
  eventBelongsToCurrentUser: boolean,
) => {
  const result = removeReactionFromActivities(
    event,
    [activity],
    eventBelongsToCurrentUser,
  );

  return {
    changed: result.changed,
    ...result.entities![0],
  };
};

const createMockAddedEvent = (
  reaction: FeedsReactionResponse,
  activity: ActivityResponse,
): ActivityReactionAddedEvent => ({
  fid: 'test-fid',
  reaction,
  activity,
  created_at: new Date(),
  custom: {},
  type: 'reaction.added',
});

const createMockDeletedEvent = (
  reaction: FeedsReactionResponse,
  activity: ActivityResponse,
): ActivityReactionDeletedEvent => ({
  fid: 'test-fid',
  reaction,
  activity,
  created_at: new Date(),
  custom: {},
  type: 'reaction.deleted',
});

describe('activity-reaction-utils', () => {
  describe('addReactionToActivity', () => {
    it('should add reaction to own_reactions when from current user', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const reaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: 'user1' },
        activity_id: 'activity1',
      });
      const eventActivity = { ...activity };
      eventActivity.latest_reactions = [reaction];
      eventActivity.reaction_groups = {
        [reaction.type]: {
          count: 1,
          first_reaction_at: reaction.created_at,
          last_reaction_at: reaction.created_at,
          sum_scores: 0,
        },
      };

      const event = createMockAddedEvent(reaction, eventActivity);
      const result = addReactionToActivity(event, activity, true);
      expect(result.changed).toBe(true);
      expect(result.own_reactions).toHaveLength(1);
      expect(result.own_reactions[0]).toEqual(reaction);
      expect(result.latest_reactions).toHaveLength(1);
      expect(result.latest_reactions[0]).toEqual(reaction);
      expect(result.reaction_groups.like).toEqual({
        count: 1,
        first_reaction_at: reaction.created_at,
        last_reaction_at: reaction.created_at,
        sum_scores: 0,
      });
    });

    it('should not add reaction to own_reactions when not from current user', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const reaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: 'user2' },
        activity_id: 'activity1',
      });
      const eventActivity = { ...activity };
      eventActivity.latest_reactions = [reaction];
      eventActivity.reaction_groups = {
        [reaction.type]: {
          count: 1,
          first_reaction_at: reaction.created_at,
          last_reaction_at: reaction.created_at,
          sum_scores: 0,
        },
      };
      const event = createMockAddedEvent(reaction, eventActivity);

      const result = addReactionToActivity(event, activity, false);

      expect(result.changed).toBe(true);
      expect(result.own_reactions).toHaveLength(0);
      expect(result.latest_reactions).toHaveLength(1);
      expect(result.latest_reactions[0]).toEqual(reaction);
      expect(result.reaction_groups.like).toEqual({
        count: 1,
        first_reaction_at: reaction.created_at,
        last_reaction_at: reaction.created_at,
        sum_scores: 0,
      });
    });
  });

  describe('removeReactionFromActivity', () => {
    it('should remove reaction from own_reactions when from current user', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const reaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: 'user1' },
        activity_id: 'activity1',
      });
      const eventActivity = { ...activity };
      eventActivity.latest_reactions = [reaction];
      eventActivity.reaction_groups = {
        [reaction.type]: {
          count: 1,
          first_reaction_at: reaction.created_at,
          last_reaction_at: reaction.created_at,
          sum_scores: 0,
        },
      };
      const event = createMockAddedEvent(reaction, eventActivity);
      const activityWithReaction = addReactionToActivity(event, activity, true);

      const deleteEventActivity = { ...activityWithReaction };
      deleteEventActivity.latest_reactions = [];
      deleteEventActivity.reaction_groups = {};
      const deleteEvent = createMockDeletedEvent(reaction, deleteEventActivity);
      const result = removeReactionFromActivity(
        deleteEvent,
        activityWithReaction,
        true,
      );

      expect(result.changed).toBe(true);
      expect(result.own_reactions).toHaveLength(0);
      expect(result.latest_reactions).toHaveLength(0);
      expect(result.reaction_groups.like).toBeUndefined();
    });

    it('should not remove reaction from own_reactions when not from current user', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const reaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: 'user1' },
        activity_id: 'activity1',
      });
      const eventActivity = { ...activity };
      eventActivity.latest_reactions = [reaction];
      eventActivity.reaction_groups = {
        [reaction.type]: {
          count: 1,
          first_reaction_at: reaction.created_at,
          last_reaction_at: reaction.created_at,
          sum_scores: 0,
        },
      };
      const event = createMockAddedEvent(reaction, eventActivity);
      const activityWithReaction = addReactionToActivity(event, activity, true);

      const deleteEventActivity = { ...activityWithReaction };
      deleteEventActivity.latest_reactions = [];
      deleteEventActivity.reaction_groups = {};
      const deleteEvent = createMockDeletedEvent(reaction, deleteEventActivity);
      const result = removeReactionFromActivity(
        deleteEvent,
        activityWithReaction,
        false,
      );

      expect(result.changed).toBe(true);
      expect(result.own_reactions).toHaveLength(1);
      expect(result.latest_reactions).toHaveLength(0);
      expect(result.reaction_groups.like).toBeUndefined();
    });
  });

  describe('addReactionToActivities', () => {
    it('should add reaction to activity in activities array', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const activities = [activity];
      const reaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: 'user1' },
        activity_id: 'activity1',
      });
      const eventActivity = { ...activity };
      eventActivity.latest_reactions = [reaction];
      eventActivity.reaction_groups = {
        [reaction.type]: {
          count: 1,
          first_reaction_at: reaction.created_at,
          last_reaction_at: reaction.created_at,
          sum_scores: 0,
        },
      };
      const event = createMockAddedEvent(reaction, eventActivity);

      const result = addReactionToActivities(event, activities, true);

      expect(result.changed).toBe(true);
      expect(result.entities!).toHaveLength(1);
      expect(result.entities![0].own_reactions).toHaveLength(1);
      expect(result.entities![0].own_reactions[0]).toEqual(reaction);
    });

    it('should return unchanged state if activity not found', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const activities = [activity];
      const reaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: 'user1' },
        activity_id: 'activity2',
      });
      const eventActivity = generateActivityResponse({ id: 'activity2' });
      eventActivity.latest_reactions = [reaction];
      eventActivity.reaction_groups = {
        [reaction.type]: {
          count: 1,
          first_reaction_at: reaction.created_at,
          last_reaction_at: reaction.created_at,
          sum_scores: 0,
        },
      };
      const event = createMockAddedEvent(reaction, eventActivity);

      const result = addReactionToActivities(event, activities, true);

      expect(result.changed).toBe(false);
      expect(result.entities).toBe(activities);
    });

    it('should handle undefined activities', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const reaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: 'user1' },
        activity_id: 'activity1',
      });
      const eventActivity = { ...activity };
      eventActivity.own_reactions = [reaction];
      eventActivity.latest_reactions = [reaction];
      eventActivity.reaction_groups = {
        [reaction.type]: {
          count: 1,
          first_reaction_at: reaction.created_at,
          last_reaction_at: reaction.created_at,
          sum_scores: 0,
        },
      };
      const event = createMockAddedEvent(reaction, eventActivity);

      const result = addReactionToActivities(event, undefined, true);

      expect(result.changed).toBe(false);
      expect(result.entities).toBeUndefined();
    });
  });

  describe('removeReactionFromActivities', () => {
    it('should remove reaction from activity in activities array', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const reaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: 'user1' },
        activity_id: 'activity1',
      });
      const eventActivity = { ...activity };
      eventActivity.latest_reactions = [reaction];
      eventActivity.reaction_groups = {
        [reaction.type]: {
          count: 1,
          first_reaction_at: reaction.created_at,
          last_reaction_at: reaction.created_at,
          sum_scores: 0,
        },
      };
      const event = createMockAddedEvent(reaction, eventActivity);
      const activityWithReaction = addReactionToActivity(event, activity, true);
      const activities = [activityWithReaction];

      const deleteEventActivity = { ...activityWithReaction };
      deleteEventActivity.latest_reactions = [];
      deleteEventActivity.reaction_groups = {};
      const deleteEvent = createMockDeletedEvent(reaction, deleteEventActivity);
      const result = removeReactionFromActivities(
        deleteEvent,
        activities,
        true,
      );

      expect(result.changed).toBe(true);
      expect(result.entities).toHaveLength(1);
      expect(result.entities![0].own_reactions).toHaveLength(0);
    });

    it('should return unchanged state if activity not found', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const activities = [activity];
      const reaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: 'user1' },
        activity_id: 'activity2',
      });
      const eventActivity = generateActivityResponse({ id: 'activity2' });
      eventActivity.latest_reactions = [];
      eventActivity.reaction_groups = {};
      const event = createMockDeletedEvent(reaction, eventActivity);

      const result = removeReactionFromActivities(event, activities, true);

      expect(result.changed).toBe(false);
      expect(result.entities).toBe(activities);
    });

    it('should handle undefined activities', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const reaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: 'user1' },
        activity_id: 'activity1',
      });
      const eventActivity = { ...activity };
      eventActivity.latest_reactions = [];
      eventActivity.reaction_groups = {};
      const event = createMockDeletedEvent(reaction, eventActivity);

      const result = removeReactionFromActivities(event, undefined, true);

      expect(result.changed).toBe(false);
      expect(result.entities).toBeUndefined();
    });
  });
});
