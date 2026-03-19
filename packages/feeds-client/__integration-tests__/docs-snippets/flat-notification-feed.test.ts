import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { ActivityResponse, UserRequest } from '../../src/gen/models';
import type { StreamFeed } from '@stream-io/node-sdk';

function isFeedGroupMissingError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /feed group|not found|doesn't exist|does not exist/i.test(message);
}

describe('Flat notification feed', () => {
  let janeClient: FeedsClient;
  let flatNotificationFeed: Feed;
  let flatNotificationFeedServer: StreamFeed;
  const user: UserRequest = getTestUser();

  beforeAll(async () => {
    const serverClient = getServerClient();

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

    janeClient = createTestClient();
    await janeClient.connectUser(user, createTestTokenGenerator(user));

    flatNotificationFeedServer = serverClient.feeds.feed(
      'flat-notification',
      user.id,
    );

    try {
      await flatNotificationFeedServer.getOrCreate({ user_id: user.id });
    } catch (err) {
      if (isFeedGroupMissingError(err)) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await flatNotificationFeedServer.getOrCreate({ user_id: user.id });
      } else {
        throw err;
      }
    }

    flatNotificationFeed = janeClient.feed('flat-notification', user.id, {
      onNewActivity: () => 'add-to-start',
    });
    await flatNotificationFeed.getOrCreate();

    await serverClient.feeds.addActivity({
      type: 'post',
      text: 'Flat notification 1',
      feeds: [`flat-notification:${user.id}`],
      user_id: user.id,
    });
    await serverClient.feeds.addActivity({
      type: 'post',
      text: 'Flat notification 2',
      feeds: [`flat-notification:${user.id}`],
      user_id: user.id,
    });
    await serverClient.feeds.addActivity({
      type: 'post',
      text: 'Flat notification 3',
      feeds: [`flat-notification:${user.id}`],
      user_id: user.id,
    });
  });

  it('reading and paginating flat notifications', async () => {
    await flatNotificationFeed.getOrCreate({ limit: 20 });
    const page1 = flatNotificationFeed.state.getLatestValue().activities ?? [];
    expect(page1.length).toBeGreaterThanOrEqual(3);

    await flatNotificationFeed.getNextPage();
    const page1And2 =
      flatNotificationFeed.state.getLatestValue().activities ?? [];
    expect(page1And2.length).toBeGreaterThanOrEqual(page1.length);
  });

  it('per-activity is_seen and is_read', async () => {
    await flatNotificationFeed.getOrCreate({ limit: 20 });
    const activities =
      flatNotificationFeed.state.getLatestValue().activities ?? [];
    expect(activities.length).toBeGreaterThan(0);

    const activity: ActivityResponse = activities[0];
    expect(typeof (activity.is_read ?? false)).toBe('boolean');
    expect(typeof (activity.is_seen ?? false)).toBe('boolean');
  });

  it('marking flat notifications as seen', async () => {
    await flatNotificationFeed.getOrCreate({ limit: 20 });
    const activities =
      flatNotificationFeed.state.getLatestValue().activities ?? [];
    const activity = activities[0];
    expect(activity?.id).toBeDefined();

    await flatNotificationFeed.markActivity({
      mark_seen: [activity.id],
    });
  });

  it('marking flat notifications as read', async () => {
    await flatNotificationFeed.getOrCreate({ limit: 20 });
    const activities =
      flatNotificationFeed.state.getLatestValue().activities ?? [];
    const activity = activities[0];
    expect(activity?.id).toBeDefined();

    await flatNotificationFeed.markActivity({
      mark_read: [activity.id],
    });
  });

  it('mark_all_seen and mark_all_read', async () => {
    await flatNotificationFeed.markActivity({ mark_all_seen: true });
    await flatNotificationFeed.markActivity({ mark_all_read: true });
  });

  it('notification status', async () => {
    const response = await flatNotificationFeed.getOrCreate();
    const notificationStatus = response.notification_status;

    expect(notificationStatus?.unread).toBeDefined();
    expect(notificationStatus?.unseen).toBeDefined();
    expect(notificationStatus?.last_seen_at).toBeDefined();
    expect(notificationStatus?.last_read_at).toBeDefined();
    expect(notificationStatus?.seen_activities).toBeDefined();
    expect(notificationStatus?.read_activities).toBeDefined();
  });

  afterAll(async () => {
    await janeClient.disconnectUser();
  });
});
