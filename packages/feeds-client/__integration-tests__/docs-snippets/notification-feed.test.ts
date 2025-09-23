import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type {
  ActivityResponse,
  CommentResponse,
  UserRequest,
} from '../../src/gen/models';
import type { StreamFeed } from '@stream-io/node-sdk';

describe('Notification feed', () => {
  let janeClient: FeedsClient;
  let janeFeed: Feed;
  let ericTimeline: Feed;
  let ericClient: FeedsClient;
  let janeActivity: ActivityResponse;
  let saraComment: CommentResponse;
  let notificationFeed: Feed;
  let saraNotificationFeed: StreamFeed;
  const user: UserRequest = getTestUser();

  beforeAll(async () => {
    janeClient = createTestClient();
    await janeClient.connectUser(user, createTestTokenGenerator(user));
    janeFeed = janeClient.feed('user', user.id);
    await janeFeed.getOrCreate();

    const ericId = `eric-${crypto.randomUUID()}`;
    ericClient = createTestClient();
    await ericClient.connectUser(
      { id: ericId },
      createTestTokenGenerator({ id: ericId }),
    );
    ericTimeline = ericClient.feed('timeline', ericId);
    await ericTimeline.getOrCreate();

    janeActivity = (
      await janeFeed.addActivity({
        text: 'Test',
        type: 'text',
      })
    ).activity;

    const serverClient = getServerClient();
    const saraId = `sara-${crypto.randomUUID()}`;
    await serverClient.upsertUsers([
      {
        id: saraId,
        name: 'Sara',
      },
    ]);

    saraNotificationFeed = serverClient.feeds.feed('notification', saraId);
    await saraNotificationFeed.getOrCreate({ user_id: saraId });

    saraComment = (
      await serverClient.feeds.addComment({
        object_id: janeActivity.id,
        object_type: 'activity',
        comment: 'Agree!',
        user_id: saraId,
      })
    ).comment;

    notificationFeed = janeClient.feed('notification', user.id);
    await notificationFeed.getOrCreate();
  });

  it(`Creating notification activities`, async () => {
    // Eric follows Jane
    await ericTimeline.follow(janeFeed, {
      // When true Jane's notification feed will be updated with follow activity
      create_notification_activity: true,
    });
    // Eric comments on Jane's activity
    await ericClient.addComment({
      comment: 'Agree!',
      object_id: janeActivity.id,
      object_type: 'activity',
      // When true Jane's notification feed will be updated with comment activity
      create_notification_activity: true,
    });
    // Eric reacts to Jane's activity
    await ericClient.addReaction({
      activity_id: janeActivity.id,
      // When true Jane's notification feed will be updated with reaction activity
      type: 'like',
      create_notification_activity: true,
    });
    // Eric reacts to a comment posted to Jane's activity by Sara
    await ericClient.addCommentReaction({
      id: saraComment.id,
      type: 'like',
      // When true Sara's notification feed will be updated with comment reaction activity
      create_notification_activity: true,
    });
  });

  it(`reading notification activities`, async () => {
    // Read notifications
    const response = await notificationFeed.getOrCreate({
      limit: 20,
    });
    const group = response.aggregated_activities[0];

    expect(group.activities).toBeDefined();
    expect(group.activities[0].notification_context).toBeDefined();
    expect(group.activity_count).toBeDefined();
    expect(group.user_count).toBeDefined();
    expect(group.group).toBeDefined();
  });

  it(`Marking notifications as seen`, async () => {
    const notifications = (
      await notificationFeed.getOrCreate({
        limit: 20,
      })
    ).aggregated_activities;

    const group = notifications[0];

    await notificationFeed.markActivity({
      mark_all_seen: true,
      mark_seen: [group.group],
    });
  });

  it(`Marking notifications as read`, async () => {
    const notifications = (
      await notificationFeed.getOrCreate({
        limit: 20,
      })
    ).aggregated_activities;

    const group = notifications[0];

    await notificationFeed.markActivity({
      mark_all_read: true,
      mark_read: [group.group],
    });
  });

  it(`notification status`, async () => {
    const notificationStatus = (await notificationFeed.getOrCreate())
      .notification_status;

    expect(notificationStatus?.unread).toBeDefined();
    expect(notificationStatus?.unseen).toBeDefined();
    expect(notificationStatus?.last_seen_at).toBeDefined();
    expect(notificationStatus?.last_read_at).toBeDefined();
    expect(notificationStatus?.seen_activities).toBeDefined();
    expect(notificationStatus?.read_activities).toBeDefined();
  });

  afterAll(async () => {
    await janeFeed.delete({ hard_delete: true });
    await ericTimeline.delete({ hard_delete: true });
    if (notificationFeed) {
      await notificationFeed.delete({ hard_delete: true });
    }
    await saraNotificationFeed.delete({ hard_delete: true });
    await janeClient.disconnectUser();
    await ericClient.disconnectUser();
  });
});
