import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { UserRequest } from '../../src/gen/models';

describe('Stories page', () => {
  let johnClient: FeedsClient;
  let saraClient: FeedsClient;
  const john: UserRequest = getTestUser('john');
  const sara: UserRequest = getTestUser('sara');
  let johnStoryFeed: Feed;
  let saraStoryTimeline: Feed;

  beforeAll(async () => {
    johnClient = createTestClient();
    await johnClient.connectUser(john, createTestTokenGenerator(john));
    saraClient = createTestClient();
    await saraClient.connectUser(sara, createTestTokenGenerator(sara));
  });

  it(`Posting stories`, async () => {
    johnStoryFeed = johnClient.feed('story', john.id);
    await johnStoryFeed.getOrCreate();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await johnStoryFeed.addActivity({
      type: 'post',
      attachments: [
        {
          image_url: 'https://example.com/image.jpg',
          custom: {},
        },
      ],
      expires_at: tomorrow.toISOString(),
    });
  });

  it(`Following stories`, async () => {
    saraStoryTimeline = saraClient.feed('stories', sara.id);
    await saraStoryTimeline.getOrCreate({ watch: true });

    await saraStoryTimeline.follow(johnStoryFeed);
  });

  it(`Reading story timeline and marking avtivities as watched`, async () => {
    saraStoryTimeline = saraClient.feed('stories', sara.id);
    await saraStoryTimeline.getOrCreate({ watch: true });

    // Since story timeline is aggregated by user id, we read aggregated activities
    const johnStories =
      saraStoryTimeline.state.getLatestValue().aggregated_activities![0];
    // True if we watched all active stories of a user
    console.log(johnStories.is_watched);

    // Display all of John's active stories
    johnStories.activities.forEach((activity) => {
      // True if we watched a given story
      console.log(activity.is_watched);
    });

    // Mark a story as read
    await saraStoryTimeline.markActivity({
      mark_watched: [johnStories.activities[0].id],
    });
  });

  it(`Reading story feed`, async () => {
    // Sara reads John's story feed
    const johnFeed = saraClient.feed('story', john.id, {
      // By default new activities are added to the start of the list, but this is not what we want for stories
      onNewActivity: () => 'add-to-end',
    });

    await johnFeed.getOrCreate({
      watch: true,
      limit: 100,
    });

    const johnStories = johnFeed.state.getLatestValue().activities!;

    // Display all of John's active stories
    johnStories.forEach((activity) => {
      // True if we watched a given story
      console.log(activity.is_watched);
    });

    // Mark a story as watched
    await johnFeed.markActivity({
      mark_watched: [johnStories[0].id],
    });
  });

  it(`Reading expired stories`, async () => {
    const now = new Date();
    const result = await johnClient.queryActivities({
      filter: {
        expires_at: { $lte: now.toISOString() },
        user_id: john.id,
      },
      sort: [{ field: 'created_at', direction: -1 }],
    });

    console.log(result.activities);
  });

  afterAll(async () => {
    await saraStoryTimeline.delete({ hard_delete: true });
    await johnStoryFeed.delete({ hard_delete: true });
    await saraClient.disconnectUser();
    await johnClient.disconnectUser();
  });
});
