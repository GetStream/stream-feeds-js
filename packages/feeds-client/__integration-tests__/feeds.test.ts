import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { UserRequest } from '../src/common/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import { FeedsClient } from '../src/FeedsClient';
import { Feed } from '../src/Feed';

describe('Feeds API dummy test', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
  });

  it('create feed', async () => {
    const request = feed.getOrCreate({ data: { visibility: 'public' } });

    expect(feed.state.getLatestValue().is_loading).toBe(true);

    const response = await request;

    expect(response.feed.id).toBe(feed.id);

    // check date decoding
    expect(Date.now() - response.feed.created_at.getTime()).toBeLessThan(3000);
    expect(feed.state.getLatestValue().is_loading).toBe(false);
  });

  it('delete feed', async () => {
    const response = await feed.delete();

    expect(response).toBeDefined();
  });

  afterAll(async () => {
    await client.disconnectUser();
  });
});
