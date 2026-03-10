import { describe, it, expect } from 'vitest';
import {
  updateNotificationFeedFromEvent,
  updateNotificationStatus,
} from './handle-notification-feed-updated';
import {
  createMockAggregatedActivity,
  createMockNotificationFeedUpdatedEvent,
  createMockNotificationStatus,
  generateActivityResponse,
} from '../../../test-utils';

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

    it(`should update notification_status when event has notification_status and currentNotificationStatus is undefined`, () => {
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus(),
      });
      const result = updateNotificationFeedFromEvent(event, [], undefined);

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status).toStrictEqual(
        event.notification_status,
      );
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

  describe('flat feed is_read/is_seen', () => {
    it('should set is_read/is_seen true for activities before last_read_at/last_seen_at', () => {
      const activity = generateActivityResponse({
        id: 'a1',
        updated_at: new Date('2023-01-01'),
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          last_read_at: new Date('2023-06-01'),
          last_seen_at: new Date('2023-06-01'),
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        undefined,
        undefined,
        [activity],
      );

      expect(result.changed).toBe(true);
      expect(result.data?.activities?.[0].is_read).toBe(true);
      expect(result.data?.activities?.[0].is_seen).toBe(true);
    });

    it('should keep is_read/is_seen false for activities after last_read_at/last_seen_at', () => {
      const activity = generateActivityResponse({
        id: 'a1',
        updated_at: new Date('2023-12-01'),
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          last_read_at: new Date('2023-06-01'),
          last_seen_at: new Date('2023-06-01'),
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        undefined,
        undefined,
        [activity],
      );

      expect(result.changed).toBe(true);
      expect(result.data?.activities?.[0].is_read).toBe(false);
      expect(result.data?.activities?.[0].is_seen).toBe(false);
    });

    it('should set is_read/is_seen true for activities in read_activities/seen_activities by id', () => {
      const activity = generateActivityResponse({
        id: 'a1',
        updated_at: new Date('2023-12-01'),
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          read_activities: ['a1'],
          seen_activities: ['a1'],
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        undefined,
        undefined,
        [activity],
      );

      expect(result.changed).toBe(true);
      expect(result.data?.activities?.[0].is_read).toBe(true);
      expect(result.data?.activities?.[0].is_seen).toBe(true);
    });

    it('should not include activities in updates when values already match', () => {
      const activity = generateActivityResponse({
        id: 'a1',
        updated_at: new Date('2023-01-01'),
        is_read: true,
        is_seen: true,
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          last_read_at: new Date('2023-06-01'),
          last_seen_at: new Date('2023-06-01'),
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        undefined,
        undefined,
        [activity],
      );

      expect(result.changed).toBe(true);
      // Only notification_status should be in updates, not activities
      expect(result.data?.notification_status).toBeDefined();
      expect(result.data?.activities).toBeUndefined();
    });

    it('should fall back to current notification_status when event does not include one', () => {
      const activity = generateActivityResponse({
        id: 'a1',
        updated_at: new Date('2023-01-01'),
      });
      const event = createMockNotificationFeedUpdatedEvent();
      const currentStatus = createMockNotificationStatus({
        last_read_at: new Date('2023-06-01'),
        last_seen_at: new Date('2023-06-01'),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        undefined,
        currentStatus,
        [activity],
      );

      expect(result.changed).toBe(true);
      expect(result.data?.activities?.[0].is_read).toBe(true);
      expect(result.data?.activities?.[0].is_seen).toBe(true);
    });
  });

  describe('aggregated feed is_read/is_seen', () => {
    it('should set is_read/is_seen true for groups before last_read_at/last_seen_at', () => {
      const group = createMockAggregatedActivity({
        group: 'group1',
        updated_at: new Date('2023-01-01'),
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          last_read_at: new Date('2023-06-01'),
          last_seen_at: new Date('2023-06-01'),
        }),
      });

      const result = updateNotificationFeedFromEvent(event, [group], undefined);

      expect(result.changed).toBe(true);
      expect(result.data?.aggregated_activities?.[0].is_read).toBe(true);
      expect(result.data?.aggregated_activities?.[0].is_seen).toBe(true);
    });

    it('should set is_read/is_seen true for groups in read_activities/seen_activities by group id', () => {
      const group = createMockAggregatedActivity({
        group: 'group1',
        updated_at: new Date('2023-12-01'),
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          read_activities: ['group1'],
          seen_activities: ['group1'],
        }),
      });

      const result = updateNotificationFeedFromEvent(event, [group], undefined);

      expect(result.changed).toBe(true);
      expect(result.data?.aggregated_activities?.[0].is_read).toBe(true);
      expect(result.data?.aggregated_activities?.[0].is_seen).toBe(true);
    });

    it('should work correctly when combined with aggregated_activities merge from event', () => {
      const existingGroup = createMockAggregatedActivity({
        group: 'group1',
        updated_at: new Date('2023-01-01'),
      });
      const newGroup = createMockAggregatedActivity({
        group: 'group2',
        updated_at: new Date('2023-01-03'),
        is_read: true,
        is_seen: true,
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [newGroup],
        notification_status: createMockNotificationStatus({
          last_read_at: new Date('2023-01-06'),
          last_seen_at: new Date('2023-01-06'),
        }),
      });

      const result = updateNotificationFeedFromEvent(event, [existingGroup]);

      expect(result.changed).toBe(true);
      // Both groups should be present and have is_read/is_seen set
      const groups = result.data?.aggregated_activities;
      expect(groups).toBeDefined();
      expect(groups?.every((g) => g.is_read === true)).toBe(true);
      expect(groups?.every((g) => g.is_seen === true)).toBe(true);
    });
  });
});
