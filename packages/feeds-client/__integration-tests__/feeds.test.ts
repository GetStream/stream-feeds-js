import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { UserRequest } from '../src/common/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import { FeedsClient } from '../src/FeedsClient';
import { FlatFeed } from '../src/FlatFeed';

describe('Feeds API dummy test', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: FlatFeed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
  });

  it('create feed', async () => {
    await client.createFeed({
      feed_id: feed.id,
      feed_group_id: feed.group,
      visibility: 'public',
    });
    const response = await feed.get();

    expect(response.feed.id).toBe(feed.id);

    // check date decoding
    expect(Date.now() - response.feed.created_at.getTime()).toBeLessThan(3000);
  });

  it('delete feed', async () => {
    const response = await client.removeFeed({
      feed_id: feed.id,
      feed_group_id: feed.group,
    });

    expect(response).toBeDefined();
  });

  afterAll(async () => {
    await client.disconnectUser();
  });
});
