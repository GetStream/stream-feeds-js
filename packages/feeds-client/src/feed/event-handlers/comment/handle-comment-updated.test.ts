import { beforeEach, describe, expect, it } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleCommentUpdated } from './handle-comment-updated';
import {
  generateCommentResponse,
  generateCommentUpdatedEvent,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils/response-generators';

describe(handleCommentUpdated.name, () => {
  let feed: Feed;
  let client: FeedsClient;
  let currentUserId: string;
  let activityId: string;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    currentUserId = getHumanId();
    client.state.partialNext({
      connected_user: generateOwnUser({ id: currentUserId }),
    });
    const feedResponse = generateFeedResponse({
      id: 'main',
      group_id: 'user',
      created_by: { id: currentUserId },
    });
    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
    activityId = `activity-${getHumanId()}`;
  });

  it('replaces the existing comment (activity level)', () => {
    const original = generateCommentResponse({ object_id: activityId });
    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: { comments: [original], pagination: { sort: 'first' } },
      },
    });

    const event = generateCommentUpdatedEvent({
      comment: {
        id: original.id,
        object_id: activityId,
      },
    });

    const stateBefore = feed.currentState;
    handleCommentUpdated.call(feed, event);
    const stateAfter = feed.currentState;

    expect(stateAfter).not.toBe(stateBefore);
    const commentsAfter =
      stateAfter.comments_by_entity_id[activityId]?.comments;
    const commentsBefore =
      stateBefore.comments_by_entity_id[activityId]?.comments;
    expect(commentsAfter).not.toBe(commentsBefore);
    expect(commentsAfter).toHaveLength(1);
    const [replaced] = commentsAfter!;
    expect(replaced).toBe(event.comment);
  });

  it('updates the comment in the correct parent entity (prefers parent_id)', () => {
    const parentId = `comment-${getHumanId()}`;
    const reply = generateCommentResponse({
      object_id: activityId,
      parent_id: parentId,
    });

    feed.state.partialNext({
      comments_by_entity_id: {
        [parentId]: { comments: [reply], pagination: { sort: 'first' } },
      },
    });

    const event = generateCommentUpdatedEvent({
      comment: {
        id: reply.id,
        object_id: activityId,
        parent_id: parentId,
      },
    });

    const stateBefore = feed.currentState;
    handleCommentUpdated.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter).not.toBe(stateBefore);
    const commentsBefore =
      stateBefore.comments_by_entity_id[parentId]?.comments;
    const commentsAfter = stateAfter.comments_by_entity_id[parentId]?.comments;
    expect(commentsAfter).not.toBe(commentsBefore);
    expect(commentsAfter).toHaveLength(1);
    const [updatedReply] = commentsAfter!;
    expect(updatedReply).toBe(event.comment);
  });

  it('does nothing if entity state does not exist', () => {
    const event = generateCommentUpdatedEvent({
      comment: { object_id: activityId },
    });
    const stateBefore = feed.currentState;
    handleCommentUpdated.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });

  it('does nothing if comment not found in existing entity state', () => {
    // set up state with different comment
    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [generateCommentResponse({ object_id: activityId })],
          pagination: { sort: 'first' },
        },
      },
    });
    const event = generateCommentUpdatedEvent({
      comment: { object_id: activityId },
    });
    const stateBefore = feed.currentState;
    handleCommentUpdated.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });
});
