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
import { StreamClient } from '@stream-io/node-sdk';

describe('Feeds - activtyAddedEventFilter filters WS events', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let serverClient: StreamClient;

  beforeAll(async () => {
    client = createTestClient();
    serverClient = getServerClient();
    await client.connectUser(user, createTestTokenGenerator(user));
  });

  it('create feed and provide activtyAddedEventFilter callback', async () => {
    feed = client.feed('user', crypto.randomUUID(), {
      activityAddedEventFilter: (event) => {
        if (event.activity.filter_tags.includes('important')) {
          return true;
        }
        return false;
      },
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
