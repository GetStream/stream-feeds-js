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

const generateBookmarkFolder = (id: string) => ({
  id,
  name: `Folder ${id}`,
  created_at: new Date(),
  updated_at: new Date(),
  custom: {},
});

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
    expect(stateBefore.activities![0].own_bookmarks[0].updated_at).not.toBe(
      event.bookmark.updated_at,
    );
    expect(
      stateBefore.pinned_activities![0].activity.own_bookmarks[0].updated_at,
    ).not.toBe(event.bookmark.updated_at);

    handleBookmarkUpdated.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_bookmarks).toHaveLength(1);
    expect(
      stateAfter.pinned_activities![0].activity.own_bookmarks,
    ).toHaveLength(1);
    expect(stateAfter.activities![0].own_bookmarks[0]).toBe(event.bookmark);
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks[0]).toBe(
      event.bookmark,
    );
    expect(stateAfter.activities![0].own_reactions).toBe(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toBe(
      stateBefore.pinned_activities![0].activity.own_reactions,
    );
    expect(stateAfter.activities![0].bookmark_count).toBe(1);
    expect(stateAfter.pinned_activities![0].activity.bookmark_count).toBe(1);
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
    expect(stateBefore.activities![0].bookmark_count).toBe(1);
    expect(stateBefore.pinned_activities![0].activity.bookmark_count).toBe(1);

    handleBookmarkUpdated.call(feed, event);

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
    expect(stateAfter.activities![0].bookmark_count).toBe(2);
    expect(stateAfter.pinned_activities![0].activity.bookmark_count).toBe(2);
  });

  it('does not double-update state when called twice with the same event', () => {
    const updatedAt = new Date('2025-08-06T12:00:00Z');
    const event = generateBookmarkUpdatedEvent({
      bookmark: {
        activity: {
          own_reactions: [],
          bookmark_count: 1,
        },
        user: { id: currentUserId },
        updated_at: updatedAt,
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

    // First call (simulating HTTP response)
    handleBookmarkUpdated.call(feed, event);
    const stateAfterFirst = feed.currentState;
    expect(stateAfterFirst.activities![0].own_bookmarks[0]).toBe(
      event.bookmark,
    );

    // Second call (simulating WS event) — state reference should not change
    handleBookmarkUpdated.call(feed, event);
    const stateAfterSecond = feed.currentState;
    expect(stateAfterSecond).toBe(stateAfterFirst);
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

  it('ignores an update event older than the bookmark in state', () => {
    const activityId = crypto.randomUUID();
    const event = generateBookmarkUpdatedEvent({
      bookmark: {
        activity: {
          id: activityId,
          own_reactions: [],
          bookmark_count: 1,
        },
        user: { id: currentUserId },
        updated_at: new Date('2025-08-05T12:00:00Z'),
      },
    });
    const currentBookmark = generateBookmarkResponse({
      activity: { id: activityId },
      user: { id: currentUserId },
      updated_at: new Date('2025-08-06T12:00:00Z'),
    });
    const activity = generateActivityResponse({
      id: activityId,
      bookmark_count: 1,
      own_bookmarks: [currentBookmark],
      own_reactions: [generateFeedReactionResponse()],
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [generateActivityPinResponse({ activity })],
    });

    const stateBefore = feed.currentState;

    handleBookmarkUpdated.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
    expect(stateAfter.activities![0].own_bookmarks).toEqual([currentBookmark]);
  });

  describe('folder moves', () => {
    it('moves a bookmark to another folder using the previous folder from the request', () => {
      // the payload carries the folder the bookmark was moved *to*, so it no longer
      // matches the entry in state by identity — only the request knows where it came
      // from
      const activityId = crypto.randomUUID();
      const event = generateBookmarkUpdatedEvent({
        bookmark: {
          activity: {
            id: activityId,
            own_reactions: [],
            bookmark_count: 1,
          },
          user: { id: currentUserId },
          folder: generateBookmarkFolder('folder2'),
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
            folder: generateBookmarkFolder('folder1'),
            updated_at: new Date('2025-08-05T12:00:00Z'),
          }),
          // a second bookmark of the same activity, which must not be touched
          generateBookmarkResponse({
            activity: { id: activityId },
            user: { id: currentUserId },
            folder: generateBookmarkFolder('folder3'),
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

      handleBookmarkUpdated.call(feed, event, { previousFolderId: 'folder1' });

      const ownBookmarks = feed.currentState.activities![0].own_bookmarks;
      expect(ownBookmarks).toHaveLength(2);
      expect(ownBookmarks[0]).toBe(event.bookmark);
      expect(ownBookmarks[1].folder?.id).toBe('folder3');
      expect(
        feed.currentState.pinned_activities![0].activity.own_bookmarks[0],
      ).toBe(event.bookmark);
    });

    it('moves a bookmark to another folder from a WS event when it is the only bookmark for the activity', () => {
      // WS events carry no previous folder; with a single candidate the move is
      // unambiguous
      const activityId = crypto.randomUUID();
      const event = generateBookmarkUpdatedEvent({
        bookmark: {
          activity: {
            id: activityId,
            own_reactions: [],
            bookmark_count: 1,
          },
          user: { id: currentUserId },
          folder: generateBookmarkFolder('folder2'),
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
            folder: generateBookmarkFolder('folder1'),
            updated_at: new Date('2025-08-05T12:00:00Z'),
          }),
        ],
        own_reactions: [generateFeedReactionResponse()],
      });
      feed.state.partialNext({
        activities: [activity],
        pinned_activities: [generateActivityPinResponse({ activity })],
      });

      handleBookmarkUpdated.call(feed, event);

      expect(feed.currentState.activities![0].own_bookmarks).toEqual([
        event.bookmark,
      ]);
    });

    it('leaves own_bookmarks untouched when a WS folder move is ambiguous', () => {
      const activityId = crypto.randomUUID();
      const event = generateBookmarkUpdatedEvent({
        bookmark: {
          activity: {
            id: activityId,
            own_reactions: [],
            bookmark_count: 2,
          },
          user: { id: currentUserId },
          folder: generateBookmarkFolder('folder3'),
          updated_at: new Date('2025-08-06T12:00:00Z'),
        },
      });
      const ownBookmarks = [
        generateBookmarkResponse({
          activity: { id: activityId },
          user: { id: currentUserId },
          folder: generateBookmarkFolder('folder1'),
          updated_at: new Date('2025-08-05T12:00:00Z'),
        }),
        generateBookmarkResponse({
          activity: { id: activityId },
          user: { id: currentUserId },
          folder: generateBookmarkFolder('folder2'),
          updated_at: new Date('2025-08-05T12:00:00Z'),
        }),
      ];
      const activity = generateActivityResponse({
        id: activityId,
        bookmark_count: 2,
        own_bookmarks: ownBookmarks,
        own_reactions: [generateFeedReactionResponse()],
      });
      feed.state.partialNext({
        activities: [activity],
        pinned_activities: [generateActivityPinResponse({ activity })],
      });

      const stateBefore = feed.currentState;

      handleBookmarkUpdated.call(feed, event);

      const stateAfter = feed.currentState;
      expect(stateAfter).toBe(stateBefore);
      expect(stateAfter.activities![0].own_bookmarks).toEqual(ownBookmarks);
    });
  });
});
