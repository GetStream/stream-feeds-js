import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import { FeedsClient } from '../../src/FeedsClient';
import { Feed } from '../../src/Feed';
import { UserRequest } from '../../src/gen/models';

describe('Activities page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate();
  });

  it('creating activities', async () => {
    // Add an activity to 1 feed
    let response = await feed.addActivity({
      type: 'post',
      text: 'apple stock will go up',
    });

    expect(response.activity).toBeDefined();

    //...or multiple feeds
    response = await client.addActivity({
      fids: [feed.fid],
      type: 'post',
      text: 'apple stock will go up',
    });
  });

  it(`image and video`, async () => {
    feed.addActivity({
      type: 'post',
      text: 'look at NYC',
      attachments: [
        {
          type: 'image',
          image_url: 'https://example.com/image.png',
          custom: {},
        },
      ],
    });
  });

  it(`stories`, async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await feed.addActivity({
      type: 'story',
      text: 'My story',
      expires_at: tomorrow.toISOString(),
      attachments: [
        {
          type: 'image',
          image_url: 'https://example.com/image.png',
          custom: {},
        },
        {
          type: 'video',
          image_url: 'https://example.com/video.mp4',
          custom: {},
        },
      ],
    });

    expect(response.activity?.expires_at?.getTime()).toBeDefined();
  });

  it('restricted visibility', async () => {
    const response = await feed.addActivity({
      type: 'post',
      text: 'Premium content',
      visibility: 'tag',
      visibility_tag: 'premium',
    });

    expect(response.activity?.visibility).toBe('tag');
    expect(response.activity?.visibility_tag).toBe('premium');
  });

  it(`Adding Many Activities`, async () => {
    const response = await client.upsertActivities({
      activities: [
        {
          fids: [feed.fid],
          id: '1',
          type: 'post',
          text: 'hi',
        },
        {
          fids: [feed.fid],
          id: '2',
          type: 'post',
          text: 'hi',
        },
      ],
    });

    expect(response.activities).toHaveLength(2);
  });

  it('Updating & Deleting Activities', async () => {
    const activities = await client.upsertActivities({
      activities: [
        {
          fids: [feed.fid],
          id: '1',
          type: 'post',
          text: 'hi',
        },
        {
          fids: [feed.fid],
          id: '2',
          type: 'post',
          text: 'hi',
        },
      ],
    });

    // Update an activity
    const updatedActivity = await client.updateActivity({
      activity_id: activities.activities[0].id,
      text: 'Updated text',
      custom: {
        color: 'blue',
      },
    });

    expect(updatedActivity.activity?.type).toBe('post');

    await client.deleteActivity({
      activity_id: activities.activities[0].id,
      hard_delete: false, // Soft delete sets deleted at but retains the data, hard delete fully removes it
    });

    // Batch delete activities
    await client.deleteActivities({
      activity_ids: [activities.activities[1].id],
      hard_delete: false,
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
