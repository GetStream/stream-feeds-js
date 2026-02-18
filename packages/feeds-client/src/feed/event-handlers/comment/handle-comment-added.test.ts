import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleCommentAdded } from './handle-comment-added';
import {
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
  generateCommentAddedEvent,
  generateCommentResponse,
  generateUserResponseCommonFields,
} from '../../../test-utils';
import type { CommentResponse, UserResponseCommonFields } from '../../../gen/models';
import type { EventPayload } from '../../../types-internal';
import { shouldUpdateState } from '../../../utils';

describe(handleCommentAdded.name, () => {
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

  it('appends a new comment when pagination.sort is not "last"', () => {
    const existingComment = generateCommentResponse({
      object_id: activityId,
    });

    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [existingComment],
          pagination: { sort: 'first' },
        },
      },
    });

    const event = generateCommentAddedEvent({
      comment: { object_id: activityId },
    });

    const stateBefore = feed.currentState;
    handleCommentAdded.call(feed, event);
    const stateAfter = feed.currentState;

    expect(stateAfter.comments_by_entity_id[activityId]!.comments).not.toBe(
      stateBefore.comments_by_entity_id[activityId]!.comments,
    );
    expect(stateAfter.comments_by_entity_id[activityId]!.comments).toHaveLength(
      2,
    );
    expect(stateAfter.comments_by_entity_id[activityId]!.comments!.at(-1)).toBe(
      event.comment,
    );
  });

  it('for sort "first", does not add comment from other user when next page exists (pagination.next is set)', () => {
    const existingComment = generateCommentResponse({
      object_id: activityId,
    });

    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [existingComment],
          pagination: { sort: 'first', next: 'cursor-more-comments' },
        },
      },
    });

    const event = generateCommentAddedEvent({
      comment: { object_id: activityId },
      user: generateUserResponseCommonFields({ id: getHumanId() }),
    });

    const stateBefore = feed.currentState;
    handleCommentAdded.call(feed, event);
    const stateAfter = feed.currentState;

    expect(stateAfter).toBe(stateBefore);
    expect(stateAfter.comments_by_entity_id[activityId]!.comments).toHaveLength(
      1,
    );
  });

  it('for sort "first", appends comment from other user when all comments are loaded (next is undefined)', () => {
    const existingComment = generateCommentResponse({
      object_id: activityId,
    });

    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [existingComment],
          pagination: { sort: 'first' },
        },
      },
    });

    const event = generateCommentAddedEvent({
      comment: { object_id: activityId },
      user: generateUserResponseCommonFields({ id: getHumanId() }),
    });

    const stateBefore = feed.currentState;
    handleCommentAdded.call(feed, event);
    const stateAfter = feed.currentState;

    expect(stateAfter.comments_by_entity_id[activityId]!.comments).not.toBe(
      stateBefore.comments_by_entity_id[activityId]!.comments,
    );
    expect(stateAfter.comments_by_entity_id[activityId]!.comments).toHaveLength(
      2,
    );
    expect(stateAfter.comments_by_entity_id[activityId]!.comments!.at(-1)).toBe(
      event.comment,
    );
  });

  it('prepends a new comment when pagination.sort is "last"', () => {
    const existingComment = generateCommentResponse({
      object_id: activityId,
    });

    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [existingComment],
          pagination: { sort: 'last' },
        },
      },
    });

    const event = generateCommentAddedEvent({
      comment: { object_id: activityId },
    });

    const stateBefore = feed.currentState;
    handleCommentAdded.call(feed, event);
    const stateAfter = feed.currentState;

    expect(stateAfter.comments_by_entity_id[activityId]!.comments).not.toBe(
      stateBefore.comments_by_entity_id[activityId]!.comments,
    );
    expect(stateAfter.comments_by_entity_id[activityId]!.comments).toHaveLength(
      2,
    );
    expect(stateAfter.comments_by_entity_id[activityId]!.comments!.at(0)).toBe(
      event.comment,
    );
  });

  it('stores the comment in the correct parent entity state (prefers parent_id)', () => {
    const parentId = `comment-${getHumanId()}`;
    const existingComment = generateCommentResponse({
      object_id: activityId,
      parent_id: parentId,
    });

    feed.state.partialNext({
      comments_by_entity_id: {
        [parentId]: {
          comments: [existingComment],
          pagination: { sort: 'best' },
        },
      },
    });

    const event = generateCommentAddedEvent({
      comment: { parent_id: parentId, object_id: activityId },
    });

    const prevState = feed.currentState;
    handleCommentAdded.call(feed, event);
    const nextState = feed.currentState;

    expect(nextState.comments_by_entity_id[parentId]!.comments).not.toBe(
      prevState.comments_by_entity_id[parentId]!.comments,
    );
    expect(nextState.comments_by_entity_id[parentId]!.comments).toHaveLength(2);
    expect(nextState.comments_by_entity_id[parentId]!.comments!.at(-1)).toBe(
      event.comment,
    );
  });

  it('does nothing if entity state does not exist (comments have not been loaded yet)', () => {
    const event = generateCommentAddedEvent({
      comment: { object_id: activityId },
    });
    const stateBefore = feed.currentState;
    handleCommentAdded.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });

  describe(`Comment added ${shouldUpdateState.name} integration`, () => {
    let currentUserPayload: EventPayload<'feeds.comment.added'>;
    let existingComment: CommentResponse;
    let newComment: CommentResponse;
    let commentId: string;

    beforeEach(() => {
      commentId = `comment-${getHumanId()}`;
      existingComment = generateCommentResponse({
        id: commentId,
        object_id: activityId,
      });
      newComment = generateCommentResponse({
        id: `comment-${getHumanId()}`,
        object_id: activityId,
      });

      currentUserPayload = generateCommentAddedEvent({
        comment: newComment,
        user: client.state.getLatestValue()
          .connected_user as UserResponseCommonFields,
      });

      feed.state.partialNext({
        comments_by_entity_id: {
          [activityId]: {
            comments: [existingComment],
            pagination: { sort: 'first' },
          },
        },
      });
      feed.state.partialNext({ watch: true });
    });

    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // 1. HTTP and then WS

      handleCommentAdded.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleCommentAdded.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // 2. WS and the HTTP

      handleCommentAdded.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleCommentAdded.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again from WS after clearing the stateUpdateQueue', () => {
      handleCommentAdded.call(feed, currentUserPayload);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handleCommentAdded.call(feed, currentUserPayload);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const [latestComment] = (comments ?? []).toReversed();

      expect(comments?.length).toEqual(3);
      expect(latestComment).toMatchObject(newComment);
    });

    it('allows update again from HTTP response after clearing the stateUpdateQueue', () => {
      handleCommentAdded.call(feed, currentUserPayload, false);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another HTTP response
      handleCommentAdded.call(feed, currentUserPayload, false);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const [latestComment] = (comments ?? []).toReversed();

      expect(comments?.length).toEqual(3);
      expect(latestComment).toMatchObject(newComment);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the comment reaction deletion', () => {
      const otherUserPayload = generateCommentAddedEvent({
        comment: newComment,
        user: generateUserResponseCommonFields({ id: getHumanId() }),
      });

      handleCommentAdded.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      handleCommentAdded.call(feed, otherUserPayload);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const [latestComment] = (comments ?? []).toReversed();

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(comments?.length).toEqual(3);
      expect(latestComment).toMatchObject(newComment);
    });
  });
});
