import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleBookmarkDeleted } from './handle-bookmark-deleted';
import {
  generateActivityPinResponse,
  generateActivityResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
  generateFeedReactionResponse,
  generateBookmarkDeletedEvent,
  generateBookmarkResponse,
} from '../../../test-utils/response-generators';

describe(handleBookmarkDeleted.name, () => {
  let feed: Feed;
  let client: FeedsClient;
  let currentUserId: string;

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
  });

  it('removes a bookmark for the current user and updates activities', () => {
    const activityId = crypto.randomUUID();
    const updatedAt = new Date();
    const event = generateBookmarkDeletedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 0,
          id: activityId,
        },
        user: { id: currentUserId },
        updated_at: updatedAt,
      },
    });
    const activity = generateActivityResponse({
      id: activityId,
      bookmark_count: 1,
      own_bookmarks: [
        generateBookmarkResponse({
          activity: { id: activityId },
          user: { id: currentUserId },
          updated_at: updatedAt,
        }),
      ],
      own_reactions: [generateFeedReactionResponse()],
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;
    expect(stateBefore.activities![0].own_bookmarks).toHaveLength(1);
    expect(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(1);
    expect(stateBefore.activities![0].bookmark_count).toBe(1);
    expect(stateBefore.pinned_activities![0].activity.bookmark_count).toBe(1);

    handleBookmarkDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_bookmarks).toHaveLength(0);
    expect(
      stateAfter.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(0);
    expect(stateAfter.activities![0].own_reactions).toBe(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toBe(
      stateBefore.pinned_activities![0].activity.own_reactions,
    );
    expect(stateAfter.activities![0].bookmark_count).toBe(0);
    expect(stateAfter.pinned_activities![0].activity.bookmark_count).toBe(0);
  });

  it('does not remove from own_bookmarks if bookmark is from another user but still updates activity', () => {
    const event = generateBookmarkDeletedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 0,
        },
        user: { id: 'other-user-id' },
      },
    });
    const activity = generateActivityResponse({
      id: event.bookmark.activity.id,
      bookmark_count: 1,
      own_bookmarks: [
        generateBookmarkResponse({
          activity: { id: event.bookmark.activity.id },
          user: { id: currentUserId },
        }),
      ],
      own_reactions: [generateFeedReactionResponse()],
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;
    expect(stateBefore.activities![0].own_bookmarks).toHaveLength(1);
    expect(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(1);
    expect(stateBefore.activities![0].bookmark_count).toBe(1);
    expect(stateBefore.pinned_activities![0].activity.bookmark_count).toBe(1);

    handleBookmarkDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_bookmarks).toBe(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toBe(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    );
    expect(stateAfter.activities![0].own_reactions).toBe(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toBe(
      stateBefore.pinned_activities![0].activity.own_reactions,
    );
    expect(stateAfter.activities![0].bookmark_count).toBe(0);
    expect(stateAfter.pinned_activities![0].activity.bookmark_count).toBe(0);
  });

  it('does not double-update state when called twice with the same event', () => {
    const activityId = crypto.randomUUID();
    const updatedAt = new Date();
    const event = generateBookmarkDeletedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 0,
          id: activityId,
        },
        user: { id: currentUserId },
        updated_at: updatedAt,
      },
    });
    const activity = generateActivityResponse({
      id: activityId,
      bookmark_count: 1,
      own_bookmarks: [
        generateBookmarkResponse({
          activity: { id: activityId },
          user: { id: currentUserId },
          updated_at: updatedAt,
        }),
      ],
      own_reactions: [generateFeedReactionResponse()],
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    // First call (simulating HTTP response)
    handleBookmarkDeleted.call(feed, event);
    const stateAfterFirst = feed.currentState;
    expect(stateAfterFirst.activities![0].own_bookmarks).toHaveLength(0);

    // Second call (simulating WS event) — state reference should not change
    handleBookmarkDeleted.call(feed, event);
    const stateAfterSecond = feed.currentState;
    expect(stateAfterSecond).toBe(stateAfterFirst);
  });

  it('does nothing if activity is not found', () => {
    const event = generateBookmarkDeletedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 0,
        },
        user: { id: currentUserId },
      },
    });
    const activity = generateActivityResponse({
      id: 'another-activity-id',
      bookmark_count: 1,
      own_bookmarks: [
        generateBookmarkResponse({
          activity: { id: 'another-activity-id' },
          user: { id: currentUserId },
        }),
      ],
      own_reactions: [generateFeedReactionResponse()],
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;
    handleBookmarkDeleted.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });

  it('removes the bookmark even when the delete payload carries a newer updated_at', () => {
    // the payload describing the deleted bookmark does not have to be the exact snapshot
    // we hold — it only has to identify the same bookmark
    const activityId = crypto.randomUUID();
    const event = generateBookmarkDeletedEvent({
      bookmark: {
        activity: {
          id: activityId,
          own_reactions: [],
          bookmark_count: 0,
        },
        user: { id: currentUserId },
        updated_at: new Date('2025-08-06T12:00:00Z'),
      },
    });
    const activity = generateActivityResponse({
      id: activityId,
      bookmark_count: 1,
      own_bookmarks: [
        generateBookmarkResponse({
          activity: { id: activityId },
          user: { id: currentUserId },
          updated_at: new Date('2025-08-05T12:00:00Z'),
        }),
      ],
      own_reactions: [generateFeedReactionResponse()],
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    handleBookmarkDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_bookmarks).toHaveLength(0);
    expect(
      stateAfter.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(0);
    expect(stateAfter.activities![0].bookmark_count).toBe(0);
  });

  it('keeps a bookmark that was re-added after the delete the event describes', () => {
    const activityId = crypto.randomUUID();
    const event = generateBookmarkDeletedEvent({
      bookmark: {
        activity: {
          id: activityId,
          own_reactions: [],
          bookmark_count: 0,
        },
        user: { id: currentUserId },
        updated_at: new Date('2025-08-05T12:00:00Z'),
      },
    });
    const reAddedBookmark = generateBookmarkResponse({
      activity: { id: activityId },
      user: { id: currentUserId },
      updated_at: new Date('2025-08-06T12:00:00Z'),
    });
    const activity = generateActivityResponse({
      id: activityId,
      bookmark_count: 1,
      own_bookmarks: [reAddedBookmark],
      own_reactions: [generateFeedReactionResponse()],
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;

    handleBookmarkDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
    expect(stateAfter.activities![0].own_bookmarks).toEqual([reAddedBookmark]);
  });
});
