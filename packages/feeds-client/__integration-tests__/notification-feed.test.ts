 

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from './utils';

import type { UserRequest } from '../src/gen/models';
import type { FeedsClient } from '../src/feeds-client';
import type { Feed } from '../src/feed';

describe('Notification Feed Test Setup', () => {
  let client1: FeedsClient;
  let client2: FeedsClient;

  // Create two test users
  const user1: UserRequest = getTestUser();
  const user2: UserRequest = getTestUser();

  // Feeds for user1
  let user1UserFeed: Feed;
  let user1NotificationFeed: Feed;
  let user1TimelineFeed: Feed;

  // Feeds for user2
  let user2UserFeed: Feed;
  let user2NotificationFeed: Feed;
  let user2TimelineFeed: Feed;

  beforeAll(async () => {
    // Create and connect first client
    client1 = createTestClient();
    await client1.connectUser(user1, createTestTokenGenerator(user1));

    // Create and connect second client
    client2 = createTestClient();
    await client2.connectUser(user2, createTestTokenGenerator(user2));

    // Initialize feeds for user1
    user1UserFeed = client1.feed('user', user1.id);
    user1NotificationFeed = client1.feed('notification', user1.id);
    user1TimelineFeed = client1.feed('timeline', user1.id);

    // Initialize feeds for user2
    user2UserFeed = client2.feed('user', user2.id);
    user2NotificationFeed = client2.feed('notification', user2.id);
    user2TimelineFeed = client2.feed('timeline', user2.id);

    await user1UserFeed.getOrCreate({
      watch: true,
      data: { visibility: 'public' },
    });
    await user2UserFeed.getOrCreate({
      watch: true,
      data: { visibility: 'public' },
    });

    // Create notification feeds
    await user1NotificationFeed.getOrCreate({ watch: true });
    await user2NotificationFeed.getOrCreate({ watch: true });

    // Create timeline feeds
    await user1TimelineFeed.getOrCreate({ watch: true });
    await user2TimelineFeed.getOrCreate({ watch: true });

    await user1UserFeed.addActivity({
      type: 'post',
      text: 'Hello, world!',
    });
  });

  it(`user 2 follows user 1 - user 1 receives notification`, async () => {
    await Promise.all([
      user2TimelineFeed.follow(user1UserFeed.feed, {
        create_notification_activity: true,
      }),
      waitForEvent(user1NotificationFeed, 'feeds.notification_feed.updated'),
    ]);

    expect(
      user1NotificationFeed.state.getLatestValue().notification_status?.unseen,
    ).toBe(1);
    expect(
      user1NotificationFeed.state.getLatestValue().notification_status?.unread,
    ).toBe(1);
    expect(
      user1NotificationFeed.state.getLatestValue().aggregated_activities,
    ).toHaveLength(1);
  });

  it(`user 2 likes user 1's post - user 1 receives notification`, async () => {
    await user2TimelineFeed.getOrCreate({ watch: true });

    const activity = user2TimelineFeed.state.getLatestValue().activities?.[0]!;

    await Promise.all([
      client2.addActivityReaction({
        activity_id: activity.id,
        type: 'like',
        create_notification_activity: true,
      }),
      waitForEvent(user1NotificationFeed, 'feeds.notification_feed.updated'),
    ]);

    expect(
      user1NotificationFeed.state.getLatestValue().notification_status?.unseen,
    ).toBe(2);

    expect(
      user1NotificationFeed.state.getLatestValue().notification_status?.unread,
    ).toBe(2);

    expect(
      user1NotificationFeed.state.getLatestValue().aggregated_activities,
    ).toHaveLength(2);
  });

  it(`user 2 adds comment to user 1's post - user 1 receives notification`, async () => {
    const activity = user2TimelineFeed.state.getLatestValue().activities?.[0]!;

    await Promise.all([
      client2.addComment({
        object_id: activity.id,
        object_type: 'activity',
        comment: 'Nice post!',
        create_notification_activity: true,
      }),
      waitForEvent(user1NotificationFeed, 'feeds.notification_feed.updated'),
    ]);

    expect(
      user1NotificationFeed.state.getLatestValue().notification_status?.unseen,
    ).toBe(3);

    expect(
      user1NotificationFeed.state.getLatestValue().notification_status?.unread,
    ).toBe(3);

    expect(
      user1NotificationFeed.state.getLatestValue().aggregated_activities,
    ).toHaveLength(3);
  });

  it(`user marks first notification as read and seen`, async () => {
    const firstActivity =
      user1NotificationFeed.state.getLatestValue().aggregated_activities?.[0]!;

    await Promise.all([
      user1NotificationFeed.markActivity({
        mark_read: [firstActivity.group],
        mark_seen: [firstActivity.group],
      }),
      waitForEvent(user1NotificationFeed, 'feeds.activity.marked'),
      waitForEvent(user1NotificationFeed, 'feeds.notification_feed.updated'),
    ]);

    const stateAfter = user1NotificationFeed.state.getLatestValue();

    expect(stateAfter.notification_status?.unread).toBe(2);
    expect(stateAfter.notification_status?.unseen).toBe(2);
    expect(stateAfter.notification_status?.read_activities?.[0]).toBe(
      firstActivity.group,
    );
    // TODO: check whether this was expected behavior, last_seen_at is currently updated only when mark_all_seen is true
    // expect(stateAfter.notification_status?.last_seen_at).toBeDefined();
  });

  afterAll(async () => {
    await user1UserFeed.delete({ hard_delete: true });
    await user2UserFeed.delete({ hard_delete: true });
    await user1NotificationFeed.delete({ hard_delete: true });
    await user2NotificationFeed.delete({ hard_delete: true });
    await user1TimelineFeed.delete({ hard_delete: true });
    await user2TimelineFeed.delete({ hard_delete: true });

    await client1.disconnectUser();
    await client2.disconnectUser();
  });
});
