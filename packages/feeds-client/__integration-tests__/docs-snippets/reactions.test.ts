import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type {
  ActivityResponse,
  CommentResponse,
  UserRequest,
} from '../../src/gen/models';

describe('Reactions page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activity: ActivityResponse;
  let comment: CommentResponse;

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
    comment = (
      await client.addComment({
        object_id: activity.id,
        object_type: 'activity',
        comment: 'Great post!',
      })
    ).comment;
  });

  it(`Reactions`, async () => {
    // Adding a reaction without triggering push notifications
    await client.addActivityReaction({
      activity_id: activity.id,
      type: 'like',
      custom: {
        emoji: '❤️',
      },
      // When set to true, existing reaction will be updated instead of creating a new one
      enforce_unique: true,
      skip_push: true,
    });

    // Add a reaction to a comment
    await client.addCommentReaction({
      id: comment.id,
      type: 'like',
      custom: {
        emoji: '👍',
      },
    });
    // Adding a comment reaction without triggering push notifications
    await client.addCommentReaction({
      id: comment.id,
      type: 'like',
      custom: {
        emoji: '👍',
      },
      skip_push: true,
    });
    const deleteResponse = await client.deleteActivityReaction({
      activity_id: activity.id,
      type: 'like',
    });
    console.log(deleteResponse.reaction);
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
