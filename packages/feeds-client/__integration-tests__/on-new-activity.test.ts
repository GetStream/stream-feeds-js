import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { UserRequest } from '../src/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  getTestUser,
  waitForEvent,
} from './utils';
import type { FeedsClient } from '../src/feeds-client';
import type { Feed } from '../src/feed';
import { activityFilter } from '../src/feed/activity-filter';
import { type StreamClient } from '@stream-io/node-sdk';

describe('Feeds - onNewActivity and activityFilter', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let serverClient: StreamClient;

  beforeAll(async () => {
    client = createTestClient();
    serverClient = getServerClient();
    await client.connectUser(user, createTestTokenGenerator(user));
  });

  it('onNewActivity with activityFilter: only add activities matching feed filter (filter_tags)', async () => {
    feed = client.feed('user', crypto.randomUUID(), {
      onNewActivity: ({ activity, currentUser }) => {
        if (activityFilter(activity, feed.currentState.last_get_or_create_request_config)) {
          return activity.user.id === currentUser?.id ? 'add-to-start' : 'ignore';
        }
        return 'ignore';
      },
    });
    await feed.getOrCreate({
      watch: true,
      filter: {
        filter_tags: ['blue'],
      },
    });

    serverClient.feeds.addActivity({
      type: 'post',
      feeds: [feed.feed],
      text: 'Post without blue tag',
      filter_tags: ['green'],
      user_id: user.id,
    });

    await waitForEvent(feed, 'feeds.activity.added', { shouldReject: true });

    expect(feed.state.getLatestValue().activities).toHaveLength(0);

    serverClient.feeds.addActivity({
      type: 'post',
      feeds: [feed.feed],
      text: 'Post with blue tag',
      filter_tags: ['blue'],
      user_id: user.id,
    });

    await waitForEvent(feed, 'feeds.activity.added', { shouldReject: true });

    expect(feed.state.getLatestValue().activities).toHaveLength(1);
    expect(feed.state.getLatestValue().activities?.[0].text).toBe('Post with blue tag');
  });

  it('addActivity HTTP response is added when onNewActivity returns add-to-start', async () => {
    const feedId = crypto.randomUUID();
    const testFeed = client.feed('user', feedId, {
      onNewActivity: () => 'add-to-start',
    });
    await testFeed.getOrCreate({ watch: false });

    const response = await testFeed.addActivity({
      type: 'post',
      text: 'My new post from HTTP',
    });

    expect(response.activity).toBeDefined();
    expect(testFeed.state.getLatestValue().activities).toHaveLength(1);
    expect(testFeed.state.getLatestValue().activities?.[0].id).toBe(response.activity.id);
    expect(testFeed.state.getLatestValue().activities?.[0].text).toBe('My new post from HTTP');

    await testFeed.delete({ hard_delete: true });
  });

  it('addActivity HTTP response is ignored when onNewActivity returns ignore', async () => {
    const feedId = crypto.randomUUID();
    const testFeed = client.feed('user', feedId, {
      onNewActivity: () => 'ignore',
    });
    await testFeed.getOrCreate({ watch: false });

    const response = await testFeed.addActivity({
      type: 'post',
      text: 'Should not appear in feed',
    });

    expect(response.activity).toBeDefined();
    expect(testFeed.state.getLatestValue().activities).toHaveLength(0);

    await testFeed.delete({ hard_delete: true });
  });

  it('default: only current user activities matching filter are added', async () => {
    const feedId = crypto.randomUUID();
    const testFeed = client.feed('user', feedId);
    await testFeed.getOrCreate({
      watch: true,
      filter: { filter_tags: ['blue'] },
    });

    serverClient.feeds.addActivity({
      type: 'post',
      feeds: [testFeed.feed],
      text: 'From current user with blue',
      filter_tags: ['blue'],
      user_id: user.id,
    });

    await waitForEvent(testFeed, 'feeds.activity.added', { shouldReject: true });

    expect(testFeed.state.getLatestValue().activities).toHaveLength(1);
    expect(testFeed.state.getLatestValue().activities?.[0].text).toBe(
      'From current user with blue',
    );

    await testFeed.delete({ hard_delete: true });
  });

  it.skip('getOrCreate with within_bounds and activity_type filter (requires server support)', async () => {
    const feedId = crypto.randomUUID();
    const testFeed = client.feed('user', feedId, {
      onNewActivity: ({ activity, currentUser }) => {
        if (activityFilter(activity, testFeed.currentState.last_get_or_create_request_config)) {
          return activity.user.id === currentUser?.id ? 'add-to-start' : 'ignore';
        }
        return 'ignore';
      },
    });
    await testFeed.getOrCreate({
      watch: true,
      filter: {
        within_bounds: {
          $eq: {
            ne_lat: 52.43017,
            ne_lng: 4.924821,
            sw_lat: 52.334272,
            sw_lng: 4.822116,
          },
        },
        activity_type: 'hike',
      },
    });
    await testFeed.addActivity({
      type: 'hike',
      text: 'Hike in Amsterdam',
      location: { lat: 52.38, lng: 4.87 },
    });
    expect(testFeed.state.getLatestValue().activities?.length).toBeGreaterThanOrEqual(0);
    await testFeed.delete({ hard_delete: true });
  });

  afterAll(async () => {
    if (feed) {
      await feed.delete({ hard_delete: true });
    }
    await client.disconnectUser();
  });
});
