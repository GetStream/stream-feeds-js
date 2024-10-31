import { beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFeed } from '../src/StreamFeed';

describe('Feeds API', () => {
  let client: StreamFeedsClient;
  let publicFeed: StreamFeed;
  let visibleFeed: StreamFeed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(
      getTestUser(),
      createTestTokenGenerator(getTestUser()),
    );
  });

  it('create a feed with public visibility', async () => {
    publicFeed = client.feed('user', uuidv4());
    const response = await publicFeed.getOrCreate({
      visibility_level: 'public',
      custom: {
        color: 'red',
      },
    });

    expect(response.feed.id).toBe(publicFeed.id);
    expect(response.feed.visibility_level).toBe('public');
  });

  it('create a feed with visible visibility', async () => {
    visibleFeed = client.feed('user', uuidv4());
    const response = await visibleFeed.getOrCreate({
      visibility_level: 'visible',
      custom: {
        color: 'red',
      },
    });

    expect(response.feed.id).toBe(visibleFeed.id);
    expect(response.feed.visibility_level).toBe('visible');
  });
});
