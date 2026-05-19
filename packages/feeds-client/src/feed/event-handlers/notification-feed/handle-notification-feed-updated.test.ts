import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../feed';
import { FeedsClient } from '../../../feeds-client';
import {
  handleNotificationFeedUpdated,
  updateNotificationFeedFromEvent,
  updateNotificationStatus,
} from './handle-notification-feed-updated';
import {
  createMockAggregatedActivity,
  createMockNotificationFeedUpdatedEvent,
  createMockNotificationStatus,
  generateActivityResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils/response-generators';

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

  describe('aggregated_activities filtering by requestConfig', () => {
    it('drops groups whose activities do not match the filter', () => {
      const matchingGroup = createMockAggregatedActivity({
        group: 'g-match',
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
        ],
      });
      const missingGroup = createMockAggregatedActivity({
        group: 'g-miss',
        activities: [
          generateActivityResponse({ id: 'a2', filter_tags: ['red'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [matchingGroup, missingGroup],
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        undefined,
        undefined,
        { filter: { filter_tags: ['blue'] } },
      );

      expect(result.changed).toBe(true);
      expect(result.data?.aggregated_activities?.map((g) => g.group)).toEqual([
        'g-match',
      ]);
    });

    it('keeps a group but trims its activities to only those matching the filter', () => {
      const group = createMockAggregatedActivity({
        group: 'g1',
        activities: [
          generateActivityResponse({ id: 'a-match', filter_tags: ['blue'] }),
          generateActivityResponse({ id: 'a-miss', filter_tags: ['red'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [group],
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        undefined,
        undefined,
        { filter: { filter_tags: ['blue'] } },
      );

      const merged = result.data?.aggregated_activities;
      expect(merged).toHaveLength(1);
      expect(merged?.[0].activities.map((a) => a.id)).toEqual(['a-match']);
    });

    it('passes aggregated_activities through unchanged when requestConfig has no filter', () => {
      const group = createMockAggregatedActivity({
        group: 'g1',
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['red'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [group],
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        undefined,
        undefined,
        { limit: 10 },
      );

      expect(result.data?.aggregated_activities).toHaveLength(1);
      expect(result.data?.aggregated_activities?.[0].group).toBe('g1');
    });

    it('applies activity_type filter to event groups', () => {
      const group = createMockAggregatedActivity({
        group: 'g1',
        activities: [
          generateActivityResponse({ id: 'a1', type: 'hike' }),
          generateActivityResponse({ id: 'a2', type: 'post' }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [group],
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        undefined,
        undefined,
        { filter: { activity_type: 'hike' } },
      );

      const merged = result.data?.aggregated_activities;
      expect(merged).toHaveLength(1);
      expect(merged?.[0].activities.map((a) => a.id)).toEqual(['a1']);
    });

    it('replaces an existing group with its filtered version (replace-then-start merge)', () => {
      const existingGroup = createMockAggregatedActivity({
        group: 'g1',
        activities: [
          generateActivityResponse({ id: 'a-old', filter_tags: ['blue'] }),
        ],
      });
      const incomingGroup = createMockAggregatedActivity({
        group: 'g1',
        activities: [
          generateActivityResponse({
            id: 'a-new-match',
            filter_tags: ['blue'],
          }),
          generateActivityResponse({ id: 'a-new-miss', filter_tags: ['red'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [incomingGroup],
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [existingGroup],
        undefined,
        undefined,
        { filter: { filter_tags: ['blue'] } },
      );

      const merged = result.data?.aggregated_activities;
      expect(merged).toHaveLength(1);
      expect(merged?.[0].group).toBe('g1');
      expect(merged?.[0].activities.map((a) => a.id)).toEqual(['a-new-match']);
    });
  });

  describe('notification_status delta logic for filtered aggregated feeds', () => {
    const filteredConfig = { filter: { filter_tags: ['blue'] } };

    it('increments unread/unseen by 1 when a filter-matching unread group is added', () => {
      const newGroup = createMockAggregatedActivity({
        group: 'g-new',
        is_read: false,
        is_seen: false,
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [newGroup],
        notification_status: createMockNotificationStatus({
          unread: 5,
          unseen: 5,
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        createMockNotificationStatus({ unread: 3, unseen: 3 }),
        undefined,
        filteredConfig,
      );

      expect(result.data?.notification_status?.unread).toBe(4);
      expect(result.data?.notification_status?.unseen).toBe(4);
    });

    it('keeps unread/unseen unchanged when a non-matching unread group is filtered out', () => {
      const missingGroup = createMockAggregatedActivity({
        group: 'g-miss',
        is_read: false,
        is_seen: false,
        activities: [
          generateActivityResponse({ id: 'a-miss', filter_tags: ['red'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [missingGroup],
        notification_status: createMockNotificationStatus({
          unread: 5,
          unseen: 5,
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        createMockNotificationStatus({ unread: 3, unseen: 3 }),
        undefined,
        filteredConfig,
      );

      expect(result.data?.notification_status?.unread).toBe(3);
      expect(result.data?.notification_status?.unseen).toBe(3);
    });

    it('decrements unread when last_read_at flips an existing group to read', () => {
      const existingGroup = createMockAggregatedActivity({
        group: 'g1',
        updated_at: new Date('2023-01-01'),
        is_read: false,
        is_seen: false,
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          unread: 5,
          unseen: 5,
          last_read_at: new Date('2023-06-01'),
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [existingGroup],
        createMockNotificationStatus({ unread: 3, unseen: 3 }),
        undefined,
        filteredConfig,
      );

      expect(result.data?.notification_status?.unread).toBe(2);
      expect(result.data?.notification_status?.unseen).toBe(3);
    });

    it('copies last_read_at, last_seen_at, read_activities, seen_activities verbatim from the event', () => {
      const lastReadAt = new Date('2023-06-01');
      const lastSeenAt = new Date('2023-07-01');
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          unread: 5,
          unseen: 5,
          last_read_at: lastReadAt,
          last_seen_at: lastSeenAt,
          read_activities: ['g-read-1', 'g-read-2'],
          seen_activities: ['g-seen-1'],
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        createMockNotificationStatus({ unread: 1, unseen: 1 }),
        undefined,
        filteredConfig,
      );

      const status = result.data?.notification_status;
      expect(status?.last_read_at).toEqual(lastReadAt);
      expect(status?.last_seen_at).toEqual(lastSeenAt);
      expect(status?.read_activities).toEqual(['g-read-1', 'g-read-2']);
      expect(status?.seen_activities).toEqual(['g-seen-1']);
    });

    it('clamps unread/unseen to 0 when the delta would push them negative', () => {
      const existingGroup = createMockAggregatedActivity({
        group: 'g1',
        updated_at: new Date('2023-01-01'),
        is_read: false,
        is_seen: false,
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          unread: 1,
          unseen: 1,
          last_read_at: new Date('2023-06-01'),
          last_seen_at: new Date('2023-06-01'),
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [existingGroup],
        createMockNotificationStatus({ unread: 0, unseen: 0 }),
        undefined,
        filteredConfig,
      );

      expect(result.data?.notification_status?.unread).toBe(0);
      expect(result.data?.notification_status?.unseen).toBe(0);
    });

    it('short-circuits to 0 when the event reports unread=0 or unseen=0', () => {
      const newGroup = createMockAggregatedActivity({
        group: 'g-new',
        is_read: false,
        is_seen: false,
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [newGroup],
        notification_status: createMockNotificationStatus({
          unread: 0,
          unseen: 0,
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        createMockNotificationStatus({ unread: 10, unseen: 10 }),
        undefined,
        filteredConfig,
      );

      expect(result.data?.notification_status?.unread).toBe(0);
      expect(result.data?.notification_status?.unseen).toBe(0);
    });

    it('short-circuits unread and unseen independently', () => {
      const newGroup = createMockAggregatedActivity({
        group: 'g-new',
        is_read: false,
        is_seen: false,
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [newGroup],
        notification_status: createMockNotificationStatus({
          unread: 0,
          unseen: 5,
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        createMockNotificationStatus({ unread: 3, unseen: 3 }),
        undefined,
        filteredConfig,
      );

      expect(result.data?.notification_status?.unread).toBe(0);
      expect(result.data?.notification_status?.unseen).toBe(4);
    });

    it('copies event notification_status verbatim when currentNotificationStatus is undefined (no base for delta)', () => {
      const newGroup = createMockAggregatedActivity({
        group: 'g-new',
        is_read: false,
        is_seen: false,
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [newGroup],
        notification_status: createMockNotificationStatus({
          unread: 5,
          unseen: 5,
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        undefined,
        undefined,
        filteredConfig,
      );

      expect(result.data?.notification_status?.unread).toBe(5);
      expect(result.data?.notification_status?.unseen).toBe(5);
    });

    it('keeps current unread/unseen when neither aggregated_activities nor flags change', () => {
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          unread: 99,
          unseen: 99,
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        createMockNotificationStatus({ unread: 3, unseen: 3 }),
        undefined,
        filteredConfig,
      );

      expect(result.data?.notification_status?.unread).toBe(3);
      expect(result.data?.notification_status?.unseen).toBe(3);
    });

    it('uses full copy (no delta) when the request has no filter', () => {
      const newGroup = createMockAggregatedActivity({
        group: 'g-new',
        is_read: false,
        is_seen: false,
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
        ],
      });
      const event = createMockNotificationFeedUpdatedEvent({
        aggregated_activities: [newGroup],
        notification_status: createMockNotificationStatus({
          unread: 9,
          unseen: 9,
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        [],
        createMockNotificationStatus({ unread: 3, unseen: 3 }),
        undefined,
        { limit: 10 },
      );

      expect(result.data?.notification_status?.unread).toBe(9);
      expect(result.data?.notification_status?.unseen).toBe(9);
    });

    it('uses full copy (no delta) for a flat feed even when filter is active', () => {
      const event = createMockNotificationFeedUpdatedEvent({
        notification_status: createMockNotificationStatus({
          unread: 9,
          unseen: 9,
        }),
      });

      const result = updateNotificationFeedFromEvent(
        event,
        undefined,
        createMockNotificationStatus({ unread: 3, unseen: 3 }),
        undefined,
        filteredConfig,
      );

      expect(result.data?.notification_status?.unread).toBe(9);
      expect(result.data?.notification_status?.unseen).toBe(9);
    });
  });
});

describe(handleNotificationFeedUpdated.name, () => {
  let feed: Feed;
  let client: FeedsClient;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    client.state.partialNext({
      connected_user: generateOwnUser({ id: getHumanId() }),
    });

    const feedResponse = generateFeedResponse({
      id: 'user1',
      group_id: 'notification',
    });

    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
  });

  it('drops event groups that do not match the feed-level filter stored in last_get_or_create_request_config', () => {
    const matchingGroup = createMockAggregatedActivity({
      group: 'g-match',
      activities: [
        generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
        generateActivityResponse({ id: 'a2', filter_tags: ['red'] }),
      ],
    });
    const missingGroup = createMockAggregatedActivity({
      group: 'g-miss',
      activities: [
        generateActivityResponse({ id: 'a3', filter_tags: ['red'] }),
      ],
    });

    feed.state.partialNext({
      aggregated_activities: [],
      last_get_or_create_request_config: {
        filter: { filter_tags: ['blue'] },
      },
    });

    const event = createMockNotificationFeedUpdatedEvent({
      aggregated_activities: [matchingGroup, missingGroup],
    });

    handleNotificationFeedUpdated.call(
      feed,
      event as Parameters<typeof handleNotificationFeedUpdated>[1],
    );

    const aggregated = feed.currentState.aggregated_activities;
    expect(aggregated).toHaveLength(1);
    expect(aggregated?.[0].group).toBe('g-match');
    expect(aggregated?.[0].activities.map((a) => a.id)).toEqual(['a1']);
  });

  it('keeps aggregated_activities when a status-only event refreshes last_seen_at and groups are unchanged', () => {
    const lastSeenFirst = new Date('2023-06-01');
    const lastSeenSecond = new Date('2023-12-01');
    const aggregated = [
      createMockAggregatedActivity({
        group: 'group1',
        updated_at: new Date('2023-01-01'),
        is_read: true,
        is_seen: true,
      }),
    ];
    const notificationStatus = createMockNotificationStatus({
      unseen: 0,
      unread: 0,
      last_seen_at: lastSeenFirst,
      last_read_at: lastSeenFirst,
    });

    feed.state.partialNext({
      aggregated_activities: aggregated,
      notification_status: notificationStatus,
    });

    const event = createMockNotificationFeedUpdatedEvent({
      notification_status: createMockNotificationStatus({
        unseen: 0,
        unread: 0,
        last_seen_at: lastSeenSecond,
        last_read_at: lastSeenSecond,
      }),
    });

    handleNotificationFeedUpdated.call(
      feed,
      event as Parameters<typeof handleNotificationFeedUpdated>[1],
    );

    expect(feed.currentState.aggregated_activities).toHaveLength(1);
    expect(feed.currentState.aggregated_activities?.[0].group).toBe('group1');
    expect(feed.currentState.notification_status?.last_seen_at).toEqual(
      lastSeenSecond,
    );
  });
});
