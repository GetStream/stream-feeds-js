import { describe, it, expect } from 'vitest';
import {
  updateNotificationFeedFromEvent,
  updateNotificationStatus,
} from './handle-notification-feed-updated';
import {
  createMockAggregatedActivity,
  createMockNotificationFeedUpdatedEvent,
  createMockNotificationStatus,
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
});
