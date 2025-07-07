import { describe, it, expect } from 'vitest';
import {
  BookmarkAddedEvent,
  BookmarkDeletedEvent,
  BookmarkUpdatedEvent,
  ActivityResponse,
  BookmarkResponse,
  UserResponse,
} from '../gen/models';
import {
  addBookmarkToActivity,
  removeBookmarkFromActivity,
  updateBookmarkInActivity,
  addBookmarkToActivities,
  removeBookmarkFromActivities,
  updateBookmarkInActivities,
} from './bookmark-utils';

const createMockUser = (id: string): UserResponse => ({
  id,
  created_at: new Date(),
  updated_at: new Date(),
  banned: false,
  language: 'en',
  online: false,
  role: 'user',
  blocked_user_ids: [],
  teams: [],
  custom: {},
});

const createMockActivity = (id: string): ActivityResponse => ({
  id,
  type: 'test',
  created_at: new Date(),
  updated_at: new Date(),
  visibility: 'public',
  bookmark_count: 0,
  comment_count: 0,
  share_count: 0,
  attachments: [],
  comments: [],
  feeds: [],
  filter_tags: [],
  interest_tags: [],
  latest_reactions: [],
  mentioned_users: [],
  own_bookmarks: [],
  own_reactions: [],
  custom: {},
  reaction_groups: {},
  search_data: {},
  popularity: 0,
  score: 0,
  user: createMockUser('user1'),
});

const createMockBookmark = (
  user: UserResponse,
  activity: ActivityResponse,
): BookmarkResponse => ({
  created_at: new Date(),
  updated_at: new Date(),
  activity,
  user,
  custom: {},
});

const createMockAddedEvent = (
  bookmark: BookmarkResponse,
): BookmarkAddedEvent => ({
  bookmark,
  created_at: new Date(),
  custom: {},
  type: 'bookmark.added',
});

const createMockDeletedEvent = (
  bookmark: BookmarkResponse,
): BookmarkDeletedEvent => ({
  bookmark,
  created_at: new Date(),
  custom: {},
  type: 'bookmark.deleted',
});

const createMockUpdatedEvent = (
  bookmark: BookmarkResponse,
): BookmarkUpdatedEvent => ({
  bookmark,
  created_at: new Date(),
  custom: {},
  type: 'bookmark.updated',
});

