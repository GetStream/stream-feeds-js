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
    expect(stateBefore.activities![0].bookmark_count).toEqual(1);
    expect(stateBefore.pinned_activities![0].activity.bookmark_count).toEqual(
      1,
    );

    handleBookmarkDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_bookmarks).toHaveLength(0);
    expect(
      stateAfter.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(0);
    expect(stateAfter.activities![0].own_reactions).toEqual(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toEqual(
      stateBefore.pinned_activities![0].activity.own_reactions,
    );
    expect(stateAfter.activities![0].bookmark_count).toEqual(0);
    expect(stateAfter.pinned_activities![0].activity.bookmark_count).toEqual(0);
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
    expect(stateBefore.activities![0].bookmark_count).toEqual(1);
    expect(stateBefore.pinned_activities![0].activity.bookmark_count).toEqual(
      1,
    );

    handleBookmarkDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_bookmarks).toEqual(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toEqual(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    );
    expect(stateAfter.activities![0].own_reactions).toEqual(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toEqual(
      stateBefore.pinned_activities![0].activity.own_reactions,
    );
    expect(stateAfter.activities![0].bookmark_count).toEqual(0);
    expect(stateAfter.pinned_activities![0].activity.bookmark_count).toEqual(0);
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
          activity: { id: 'another-activity-id', },
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
});
