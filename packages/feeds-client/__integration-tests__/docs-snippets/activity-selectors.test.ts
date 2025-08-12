import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import { FeedsClient } from '../../src/feeds-client';
import { Feed } from '../../src/feed';
import { UserRequest } from '../../src/gen/models';

describe('Activity selectors page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate();
  });

  it('proximity selector', async () => {
    // Provide filter when reading the feed
    await feed.getOrCreate({
      filter: {
        within_bounds: {
          $eq: {
            ne_lat: 52.43017,
            ne_lng: 4.924821,
            sw_lat: 52.334272,
            sw_lng: 4.822116,
          },
        },
        // Optionally provide other filter properties, just like when querying activities
        activity_type: 'hike',
      },
    });
    // Use either within_bounds or near filter
    await feed.getOrCreate({
      filter: {
        near: { $eq: { lat: 52.373558, lng: 4.885261, distance: 10 } },
      },
    });
    // You can omit filter if location is set for user
    const me = client.state.getLatestValue().connected_user!;
    await client.updateUsersPartial({
      users: [
        {
          id: me.id,
          set: {
            lat: 52.373558,
            lng: 4.885261,
          },
        },
      ],
    });
    await feed.getOrCreate({
      // If filter is not provided, but feed group has proximity selector, API searches based on user's location
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
