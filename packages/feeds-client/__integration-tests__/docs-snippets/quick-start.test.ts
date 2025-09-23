import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { UserRequest } from '../../src/gen/models';

describe('Quick start page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let timeline: Feed;
  let notifications: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
  });

  it('quick start page', async () => {
    feed = client.feed('user', crypto.randomUUID());
    // Subscribe to WebSocket events for state updates
    await feed.getOrCreate({ watch: true });
    // Add activity
    const activity1 = await feed.addActivity({
      text: 'Hello, Stream Feeds!',
      type: 'post',
    });

    timeline = client.feed('timeline', crypto.randomUUID());
    await timeline.getOrCreate();
    // Add a reaction to activity
    await client.addReaction({
      activity_id: activity1.activity.id,
      type: 'like',
    });
    // Add a comment to activity
    const comment1 = await client.addComment({
      object_id: activity1.activity.id,
      object_type: 'activity',
      comment: 'Great post!',
    });
    // Add a reaction to comment
    await client.addCommentReaction({
      id: comment1.comment.id,
      type: 'love',
    });

    notifications = client.feed('notification', 'john');
    await notifications.getOrCreate();
    // Mark notifications as read
    await notifications.markActivity({
      mark_all_read: true,
    });

    const poll = await client.createPoll({
      name: 'What is your favorite color?',
      options: [{ text: 'Red' }, { text: 'Blue' }, { text: 'Green' }],
    });
    // Attach it to an activity
    const activity = await feed.addActivity({
      text: 'What is your favorite color?',
      type: 'poll',
      poll_id: poll.poll.id,
    });
    // Vote
    await client.castPollVote({
      poll_id: poll.poll.id,
      activity_id: activity.activity.id,
      vote: {
        option_id: poll.poll.options[0].id,
      },
    });

    await feed.addActivity({
      type: 'workout',
      text: 'Just finished my run',
      custom: {
        distance: 5.2,
        duration: 1800,
        calories: 450,
      },
    });
  });

  afterAll(async () => {
    const serverClient = getServerClient();

    await serverClient.feeds.deleteFeed({
      feed_group_id: feed.group,
      feed_id: feed.id,
    });
    await serverClient.feeds.deleteFeed({
      feed_group_id: timeline.group,
      feed_id: timeline.id,
    });
    await serverClient.feeds.deleteFeed({
      feed_group_id: notifications.group,
      feed_id: notifications.id,
    });

    await client.disconnectUser();
  });
});
