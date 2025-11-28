import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import type { FeedsClient } from '../src/feeds-client';
import type { Feed } from '../src/feed';

describe('Connecting anonymous user', () => {
  let client: FeedsClient;
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(
      getTestUser(),
      createTestTokenGenerator(getTestUser()),
    );
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate();
    await feed.addActivity({
      type: 'post',
      text: 'Hello, world!',
    });
  });

  it('anonymous user can query users', async () => {
    const anonymousClient = createTestClient();
    await anonymousClient.connectAnonymous();

    const response = await anonymousClient.queryUsers({
      payload: {
        filter_conditions: {},
      },
    });

    expect(response.users.length).toBeGreaterThan(0);
  });

  it.fails('anonymous user can read activity', async () => {
    const activity = (await feed.getOrCreate()).activities?.[0];

    const anonymousClient = createTestClient();
    await anonymousClient.connectAnonymous();

    const response = await anonymousClient.getActivity({
      id: activity.id,
    });
    expect(response.activity.text).toBe('Hello, world!');
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
