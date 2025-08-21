import { describe, it, expect } from 'vitest';
import {
  NotificationFeedUpdatedEvent,
  NotificationStatusResponse,
  AggregatedActivityResponse,
} from '../../../gen/models';
import { updateNotificationFeedFromEvent } from './handle-notification-feed-updated';

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

      const result = updateNotificationFeedFromEvent(event);

      expect(result.changed).toBe(false);
    });

    it('should update notification_status when event has notification_status', () => {
      const notificationStatus = createMockNotificationStatus({
        unread: 5,
        unseen: 3,
        read_activities: ['activity1', 'activity2'],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: notificationStatus,
      });

      const result = updateNotificationFeedFromEvent(event);

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status).toEqual(notificationStatus);
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

      const result = updateNotificationFeedFromEvent(event);

      expect(result.changed).toBe(true);
      expect(result.data?.aggregated_activities).toEqual(aggregatedActivities);
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

      const result = updateNotificationFeedFromEvent(event);

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status).toEqual(notificationStatus);
      expect(result.data?.aggregated_activities).toEqual(aggregatedActivities);
    });

    it('should handle notification_status with all fields', () => {
      const notificationStatus = createMockNotificationStatus({
        unread: 10,
        unseen: 5,
        last_seen_at: new Date('2023-01-01'),
        read_activities: ['activity1', 'activity2', 'activity3'],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: notificationStatus,
      });

      const result = updateNotificationFeedFromEvent(event);

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status).toEqual(notificationStatus);
    });
  });
});
