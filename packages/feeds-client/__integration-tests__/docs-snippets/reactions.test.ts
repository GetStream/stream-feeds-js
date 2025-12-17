import { afterAll, beforeAll, describe, it } from 'vitest';
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
    // Add a reaction to an activity
    const addResponse = await client.addActivityReaction({
      activity_id: activity.id,
      type: 'like',
      custom: {
        emoji: '❤️',
      },
      // Optionally override existing reaction
      enforce_unique: true,
    });

    console.log(addResponse.reaction);

    // Adding a reaction without triggering push notifications
    await client.addActivityReaction({
      activity_id: activity.id,
      type: 'like',
      custom: {
        emoji: '❤️',
      },
      skip_push: true,
    });

    // Add a reaction to a comment
    await client.addCommentReaction({
      id: comment.id,
      type: 'like',
      custom: {
        emoji: '👍',
      },
      // Optionally override existing reaction
      enforce_unique: true,
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

  it(`Query Reactions`, async () => {
    await client.queryActivityReactions({
      activity_id: activity.id,
      // Provide optional filters
      filter: {
        reaction_type: 'like',
      },
    });

    await client.queryCommentReactions({
      id: comment.id,
      // Provide optional filters

      filter: {
        reaction_type: 'like',
      },
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
