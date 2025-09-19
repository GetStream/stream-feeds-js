import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { updateCommentCount as updateCommentCountInternal } from './update-comment-count';
import * as commentHandlers from '../handle-comment-updated';
import * as activityHandlers from '../../activity';
import { FeedsClient } from '../../../../feeds-client';
import { Feed } from '../../../feed';
import { ActivityResponse, CommentResponse } from '../../../../gen/models';
import {
  generateCommentResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
} from '../../../../test-utils';

vi.mock('../../activity', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../activity')>();
  return {
    ...actual,
    handleActivityUpdated: vi.fn(),
  };
});

vi.mock('../handle-comment-updated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../handle-comment-updated')>();
  return {
    ...actual,
    handleCommentUpdated: vi.fn(),
  };
});

const handleCommentUpdated = commentHandlers.handleCommentUpdated as unknown as ReturnType<typeof vi.fn>;
const handleActivityUpdated = activityHandlers.handleActivityUpdated as unknown as ReturnType<typeof vi.fn>;

describe('updateCommentCount', () => {
  let feed: Feed;
  let client: FeedsClient;
  let currentUserId: string;
  let activityId: string;
  let existingActivity: ActivityResponse;

  let updateCommentCount: OmitThisParameter<typeof updateCommentCountInternal>;

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
    feed.state.partialNext({ watch: false });

    updateCommentCount = updateCommentCountInternal.bind(feed);

    activityId = `activity-${getHumanId()}`;
    existingActivity = { id: activityId, comment_count: 0 } as ActivityResponse;

    feed.state.partialNext({ activities: [existingActivity] });
  });

  afterEach(() => {
    vi.resetAllMocks();
  })

  it('correctly updates parent comment reply_count and comment_count (with watch: false)', () => {
    const parentCommentId = 'c1';

    const existingComment = generateCommentResponse({
      id: parentCommentId,
      object_id: activityId,
      reply_count: 0,
    });

    feed.state.partialNext({
      activities: [{ ...existingActivity, comment_count: 1 }],
      comments_by_entity_id: {
        [activityId]: {
          comments: [existingComment],
        },
      },
    });

    const incomingReply = generateCommentResponse({
      id: 'c2',
      object_id: activityId,
      parent_id: parentCommentId,
      reply_count: 0,
    });

    updateCommentCount({
      activity: { ...existingActivity, comment_count: 11 },
      comment: incomingReply,
      replyCountUpdater: (prev: number) => prev + 1,
    });

    expect(handleCommentUpdated).toHaveBeenCalledTimes(1);
    const [commentArg, secondArg] = handleCommentUpdated.mock.calls[0];
    expect(secondArg).toBe(false);
    expect(commentArg).toEqual({
      comment: {
        ...existingComment,
        reply_count: 1,
      },
    });

    expect(handleActivityUpdated).toHaveBeenCalledTimes(1);
    expect(handleActivityUpdated).toHaveBeenCalledWith({
      activity: { id: activityId, comment_count: 11 },
    }, false);
  });

  it('updates parent comment reply_count when grandparent is missing (falls back to activity store)', () => {
    const parentCommentId = 'c1';

    const existingComment = generateCommentResponse({
      id: parentCommentId,
      object_id: activityId,
      reply_count: 5,
    });

    feed.state.partialNext({
      activities: [{ ...existingActivity, comment_count: 0 }],
      comments_by_entity_id: {
        [activityId]: {
          comments: [existingComment],
          pagination: { sort: 'first' },
        },
      },
    });

    const incomingReply = generateCommentResponse({
      id: 'c2',
      object_id: activityId,
      parent_id: parentCommentId,
      reply_count: 0,
    });

    updateCommentCount({
      activity: { ...existingActivity, comment_count: 1 },
      comment: incomingReply,
      replyCountUpdater: (prev: number) => prev - 2,
    });

    expect(handleCommentUpdated).toHaveBeenCalledTimes(1);
    expect(handleCommentUpdated).toHaveBeenCalledWith(
      { comment: { ...existingComment, reply_count: 3 } },
      false,
    );
    expect(handleActivityUpdated).toHaveBeenCalledTimes(1);
    expect(handleActivityUpdated).toHaveBeenCalledWith({
      activity: { id: activityId, comment_count: 1 },
    }, false);
  });

  it('updates the correct parent when replying to a depth-3 comment (entity_parent_id points to the parent comment store)', () => {
    const c1: CommentResponse = generateCommentResponse({ id: 'c1', object_id: activityId, reply_count: 0 });
    const c2: CommentResponse = generateCommentResponse({ id: 'c2', object_id: activityId, parent_id: 'c1', reply_count: 7 });

    feed.state.partialNext({
      activities: [{ ...existingActivity, comment_count: 1 }],
      comments_by_entity_id: {
        [activityId]: {
          comments: [c1],
        },
        ['c1']: { entity_parent_id: activityId, comments: [c2] },
        ['c2']: { entity_parent_id: 'c1', comments: [] },
      },
    });

    const incomingReplyToC2: CommentResponse = generateCommentResponse({
      id: 'c3',
      object_id: activityId,
      parent_id: 'c2',
      reply_count: 0,
    });

    updateCommentCount({
      activity: { ...existingActivity, comment_count: 1 },
      comment: incomingReplyToC2,
      replyCountUpdater: (prev: number) => prev + 5,
    });

    expect(handleCommentUpdated).toHaveBeenCalledTimes(1);
    expect(handleCommentUpdated).toHaveBeenCalledWith(
      { comment: { ...c2, reply_count: 12 } },
      false,
    );
    expect(handleActivityUpdated).toHaveBeenCalledTimes(1);
    expect(handleActivityUpdated).toHaveBeenCalledWith({
      activity: { id: activityId, comment_count: 1 },
    }, false);
  });

  it('does nothing on parent reply when parent comment is not found in the resolved store', () => {
    feed.state.partialNext({
      activities: [{ ...existingActivity, comment_count: 4 }],
      comments_by_entity_id: {
        [activityId]: { comments: [], },
      },
    });

    const incomingReply: CommentResponse = generateCommentResponse({
      id: 'child',
      object_id: activityId,
      parent_id: 'missing-parent',
      reply_count: 0,
    });

    updateCommentCount({
      activity: { ...existingActivity, comment_count: 5 },
      comment: incomingReply,
      replyCountUpdater: (prev: number) => prev + 1,
    });

    expect(handleCommentUpdated).not.toHaveBeenCalled();
    // the activity still updates, as watch === true
    expect(handleActivityUpdated).toHaveBeenCalledTimes(1);
    expect(handleActivityUpdated).toHaveBeenCalledWith({
      activity: { id: activityId, comment_count: 5 },
    }, false);
  });

  it('skips parent reply update when comment has no parent_id (top-level comment)', () => {
    feed.state.partialNext({
      activities: [{ ...existingActivity, comment_count: 1 }],
      comments_by_entity_id: {
        [activityId]: { comments: [], },
      },
    });

    const topLevel: CommentResponse = generateCommentResponse({
      id: 'cTop',
      object_id: activityId,
      reply_count: 0,
    });

    updateCommentCount({
      activity: { ...existingActivity, comment_count: 3 },
      comment: topLevel,
      replyCountUpdater: (prev: number) => prev + 100,
    });

    expect(handleCommentUpdated).not.toHaveBeenCalled();
    expect(handleActivityUpdated).toHaveBeenCalledTimes(1);
    expect(handleActivityUpdated).toHaveBeenCalledWith({
      activity: { id: activityId, comment_count: 3 },
    }, false);
  });

  it('no-ops any update if neither activity nor comment are found', () => {
    feed.state.partialNext({
      activities: [{ id: 'other-1', comment_count: 1 } as ActivityResponse, { id: 'other-2', comment_count: 3 } as ActivityResponse],
      comments_by_entity_id: {},
    });

    const topLevel: CommentResponse = generateCommentResponse({
      id: 'cTop',
      object_id: 'missing-activity',
      reply_count: 0,
    });

    updateCommentCount({
      activity: { ...existingActivity, comment_count: 3 },
      comment: topLevel,
      replyCountUpdater: (prev: number) => prev + 1,
    });

    expect(handleActivityUpdated).not.toHaveBeenCalled();
    expect(handleCommentUpdated).not.toHaveBeenCalled();
  });

  it('can update both parent reply_count and activity comment_count in the same call', () => {
    const parentCommentId = 'c1';
    const c1: CommentResponse = generateCommentResponse({ id: parentCommentId, object_id: activityId, reply_count: 10 });

    feed.state.partialNext({
      activities: [{ ...existingActivity, comment_count: 100 }],
      comments_by_entity_id: {
        [activityId]: { comments: [c1] },
        [parentCommentId]: { entity_parent_id: activityId },
      },
    });

    const incomingReply: CommentResponse = generateCommentResponse({
      id: 'c2',
      object_id: activityId,
      parent_id: parentCommentId,
      reply_count: 0,
    });

    updateCommentCount({
      activity: { ...existingActivity, comment_count: 97 },
      comment: incomingReply,
      replyCountUpdater: (prev: number) => prev + 2,
    });

    expect(handleCommentUpdated).toHaveBeenCalledTimes(1);
    expect(handleCommentUpdated).toHaveBeenCalledWith(
      { comment: { ...c1, reply_count: 12 } },
      false,
    );
    expect(handleActivityUpdated).toHaveBeenCalledTimes(1);
    expect(handleActivityUpdated).toHaveBeenCalledWith({
      activity: { id: activityId, comment_count: 97 },
    }, false);
  });
});
