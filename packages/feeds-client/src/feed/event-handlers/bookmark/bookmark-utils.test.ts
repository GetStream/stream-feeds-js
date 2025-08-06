import { describe, it, expect } from 'vitest';
import {
  BookmarkAddedEvent,
  BookmarkDeletedEvent,
  BookmarkUpdatedEvent,
  ActivityResponse,
  BookmarkResponse,
  UserResponse,
} from '../../../gen/models';
import {
  addBookmarkToActivities,
  removeBookmarkFromActivities,
  updateBookmarkInActivities,
} from './';
import {
  generateActivityResponse,
  generateUserResponse,
} from '../../../test-utils';

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

const addBookmarkToActivity = (
  event: BookmarkAddedEvent,
  activity: ActivityResponse,
  eventBelongsToCurrentUser: boolean,
) => {
  const result = addBookmarkToActivities(
    event,
    [activity],
    eventBelongsToCurrentUser,
  );

  return {
    changed: result.changed,
    ...result.entities![0],
  };
};

const removeBookmarkFromActivity = (
  event: BookmarkAddedEvent,
  activity: ActivityResponse,
  eventBelongsToCurrentUser: boolean,
) => {
  const result = removeBookmarkFromActivities(
    event,
    [activity],
    eventBelongsToCurrentUser,
  );

  return {
    changed: result.changed,
    ...result.entities![0],
  };
};

const updateBookmarkInActivity = (
  event: BookmarkAddedEvent,
  activity: ActivityResponse,
  eventBelongsToCurrentUser: boolean,
) => {
  const result = updateBookmarkInActivities(
    event,
    [activity],
    eventBelongsToCurrentUser,
  );

  return {
    changed: result.changed,
    ...result.entities![0],
  };
};

