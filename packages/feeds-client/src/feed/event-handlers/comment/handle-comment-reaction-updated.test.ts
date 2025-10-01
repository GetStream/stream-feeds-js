import { describe, it, expect, beforeEach } from 'vitest';
import { Feed, handleCommentReactionUpdated } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import {
  generateCommentResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
  generateFeedReactionResponse,
  generateCommentReactionUpdatedEvent,
} from '../../../test-utils';
import type {
  CommentResponse,
  FeedsReactionResponse,
} from '../../../gen/models';
import { shouldUpdateState } from '../../../utils';
import type { EventPayload } from '../../../types-internal';

describe(handleCommentReactionUpdated.name, () => {
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

  it('updates own_reactions for current user and updates comment fields from the event', () => {
    const existingCommentId = `comment-${getHumanId()}`;
    const existingReaction = generateFeedReactionResponse({
      type: 'like',
      user: { id: currentUserId },
      activity_id: activityId,
      comment_id: existingCommentId,
    });
    const existingComment = generateCommentResponse({
      id: existingCommentId,
      object_id: activityId,
      latest_reactions: [],
      reaction_groups: {},
      own_reactions: [existingReaction],
    });
    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [existingComment],
          pagination: { sort: 'first' },
        },
      },
    });

    const event = generateCommentReactionUpdatedEvent({
      comment: {
        id: existingComment.id,
        object_id: activityId,
        latest_reactions: [],
        reaction_groups: {},
      },
      reaction: {
        type: 'downvote',
        user: { id: currentUserId },
        activity_id: activityId,
        comment_id: existingCommentId,
      },
    });

    const stateBefore = feed.currentState;
    const [initialReaction] = (stateBefore.comments_by_entity_id[activityId]
      ?.comments ?? [])[0].own_reactions;
    expect(
      stateBefore.comments_by_entity_id[activityId]?.comments?.[0]
        ?.own_reactions,
    ).toHaveLength(1);
    expect(initialReaction).toBe(existingReaction);

    handleCommentReactionUpdated.call(feed, event);

    const stateAfter = feed.currentState;
    const [updated] = stateAfter.comments_by_entity_id[activityId]!.comments!;
    expect(updated.own_reactions).toHaveLength(1);
    expect(updated.own_reactions[0]).toBe(event.reaction);
    // ensure we used event's latest_reactions & reaction_groups (Object.is check)
    expect(updated.latest_reactions).toBe(event.comment.latest_reactions);
    expect(updated.reaction_groups).toBe(event.comment.reaction_groups);
  });

  it('does modify own_reactions if the target reaction belongs to another user', () => {
    const existingComment = generateCommentResponse({
      object_id: activityId,
      latest_reactions: [],
      reaction_groups: {},
      own_reactions: [],
    });
    feed.state.partialNext({
      comments_by_entity_id: {
        [activityId]: {
          comments: [existingComment],
          pagination: { sort: 'first' },
        },
      },
    });

    const event = generateCommentReactionUpdatedEvent({
      comment: {
        id: existingComment.id,
        object_id: activityId,
        latest_reactions: [],
        reaction_groups: {},
      },
      reaction: {
        type: 'laugh',
        user: { id: 'other-user' },
        activity_id: activityId,
        comment_id: existingComment.id,
      },
    });

    handleCommentReactionUpdated.call(feed, event);
    const stateAfter = feed.currentState;
    const [updated] = stateAfter.comments_by_entity_id[activityId]!.comments!;
    expect(updated.own_reactions).toHaveLength(0);
    expect(updated.latest_reactions).toBe(event.comment.latest_reactions);
    expect(updated.reaction_groups).toBe(event.comment.reaction_groups);
  });

  it('updates the proper entity state (prefers parent_id)', () => {
    const parentId = `comment-${getHumanId()}`;
    const existingCommentId = `comment-${getHumanId()}`;
    const existingReaction = generateFeedReactionResponse({
      type: 'like',
      user: { id: currentUserId },
      activity_id: activityId,
      comment_id: existingCommentId,
    });
    const existingComment = generateCommentResponse({
      id: existingCommentId,
      object_id: activityId,
      parent_id: parentId,
      latest_reactions: [],
      reaction_groups: {},
      own_reactions: [existingReaction],
    });
    feed.state.partialNext({
      comments_by_entity_id: {
        [parentId]: {
          comments: [existingComment],
          pagination: { sort: 'first' },
        },
      },
    });

    const addedEvent = generateCommentReactionUpdatedEvent({
      comment: {
        id: existingComment.id,
        object_id: activityId,
        parent_id: parentId,
        latest_reactions: [],
        reaction_groups: {},
      },
      reaction: {
        type: 'downvote',
        user: { id: currentUserId },
        activity_id: activityId,
        comment_id: existingComment.id,
      },
    });

    const stateBefore = feed.currentState;
    expect(
      stateBefore.comments_by_entity_id[parentId]?.comments?.[0]?.own_reactions,
    ).toHaveLength(1);
    const [initialReaction] = (stateBefore.comments_by_entity_id[parentId]
      ?.comments ?? [])[0].own_reactions;
    expect(initialReaction).toBe(existingReaction);

    handleCommentReactionUpdated.call(feed, addedEvent);
    const stateAfter1 = feed.currentState;
    const [updated1] = stateAfter1.comments_by_entity_id[parentId]!.comments!;
    expect(updated1.own_reactions).toHaveLength(1);
    expect(updated1.own_reactions[0]).toBe(addedEvent.reaction);
    expect(updated1.latest_reactions).toBe(addedEvent.comment.latest_reactions);
    expect(updated1.reaction_groups).toBe(addedEvent.comment.reaction_groups);
  });

  it('does nothing if comment is not found in state', () => {
    const addedEvent = generateCommentReactionUpdatedEvent({
      comment: { object_id: activityId },
      reaction: { user: { id: currentUserId } },
    });
    const stateBefore = feed.currentState;

    handleCommentReactionUpdated.call(feed, addedEvent);
    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });

  describe(`Comment reaction updated ${shouldUpdateState.name} integration`, () => {
    let currentUserPayload: EventPayload<'feeds.comment.reaction.updated'>;
    let existingComment: CommentResponse;
    let existingReaction: FeedsReactionResponse;
    let newReaction: FeedsReactionResponse;
    let commentId: string;

    beforeEach(() => {
      commentId = `comment-${getHumanId()}`;
      existingReaction = generateFeedReactionResponse({
        type: 'heart',
        user: { id: currentUserId },
        activity_id: activityId,
        comment_id: commentId,
      });
      newReaction = generateFeedReactionResponse({
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

      currentUserPayload = generateCommentReactionUpdatedEvent({
        comment: existingComment,
        reaction: newReaction,
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

      handleCommentReactionUpdated.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleCommentReactionUpdated.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // 2. WS and the HTTP

      handleCommentReactionUpdated.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleCommentReactionUpdated.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again from WS after clearing the stateUpdateQueue', () => {
      handleCommentReactionUpdated.call(feed, currentUserPayload);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handleCommentReactionUpdated.call(feed, currentUserPayload);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const comment = comments?.find((a) => a.id === commentId);
      const [latestReaction] = (comment?.own_reactions ?? []).toReversed();

      expect(comment?.own_reactions.length).toEqual(1);
      expect(latestReaction).toMatchObject(newReaction);
    });

    it('allows update again from HTTP response after clearing the stateUpdateQueue', () => {
      handleCommentReactionUpdated.call(feed, currentUserPayload, false);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another HTTP response
      handleCommentReactionUpdated.call(feed, currentUserPayload, false);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const comment = comments?.find((a) => a.id === commentId);
      const [latestReaction] = (comment?.own_reactions ?? []).toReversed();

      expect(comment?.own_reactions.length).toEqual(1);
      expect(latestReaction).toMatchObject(newReaction);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the comment reaction deletion', () => {
      const otherUserPayload = generateCommentReactionUpdatedEvent({
        comment: existingComment,
        reaction: {
          ...existingReaction,
          user: {
            id: getHumanId(),
          },
        },
      });

      handleCommentReactionUpdated.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      handleCommentReactionUpdated.call(feed, otherUserPayload);

      const comments =
        feed.currentState.comments_by_entity_id[activityId]?.comments;
      const comment = comments?.find((a) => a.id === commentId);
      const [latestReaction] = comment?.own_reactions ?? [];

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(comment?.own_reactions.length).toEqual(1);
      expect(latestReaction).toMatchObject(existingReaction);
    });
  });
});
