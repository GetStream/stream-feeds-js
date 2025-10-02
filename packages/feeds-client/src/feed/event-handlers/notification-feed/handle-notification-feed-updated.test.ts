import { describe, it, expect } from 'vitest';
import type {
  NotificationFeedUpdatedEvent,
  NotificationStatusResponse,
  AggregatedActivityResponse,
} from '../../../gen/models';
import {
  updateNotificationFeedFromEvent,
  addAggregatedActivitiesToState,
  updateNotificationStatus,
} from './handle-notification-feed-updated';

const createMockNotificationFeedUpdatedEvent = (
  overrides: Partial<NotificationFeedUpdatedEvent> = {},
): NotificationFeedUpdatedEvent => ({
  created_at: new Date(),
  fid: 'user:notification',
  custom: {},
  type: 'feeds.notification_feed.updated',
  ...overrides,
});

const createMockNotificationStatus = (
  overrides: Partial<NotificationStatusResponse> = {},
): NotificationStatusResponse => ({
  unread: 0,
  unseen: 0,
  ...overrides,
});

const createMockAggregatedActivity = (
  overrides: Partial<AggregatedActivityResponse> = {},
): AggregatedActivityResponse => ({
  activity_count: 1,
  created_at: new Date(),
  group: 'test-group',
  user_count_truncated: false,
  score: 1,
  updated_at: new Date(),
  user_count: 1,
  activities: [],
  ...overrides,
});

