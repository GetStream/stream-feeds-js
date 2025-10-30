import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { ActivityResponse, UserRequest } from '../../src/gen/models';

describe('Activities page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activity: ActivityResponse;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate();
    activity = (
      await feed.addActivity({
        type: 'post',
        text: 'Hello, world!',
      })
    ).activity;
  });

  it(`hide and unhide an activity`, async () => {
    await client.activityFeedback({
      activity_id: activity.id,
      hide: true,
    });

    await client.activityFeedback({
      activity_id: activity.id,
      hide: false,
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
