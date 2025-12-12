import { beforeAll, describe, expect, it } from 'vitest';
import type { Feed } from '../src';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';

describe('skip_activity_current_feed', () => {
  const user1 = getTestUser();
  const user2 = getTestUser();
  const client1 = createTestClient();
  const client2 = createTestClient();
  let feed1: Feed;
  let feed2: Feed;

  beforeAll(async () => {
    await client1.connectUser(user1, createTestTokenGenerator(user1));
    await client2.connectUser(user2, createTestTokenGenerator(user2));
    feed1 = client1.feed('timeline', user1.id);
    feed2 = client2.feed('timeline', user2.id);
    await feed1.getOrCreate();
    await feed2.getOrCreate();
    await feed1.follow(feed2.feed);
    await feed2.addActivity({
      type: 'post',
      text: 'Hello, world!',
    });
  });

  it('should not create a feed for the activity current feed if read with skip_activity_current_feed', async () => {
    await feed1.getOrCreate({
      enrichment_options: { skip_activity_current_feed: true },
    });

    expect(feed1.currentState.activities?.length).toBe(1);
    expect(client1['activeFeeds'][feed2.feed]).toBeUndefined();
  });

  it('should create a feed for the activity current feed if read without skip_activity_current_feed', async () => {
    await feed1.getOrCreate();

    expect(feed1.currentState.activities?.length).toBe(1);
    expect(client1['activeFeeds'][feed2.feed]).toBeDefined();
  });
});