describe('notification-feed-utils', () => {
  describe('updateNotificationFeedFromEvent', () => {
    it('should return unchanged if event has no notification_status or aggregated_activities', () => {
      const event = createMockNotificationFeedUpdatedEvent();

      const result = updateNotificationFeedFromEvent(event, [], {
        unread: 0,
        unseen: 0,
        read_activities: [],
        seen_activities: [],
      });

      expect(result.changed).toBe(false);
    });

    it(`shouldn't update notification_status when event has notification_status but currentNotificationStatus is undefined`, () => {
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus(),
      });
      const result = updateNotificationFeedFromEvent(event, [], undefined);

      expect(result.changed).toBe(false);
    });

    it(`shouldn't update aggregated_activities when event has aggregated_activities but currentAggregatedActivities is undefined`, () => {
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [createMockAggregatedActivity()],
      });
      const result = updateNotificationFeedFromEvent(
        event,
        undefined,
        createMockNotificationStatus(),
      );

      expect(result.changed).toBe(false);
    });

    it('should update notification_status when event has notification_status', () => {
      const notificationStatus = createMockNotificationStatus({
        unread: 5,
        unseen: 3,
        read_activities: ['activity1', 'activity2'],
        seen_activities: [],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: notificationStatus,
      });

      const result = updateNotificationFeedFromEvent(event, [], {
        unread: 0,
        unseen: 0,
        read_activities: [],
        seen_activities: [],
      });

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status).toStrictEqual(
        notificationStatus,
      );
      expect(result.data?.aggregated_activities).toBeUndefined();
    });

    it('should update aggregated_activities when event has aggregated_activities', () => {
      const aggregatedActivities = [
        createMockAggregatedActivity({ group: 'group1' }),
        createMockAggregatedActivity({ group: 'group2' }),
      ];
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: aggregatedActivities,
      });

      const result = updateNotificationFeedFromEvent(event, [], {
        unread: 0,
        unseen: 0,
        read_activities: [],
        seen_activities: [],
      });

      expect(result.changed).toBe(true);
      expect(result.data?.aggregated_activities).toStrictEqual(
        aggregatedActivities,
      );
      expect(result.data?.notification_status).toBeUndefined();
    });

    it('should update both notification_status and aggregated_activities when event has both', () => {
      const notificationStatus = createMockNotificationStatus({
        unread: 2,
        unseen: 1,
      });
      const aggregatedActivities = [
        createMockAggregatedActivity({ group: 'group1' }),
      ];
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: notificationStatus,
        aggregated_activities: aggregatedActivities,
      });

      const result = updateNotificationFeedFromEvent(event, [], {
        unread: 0,
        unseen: 0,
        read_activities: [],
        seen_activities: [],
      });

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status?.unread).toBe(
        notificationStatus.unread,
      );
      expect(result.data?.notification_status?.unseen).toBe(
        notificationStatus.unseen,
      );
      expect(result.data?.aggregated_activities).toStrictEqual(
        aggregatedActivities,
      );
    });

    it('should handle notification_status with all fields', () => {
      const notificationStatus = createMockNotificationStatus({
        unread: 10,
        unseen: 5,
        last_seen_at: new Date('2023-01-01'),
        seen_activities: [],
        read_activities: ['activity1', 'activity2', 'activity3'],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: notificationStatus,
      });

      const result = updateNotificationFeedFromEvent(event, [], {
        unread: 0,
        unseen: 0,
        read_activities: [],
        seen_activities: [],
      });

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status).toStrictEqual(
        notificationStatus,
      );
    });
  });

  describe('addAggregatedActivitiesToState', () => {
    it('should add new activities when none exist', () => {
      const newActivities = [
        createMockAggregatedActivity({ group: 'group1' }),
        createMockAggregatedActivity({ group: 'group2' }),
      ];

      const result = addAggregatedActivitiesToState(
        newActivities,
        undefined,
        'start',
      );

      expect(result.changed).toBe(true);
      expect(result.aggregated_activities).toStrictEqual(newActivities);
    });

    it('should add new activities to existing ones', () => {
      const existingActivities = [
        createMockAggregatedActivity({ group: 'existing1' }),
      ];
      const newActivities = [
        createMockAggregatedActivity({ group: 'new1' }),
        createMockAggregatedActivity({ group: 'new2' }),
      ];

      const result = addAggregatedActivitiesToState(
        newActivities,
        existingActivities,
        'start',
      );

      expect(result.changed).toBe(true);
      expect(result.aggregated_activities).toStrictEqual([
        ...newActivities,
        ...existingActivities,
      ]);
    });

    it('should add new activities at the end when position is end', () => {
      const existingActivities = [
        createMockAggregatedActivity({ group: 'existing1' }),
      ];
      const newActivities = [createMockAggregatedActivity({ group: 'new1' })];

      const result = addAggregatedActivitiesToState(
        newActivities,
        existingActivities,
        'end',
      );

      expect(result.changed).toBe(true);
      expect(result.aggregated_activities).toStrictEqual([
        ...existingActivities,
        ...newActivities,
      ]);
    });

    it('should update existing activities with same group (upsert)', () => {
      const baseDate = new Date('2023-01-01');
      const existingActivities = [
        createMockAggregatedActivity({
          group: 'group1',
          activity_count: 1,
          score: 10,
          updated_at: baseDate,
        }),
        createMockAggregatedActivity({
          group: 'group2',
          activity_count: 2,
          score: 20,
        }),
      ];
      const newActivities = [
        createMockAggregatedActivity({
          group: 'group1',
          activity_count: 3,
          score: 30,
          updated_at: new Date('2023-01-02'),
        }),
        createMockAggregatedActivity({
          group: 'group3',
          activity_count: 4,
          score: 40,
        }),
      ];

      const result = addAggregatedActivitiesToState(
        newActivities,
        existingActivities,
        'start',
      );

      expect(result.changed).toBe(true);
      expect(result.aggregated_activities).toHaveLength(3);

      // Check that group1 was updated
      const updatedGroup1 = result.aggregated_activities.find(
        (a) => a.group === 'group1',
      );
      expect(updatedGroup1?.activity_count).toBe(3);
      expect(updatedGroup1?.score).toBe(30);
      expect(updatedGroup1?.updated_at).toEqual(new Date('2023-01-02'));

      // Check that group2 remains unchanged
      const unchangedGroup2 = result.aggregated_activities.find(
        (a) => a.group === 'group2',
      );
      expect(unchangedGroup2?.activity_count).toBe(2);
      expect(unchangedGroup2?.score).toBe(20);

      // Check that group3 was added
      const newGroup3 = result.aggregated_activities.find(
        (a) => a.group === 'group3',
      );
      expect(newGroup3?.activity_count).toBe(4);
      expect(newGroup3?.score).toBe(40);
    });

    it('should handle mixed new and existing activities', () => {
      const existingActivities = [
        createMockAggregatedActivity({ group: 'existing1' }),
        createMockAggregatedActivity({ group: 'existing2' }),
      ];
      const newActivities = [
        createMockAggregatedActivity({ group: 'existing1', activity_count: 5 }), // Update existing
        createMockAggregatedActivity({ group: 'new1' }), // Add new
        createMockAggregatedActivity({ group: 'existing2', score: 100 }), // Update existing
        createMockAggregatedActivity({ group: 'new2' }), // Add new
      ];

      const result = addAggregatedActivitiesToState(
        newActivities,
        existingActivities,
        'start',
      );

      expect(result.changed).toBe(true);
      expect(result.aggregated_activities).toHaveLength(4);

      // Check that existing1 was updated
      const updatedExisting1 = result.aggregated_activities.find(
        (a) => a.group === 'existing1',
      );
      expect(updatedExisting1?.activity_count).toBe(5);

      // Check that existing2 was updated
      const updatedExisting2 = result.aggregated_activities.find(
        (a) => a.group === 'existing2',
      );
      expect(updatedExisting2?.score).toBe(100);

      // Check that new activities were added
      expect(
        result.aggregated_activities.find((a) => a.group === 'new1'),
      ).toBeDefined();
      expect(
        result.aggregated_activities.find((a) => a.group === 'new2'),
      ).toBeDefined();
    });

    it('should preserve order when adding at start', () => {
      const existingActivities = [
        createMockAggregatedActivity({ group: 'existing1' }),
        createMockAggregatedActivity({ group: 'existing2' }),
      ];
      const newActivities = [
        createMockAggregatedActivity({ group: 'new1' }),
        createMockAggregatedActivity({ group: 'new2' }),
      ];

      const result = addAggregatedActivitiesToState(
        newActivities,
        existingActivities,
        'start',
      );

      expect(result.aggregated_activities).toStrictEqual([
        ...newActivities,
        ...existingActivities,
      ]);
    });

    it('should preserve order when adding at end', () => {
      const existingActivities = [
        createMockAggregatedActivity({ group: 'existing1' }),
        createMockAggregatedActivity({ group: 'existing2' }),
      ];
      const newActivities = [
        createMockAggregatedActivity({ group: 'new1' }),
        createMockAggregatedActivity({ group: 'new2' }),
      ];

      const result = addAggregatedActivitiesToState(
        newActivities,
        existingActivities,
        'end',
      );

      expect(result.aggregated_activities).toStrictEqual([
        ...existingActivities,
        ...newActivities,
      ]);
    });

    describe('replace position', () => {
      it('should replace existing activities with same group', () => {
        const baseDate = new Date('2023-01-01');
        const existingActivities = [
          createMockAggregatedActivity({
            group: 'group1',
            activity_count: 1,
            score: 10,
            updated_at: baseDate,
          }),
          createMockAggregatedActivity({
            group: 'group2',
            activity_count: 2,
            score: 20,
            updated_at: baseDate,
          }),
        ];
        const newActivities = [
          createMockAggregatedActivity({
            group: 'group1',
            activity_count: 3,
            score: 30,
            updated_at: new Date('2023-01-02'),
          }),
          createMockAggregatedActivity({
            group: 'group3',
            activity_count: 4,
            score: 40,
            updated_at: new Date('2023-01-02'),
          }),
        ];

        const result = addAggregatedActivitiesToState(
          newActivities,
          existingActivities,
          'replace',
        );

        expect(result.changed).toBe(true);
        expect(result.aggregated_activities).toHaveLength(3);

        // Check that group1 was replaced
        const replacedGroup1 = result.aggregated_activities.find(
          (a) => a.group === 'group1',
        );
        expect(replacedGroup1?.activity_count).toBe(3);
        expect(replacedGroup1?.score).toBe(30);
        expect(replacedGroup1?.updated_at).toEqual(new Date('2023-01-02'));

        // Check that group2 remains unchanged
        const unchangedGroup2 = result.aggregated_activities.find(
          (a) => a.group === 'group2',
        );
        expect(unchangedGroup2?.activity_count).toBe(2);
        expect(unchangedGroup2?.score).toBe(20);
        expect(unchangedGroup2?.updated_at).toEqual(baseDate);

        // Check that group3 was added
        const newGroup3 = result.aggregated_activities.find(
          (a) => a.group === 'group3',
        );
        expect(newGroup3?.activity_count).toBe(4);
        expect(newGroup3?.score).toBe(40);
        expect(newGroup3?.updated_at).toEqual(new Date('2023-01-02'));
      });

      it('should preserve order of existing activities when replacing', () => {
        const existingActivities = [
          createMockAggregatedActivity({ group: 'group1', activity_count: 1 }),
          createMockAggregatedActivity({ group: 'group2', activity_count: 2 }),
          createMockAggregatedActivity({ group: 'group3', activity_count: 3 }),
        ];
        const newActivities = [
          createMockAggregatedActivity({ group: 'group2', activity_count: 20 }),
          createMockAggregatedActivity({ group: 'group1', activity_count: 10 }),
        ];

        const result = addAggregatedActivitiesToState(
          newActivities,
          existingActivities,
          'replace',
        );

        expect(result.changed).toBe(true);
        expect(result.aggregated_activities).toHaveLength(3);

        // Check that order is preserved
        expect(result.aggregated_activities[0].group).toBe('group1');
        expect(result.aggregated_activities[0].activity_count).toBe(10);
        expect(result.aggregated_activities[1].group).toBe('group2');
        expect(result.aggregated_activities[1].activity_count).toBe(20);
        expect(result.aggregated_activities[2].group).toBe('group3');
        expect(result.aggregated_activities[2].activity_count).toBe(3);
      });

      it('should add new activities at the end when replacing', () => {
        const existingActivities = [
          createMockAggregatedActivity({ group: 'group1', activity_count: 1 }),
          createMockAggregatedActivity({ group: 'group2', activity_count: 2 }),
        ];
        const newActivities = [
          createMockAggregatedActivity({ group: 'group1', activity_count: 10 }),
          createMockAggregatedActivity({ group: 'group3', activity_count: 3 }),
          createMockAggregatedActivity({ group: 'group4', activity_count: 4 }),
        ];

        const result = addAggregatedActivitiesToState(
          newActivities,
          existingActivities,
          'replace',
        );

        expect(result.changed).toBe(true);
        expect(result.aggregated_activities).toHaveLength(4);

        // Check that existing activities are in their original positions
        expect(result.aggregated_activities[0].group).toBe('group1');
        expect(result.aggregated_activities[0].activity_count).toBe(10);
        expect(result.aggregated_activities[1].group).toBe('group2');
        expect(result.aggregated_activities[1].activity_count).toBe(2);

        // Check that new activities are added at the end
        expect(result.aggregated_activities[2].group).toBe('group3');
        expect(result.aggregated_activities[2].activity_count).toBe(3);
        expect(result.aggregated_activities[3].group).toBe('group4');
        expect(result.aggregated_activities[3].activity_count).toBe(4);
      });

      it('should handle empty new activities', () => {
        const existingActivities = [
          createMockAggregatedActivity({ group: 'group1', activity_count: 1 }),
          createMockAggregatedActivity({ group: 'group2', activity_count: 2 }),
        ];

        const result = addAggregatedActivitiesToState(
          [],
          existingActivities,
          'replace',
        );

        expect(result.changed).toBe(false);
        expect(result.aggregated_activities).toStrictEqual(existingActivities);
      });

      it('should handle both arrays being empty', () => {
        const result = addAggregatedActivitiesToState([], [], 'replace');

        expect(result.changed).toBe(false);
        expect(result.aggregated_activities).toStrictEqual([]);
      });

      it('should replace multiple activities with same groups', () => {
        const existingActivities = [
          createMockAggregatedActivity({
            group: 'group1',
            activity_count: 1,
            score: 10,
          }),
          createMockAggregatedActivity({
            group: 'group2',
            activity_count: 2,
            score: 20,
          }),
          createMockAggregatedActivity({
            group: 'group3',
            activity_count: 3,
            score: 30,
          }),
        ];
        const newActivities = [
          createMockAggregatedActivity({
            group: 'group1',
            activity_count: 10,
            score: 100,
          }),
          createMockAggregatedActivity({
            group: 'group3',
            activity_count: 30,
            score: 300,
          }),
          createMockAggregatedActivity({
            group: 'group4',
            activity_count: 4,
            score: 40,
          }),
        ];

        const result = addAggregatedActivitiesToState(
          newActivities,
          existingActivities,
          'replace',
        );

        expect(result.changed).toBe(true);
        expect(result.aggregated_activities).toHaveLength(4);

        // Check that group1 was replaced
        const replacedGroup1 = result.aggregated_activities.find(
          (a) => a.group === 'group1',
        );
        expect(replacedGroup1?.activity_count).toBe(10);
        expect(replacedGroup1?.score).toBe(100);

        // Check that group2 remains unchanged
        const unchangedGroup2 = result.aggregated_activities.find(
          (a) => a.group === 'group2',
        );
        expect(unchangedGroup2?.activity_count).toBe(2);
        expect(unchangedGroup2?.score).toBe(20);

        // Check that group3 was replaced
        const replacedGroup3 = result.aggregated_activities.find(
          (a) => a.group === 'group3',
        );
        expect(replacedGroup3?.activity_count).toBe(30);
        expect(replacedGroup3?.score).toBe(300);

        // Check that group4 was added
        const newGroup4 = result.aggregated_activities.find(
          (a) => a.group === 'group4',
        );
        expect(newGroup4?.activity_count).toBe(4);
        expect(newGroup4?.score).toBe(40);
      });
    });
  });

  describe('updateNotificationStatus', () => {
    it('should replace old state with new one', () => {
      const newNotificationStatus = createMockNotificationStatus({
        unread: 5,
        unseen: 3,
        read_activities: ['activity1', 'activity2'],
        seen_activities: ['activity3', 'activity4'],
      });

      const currentNotificationStatus = createMockNotificationStatus({
        unread: 2,
        unseen: 1,
        read_activities: ['activity5', 'activity6'],
        seen_activities: ['activity7', 'activity8'],
      });

      const result = updateNotificationStatus(
        newNotificationStatus,
        currentNotificationStatus,
      );

      expect(result.notification_status).toStrictEqual(newNotificationStatus);
    });
  });
});
