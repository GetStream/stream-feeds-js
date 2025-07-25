import { describe, it, expect } from 'vitest';
import { ActivityResponse, FeedsReactionResponse } from '../gen/models';
import {
  addActivitiesToState,
  updateActivityInState,
  removeActivityFromState,
} from './activity-utils';

const createMockActivity = (id: string, text?: string): ActivityResponse =>
  ({
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
    text: text,
    popularity: 0,
    score: 0,
    reaction_count: 0,
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
  }) as ActivityResponse;

describe('activity-utils', () => {
  describe('addActivitiesToState', () => {
    const activity1 = createMockActivity('activity1');
    const activity2 = createMockActivity('activity2');

    it('should add activities to empty state', () => {
      const result = addActivitiesToState([activity1], undefined, 'start');

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].id).toBe('activity1');
    });

    it('should add activities to the start of existing activities', () => {
      const existingActivities = [activity2];
      const result = addActivitiesToState(
        [activity1],
        existingActivities,
        'start',
      );

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(2);
      expect(result.activities[0].id).toBe('activity1');
      expect(result.activities[1].id).toBe('activity2');
    });

    it('should add activities to the end of existing activities', () => {
      const existingActivities = [activity1];
      const result = addActivitiesToState(
        [activity2],
        existingActivities,
        'end',
      );

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(2);
      expect(result.activities[0].id).toBe('activity1');
      expect(result.activities[1].id).toBe('activity2');
    });

    it('should not add duplicate activities', () => {
      const existingActivities = [activity1];
      const result = addActivitiesToState(
        [activity1],
        existingActivities,
        'start',
      );

      expect(result.changed).toBe(false);
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].id).toBe('activity1');
    });

    it('should handle multiple new activities correctly', () => {
      const activity3 = createMockActivity('activity3');

      const existingActivities = [activity1];
      const result = addActivitiesToState(
        [activity2, activity3],
        existingActivities,
        'start',
      );

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(3);
      expect(result.activities[0].id).toBe('activity2');
      expect(result.activities[1].id).toBe('activity3');
      expect(result.activities[2].id).toBe('activity1');
    });
  });

  describe('updateActivityInState', () => {
    it('should update an activity in the state', () => {
      const originalActivity = createMockActivity('activity1', 'original text');
      const updatedActivity = createMockActivity('activity1', 'updated text');
      const originalActivities = [originalActivity];

      const result = updateActivityInState(updatedActivity, originalActivities);

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].id).toBe('activity1');
      expect(result.activities[0].text).toBe('updated text');

      // Make sure we create a new array
      expect(originalActivities === result.activities).toBe(false);
    });

    it('should preserve reaction data when updating an activity', () => {
      const originalActivity = createMockActivity('activity1', 'original text');
      // Mock the reaction structure with proper types
      originalActivity.own_reactions = [
        {
          type: 'like',
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
          activity_id: 'activity1',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      originalActivity.latest_reactions = {} as FeedsReactionResponse[];
      (originalActivity.latest_reactions as any).like = [
        {
          type: 'like',
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
          activity_id: 'activity1',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      originalActivity.reaction_groups = {
        like: {
          count: 1,
          first_reaction_at: new Date(),
          last_reaction_at: new Date(),
        },
      };

      const updatedActivity = createMockActivity('activity1', 'updated text');
      // Reactions are not included in the updated activity from server

      const result = updateActivityInState(updatedActivity, [originalActivity]);

      expect(result.changed).toBe(true);
      expect(result.activities[0].text).toBe('updated text');
      // Check that reactions were preserved
      expect(result.activities[0].own_reactions).toEqual(
        originalActivity.own_reactions,
      );
      expect(result.activities[0].latest_reactions).toEqual(
        originalActivity.latest_reactions,
      );
      expect(result.activities[0].reaction_groups).toEqual(
        originalActivity.reaction_groups,
      );
    });

    it('should return unchanged state if activity not found', () => {
      const existingActivity = createMockActivity('activity1');
      const updatedActivity = createMockActivity('activity2', 'some text');

      const result = updateActivityInState(updatedActivity, [existingActivity]);

      expect(result.changed).toBe(false);
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].id).toBe('activity1');
    });
  });

  describe('removeActivityFromState', () => {
    it('should remove an activity from the state', () => {
      const activity1 = createMockActivity('activity1');
      const activity2 = createMockActivity('activity2');
      const activities = [activity1, activity2];

      const result = removeActivityFromState(activity1, activities);

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].id).toBe('activity2');
      // Make sure we create a new array
      expect(activities === result.activities).toBe(false);
    });

    it('should return unchanged state if activity not found', () => {
      const activity1 = createMockActivity('activity1');
      const activity2 = createMockActivity('activity2');
      const activities = [activity1];

      const result = removeActivityFromState(activity2, activities);

      expect(result.changed).toBe(false);
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].id).toBe('activity1');
    });

    it('should handle empty activities array', () => {
      const activity = createMockActivity('activity1');
      const activities: ActivityResponse[] = [];

      const result = removeActivityFromState(activity, activities);

      expect(result.changed).toBe(false);
      expect(result.activities).toHaveLength(0);
    });
  });
});
