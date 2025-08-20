import { beforeEach, describe, expect, it } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleCommentDeleted } from './handle-comment-deleted';
import {
  generateCommentDeletedEvent,
  generateCommentResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils/response-generators';

describe(handleCommentDeleted.name, () => {
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

  it('removes the comment from the entity state (activity level)', () => {
    const comment = generateCommentResponse({ object_id: activityId });

    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [comment],
          pagination: { sort: 'first' },
        },
        // should be removed by id cleanup
        [comment.id]: {
          comments: [],
          pagination: { sort: 'first' },
        },
      },
    });

    const event = generateCommentDeletedEvent({
      comment: { id: comment.id, object_id: activityId },
    });

    const stateBefore = feed.currentState;

    handleCommentDeleted.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter.comments_by_entity_id[activityId]?.comments).not.toEqual(
      stateBefore.comments_by_entity_id[activityId]?.comments,
    );
    expect(stateAfter.comments_by_entity_id[activityId]?.comments).toHaveLength(
      0,
    );
    expect(stateAfter.comments_by_entity_id).not.toHaveProperty(comment.id);
  });

  it('removes the comment from the correct parent entity (comment reply)', () => {
    const parentComment = generateCommentResponse({ object_id: activityId });
    const reply = generateCommentResponse({
      object_id: activityId,
      parent_id: parentComment.id,
    });

    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [parentComment],
          pagination: { sort: 'first' },
        },
        [parentComment.id]: {
          comments: [reply],
          pagination: { sort: 'first' },
        },
        [reply.id]: { comments: [], pagination: { sort: 'first' } },
      },
    });

    const event = generateCommentDeletedEvent({
      comment: {
        id: reply.id,
        object_id: activityId,
        parent_id: parentComment.id,
      },
    });

    const stateBefore = feed.currentState;

    handleCommentDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter).not.toBe(stateBefore);
    expect(
      stateAfter.comments_by_entity_id[parentComment.id]?.comments,
    ).not.toEqual(
      stateBefore.comments_by_entity_id[parentComment.id]?.comments,
    );
    expect(
      stateAfter.comments_by_entity_id[parentComment.id]?.comments,
    ).toHaveLength(0);
    expect(stateAfter.comments_by_entity_id).not.toHaveProperty(reply.id);
    expect(stateAfter.comments_by_entity_id).toHaveProperty(activityId);
  });

  it('does not change the state if the deleted comment is not in state', () => {
    const event = generateCommentDeletedEvent({
      comment: { object_id: activityId },
    });

    const stateBefore = feed.currentState;
    handleCommentDeleted.call(feed, event);
    const stateAfter = feed.currentState;

    expect(stateAfter).toEqual(stateBefore);
  });
});
