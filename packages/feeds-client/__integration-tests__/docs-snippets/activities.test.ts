import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { UserRequest } from '../../src/gen/models';

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
      feeds: [feed.feed],
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

  it(`sharing activities`, async () => {
    const activityToShare = (
      await feed.addActivity({
        type: 'post',
        text: 'Very interesting activity',
      })
    ).activity;

    const response = await feed.addActivity({
      type: 'post',
      text: `Couldn't agree more!`,
      parent_id: activityToShare.id,
    });

    console.log(response.activity?.parent);
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
          feeds: [feed.feed],
          id: '1',
          type: 'post',
          text: 'hi',
        },
        {
          feeds: [feed.feed],
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
          feeds: [feed.feed],
          id: '1',
          type: 'post',
          text: 'hi',
        },
        {
          feeds: [feed.feed],
          id: '2',
          type: 'post',
          text: 'hi',
        },
      ],
    });

    // Update an activity
    const updatedActivity = await client.updateActivity({
      id: activities.activities[0].id,
      text: 'Updated text',
      custom: {
        color: 'blue',
      },
    });

    expect(updatedActivity.activity?.type).toBe('post');

    await client.deleteActivity({
      id: activities.activities[0].id,
      hard_delete: false, // Soft delete sets deleted at but retains the data, hard delete fully removes it
    });

    // Batch delete activities
    await client.deleteActivities({
      ids: [activities.activities[1].id],
      hard_delete: false,
    });
  });

  it('Partial activity updates', async () => {
    const activity = (
      await feed.addActivity({
        type: 'post',
        text: 'Hello, world!',
      })
    ).activity;

    // Partially set some fields
    client.updateActivityPartial({
      id: activity.id,
      set: {
        text: 'Japan has over 6,800 islands.',
        custom: {
          topic: 'fun facts',
          color: 'blue',
        },
      },
    });

    // Partially unset some fields
    client.updateActivityPartial({
      id: activity.id,
      unset: ['custom.color'],
    });
  });

  it(`get activity`, async () => {
    const activityId = (
      await feed.addActivity({
        type: 'post',
        text: 'Hello, world!',
      })
    ).activity.id;

    const activityWithStateUpdates =
      client.activityWithStateUpdates(activityId);
    await activityWithStateUpdates.get({
      // Optionally fetch comments too
      comments: {
        limit: 10,
        depth: 2,
      },
    });

    // Subscribe to state updates
    activityWithStateUpdates.state.subscribe((state) => {
      console.log(state.activity);
      console.log(state.comments_by_entity_id);
      // True if activity is being fetched
      console.log(state.is_loading);
    });
    // Comment pagination
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    activityWithStateUpdates.loadNextPageActivityComments;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    activityWithStateUpdates.loadNextPageCommentReplies;
    // Optionally start watching the feed
    // If activity belongs to multiple feeds, it's up to you to choose which feed to watch
    const fid = activityWithStateUpdates.currentState.activity!.feeds[0];
    const [group, id] = fid.split(':');
    feed = client.feed(group, id);
    const shouldWatch = false;
    if (!feed.currentState.watch) {
      await feed.getOrCreate({
        watch: true,
        limit: 0,
        followers_pagination: { limit: 0 },
        following_pagination: { limit: 0 },
      });
    }

    // When leaving the page...
    // dispose activity, this avoids refetching the activity if WebSocket reconnects
    activityWithStateUpdates.dispose();
    // you should stop watching the feed, unless your app has another component that watches the same feed
    if (shouldWatch) {
      await feed.stopWatching();
    }

    // If you don't care about state updates
    await client.getActivity({
      id: activityId,
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
