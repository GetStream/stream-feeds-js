import { beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFeed } from '../src/StreamFeed';

describe('Feeds API - test with "visible" visibility level', () => {
  let client: StreamFeedsClient;
  let feed: StreamFeed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(
      getTestUser(),
      createTestTokenGenerator(getTestUser()),
    );
  });

  it('create feed', async () => {
    feed = client.feed('user', uuidv4());
    const response = await feed.getOrCreate({
      visibility_level: 'visible',
      custom: {
        color: 'red',
      },
    });

    expect(response.feed.id).toBe(feed.id);
    expect(response.feed.visibility_level).toBe('visible');
  });

  it('add members to feed', async () => {
    const response = await feed.addFeedMembers({
      // TODO: we should be able to specify a role here
      new_members: ['alice', 'bob'],
    });

    // TODO: we should receive the members in response
    expect(response);
  });
});
