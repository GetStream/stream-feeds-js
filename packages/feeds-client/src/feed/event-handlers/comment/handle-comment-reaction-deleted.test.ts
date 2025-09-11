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
});
