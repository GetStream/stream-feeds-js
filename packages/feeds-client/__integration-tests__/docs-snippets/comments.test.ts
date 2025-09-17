import { afterAll, beforeAll, expect, describe, it } from 'vitest';
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

describe('Comments page', () => {
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
  });

  it('Adding comments', async () => {
    // Adding a comment to an activity
    comment = (
      await client.addComment({
        comment: 'So great!',
        object_id: activity.id,
        object_type: 'activity',
        custom: {
          sentiment: 'positive',
        },
      })
    ).comment;
    // Adding a reply to a comment
    await client.addComment({
      comment: 'I agree!',
      object_id: activity.id,
      object_type: 'activity',
      parent_id: comment.id,
    });
  });

  it('Updating comments', async () => {
    // Update a comment
    await client.updateComment({
      id: comment.id,
      comment: 'Updated comment',
      custom: {
        edited: true,
      },
    });
  });

  it(`Reading comments`, async () => {

    await feed.getOrCreate();

    // Supported values for sort: first, last, top, controversial, best
    // Loads the first page
    await feed.loadNextPageActivityComments(activity, { sort: 'best' });

    expect(
      feed.state.getLatestValue()?.comments_by_entity_id[activity.id],
    ).toBeDefined();

    // Loads the next page
    await feed.loadNextPageCommentReplies(comment, { sort: 'best' });

    // To read comments without storing them in feed state
    const response = await client.getComments({
      object_type: 'activity',
      object_id: activity.id,
      limit: 10,
      sort: 'best',
    });

    expect(response.comments).toBeDefined();
  });

  it(`Querying comments`, async () => {
    // Search in comment texts
    await client.queryComments({
      filter: { comment_text: { $q: 'oat' } },
    });
    // All comments for an activity
    await client.queryComments({
      filter: { object_id: 'activity_123', object_type: 'activity' },
    });
    // Replies to a parent acitivity
    await client.queryComments({
      filter: { parent_id: '<parent id>' },
    });
    await client.queryComments({
      filter: {
        user_id: 'jane',
      },
      limit: 20,
    });
  });

  it(`Comment reactions`, async () => {
    // Add a reaction to a comment
    await client.addCommentReaction({
      id: comment.id,
      type: 'like',
    });

    await client.deleteCommentReaction({
      id: comment.id,
      type: 'like',
    });
  });

  it(`Comment Threading`, async () => {
    await feed.getOrCreate();

    await feed.loadNextPageActivityComments(activity, { depth: 3, limit: 20 });

    const commentState =
      feed.state.getLatestValue()?.comments_by_entity_id[activity.id];
    const parentComment = commentState?.comments?.[0]!;

    expect(
      feed.state.getLatestValue()?.comments_by_entity_id[parentComment?.id],
    ).toBeDefined();

    // Load next page of replies (or first, if replies aren't yet initialized)
    await feed.loadNextPageCommentReplies(parentComment);

    // To read comments without storing them in state use getComments and getCommentReplies
    await client.getComments({
      object_id: activity.id,
      object_type: 'activity',
      // Depth of the threaded comments
      depth: 3,
      limit: 20,
    });

    // Get replies of a specific parent comment
    await client.getCommentReplies({
      id: comment.id,
    });
  });

  it('Deleting comments', async () => {
    await client.deleteComment({
      id: comment.id,
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
