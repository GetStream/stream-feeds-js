import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleCommentReactionAdded } from './handle-comment-reaction-added';
import {
  generateCommentResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
  generateCommentReactionAddedEvent,
} from '../../../test-utils';

describe(handleCommentReactionAdded.name, () => {
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

  it('adds to own_reactions for current user and updates comment fields from the event', () => {
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

    const event = generateCommentReactionAddedEvent({
      comment: {
        id: existingComment.id,
        object_id: activityId,
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
      stateBefore.comments_by_entity_id[activityId]?.comments?.[0]
        ?.own_reactions,
    ).toHaveLength(0);

    handleCommentReactionAdded.call(feed, event);

    const stateAfter = feed.currentState;
    const [updated] = stateAfter.comments_by_entity_id[activityId]!.comments!;
    expect(updated.own_reactions).toHaveLength(1);
    expect(updated.own_reactions[0]).toBe(event.reaction);
    // ensure we used event's latest_reactions & reaction_groups (Object.is check)
    expect(updated.latest_reactions).toBe(event.comment.latest_reactions);
    expect(updated.reaction_groups).toBe(event.comment.reaction_groups);
  });

  it('does not add to own_reactions if the target reaction belongs to another user', () => {
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

    const event = generateCommentReactionAddedEvent({
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

    handleCommentReactionAdded.call(feed, event);
    const stateAfter = feed.currentState;
    const [updated] = stateAfter.comments_by_entity_id[activityId]!.comments!;
    expect(updated.own_reactions).toHaveLength(0);
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
    feed.state.partialNext({
      comments_by_entity_id: {
        [parentId]: {
          comments: [existingComment],
          pagination: { sort: 'first' },
        },
      },
    });

    const addedEvent = generateCommentReactionAddedEvent({
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
    ).toHaveLength(0);

    handleCommentReactionAdded.call(feed, addedEvent);
    const stateAfter1 = feed.currentState;
    const [updated1] = stateAfter1.comments_by_entity_id[parentId]!.comments!;
    expect(updated1.own_reactions).toHaveLength(1);
    expect(updated1.own_reactions[0]).toBe(addedEvent.reaction);
    expect(updated1.latest_reactions).toBe(addedEvent.comment.latest_reactions);
    expect(updated1.reaction_groups).toBe(addedEvent.comment.reaction_groups);
  });

  it('does nothing if comment is not found in state', () => {
    const addedEvent = generateCommentReactionAddedEvent({
      comment: { object_id: activityId },
      reaction: { user: { id: currentUserId } },
    });
    const stateBefore = feed.currentState;

    handleCommentReactionAdded.call(feed, addedEvent);
    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });
});
