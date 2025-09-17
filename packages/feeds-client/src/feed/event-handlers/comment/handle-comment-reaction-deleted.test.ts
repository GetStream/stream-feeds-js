import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleCommentReactionDeleted } from './handle-comment-reaction-deleted';
import {
  generateCommentResponse,
  generateFeedReactionResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
  generateCommentReactionDeletedEvent,
} from '../../../test-utils';
import { shouldUpdateState } from '../../../utils';
import { CommentResponse, FeedsReactionResponse } from '../../../gen/models';
import { EventPayload } from '../../../types-internal';

describe(handleCommentReactionDeleted.name, () => {
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

  it('removes from own_reactions when the target reaction belongs to the current user', () => {
    const commentId = `comment-${getHumanId()}`;
    const existingReaction = generateFeedReactionResponse({
      type: 'heart',
      user: { id: currentUserId },
      activity_id: activityId,
      comment_id: commentId,
    });
    const existingComment = generateCommentResponse({
      id: commentId,
      object_id: activityId,
      own_reactions: [existingReaction],
      latest_reactions: [],
      reaction_groups: {},
    });
    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [existingComment],
          pagination: { sort: 'first' },
        },
      },
    });

    const event = generateCommentReactionDeletedEvent({
      comment: {
        ...existingComment,
        latest_reactions: [],
        reaction_groups: {},
      },
      reaction: {
        type: 'heart',
        user: { id: currentUserId },
        activity_id: activityId,
      },
    });

    const stateBefore = feed.currentState;
    expect(
      stateBefore.comments_by_entity_id[activityId]!.comments![0].own_reactions,
    ).toHaveLength(1);
    handleCommentReactionDeleted.call(feed, event);
    const stateAfter = feed.currentState;
    const [updated] = stateAfter.comments_by_entity_id[activityId]!.comments!;
    expect(updated.own_reactions).toHaveLength(0);
    expect(updated.latest_reactions).toBe(event.comment.latest_reactions);
    expect(updated.reaction_groups).toBe(event.comment.reaction_groups);
  });

  it('does not remove from own_reactions when target reaction does not belong to the current user', () => {
    const commentId = `comment-${getHumanId()}`;
    const ownReaction = generateFeedReactionResponse({
      type: 'wow',
      user: { id: currentUserId },
      activity_id: activityId,
      comment_id: commentId,
    });
    const existingComment = generateCommentResponse({
      id: commentId,
      object_id: activityId,
      own_reactions: [ownReaction],
      latest_reactions: [],
      reaction_groups: {},
    });
    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [existingComment],
          pagination: { sort: 'first' },
        },
      },
    });

    const event = generateCommentReactionDeletedEvent({
      comment: {
        ...existingComment,
        latest_reactions: [],
        reaction_groups: {},
      },
      reaction: {
        type: 'wow',
        user: { id: 'other-user' },
        comment_id: existingComment.id,
      },
    });

    handleCommentReactionDeleted.call(feed, event);
    const stateAfter = feed.currentState;
    const [updated] = stateAfter.comments_by_entity_id[activityId]!.comments!;
    expect(updated.own_reactions).toHaveLength(1);
    expect(updated.own_reactions[0]).toBe(ownReaction);
    expect(updated.latest_reactions).toBe(event.comment.latest_reactions);
    expect(updated.reaction_groups).toBe(event.comment.reaction_groups);
  });

  it('does changes to the proper entity state (prefers parent_id)', () => {
    const parentId = `comment-${getHumanId()}`;
    const existingComment = generateCommentResponse({
      object_id: activityId,
      parent_id: parentId,
      latest_reactions: [],
      reaction_groups: {},
      own_reactions: [],
    });

    const existingReaction = generateFeedReactionResponse({
      type: 'like',
      user: { id: currentUserId },
      activity_id: activityId,
      comment_id: existingComment.id,
    });
    existingComment.own_reactions = [existingReaction];

    feed.state.partialNext({
      comments_by_entity_id: {
        [parentId]: {
          comments: [existingComment],
          pagination: { sort: 'first' },
        },
      },
    });

    const deletedEvent = generateCommentReactionDeletedEvent({
      comment: {
        id: existingComment.id,
        object_id: activityId,
        parent_id: parentId,
        latest_reactions: [],
        reaction_groups: {},
      },
      reaction: {
        type: 'like',
        user: { id: currentUserId },
        activity_id: activityId,
        comment_id: existingComment.id,
      },
    });

    const stateBefore = feed.currentState;
    expect(
      stateBefore.comments_by_entity_id[parentId]?.comments?.[0]?.own_reactions,
    ).toHaveLength(1);

    handleCommentReactionDeleted.call(feed, deletedEvent);
    const stateAfter = feed.currentState;
    const [updated] = stateAfter.comments_by_entity_id[parentId]!.comments!;
    expect(updated.own_reactions).toHaveLength(0);
    expect(updated.latest_reactions).toBe(
      deletedEvent.comment.latest_reactions,
    );
    expect(updated.reaction_groups).toBe(deletedEvent.comment.reaction_groups);
  });

  it('does nothing if comment is not found in state', () => {
    const deletedEvent = generateCommentReactionDeletedEvent({
      comment: { object_id: activityId },
      reaction: { user: { id: currentUserId } },
    });
    const stateBefore = feed.currentState;

    handleCommentReactionDeleted.call(feed, deletedEvent);
    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });

  describe(`Comment reaction deleted ${shouldUpdateState.name} integration`, () => {
    let currentUserPayload: EventPayload<'feeds.comment.reaction.deleted'>;
    let existingComment: CommentResponse;
    let existingReaction: FeedsReactionResponse;
    let commentId: string;

    beforeEach(() => {
      commentId = `comment-${getHumanId()}`;
      existingReaction = generateFeedReactionResponse({
        type: 'like',
        user: { id: currentUserId },
        activity_id: activityId,
        comment_id: commentId,
      });
      existingComment = generateCommentResponse({
        id: commentId,
        object_id: activityId,
        own_reactions: [existingReaction],
      });

      currentUserPayload = generateCommentReactionDeletedEvent({
        comment: {
          ...existingComment,
          own_reactions: [],
        },
        reaction: existingReaction,
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

      handleCommentReactionDeleted.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleCommentReactionDeleted.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // 2. WS and the HTTP

      handleCommentReactionDeleted.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleCommentReactionDeleted.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again from WS after clearing the stateUpdateQueue', () => {
      handleCommentReactionDeleted.call(feed, currentUserPayload);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handleCommentReactionDeleted.call(feed, currentUserPayload);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const comment = comments?.find((a) => a.id === commentId);
      const [latestReaction] = comment?.own_reactions ?? [];

      expect(comment?.own_reactions.length).toEqual(0);
      expect(latestReaction).toBeUndefined();
    });

    it('allows update again from HTTP response after clearing the stateUpdateQueue', () => {
      handleCommentReactionDeleted.call(feed, currentUserPayload, false);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another HTTP response
      handleCommentReactionDeleted.call(feed, currentUserPayload, false);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const comment = comments?.find((a) => a.id === commentId);
      const [latestReaction] = comment?.own_reactions ?? [];

      expect(comment?.own_reactions.length).toEqual(0);
      expect(latestReaction).toBeUndefined();
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the comment reaction deletion', () => {
      const otherUserPayload = generateCommentReactionDeletedEvent({
        comment: {
          ...existingComment,
          own_reactions: [],
        },
        reaction: {
          ...existingReaction,
          user: {
            id: getHumanId(),
          },
        },
      });

      handleCommentReactionDeleted.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      handleCommentReactionDeleted.call(feed, otherUserPayload);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const comment = comments?.find((a) => a.id === commentId);
      const [latestReaction] = comment?.own_reactions ?? [];

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(comment?.own_reactions.length).toEqual(1);
      expect(latestReaction).toBe(existingReaction);
    });
  });
});
