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
import { type StreamClient } from '@stream-io/node-sdk';

describe('Feeds - onNewActivity filters WS events', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let serverClient: StreamClient;

  beforeAll(async () => {
    client = createTestClient();
    serverClient = getServerClient();
    await client.connectUser(user, createTestTokenGenerator(user));
  });

  it('create feed and provide onNewActivity callback', async () => {
    feed = client.feed('user', crypto.randomUUID(), {
      onNewActivity: ({ activity }) =>
        activity.filter_tags?.includes('important')
          ? 'add-to-start'
          : 'ignore',
    });
    await feed.getOrCreate({
      watch: true,
      filter: {
        filter_tags: ['important'],
      },
    });

    serverClient.feeds.addActivity({
      type: 'post',
      feeds: [feed.feed],
      text: 'Not important post',
      user_id: user.id,
    });

    await waitForEvent(feed, 'feeds.activity.added', {
      shouldReject: true,
    });

    expect(feed.state.getLatestValue().activities).toHaveLength(0);

    serverClient.feeds.addActivity({
      type: 'post',
      feeds: [feed.feed],
      text: 'Important post',
      filter_tags: ['important'],
      user_id: user.id,
    });

    await waitForEvent(feed, 'feeds.activity.added', {
      shouldReject: true,
    });

    expect(feed.state.getLatestValue().activities).toHaveLength(1);
    expect(feed.state.getLatestValue().activities?.[0].text).toBe(
      'Important post',
    );
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
