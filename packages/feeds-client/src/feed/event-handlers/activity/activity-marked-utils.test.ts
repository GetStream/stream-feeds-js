import { describe, it, expect } from 'vitest';
import {
  ActivityMarkEvent,
  NotificationStatusResponse,
} from '../../../gen/models';
import { updateNotificationStatusFromActivityMarked } from './handle-activity-marked';

const createMockActivityMarkEvent = (
  overrides: Partial<ActivityMarkEvent> = {},
): ActivityMarkEvent => ({
  created_at: new Date(),
  fid: 'user:notification',
  custom: {},
  type: 'feeds.activity.marked',
  ...overrides,
});

const createMockNotificationStatus = (
  overrides: Partial<NotificationStatusResponse> = {},
): NotificationStatusResponse => ({
  unread: 0,
  unseen: 0,
  ...overrides,
});

const createMockAggregatedActivity = (group: string) => ({ group });

describe('activity-marked-utils', () => {
  describe('updateNotificationStatusFromActivityMarked', () => {
    it('should return unchanged if notification_status is undefined', () => {
      const event = createMockActivityMarkEvent({ mark_all_read: true });
      const currentStatus = undefined;

      const result = updateNotificationStatusFromActivityMarked(
        event,
        currentStatus,
      );

      expect(result.changed).toBe(false);
    });

    it('should handle mark_all_read by adding all aggregated activity groups', () => {
      const event = createMockActivityMarkEvent({ mark_all_read: true });
      const currentStatus = createMockNotificationStatus({
        read_activities: ['existing1'],
      });
      const aggregatedActivities = [
        createMockAggregatedActivity('group1'),
        createMockAggregatedActivity('group2'),
        createMockAggregatedActivity('group3'),
      ];

      const result = updateNotificationStatusFromActivityMarked(
        event,
        currentStatus,
        aggregatedActivities,
      );

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status.read_activities).toEqual([
        'existing1',
        'group1',
        'group2',
        'group3',
      ]);
    });

    it('should handle mark_read by adding specific activity IDs', () => {
      const event = createMockActivityMarkEvent({
        mark_read: ['activity1', 'activity2'],
      });
      const currentStatus = createMockNotificationStatus({
        read_activities: ['existing1'],
      });

      const result = updateNotificationStatusFromActivityMarked(
        event,
        currentStatus,
      );

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status.read_activities).toEqual([
        'existing1',
        'activity1',
        'activity2',
      ]);
    });

    it('should handle mark_all_seen by setting last_seen_at to current date', () => {
      const event = createMockActivityMarkEvent({ mark_all_seen: true });
      const currentStatus = createMockNotificationStatus({
        last_seen_at: new Date('2023-01-01'),
      });

      const result = updateNotificationStatusFromActivityMarked(
        event,
        currentStatus,
      );

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status.last_seen_at).toBeInstanceOf(
        Date,
      );
      expect(
        result.data?.notification_status.last_seen_at!.getTime(),
      ).toBeGreaterThan(new Date('2023-01-01').getTime());
    });

    it('should handle multiple mark flags simultaneously', () => {
      const event = createMockActivityMarkEvent({
        mark_all_read: true,
        mark_all_seen: true,
      });
      const currentStatus = createMockNotificationStatus({
        read_activities: ['existing1'],
        last_seen_at: new Date('2023-01-01'),
      });
      const aggregatedActivities = [
        createMockAggregatedActivity('group1'),
        createMockAggregatedActivity('group2'),
      ];

      const result = updateNotificationStatusFromActivityMarked(
        event,
        currentStatus,
        aggregatedActivities,
      );

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status.read_activities).toEqual([
        'existing1',
        'group1',
        'group2',
      ]);
      expect(result.data?.notification_status.last_seen_at).toBeInstanceOf(
        Date,
      );
    });

    it('should deduplicate read activities when adding new ones', () => {
      const event = createMockActivityMarkEvent({
        mark_read: ['activity1', 'activity1', 'activity2'],
      });
      const currentStatus = createMockNotificationStatus({
        read_activities: ['existing1', 'activity1'],
      });

      const result = updateNotificationStatusFromActivityMarked(
        event,
        currentStatus,
      );

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status.read_activities).toEqual([
        'existing1',
        'activity1',
        'activity2',
      ]);
    });

    it('should preserve existing notification status fields', () => {
      const event = createMockActivityMarkEvent({ mark_all_seen: true });
      const currentStatus = createMockNotificationStatus({
        unread: 5,
        unseen: 3,
        read_activities: ['existing1'],
      });

      const result = updateNotificationStatusFromActivityMarked(
        event,
        currentStatus,
      );

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status.unread).toBe(5);
      expect(result.data?.notification_status.unseen).toBe(3);
      expect(result.data?.notification_status.read_activities).toEqual([
        'existing1',
      ]);
      expect(result.data?.notification_status.last_seen_at).toBeInstanceOf(
        Date,
      );
    });

    it('should handle mark_all_read with no existing read_activities', () => {
      const event = createMockActivityMarkEvent({ mark_all_read: true });
      const currentStatus = createMockNotificationStatus({
        read_activities: undefined,
      });
      const aggregatedActivities = [
        createMockAggregatedActivity('group1'),
        createMockAggregatedActivity('group2'),
      ];

      const result = updateNotificationStatusFromActivityMarked(
        event,
        currentStatus,
        aggregatedActivities,
      );

      expect(result.changed).toBe(true);
      expect(result.data?.notification_status.read_activities).toEqual([
        'group1',
        'group2',
      ]);
    });
  });
});
