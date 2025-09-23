import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { ActivityResponse, UserRequest } from '../../src/gen/models';

describe('Pin and unpin page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activity: ActivityResponse;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate({ watch: true });
    activity = (
      await feed.addActivity({
        type: 'post',
        text: 'Hello, world!',
      })
    ).activity;
  });

  it('Pinning and unpinning activities', async () => {
    // Pin an activity
    await client.pinActivity({
      feed_group_id: feed.group,
      feed_id: feed.id,
      activity_id: activity.id,
    });

    const response = await feed.getOrCreate();

    expect(
      response.pinned_activities.find((a) => a.activity.id === activity.id),
    ).toBeDefined();

    // Unpin an activity
    await client.unpinActivity({
      feed_group_id: feed.group,
      feed_id: feed.id,
      activity_id: activity.id,
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
