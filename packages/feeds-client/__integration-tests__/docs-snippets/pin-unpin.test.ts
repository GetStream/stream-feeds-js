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

  it('Pinning and unpinning activities (with watch)', async () => {
    // Pin an activity
    await client.pinActivity({
      feed_group_id: feed.group,
      feed_id: feed.id,
      activity_id: activity.id,
    });

    // State should be updated without needing getOrCreate
    expect(
      feed.currentState.pinned_activities?.find(
        (a) => a.activity.id === activity.id,
      ),
    ).toBeDefined();

    // Unpin an activity
    await client.unpinActivity({
      feed_group_id: feed.group,
      feed_id: feed.id,
      activity_id: activity.id,
    });

    // State should be updated without needing getOrCreate
    expect(
      feed.currentState.pinned_activities?.find(
        (a) => a.activity.id === activity.id,
      ),
    ).toBeUndefined();
  });

  it('Pinning and unpinning activities (without watch)', async () => {
    // Create a second feed without watch
    const feedWithoutWatch = client.feed('user', feed.id);
    await feedWithoutWatch.getOrCreate({ watch: false });

    // Pin an activity
    await client.pinActivity({
      feed_group_id: feedWithoutWatch.group,
      feed_id: feedWithoutWatch.id,
      activity_id: activity.id,
    });

    // State should be updated from the HTTP response
    expect(
      feedWithoutWatch.currentState.pinned_activities?.find(
        (a) => a.activity.id === activity.id,
      ),
    ).toBeDefined();

    // Unpin an activity
    await client.unpinActivity({
      feed_group_id: feedWithoutWatch.group,
      feed_id: feedWithoutWatch.id,
      activity_id: activity.id,
    });

    // State should be updated from the HTTP response
    expect(
      feedWithoutWatch.currentState.pinned_activities?.find(
        (a) => a.activity.id === activity.id,
      ),
    ).toBeUndefined();
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
