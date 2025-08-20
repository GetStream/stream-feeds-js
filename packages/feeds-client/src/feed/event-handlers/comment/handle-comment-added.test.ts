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
} from '../../../test-utils/response-generators';

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

    expect(stateAfter.comments_by_entity_id[activityId]!.comments).not.toEqual(
      stateBefore.comments_by_entity_id[activityId]!.comments,
    );
    expect(stateAfter.comments_by_entity_id[activityId]!.comments).toHaveLength(
      2,
    );
    expect(
      stateAfter.comments_by_entity_id[activityId]!.comments!.at(-1),
    ).toEqual(event.comment);
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

    expect(stateAfter.comments_by_entity_id[activityId]!.comments).not.toEqual(
      stateBefore.comments_by_entity_id[activityId]!.comments,
    );
    expect(stateAfter.comments_by_entity_id[activityId]!.comments).toHaveLength(
      2,
    );
    expect(
      stateAfter.comments_by_entity_id[activityId]!.comments!.at(0),
    ).toEqual(event.comment);
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

    expect(nextState.comments_by_entity_id[parentId]!.comments).not.toEqual(
      prevState.comments_by_entity_id[parentId]!.comments,
    );
    expect(nextState.comments_by_entity_id[parentId]!.comments).toHaveLength(2);
    expect(nextState.comments_by_entity_id[parentId]!.comments!.at(-1)).toEqual(
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
});
