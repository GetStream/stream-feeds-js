import { beforeEach, describe, expect, it } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleCommentUpdated } from './handle-comment-updated';
import {
  generateCommentResponse,
  generateCommentUpdatedEvent,
  generateFeedResponse,
  generateOwnUser,
  generateUserResponseCommonFields,
  getHumanId,
} from '../../../test-utils';
import { CommentResponse, UserResponseCommonFields } from '../../../gen/models';
import { shouldUpdateState } from '../../../utils';
import { EventPayload } from '../../../types-internal';

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

  describe(`Comment updated ${shouldUpdateState.name} integration`, () => {
    let currentUserPayload: EventPayload<'feeds.comment.updated'>;
    let existingComment: CommentResponse;
    let commentBeforeUpdate: CommentResponse;
    let commentAfterUpdate: CommentResponse;
    let commentId: string;

    beforeEach(() => {
      commentId = `comment-${getHumanId()}`;
      commentBeforeUpdate = generateCommentResponse({
        id: commentId,
        object_id: activityId,
      });
      commentAfterUpdate = {
        ...commentBeforeUpdate,
        reply_count: commentBeforeUpdate.reply_count + 10,
      };
      existingComment = generateCommentResponse({
        id: `comment-${getHumanId()}`,
        object_id: activityId,
      });

      currentUserPayload = generateCommentUpdatedEvent({
        comment: commentAfterUpdate,
        user: client.state.getLatestValue()
          .connected_user as UserResponseCommonFields,
      });

      feed.state.partialNext({
        comments_by_entity_id: {
          [activityId]: {
            comments: [existingComment, commentBeforeUpdate],
            pagination: { sort: 'first' },
          },
        },
      });
      feed.state.partialNext({ watch: true });
    });

    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // 1. HTTP and then WS

      handleCommentUpdated.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleCommentUpdated.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // 2. WS and the HTTP

      handleCommentUpdated.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleCommentUpdated.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again from WS after clearing the stateUpdateQueue', () => {
      handleCommentUpdated.call(feed, currentUserPayload);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handleCommentUpdated.call(feed, currentUserPayload);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const [latestComment, previousComment] = (comments ?? []).toReversed();

      expect(comments?.length).toEqual(2);
      expect(latestComment).toMatchObject(commentAfterUpdate);
      expect(previousComment).toMatchObject(existingComment);
    });

    it('allows update again from HTTP response after clearing the stateUpdateQueue', () => {
      handleCommentUpdated.call(feed, currentUserPayload, false);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another HTTP response
      handleCommentUpdated.call(feed, currentUserPayload, false);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const [latestComment, previousComment] = (comments ?? []).toReversed();

      expect(comments?.length).toEqual(2);
      expect(latestComment).toMatchObject(commentAfterUpdate);
      expect(previousComment).toMatchObject(existingComment);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the comment reaction deletion', () => {
      const otherCommentUpdate = generateCommentResponse({
        ...commentBeforeUpdate,
        reply_count: commentBeforeUpdate.reply_count + 1,
      });
      const otherUserPayload = generateCommentUpdatedEvent({
        comment: otherCommentUpdate,
        user: generateUserResponseCommonFields({ id: getHumanId() }),
      });

      handleCommentUpdated.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      handleCommentUpdated.call(feed, otherUserPayload);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const [latestComment, previousComment] = (comments ?? []).toReversed();

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(comments?.length).toEqual(2);
      expect(latestComment).toMatchObject(otherCommentUpdate);
      expect(previousComment).toMatchObject(existingComment);
    });
  });
});
