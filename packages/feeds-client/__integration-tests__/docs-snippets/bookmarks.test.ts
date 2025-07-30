import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import { FeedsClient } from '../../src/feeds-client';
import { Feed } from '../../src/feed';
import { ActivityResponse, UserRequest } from '../../src/gen/models';

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

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
