import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { ActivityResponse, UserRequest } from '../../src/gen/models';

describe('Push introduction page', () => {
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

  it(`direct push notifications`, async () => {
    await client.addComment({
      object_id: activity.id,
      object_type: 'activity',
      comment: 'Great post!',
      // skip_push: false (default) - sends push immediately
    });

    await client.addActivityReaction({
      activity_id: activity.id,
      type: 'like',
      // skip_push: false (default) - sends push immediately
    });
  });

  it(`Notification Feed Push Notifications`, async () => {
    // Comment that creates notification activity and sends via notification feed
    await client.addComment({
      object_id: activity.id,
      object_type: 'activity',
      comment: 'Great post!',
      create_notification_activity: true,
      skip_push: true, // Send via notification feed instead of direct push
    });
    // Reaction that creates notification activity
    await client.addActivityReaction({
      activity_id: activity.id,
      type: 'like',
      create_notification_activity: true,
      skip_push: true, // Send via notification feed
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
