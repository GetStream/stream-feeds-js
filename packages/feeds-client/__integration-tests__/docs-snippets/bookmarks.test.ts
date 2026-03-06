import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { ActivityResponse, UserRequest } from '../../src/gen/models';

describe('Bookmarks page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activity: ActivityResponse;
  let activity2: ActivityResponse;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate({ watch: true });
    activity = (
      await feed.addActivity({
        type: 'post',
        text: 'Hello, world!',
      })
    ).activity;
    activity2 = (
      await feed.addActivity({
        type: 'post',
        text: 'Hello, world2!',
      })
    ).activity;
  });

  it('Adding bookmarks', async () => {
    // Adding a bookmark to a new folder
    const bookmark = await client.addBookmark({
      activity_id: activity.id,
    });

    // Update a bookmark (without a folder initially) - add custom data and move it to a new folder
    const updatedBookmark = await client.updateBookmark({
      activity_id: activity.id,
      folder_id: bookmark.bookmark.folder?.id,
      new_folder: {
        name: 'New folder name',
        custom: {
          icon: '📂',
        },
      },
      custom: {
        color: 'blue',
      },
    });

    // Adding to an existing folder
    const bookmark2 = await client.addBookmark({
      activity_id: activity2.id,
      folder_id: updatedBookmark.bookmark.folder?.id,
    });

    // Update a bookmark - move it from one existing folder to another existing folder
    await client.updateBookmark({
      activity_id: activity2.id,
      folder_id: bookmark2.bookmark.folder?.id,
      new_folder_id: undefined,
    });
  });

  it('Querying bookmarks', async () => {
    // Query bookmarks
    const firstPage = await client.queryBookmarks({
      limit: 2,
    });
    // Get next page
    await client.queryBookmarks({
      limit: 2,
      next: firstPage.next,
    });
    // Query by activity ID
    await client.queryBookmarks({
      filter: {
        activity_id: 'activity_123',
      },
    });
    // Query by folder ID
    await client.queryBookmarks({
      filter: {
        folder_id: 'folder_456',
      },
    });
  });

  it('Querying Bookmark Folders', async () => {
    // Query bookmark folders
    const firstPage = await client.queryBookmarkFolders({
      limit: 2,
    });
    // Get next page
    await client.queryBookmarkFolders({
      limit: 2,
      next: firstPage.next,
    });
    // Query by filter condition
    await client.queryBookmarkFolders({
      filter: {
        folder_name: {
          $contains: 'project',
        },
      },
      limit: 2,
      next: firstPage.next,
    });
  });

  it('Managing Bookmark Folders', async () => {
    const bookmark = (
      await client.addBookmark({
        activity_id: activity.id,
        new_folder: {
          name: 'Breakfast recipes',
          custom: {
            icon: '🍳',
          },
        },
      })
    ).bookmark;

    const updatedFolder = (
      await client.updateBookmarkFolder({
        folder_id: bookmark.folder?.id!,
        name: 'Sweet Breakfast Recipes',
        custom: {
          icon: '🥞',
        },
      })
    ).bookmark_folder;

    await client.deleteBookmarkFolder({
      folder_id: updatedFolder.id,
    });
  });

  it('updates feed state from HTTP response for bookmark operations', async () => {
    const testActivity = (
      await feed.addActivity({
        type: 'post',
        text: 'Bookmark state test',
      })
    ).activity;

    // addBookmark should update state immediately
    await client.addBookmark({
      activity_id: testActivity.id,
    });
    const activitiesAfterAdd = feed.currentState.activities!;
    const activityAfterAdd = activitiesAfterAdd.find(
      (a) => a.id === testActivity.id,
    )!;
    expect(activityAfterAdd.own_bookmarks).toHaveLength(1);
    expect(activityAfterAdd.own_bookmarks[0].activity.id).toBe(testActivity.id);

    // updateBookmark should update state immediately
    await client.updateBookmark({
      activity_id: testActivity.id,
      folder_id: activityAfterAdd.own_bookmarks[0].folder?.id,
      custom: { color: 'red' },
    });
    const activitiesAfterUpdate = feed.currentState.activities!;
    const activityAfterUpdate = activitiesAfterUpdate.find(
      (a) => a.id === testActivity.id,
    )!;
    expect(activityAfterUpdate.own_bookmarks).toHaveLength(1);
    expect(activityAfterUpdate.own_bookmarks[0].custom).toEqual({
      color: 'red',
    });

    // deleteBookmark should update state immediately
    await client.deleteBookmark({
      activity_id: testActivity.id,
    });
    const activitiesAfterDelete = feed.currentState.activities!;
    const activityAfterDelete = activitiesAfterDelete.find(
      (a) => a.id === testActivity.id,
    )!;
    expect(activityAfterDelete.own_bookmarks).toHaveLength(0);
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
