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
import type { StreamClient } from '@stream-io/node-sdk';

describe('Aggregated notification feed with filter_tags filter', () => {
  let client: FeedsClient;
  let serverClient: StreamClient;
  let feed: Feed;
  const user: UserRequest = getTestUser();

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    serverClient = getServerClient();

    feed = client.feed('notification', crypto.randomUUID());
    await feed.getOrCreate({
      watch: true,
      filter: { filter_tags: ['blue'] },
    });
  });

  it('adds an aggregated group and increments unread/unseen when a matching activity is added', async () => {
    const updated = waitForEvent(feed, 'feeds.notification_feed.updated');
    void serverClient.feeds.addActivity({
      type: 'post',
      feeds: [feed.feed],
      text: 'blue post',
      filter_tags: ['blue'],
      user_id: user.id,
    });
    await updated;

    const state = feed.state.getLatestValue();
    expect(state.aggregated_activities).toHaveLength(1);
    expect(state.notification_status?.unread).toBe(1);
    expect(state.notification_status?.unseen).toBe(1);
  });

  it('drops the group and keeps unread/unseen unchanged when a non-matching activity is added', async () => {
    const updated = waitForEvent(feed, 'feeds.notification_feed.updated');
    void serverClient.feeds.addActivity({
      type: 'comment',
      feeds: [feed.feed],
      text: 'red comment',
      filter_tags: ['red'],
      user_id: user.id,
    });
    await updated;

    const state = feed.state.getLatestValue();
    expect(state.aggregated_activities).toHaveLength(1);
    expect(state.notification_status?.unread).toBe(1);
    expect(state.notification_status?.unseen).toBe(1);
  });

  it('adds existing group if a matching activity is added', async () => {
    const updated = waitForEvent(feed, 'feeds.notification_feed.updated');
    void serverClient.feeds.addActivity({
      type: 'comment',
      feeds: [feed.feed],
      text: 'blue comment',
      filter_tags: ['blue'],
      user_id: user.id,
    });
    await updated;

    const state = feed.state.getLatestValue();
    expect(state.aggregated_activities).toHaveLength(2);
    expect(state.notification_status?.unread).toBe(2);
    expect(state.notification_status?.unseen).toBe(2);
  });

  it('adds a third aggregated group and increments unread/unseen when another matching activity of a new type is added', async () => {
    const updated = waitForEvent(feed, 'feeds.notification_feed.updated');
    void serverClient.feeds.addActivity({
      type: 'like',
      feeds: [feed.feed],
      text: 'blue like',
      filter_tags: ['blue'],
      user_id: user.id,
    });
    await updated;

    const state = feed.state.getLatestValue();
    expect(state.aggregated_activities).toHaveLength(3);
    expect(state.notification_status?.unread).toBe(3);
    expect(state.notification_status?.unseen).toBe(3);
  });

  it('decrements unread via delta when an existing group is marked as read', async () => {
    const firstGroup = feed.state.getLatestValue().aggregated_activities?.[0]!;

    const updated = waitForEvent(feed, 'feeds.notification_feed.updated');
    await feed.markActivity({ mark_read: [firstGroup.group] });
    await updated;

    const state = feed.state.getLatestValue();
    expect(state.aggregated_activities).toHaveLength(3);
    expect(state.notification_status?.unread).toBe(2);
    expect(state.notification_status?.unseen).toBe(3);

    const groupAfter = state.aggregated_activities?.find(
      (g) => g.group === firstGroup.group,
    );
    expect(groupAfter?.is_read).toBe(true);
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
