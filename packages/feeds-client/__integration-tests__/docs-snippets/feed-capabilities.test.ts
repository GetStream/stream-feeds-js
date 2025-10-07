import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { UserRequest } from '../../src/gen/models';

describe('Feeds capabilities page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await client.upsertActivities({
      activities: new Array(10).fill(null).map((_, i) => ({
        type: 'post',
        text: `Hello, Stream Feeds! ${i}`,
        feeds: [feed.feed],
      })),
    });
  });

  it(`Read feed capabilities`, async () => {
    await feed.getOrCreate();

    const activity = feed.state.getLatestValue().activities?.[0]!;

    // Make sure to subscribe to changes, it's not guaranteed that own capabilities are ready by the time an activity is being displayed
    // Usually you do this in a lifecycle method that's called when an activity component is being created
    const unsubscribe = client.state.subscribeWithSelector(
      (state) => ({
        ownCapabilities:
          state.own_capabilities_by_fid[activity.current_feed?.feed ?? ''],
      }),
      (state) => {
        console.log(state.ownCapabilities);
      },
    );

    // Make sure to call unsubscribe, usually you do this in a lifecycle method that's called before the activity component is destroyed
    unsubscribe();
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
