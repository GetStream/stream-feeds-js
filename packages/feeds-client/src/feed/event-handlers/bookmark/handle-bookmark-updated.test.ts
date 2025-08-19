import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleBookmarkUpdated } from './handle-bookmark-updated';
import {
  generateActivityPinResponse,
  generateActivityResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
  generateFeedReactionResponse,
  generateBookmarkUpdatedEvent,
  generateBookmarkResponse,
} from '../../../test-utils/response-generators';

describe(handleBookmarkUpdated.name, () => {
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

  it('updates a bookmark for the current user and updates activities', () => {
    const event = generateBookmarkUpdatedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 1,
        },
        user: { id: currentUserId },
        updated_at: new Date('2025-08-06T12:00:00Z'),
      },
    });
    const activity = generateActivityResponse({
      id: event.bookmark.activity.id,
      bookmark_count: 1,
      own_bookmarks: [
        generateBookmarkResponse({
          activity: { id: event.bookmark.activity.id },
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

    const stateBefore = feed.currentState;
    expect(stateBefore.activities![0].own_bookmarks).toHaveLength(1);
    expect(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(1);
    expect(stateBefore.activities![0].own_bookmarks[0].updated_at).not.toEqual(
      event.bookmark.updated_at,
    );
    expect(
      stateBefore.pinned_activities![0].activity.own_bookmarks[0].updated_at,
    ).not.toEqual(event.bookmark.updated_at);

    handleBookmarkUpdated.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_bookmarks).toHaveLength(1);
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toHaveLength(1);
    expect(stateAfter.activities![0].own_bookmarks[0]).toEqual(event.bookmark);
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks[0]).toEqual(
      event.bookmark,
    );
    expect(stateAfter.activities![0].own_reactions).toEqual(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toEqual(
      stateBefore.pinned_activities![0].activity.own_reactions,
    );
    expect(stateAfter.activities![0].bookmark_count).toEqual(1);
    expect(stateAfter.pinned_activities![0].activity.bookmark_count).toEqual(1);
  });

  it('does not update own_bookmarks if bookmark is from another user but still updates activity', () => {
    const event = generateBookmarkUpdatedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 2,
        },
        user: { id: 'other-user-id' },
        updated_at: new Date('2025-08-06T12:00:00Z'),
      },
    });
    const activity = generateActivityResponse({
      id: event.bookmark.activity.id,
      bookmark_count: 1,
      own_bookmarks: [
        generateBookmarkResponse({
          activity: { id: event.bookmark.activity.id },
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

    const stateBefore = feed.currentState;
    expect(stateBefore.activities![0].own_bookmarks).toHaveLength(1);
    expect(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(1);
    expect(stateBefore.activities![0].bookmark_count).toEqual(1);
    expect(stateBefore.pinned_activities![0].activity.bookmark_count).toEqual(
      1,
    );

    handleBookmarkUpdated.call(feed, event);

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
    expect(stateAfter.activities![0].bookmark_count).toEqual(2);
    expect(stateAfter.pinned_activities![0].activity.bookmark_count).toEqual(2);
  });

  it('does nothing if activity is not found', () => {
    const event = generateBookmarkUpdatedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 1,
        },
        user: { id: currentUserId },
      },
    });
    const activity = generateActivityResponse({
      id: 'unrelated-activity-id',
      bookmark_count: 1,
      own_bookmarks: [
        generateBookmarkResponse({
          activity: { id: 'unrelated-activity-id' },
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
    handleBookmarkUpdated.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });
});
