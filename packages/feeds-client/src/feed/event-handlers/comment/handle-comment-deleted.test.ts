import { beforeEach, describe, expect, it } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleCommentDeleted } from './handle-comment-deleted';
import {
  generateCommentDeletedEvent,
  generateCommentResponse,
  generateFeedResponse,
  generateOwnUser, generateUserResponseCommonFields,
  getHumanId,
} from '../../../test-utils';
import { CommentResponse, UserResponseCommonFields } from '../../../gen/models';
import { shouldUpdateState } from '../../../utils';
import { EventPayload } from '../../../types-internal';

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

    expect(stateAfter.comments_by_entity_id[activityId]?.comments).not.toBe(
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
    ).not.toBe(
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

    expect(stateAfter).toBe(stateBefore);
  });

  describe(`Comment deleted ${shouldUpdateState.name} integration`, () => {
    let currentUserPayload: EventPayload<'feeds.comment.deleted'>;
    let existingComment: CommentResponse;
    let commentToDelete: CommentResponse;
    let commentId: string;

    beforeEach(() => {
      commentId = `comment-${getHumanId()}`;
      existingComment = generateCommentResponse({
        id: commentId,
        object_id: activityId,
      });
      commentToDelete = generateCommentResponse({
        id: `comment-${getHumanId()}`,
        object_id: activityId,
      })

      currentUserPayload = generateCommentDeletedEvent({
        comment: commentToDelete,
        user: client.state.getLatestValue().connected_user as UserResponseCommonFields,
      });

      feed.state.partialNext({
        comments_by_entity_id: {
          [activityId]: {
            comments: [existingComment, commentToDelete],
            pagination: { sort: 'first' },
          },
        },
      });
      feed.state.partialNext({ watch: true });
    });

    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // 1. HTTP and then WS

      handleCommentDeleted.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleCommentDeleted.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // 2. WS and the HTTP

      handleCommentDeleted.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleCommentDeleted.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again from WS after clearing the stateUpdateQueue', () => {
      handleCommentDeleted.call(feed, currentUserPayload);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handleCommentDeleted.call(feed, currentUserPayload);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const [latestComment] = (comments ?? []).toReversed();

      expect(comments?.length).toEqual(1);
      expect(latestComment).toMatchObject(existingComment);
    });

    it('allows update again from HTTP response after clearing the stateUpdateQueue', () => {
      handleCommentDeleted.call(feed, currentUserPayload, false);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another HTTP response
      handleCommentDeleted.call(feed, currentUserPayload, false);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const [latestComment] = (comments ?? []).toReversed();

      expect(comments?.length).toEqual(1);
      expect(latestComment).toMatchObject(existingComment);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the comment reaction deletion', () => {
      const otherUserPayload = generateCommentDeletedEvent({
        comment: commentToDelete,
        user: generateUserResponseCommonFields({ id: getHumanId() })
      });

      handleCommentDeleted.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      handleCommentDeleted.call(feed, otherUserPayload);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const [latestComment] = (comments ?? []).toReversed();

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(comments?.length).toEqual(1);
      expect(latestComment).toMatchObject(existingComment);
    });
  });
});