describe('bookmark-utils', () => {
  describe('addBookmarkToActivity', () => {
    it('should add bookmark to own_bookmarks when from current user', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user1' });
      const bookmark = createMockBookmark(user, activity);
      const event = createMockAddedEvent(bookmark);

      const result = addBookmarkToActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(bookmark);
    });

    it('should not add bookmark to own_bookmarks when not from current user', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user2' });
      const bookmark = createMockBookmark(user, activity);
      const event = createMockAddedEvent(bookmark);

      const result = addBookmarkToActivity(event, activity, false);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(0);
    });

    it('should handle existing bookmarks correctly', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user1' });
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
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user1' });
      const bookmark = createMockBookmark(user, activity);
      activity.own_bookmarks = [bookmark];

      const event = createMockDeletedEvent(bookmark);
      const result = removeBookmarkFromActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(0);
    });

    it('should not remove bookmark from own_bookmarks when not from current user', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user1' });
      const bookmark = createMockBookmark(user, activity);
      activity.own_bookmarks = [bookmark];

      const event = createMockDeletedEvent(bookmark);
      const result = removeBookmarkFromActivity(event, activity, false);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(bookmark);
    });

    it('should remove correct bookmark when multiple bookmarks exist', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const user1 = generateUserResponse({ id: 'user1' });
      const user2 = generateUserResponse({ id: 'user2' });
      const bookmark1 = createMockBookmark(user1, activity);
      const bookmark2 = createMockBookmark(user2, activity);
      activity.own_bookmarks = [bookmark1, bookmark2];

      const event = createMockDeletedEvent(bookmark1);
      const result = removeBookmarkFromActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(bookmark2);
    });

    it('should correctly identify bookmarks by activity_id + folder_id + user_id', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user1' });

      // Create two bookmarks with same activity and user but different folders
      const bookmark1 = {
        ...createMockBookmark(user, activity),
        folder: {
          id: 'folder1',
          name: 'Folder 1',
          created_at: new Date(),
          updated_at: new Date(),
          custom: {},
        },
      };
      const bookmark2 = {
        ...createMockBookmark(user, activity),
        folder: {
          id: 'folder2',
          name: 'Folder 2',
          created_at: new Date(),
          updated_at: new Date(),
          custom: {},
        },
      };

      activity.own_bookmarks = [bookmark1, bookmark2];

      // Try to remove bookmark1
      const event = createMockDeletedEvent(bookmark1);
      const result = removeBookmarkFromActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(bookmark2);
    });

    it('should handle bookmarks without folders correctly', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user1' });

      // Create two bookmarks: one with folder, one without
      const bookmarkWithFolder = {
        ...createMockBookmark(user, activity),
        folder: {
          id: 'folder1',
          name: 'Folder 1',
          created_at: new Date(),
          updated_at: new Date(),
          custom: {},
        },
      };
      const bookmarkWithoutFolder = createMockBookmark(user, activity);

      activity.own_bookmarks = [bookmarkWithFolder, bookmarkWithoutFolder];

      // Try to remove bookmark without folder
      const event = createMockDeletedEvent(bookmarkWithoutFolder);
      const result = removeBookmarkFromActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(1);
      expect(result.own_bookmarks[0]).toEqual(bookmarkWithFolder);
    });
  });

  describe('updateBookmarkInActivity', () => {
    it('should update bookmark in own_bookmarks when from current user', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user1' });
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
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user1' });
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

    // Test for the bug: updating bookmarks with same activity_id but different folder_id
    it('should correctly update bookmark by activity_id + folder_id + user_id', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user1' });

      // Create two bookmarks with same activity and user but different folders
      const bookmark1 = {
        ...createMockBookmark(user, activity),
        folder: {
          id: 'folder1',
          name: 'Folder 1',
          created_at: new Date(),
          updated_at: new Date(),
          custom: {},
        },
      };
      const bookmark2 = {
        ...createMockBookmark(user, activity),
        folder: {
          id: 'folder2',
          name: 'Folder 2',
          created_at: new Date(),
          updated_at: new Date(),
          custom: {},
        },
      };

      activity.own_bookmarks = [bookmark1, bookmark2];

      // Update bookmark1
      const updatedBookmark1 = {
        ...bookmark1,
        custom: { updated: true },
      };
      const event = createMockUpdatedEvent(updatedBookmark1);
      const result = updateBookmarkInActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(2);
      expect(result.own_bookmarks).toContain(updatedBookmark1);
      expect(result.own_bookmarks).toContain(bookmark2);
    });

    it('should handle updating bookmarks without folders correctly', () => {
      const activity = generateActivityResponse({ id: 'activity1' });
      const user = generateUserResponse({ id: 'user1' });

      // Create two bookmarks: one with folder, one without
      const bookmarkWithFolder = {
        ...createMockBookmark(user, activity),
        folder: {
          id: 'folder1',
          name: 'Folder 1',
          created_at: new Date(),
          updated_at: new Date(),
          custom: {},
        },
      };
      const bookmarkWithoutFolder = createMockBookmark(user, activity);

      activity.own_bookmarks = [bookmarkWithFolder, bookmarkWithoutFolder];

      // Update bookmark without folder
      const updatedBookmarkWithoutFolder = {
        ...bookmarkWithoutFolder,
        custom: { updated: true },
      };
      const event = createMockUpdatedEvent(updatedBookmarkWithoutFolder);
      const result = updateBookmarkInActivity(event, activity, true);

      expect(result.changed).toBe(true);
      expect(result.own_bookmarks).toHaveLength(2);
      expect(result.own_bookmarks).toContain(bookmarkWithFolder);
      expect(result.own_bookmarks).toContain(updatedBookmarkWithoutFolder);
    });
  });

  describe('addBookmarkToActivities', () => {
    it('should add bookmark to correct activity', () => {
      const activity1 = generateActivityResponse({ id: 'activity1' });
      const activity2 = generateActivityResponse({ id: 'activity2' });
      const activities = [activity1, activity2];

      const user = generateUserResponse({ id: 'user1' });
      const bookmark = createMockBookmark(user, activity1);
      const event = createMockAddedEvent(bookmark);

      const result = addBookmarkToActivities(event, activities, true);

      expect(result.changed).toBe(true);
      expect(result.entities).toHaveLength(2);
      expect(result.entities![0].own_bookmarks).toHaveLength(1);
      expect(result.entities![0].own_bookmarks[0]).toEqual(bookmark);
      expect(result.entities![1].own_bookmarks).toHaveLength(0);
    });

    it('should return unchanged when activity not found', () => {
      const activity1 = generateActivityResponse({ id: 'activity1' });
      const activities = [activity1];

      const user = generateUserResponse({ id: 'user1' });
      const differentActivity = generateActivityResponse({ id: 'activity2' });
      const bookmark = createMockBookmark(user, differentActivity);
      const event = createMockAddedEvent(bookmark);

      const result = addBookmarkToActivities(event, activities, true);

      expect(result.changed).toBe(false);
      expect(result.entities).toEqual(activities);
    });

    it('should handle undefined activities', () => {
      const user = generateUserResponse({ id: 'user1' });
      const activity = generateActivityResponse({ id: 'activity1' });
      const bookmark = createMockBookmark(user, activity);
      const event = createMockAddedEvent(bookmark);

      const result = addBookmarkToActivities(event, undefined, true);

      expect(result.changed).toBe(false);
      expect(result.entities).toBeUndefined();
    });
  });

  describe('removeBookmarkFromActivities', () => {
    it('should remove bookmark from correct activity', () => {
      const activity1 = generateActivityResponse({ id: 'activity1' });
      const activity2 = generateActivityResponse({ id: 'activity2' });
      const user = generateUserResponse({ id: 'user1' });
      const bookmark = createMockBookmark(user, activity1);
      activity1.own_bookmarks = [bookmark];
      const activities = [activity1, activity2];

      const event = createMockDeletedEvent(bookmark);
      const result = removeBookmarkFromActivities(event, activities, true);

      expect(result.changed).toBe(true);
      expect(result.entities).toHaveLength(2);
      expect(result.entities![0].own_bookmarks).toHaveLength(0);
      expect(result.entities![1].own_bookmarks).toHaveLength(0);
    });

    it('should return unchanged when activity not found', () => {
      const activity1 = generateActivityResponse({ id: 'activity1' });
      const activities = [activity1];

      const user = generateUserResponse({ id: 'user1' });
      const differentActivity = generateActivityResponse({ id: 'activity2' });
      const bookmark = createMockBookmark(user, differentActivity);
      const event = createMockDeletedEvent(bookmark);

      const result = removeBookmarkFromActivities(event, activities, true);

      expect(result.changed).toBe(false);
      expect(result.entities).toEqual(activities);
    });

    it('should handle undefined activities', () => {
      const user = generateUserResponse({ id: 'user1' });
      const activity = generateActivityResponse({ id: 'activity1' });
      const bookmark = createMockBookmark(user, activity);
      const event = createMockDeletedEvent(bookmark);

      const result = removeBookmarkFromActivities(event, undefined, true);

      expect(result.changed).toBe(false);
      expect(result.entities).toBeUndefined();
    });
  });

  describe('updateBookmarkInActivities', () => {
    it('should update bookmark in correct activity', () => {
      const activity1 = generateActivityResponse({ id: 'activity1' });
      const activity2 = generateActivityResponse({ id: 'activity2' });
      const user = generateUserResponse({ id: 'user1' });
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
      expect(result.entities).toHaveLength(2);
      expect(result.entities![0].own_bookmarks).toHaveLength(1);
      expect(result.entities![0].own_bookmarks[0]).toEqual(updatedBookmark);
      expect(result.entities![1].own_bookmarks).toHaveLength(0);
    });

    it('should return unchanged when activity not found', () => {
      const activity1 = generateActivityResponse({ id: 'activity1' });
      const activities = [activity1];

      const user = generateUserResponse({ id: 'user1' });
      const differentActivity = generateActivityResponse({ id: 'activity2' });
      const bookmark = createMockBookmark(user, differentActivity);
      const event = createMockUpdatedEvent(bookmark);

      const result = updateBookmarkInActivities(event, activities, true);

      expect(result.changed).toBe(false);
      expect(result.entities).toEqual(activities);
    });

    it('should handle undefined activities', () => {
      const user = generateUserResponse({ id: 'user1' });
      const activity = generateActivityResponse({ id: 'activity1' });
      const bookmark = createMockBookmark(user, activity);
      const event = createMockUpdatedEvent(bookmark);

      const result = updateBookmarkInActivities(event, undefined, true);

      expect(result.changed).toBe(false);
      expect(result.entities).toBeUndefined();
    });
  });
});
