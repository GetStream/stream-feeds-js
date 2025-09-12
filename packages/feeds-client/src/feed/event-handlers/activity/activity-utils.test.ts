import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ActivityResponse } from '../../../gen/models';
import { FeedsClient } from '../../../feeds-client';
import {
  addActivitiesToState as addActivitiesToStateOriginal,
  updateActivityInState,
  removeActivityFromState as removeActivityFromStateOriginal,
} from './';
import {
  generateActivityResponse,
  generateFeedReactionResponse,
} from '../../../test-utils';

describe('activity-utils', () => {
  let addActivitiesToState: OmitThisParameter<
    typeof addActivitiesToStateOriginal
  >;
  let removeActivityFromState: OmitThisParameter<
    typeof removeActivityFromStateOriginal
  >;
  let prehydrateActivities: (
    newActivities: ActivityResponse[],
  ) => ActivityResponse[];

  beforeEach(() => {
    const client = new FeedsClient('mock-api-key');
    const feed = client.feed('some', 'feed');

    addActivitiesToState = addActivitiesToStateOriginal.bind(feed);
    removeActivityFromState = removeActivityFromStateOriginal.bind(feed);

    prehydrateActivities = (newActivities: ActivityResponse[]) => {
      const existingActivities = [...newActivities];
      // @ts-expect-error Using internals only in tests
      feed.indexedActivityIds = new Set(
        existingActivities.map((activity) => activity.id),
      );

      return existingActivities;
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('addActivitiesToState', () => {
    const activity1 = generateActivityResponse({ id: 'activity1' });
    const activity2 = generateActivityResponse({ id: 'activity2' });

    it('should add activities to empty state', () => {
      const result = addActivitiesToState([activity1], undefined, 'start');

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].id).toBe('activity1');
    });

    it('should add activities to the start of existing activities', () => {
      const existingActivities = prehydrateActivities([activity2]);
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
      const existingActivities = prehydrateActivities([activity1]);
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
      const existingActivities = prehydrateActivities([activity1]);
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
      const activity3 = generateActivityResponse({ id: 'activity3' });

      const existingActivities = prehydrateActivities([activity1]);
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
      const originalActivity = generateActivityResponse({
        id: 'activity1',
        text: 'original text',
      });
      const updatedActivity = { ...originalActivity, text: 'updated text' };
      const originalActivities = [originalActivity];

      const result = updateActivityInState(
        {
          activity: updatedActivity,
          created_at: new Date(),
          fid: '',
          type: '',
          custom: {},
        },
        originalActivities,
      );

      expect(result.changed).toBe(true);
      expect(result.entities).toHaveLength(1);
      expect(result.entities![0].id).toBe('activity1');
      expect(result.entities![0].text).toBe('updated text');

      // Make sure we create a new array
      expect(originalActivities === result.entities).toBe(false);
    });

    it('should preserve reaction data (own_reaction) when updating an activity', () => {
      const r = generateFeedReactionResponse({
        activity_id: 'activity1',
        user: {
          id: 'user1',
        },
      });
      const originalActivity = generateActivityResponse({
        id: 'activity1',
        text: 'original text',
        own_reactions: [r],
        latest_reactions: [r],
      });

      const updatedActivity = generateActivityResponse({
        id: 'activity1',
        text: 'updated text',
        own_reactions: [],
        latest_reactions: [
          r,
          generateFeedReactionResponse({
            activity_id: 'activity1',
            user: { id: 'user2' },
          }),
        ],
      });

      const result = updateActivityInState(
        {
          activity: updatedActivity,
          created_at: new Date(),
          fid: '',
          type: '',
          custom: {},
        },
        [originalActivity],
      );

      expect(result.changed).toBe(true);
      expect(result.entities![0].text).toBe('updated text');
      // Check that reactions were preserved
      expect(result.entities![0].own_reactions).toEqual(
        originalActivity.own_reactions,
      );
    });

    it('should return unchanged state if activity not found', () => {
      const existingActivity = generateActivityResponse({ id: 'activity1' });
      const updatedActivity = generateActivityResponse({
        id: 'activity2',
        text: 'some text',
      });

      const result = updateActivityInState(
        {
          activity: updatedActivity,
          created_at: new Date(),
          fid: '',
          type: '',
          custom: {},
        },
        [existingActivity],
      );

      expect(result.changed).toBe(false);
      expect(result.entities).toHaveLength(1);
      expect(result.entities![0].id).toBe('activity1');
    });
  });

  describe('removeActivityFromState', () => {
    it('should remove an activity from the state', () => {
      const activity1 = generateActivityResponse({ id: 'activity1' });
      const activity2 = generateActivityResponse({ id: 'activity2' });
      const activities = prehydrateActivities([activity1, activity2]);

      const result = removeActivityFromState(activity1, activities);

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(1);
      expect(result.activities![0].id).toBe('activity2');
      // Make sure we create a new array
      expect(activities === result.activities).toBe(false);
    });

    it('should return unchanged state if activity not found', () => {
      const activity1 = generateActivityResponse({ id: 'activity1' });
      const activity2 = generateActivityResponse({ id: 'activity2' });
      const activities = prehydrateActivities([activity1]);

      const result = removeActivityFromState(activity2, activities);

      expect(result.changed).toBe(false);
      expect(result.activities).toHaveLength(1);
      expect(result.activities![0].id).toBe('activity1');
    });

    it('should handle empty activities array', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const activities: ActivityResponse[] = [];

      const result = removeActivityFromState(activity, activities);

      expect(result.changed).toBe(false);
      expect(result.activities).toHaveLength(0);
    });
  });
});