describe('bookmark-utils', () => {
  describe('addBookmarkToActivity', () => {
    it('should add bookmark to own_bookmarks when from current user', () => {
      const activity = createMockActivity('activity1');
      const user = createMockUser('user1');
      const bookmark = createMockBookmark(user, activity);
      const event = createMockAddedEvent(bookmark);

      const result = addBookmarkToActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(bookmark);
    });

    it('should not add bookmark to own_bookmarks when not from current user', () => {
      const activity = createMockActivity('activity1');
      const user = createMockUser('user2');
      const bookmark = createMockBookmark(user, activity);
      const event = createMockAddedEvent(bookmark);

      const result = addBookmarkToActivity(event, activity, false);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(0);
    });

    it('should handle existing bookmarks correctly', () => {
      const activity = createMockActivity('activity1');
      const user = createMockUser('user1');
      const existingBookmark = createMockBookmark(user, activity);
      activity.own_bookmarks = [existingBookmark];

      const newBookmark = createMockBookmark(user, activity);
      const event = createMockAddedEvent(newBookmark);

      const result = addBookmarkToActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(2);
      expect(result.own_bookmarks).toContain(existingBookmark);
      expect(result.own_bookmarks).toContain(newBookmark);
    });
  });

  describe('removeBookmarkFromActivity', () => {
    it('should remove bookmark from own_bookmarks when from current user', () => {
      const activity = createMockActivity('activity1');
      const user = createMockUser('user1');
      const bookmark = createMockBookmark(user, activity);
      activity.own_bookmarks = [bookmark];

      const event = createMockDeletedEvent(bookmark);
      const result = removeBookmarkFromActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(0);
    });

    it('should not remove bookmark from own_bookmarks when not from current user', () => {
      const activity = createMockActivity('activity1');
      const user = createMockUser('user1');
      const bookmark = createMockBookmark(user, activity);
      activity.own_bookmarks = [bookmark];

      const event = createMockDeletedEvent(bookmark);
      const result = removeBookmarkFromActivity(event, activity, false);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(bookmark);
    });

    it('should remove correct bookmark when multiple bookmarks exist', () => {
      const activity = createMockActivity('activity1');
      const user1 = createMockUser('user1');
      const user2 = createMockUser('user2');
      const bookmark1 = createMockBookmark(user1, activity);
      const bookmark2 = createMockBookmark(user2, activity);
      activity.own_bookmarks = [bookmark1, bookmark2];

      const event = createMockDeletedEvent(bookmark1);
      const result = removeBookmarkFromActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(bookmark2);
    });
  });

  describe('updateBookmarkInActivity', () => {
    it('should update bookmark in own_bookmarks when from current user', () => {
      const activity = createMockActivity('activity1');
      const user = createMockUser('user1');
      const bookmark = createMockBookmark(user, activity);
      activity.own_bookmarks = [bookmark];

      const updatedBookmark = {
        ...bookmark,
        custom: { updated: true },
      };
      const event = createMockUpdatedEvent(updatedBookmark);
      const result = updateBookmarkInActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(updatedBookmark);
    });

    it('should not update bookmark in own_bookmarks when not from current user', () => {
      const activity = createMockActivity('activity1');
      const user = createMockUser('user1');
      const bookmark = createMockBookmark(user, activity);
      activity.own_bookmarks = [bookmark];

      const updatedBookmark = {
        ...bookmark,
        custom: { updated: true },
      };
      const event = createMockUpdatedEvent(updatedBookmark);
      const result = updateBookmarkInActivity(event, activity, false);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(bookmark); // unchanged
    });

    it('should not update bookmark if it does not exist', () => {
      const activity = createMockActivity('activity1');
      const user = createMockUser('user1');
      const bookmark = createMockBookmark(user, activity);
      activity.own_bookmarks = [bookmark];

      const differentUser = createMockUser('user2');
      const differentBookmark = createMockBookmark(differentUser, activity);
      const event = createMockUpdatedEvent(differentBookmark);
      const result = updateBookmarkInActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(bookmark); // unchanged
    });
  });

  describe('addBookmarkToActivities', () => {
    it('should add bookmark to correct activity', () => {
      const activity1 = createMockActivity('activity1');
      const activity2 = createMockActivity('activity2');
      const activities = [activity1, activity2];

      const user = createMockUser('user1');
      const bookmark = createMockBookmark(user, activity1);
      const event = createMockAddedEvent(bookmark);

      const result = addBookmarkToActivities(event, activities, true);

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(2);
      expect(result.activities[0].own_bookmarks).toHaveLength(1);
      expect(result.activities[0].own_bookmarks[0]).toEqual(bookmark);
      expect(result.activities[1].own_bookmarks).toHaveLength(0);
    });

    it('should return unchanged when activity not found', () => {
      const activity1 = createMockActivity('activity1');
      const activities = [activity1];

      const user = createMockUser('user1');
      const differentActivity = createMockActivity('activity2');
      const bookmark = createMockBookmark(user, differentActivity);
      const event = createMockAddedEvent(bookmark);

      const result = addBookmarkToActivities(event, activities, true);

      expect(result.changed).toBe(false);
      expect(result.activities).toEqual(activities);
    });

    it('should handle undefined activities', () => {
      const user = createMockUser('user1');
      const activity = createMockActivity('activity1');
      const bookmark = createMockBookmark(user, activity);
      const event = createMockAddedEvent(bookmark);

      const result = addBookmarkToActivities(event, undefined, true);

      expect(result.changed).toBe(false);
      expect(result.activities).toEqual([]);
    });
  });

  describe('removeBookmarkFromActivities', () => {
    it('should remove bookmark from correct activity', () => {
      const activity1 = createMockActivity('activity1');
      const activity2 = createMockActivity('activity2');
      const user = createMockUser('user1');
      const bookmark = createMockBookmark(user, activity1);
      activity1.own_bookmarks = [bookmark];
      const activities = [activity1, activity2];

      const event = createMockDeletedEvent(bookmark);
      const result = removeBookmarkFromActivities(event, activities, true);

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(2);
      expect(result.activities[0].own_bookmarks).toHaveLength(0);
      expect(result.activities[1].own_bookmarks).toHaveLength(0);
    });

    it('should return unchanged when activity not found', () => {
      const activity1 = createMockActivity('activity1');
      const activities = [activity1];

      const user = createMockUser('user1');
      const differentActivity = createMockActivity('activity2');
      const bookmark = createMockBookmark(user, differentActivity);
      const event = createMockDeletedEvent(bookmark);

      const result = removeBookmarkFromActivities(event, activities, true);

      expect(result.changed).toBe(false);
      expect(result.activities).toEqual(activities);
    });

    it('should handle undefined activities', () => {
      const user = createMockUser('user1');
      const activity = createMockActivity('activity1');
      const bookmark = createMockBookmark(user, activity);
      const event = createMockDeletedEvent(bookmark);

      const result = removeBookmarkFromActivities(event, undefined, true);

      expect(result.changed).toBe(false);
      expect(result.activities).toEqual([]);
    });
  });

  describe('updateBookmarkInActivities', () => {
    it('should update bookmark in correct activity', () => {
      const activity1 = createMockActivity('activity1');
      const activity2 = createMockActivity('activity2');
      const user = createMockUser('user1');
      const bookmark = createMockBookmark(user, activity1);
      activity1.own_bookmarks = [bookmark];
      const activities = [activity1, activity2];

      const updatedBookmark = {
        ...bookmark,
        custom: { updated: true },
      };
      const event = createMockUpdatedEvent(updatedBookmark);
      const result = updateBookmarkInActivities(event, activities, true);

      expect(result.changed).toBe(true);
      expect(result.activities).toHaveLength(2);
      expect(result.activities[0].own_bookmarks).toHaveLength(1);
      expect(result.activities[0].own_bookmarks[0]).toEqual(updatedBookmark);
      expect(result.activities[1].own_bookmarks).toHaveLength(0);
    });

    it('should return unchanged when activity not found', () => {
      const activity1 = createMockActivity('activity1');
      const activities = [activity1];

      const user = createMockUser('user1');
      const differentActivity = createMockActivity('activity2');
      const bookmark = createMockBookmark(user, differentActivity);
      const event = createMockUpdatedEvent(bookmark);

      const result = updateBookmarkInActivities(event, activities, true);

      expect(result.changed).toBe(false);
      expect(result.activities).toEqual(activities);
    });

    it('should handle undefined activities', () => {
      const user = createMockUser('user1');
      const activity = createMockActivity('activity1');
      const bookmark = createMockBookmark(user, activity);
      const event = createMockUpdatedEvent(bookmark);

      const result = updateBookmarkInActivities(event, undefined, true);

      expect(result.changed).toBe(false);
      expect(result.activities).toEqual([]);
    });
  });
});
