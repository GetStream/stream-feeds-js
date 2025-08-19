import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleBookmarkAdded } from './handle-bookmark-added';
import {
  generateActivityPinResponse,
  generateActivityResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
  generateFeedReactionResponse,
  generateBookmarkAddedEvent,
} from '../../../test-utils/response-generators';

describe(handleBookmarkAdded.name, () => {
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

  it('adds a bookmark for the current user and updates activities', () => {
    const event = generateBookmarkAddedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 1,
        },
        user: { id: currentUserId },
      },
    });
    const activity = generateActivityResponse({
      id: event.bookmark.activity.id,
      bookmark_count: 0,
      own_bookmarks: [],
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
    expect(stateBefore.activities![0].own_bookmarks).toHaveLength(0);
    expect(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(0);
    expect(stateBefore.activities![0].bookmark_count).toEqual(0);
    expect(stateBefore.pinned_activities![0].activity.bookmark_count).toEqual(
      0,
    );

    handleBookmarkAdded.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_bookmarks).toHaveLength(1);
    expect(
      stateAfter.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(1);
    expect(stateAfter.activities![0].own_bookmarks).toContain(event.bookmark);
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toContain(
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

  it('does not add to own_bookmarks if bookmark is from another user but still updates activity', () => {
    const event = generateBookmarkAddedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 1,
        },
        user: { id: 'other-user-id' },
      },
    });
    const activity = generateActivityResponse({
      id: event.bookmark.activity.id,
      bookmark_count: 0,
      own_bookmarks: [],
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
    expect(stateBefore.activities![0].own_bookmarks).toHaveLength(0);
    expect(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(0);
    expect(stateBefore.activities![0].bookmark_count).toEqual(0);
    expect(stateBefore.pinned_activities![0].activity.bookmark_count).toEqual(
      0,
    );

    handleBookmarkAdded.call(feed, event);

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
    expect(stateAfter.activities![0].bookmark_count).toEqual(1);
    expect(stateAfter.pinned_activities![0].activity.bookmark_count).toEqual(1);
  });

  it('does nothing if activity is not found', () => {
    const event = generateBookmarkAddedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 1,
        },
        user: { id: 'other-user-id' },
      },
    });
    const activity = generateActivityResponse({
      id: 'unrelated-activity-id',
      bookmark_count: 0,
      own_bookmarks: [],
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
    
    handleBookmarkAdded.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });
});
