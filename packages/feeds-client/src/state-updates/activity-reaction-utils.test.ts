import { describe, it, expect } from 'vitest';
import { ActivityResponse, ActivityReactionResponse } from '../gen/models';
import {
  addReactionToActivity,
  removeReactionFromActivity,
  addReactionToActivities,
  removeReactionFromActivities,
} from './activity-reaction-utils';

const createMockActivity = (id: string): ActivityResponse => ({
  id,
  type: 'test',
  created_at: new Date(),
  updated_at: new Date(),
  visibility: 'public',
  bookmark_count: 0,
  comment_count: 0,
  share_count: 0,
  attachments: [],
  comments: [],
  feeds: [],
  filter_tags: [],
  interest_tags: [],
  latest_reactions: [],
  mentioned_users: [],
  own_bookmarks: [],
  own_reactions: [],
  custom: {},
  reaction_groups: {},
  search_data: {},
  popularity: 0,
  score: 0,
  user: {
    id: 'user1',
    created_at: new Date(),
    updated_at: new Date(),
    banned: false,
    language: 'en',
    online: false,
    role: 'user',
    blocked_user_ids: [],
    teams: [],
    custom: {},
  },
});

const createMockReaction = (
  type: string,
  userId: string,
  activityId: string,
): ActivityReactionResponse => ({
  type,
  user: {
    id: userId,
    created_at: new Date(),
    updated_at: new Date(),
    banned: false,
    language: 'en',
    online: false,
    role: 'user',
    blocked_user_ids: [],
    teams: [],
    custom: {},
  },
  activity_id: activityId,
  created_at: new Date(),
  updated_at: new Date(),
});

describe('activity-reaction-utils', () => {
  describe('addReactionToActivity', () => {
    it('should add reaction to own_reactions when from current user', () => {
      const activity = createMockActivity('activity1');
      const reaction = createMockReaction('like', 'user1', 'activity1');

      const result = addReactionToActivity(reaction, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_reactions).toHaveLength(1);
      expect(result.own_reactions[0]).toEqual(reaction);
      expect(result.latest_reactions).toHaveLength(1);
      expect(result.latest_reactions[0]).toEqual(reaction);
      expect(result.reaction_groups['like']).toEqual({
        count: 1,
        first_reaction_at: reaction.created_at,
        last_reaction_at: reaction.created_at,
      });
    });

    it('should not add reaction to own_reactions when not from current user', () => {
      const activity = createMockActivity('activity1');
      const reaction = createMockReaction('like', 'user2', 'activity1');

      const result = addReactionToActivity(reaction, activity, false);

      expect(result.changed).toBe(true);
      expect(result.own_reactions).toHaveLength(0);
      expect(result.latest_reactions).toHaveLength(1);
      expect(result.latest_reactions[0]).toEqual(reaction);
      expect(result.reaction_groups['like']).toEqual({
        count: 1,
        first_reaction_at: reaction.created_at,
        last_reaction_at: reaction.created_at,
      });
    });

    it('should increment reaction count in reaction_groups', () => {
      const activity = createMockActivity('activity1');
      const reaction1 = createMockReaction('like', 'user1', 'activity1');
      const reaction2 = createMockReaction('like', 'user2', 'activity1');

      const result1 = addReactionToActivity(reaction1, activity, true);
      const result2 = addReactionToActivity(reaction2, result1, false);

      expect(result2.changed).toBe(true);
      expect(result2.reaction_groups['like'].count).toBe(2);
    });
  });

  describe('removeReactionFromActivity', () => {
    it('should remove reaction from own_reactions when from current user', () => {
      const activity = createMockActivity('activity1');
      const reaction = createMockReaction('like', 'user1', 'activity1');
      const activityWithReaction = addReactionToActivity(
        reaction,
        activity,
        true,
      );

      const result = removeReactionFromActivity(
        reaction,
        activityWithReaction,
        true,
      );

      expect(result.changed).toBe(true);
      expect(result.own_reactions).toHaveLength(0);
      expect(result.latest_reactions).toHaveLength(0);
      expect(result.reaction_groups['like']).toBeUndefined();
    });

    it('should not remove reaction from own_reactions when not from current user', () => {
      const activity = createMockActivity('activity1');
      const reaction = createMockReaction('like', 'user1', 'activity1');
      const activityWithReaction = addReactionToActivity(
        reaction,
        activity,
        true,
      );

      const result = removeReactionFromActivity(
        reaction,
        activityWithReaction,
        false,
      );

      expect(result.changed).toBe(true);
      expect(result.own_reactions).toHaveLength(1);
      expect(result.latest_reactions).toHaveLength(0);
      expect(result.reaction_groups['like']).toBeUndefined();
    });

    it('should decrement reaction count in reaction_groups', () => {
      const activity = createMockActivity('activity1');
      const reaction1 = createMockReaction('like', 'user1', 'activity1');
      const reaction2 = createMockReaction('like', 'user2', 'activity1');
      const activityWithReactions = addReactionToActivity(
        reaction2,
        addReactionToActivity(reaction1, activity, true),
        false,
      );

      const result = removeReactionFromActivity(
        reaction1,
        activityWithReactions,
        true,
      );

      expect(result.changed).toBe(true);
      expect(result.reaction_groups['like'].count).toBe(1);
    });
  });

  describe('addReactionToActivities', () => {
    it('should add reaction to activity in activities array', () => {
      const activity = createMockActivity('activity1');
      const activities = [activity];
      const reaction = createMockReaction('like', 'user1', 'activity1');

      const result = addReactionToActivities(reaction, activities, true);

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].own_reactions).toHaveLength(1);
      expect(result.activities[0].own_reactions[0]).toEqual(reaction);
    });

    it('should return unchanged state if activity not found', () => {
      const activity = createMockActivity('activity1');
      const activities = [activity];
      const reaction = createMockReaction('like', 'user1', 'activity2');

      const result = addReactionToActivities(reaction, activities, true);

      expect(result.changed).toBe(false);
      expect(result.activities).toBe(activities);
    });

    it('should handle undefined activities', () => {
      const reaction = createMockReaction('like', 'user1', 'activity1');

      const result = addReactionToActivities(reaction, undefined, true);

      expect(result.changed).toBe(false);
      expect(result.activities).toEqual([]);
    });
  });

  describe('removeReactionFromActivities', () => {
    it('should remove reaction from activity in activities array', () => {
      const activity = createMockActivity('activity1');
      const reaction = createMockReaction('like', 'user1', 'activity1');
      const activityWithReaction = addReactionToActivity(
        reaction,
        activity,
        true,
      );
      const activities = [activityWithReaction];

      const result = removeReactionFromActivities(reaction, activities, true);

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].own_reactions).toHaveLength(0);
    });

    it('should return unchanged state if activity not found', () => {
      const activity = createMockActivity('activity1');
      const activities = [activity];
      const reaction = createMockReaction('like', 'user1', 'activity2');

      const result = removeReactionFromActivities(reaction, activities, true);

      expect(result.changed).toBe(false);
      expect(result.activities).toBe(activities);
    });

    it('should handle undefined activities', () => {
      const reaction = createMockReaction('like', 'user1', 'activity1');

      const result = removeReactionFromActivities(reaction, undefined, true);

      expect(result.changed).toBe(false);
      expect(result.activities).toEqual([]);
    });
  });
});
