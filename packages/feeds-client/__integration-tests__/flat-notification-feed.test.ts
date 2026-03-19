import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  getTestUser,
  waitForEvent,
} from './utils';

import type { UserRequest } from '../src/gen/models';
import type { FeedsClient } from '../src/feeds-client';
import type { Feed } from '../src/feed';

function isFeedGroupMissingError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /feed group|not found|doesn't exist|does not exist/i.test(message);
}

describe('Flat notification feed', () => {
  let client1: FeedsClient;
  let client2: FeedsClient;
  let serverClient: ReturnType<typeof getServerClient>;

  const user1: UserRequest = getTestUser();
  const user2: UserRequest = getTestUser();

  let user1FlatNotificationFeed: Feed;

  beforeAll(async () => {
    serverClient = getServerClient();

    await serverClient.feeds.getOrCreateFeedGroup({
      id: 'flat-notification',
      default_visibility: 'private',
      notification: {
        track_read: true,
        track_seen: true,
      },
      push_notification: {
        enable_push: true,
        push_types: [],
      },
    });

    client1 = createTestClient();
    await client1.connectUser(user1, createTestTokenGenerator(user1));

    client2 = createTestClient();
    await client2.connectUser(user2, createTestTokenGenerator(user2));

    user1FlatNotificationFeed = client1.feed('flat-notification', user1.id, {
      onNewActivity: () => 'add-to-start',
    });

    const flatNotificationFeedServerUser1 = serverClient.feeds.feed(
      'flat-notification',
      user1.id,
    );
    try {
      await flatNotificationFeedServerUser1.getOrCreate({ user_id: user1.id });
    } catch (err) {
      if (isFeedGroupMissingError(err)) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await flatNotificationFeedServerUser1.getOrCreate({
          user_id: user1.id,
        });
      } else {
        throw err;
      }
    }

    await user1FlatNotificationFeed.getOrCreate({ watch: true });
  });

  it('user 2 follows user 1 - user 1 receives flat notification', async () => {
    const notificationPromise = Promise.all([
      waitForEvent(user1FlatNotificationFeed, 'feeds.activity.added', {
        timeoutMs: 15000,
        shouldReject: true,
      }),
      waitForEvent(
        user1FlatNotificationFeed,
        'feeds.notification_feed.updated',
        { timeoutMs: 15000, shouldReject: true },
      ),
    ]);
    void serverClient.feeds.addActivity({
      type: 'follow',
      text: 'started following you',
      feeds: [user1FlatNotificationFeed.feed],
      user_id: user2.id,
    });
    await notificationPromise;

    expect(
      user1FlatNotificationFeed.state.getLatestValue().notification_status
        ?.unseen,
    ).toBe(1);
    expect(
      user1FlatNotificationFeed.state.getLatestValue().notification_status
        ?.unread,
    ).toBe(1);
    expect(
      user1FlatNotificationFeed.state.getLatestValue().activities,
    ).toHaveLength(1);
  });

  it("user 2 likes user 1's post - user 1 receives flat notification", async () => {
    const notificationPromise = Promise.all([
      waitForEvent(user1FlatNotificationFeed, 'feeds.activity.added', {
        timeoutMs: 15000,
        shouldReject: true,
      }),
      waitForEvent(
        user1FlatNotificationFeed,
        'feeds.notification_feed.updated',
        { timeoutMs: 15000, shouldReject: true },
      ),
    ]);
    void serverClient.feeds.addActivity({
      type: 'like',
      text: 'liked your post',
      feeds: [user1FlatNotificationFeed.feed],
      user_id: user2.id,
    });
    await notificationPromise;

    expect(
      user1FlatNotificationFeed.state.getLatestValue().notification_status
        ?.unseen,
    ).toBe(2);
    expect(
      user1FlatNotificationFeed.state.getLatestValue().notification_status
        ?.unread,
    ).toBe(2);
    expect(
      user1FlatNotificationFeed.state.getLatestValue().activities,
    ).toHaveLength(2);
  });

  it("user 2 adds comment to user 1's post - user 1 receives flat notification", async () => {
    const notificationPromise = Promise.all([
      waitForEvent(user1FlatNotificationFeed, 'feeds.activity.added', {
        timeoutMs: 15000,
        shouldReject: true,
      }),
      waitForEvent(
        user1FlatNotificationFeed,
        'feeds.notification_feed.updated',
        { timeoutMs: 15000, shouldReject: true },
      ),
    ]);
    void serverClient.feeds.addActivity({
      type: 'comment',
      text: 'commented on your post',
      feeds: [user1FlatNotificationFeed.feed],
      user_id: user2.id,
    });
    await notificationPromise;

    expect(
      user1FlatNotificationFeed.state.getLatestValue().notification_status
        ?.unseen,
    ).toBe(3);
    expect(
      user1FlatNotificationFeed.state.getLatestValue().notification_status
        ?.unread,
    ).toBe(3);
    expect(
      user1FlatNotificationFeed.state.getLatestValue().activities,
    ).toHaveLength(3);
  });

  it('user marks first flat notification as read and seen', async () => {
    const activities =
      user1FlatNotificationFeed.state.getLatestValue().activities ?? [];
    const firstActivity = activities[0];
    expect(firstActivity?.id).toBeDefined();

    await Promise.all([
      user1FlatNotificationFeed.markActivity({
        mark_read: [firstActivity.id],
        mark_seen: [firstActivity.id],
      }),
      waitForEvent(
        user1FlatNotificationFeed,
        'feeds.notification_feed.updated',
        { timeoutMs: 15000, shouldReject: true },
      ),
    ]);

    const stateAfter = user1FlatNotificationFeed.state.getLatestValue();

    expect(stateAfter.notification_status?.unread).toBe(2);
    expect(stateAfter.notification_status?.unseen).toBe(2);
    expect(stateAfter.notification_status?.read_activities).toContain(
      firstActivity.id,
    );
    expect(stateAfter.notification_status?.seen_activities).toContain(
      firstActivity.id,
    );
  });

  it('per-activity is_seen and is_read are set', async () => {
    await user1FlatNotificationFeed.getOrCreate({ limit: 20 });

    const activities =
      user1FlatNotificationFeed.state.getLatestValue().activities ?? [];
    expect(activities.length).toBeGreaterThan(0);

    const firstActivity = activities[0];
    expect(typeof (firstActivity.is_read ?? false)).toBe('boolean');
    expect(typeof (firstActivity.is_seen ?? false)).toBe('boolean');
  });

  it('mark all read and seen clears unread and unseen', async () => {
    await user1FlatNotificationFeed.markActivity({ mark_all_read: true });
    await user1FlatNotificationFeed.markActivity({ mark_all_seen: true });

    await user1FlatNotificationFeed.getOrCreate();

    const stateAfter = user1FlatNotificationFeed.state.getLatestValue();

    expect(stateAfter.notification_status?.unread).toBe(0);
    expect(stateAfter.notification_status?.unseen).toBe(0);
  });

  afterAll(async () => {
    await user1FlatNotificationFeed.delete({ hard_delete: true });

    await client1.disconnectUser();
    await client2.disconnectUser();
  });
});
