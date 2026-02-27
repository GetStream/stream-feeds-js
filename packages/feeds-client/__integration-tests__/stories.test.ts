import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from './utils';

import type { UserRequest } from '../src/gen/models';
import type { FeedsClient } from '../src/feeds-client';
import type { Feed } from '../src/feed';

describe('Stories Feed', () => {
  let client1: FeedsClient;
  let client2: FeedsClient;

  // Create two test users
  const user1: UserRequest = getTestUser();
  const user2: UserRequest = getTestUser();

  // Feeds for user1
  let user1StoryFeed: Feed;

  // Feeds for user2
  let user2StoriesFeed: Feed;

  beforeAll(async () => {
    // Create and connect first client
    client1 = createTestClient();
    await client1.connectUser(user1, createTestTokenGenerator(user1));

    // Create and connect second client
    client2 = createTestClient();
    await client2.connectUser(user2, createTestTokenGenerator(user2));

    // Initialize feeds for user1
    user1StoryFeed = client1.feed('story', user1.id);

    // Initialize feeds for user2
    user2StoriesFeed = client2.feed('stories', user2.id);

    // Create notification feeds
    await user1StoryFeed.getOrCreate({ watch: true });
    await user2StoriesFeed.getOrCreate({ watch: true });

    // User 2 follows user 1
    await user2StoriesFeed.follow(user1StoryFeed.feed);
  });

  it(`user 1 posts a story, user 2 can see on its story timeline`, async () => {
    await user1StoryFeed.addActivity({
      type: 'post',
      attachments: [
        {
          type: 'image',
          image_url: 'https://example.com/image.png',
          custom: {},
        },
      ],
    });

    await user2StoriesFeed.getOrCreate({ watch: true });

    expect(
      user2StoriesFeed.state.getLatestValue().aggregated_activities,
    ).toHaveLength(1);
    expect(
      user2StoriesFeed.state.getLatestValue().aggregated_activities![0]
        .activities,
    ).toHaveLength(1);
  });

  it(`user 2 marks the story as watched`, async () => {
    await user2StoriesFeed.getOrCreate({ watch: true });
    user2StoriesFeed.on('feeds.stories_feed.updated', (_) => {});

    await Promise.all([
      user2StoriesFeed.markActivity({
        mark_watched: [
          user2StoriesFeed.state.getLatestValue().aggregated_activities![0]
            .activities![0].id,
        ],
      }),
      waitForEvent(user2StoriesFeed, 'feeds.stories_feed.updated', {
        shouldReject: true,
      }),
    ]);

    expect(
      user2StoriesFeed.state.getLatestValue().aggregated_activities![0]
        .is_watched,
    ).toBe(true);
    expect(
      user2StoriesFeed.state.getLatestValue().aggregated_activities![0]
        .activities![0].is_watched,
    ).toBe(true);
  });

  it(`user reads user1's story feed directly`, async () => {
    const feed = client2.feed(user1StoryFeed.group, user1StoryFeed.id, {
      onNewActivity: () => 'add-to-end',
    });
    await feed.getOrCreate({ watch: true });

    expect(feed.state.getLatestValue().activities).toHaveLength(1);

    await Promise.all([
      client1.addActivity({
        type: 'post',
        feeds: [user1StoryFeed.feed],
        attachments: [
          {
            type: 'video',
            image_url: 'https://example.com/video.mp3',
            custom: {},
          },
        ],
      }),
      waitForEvent(feed, 'feeds.activity.added', {
        shouldReject: true,
      }),
    ]);

    expect(feed.state.getLatestValue().activities).toHaveLength(2);

    feed.state.getLatestValue().activities!.forEach((activity, index) => {
      if (index > 0) {
        expect(activity.created_at.getTime()).toBeGreaterThan(
          feed.state
            .getLatestValue()
            .activities![index - 1].created_at.getTime(),
        );
      }
    });

    await Promise.all([
      feed.markActivity({
        mark_watched: [feed.state.getLatestValue().activities![0].id],
      }),
      waitForEvent(feed, 'feeds.stories_feed.updated', {
        shouldReject: true,
      }),
    ]);

    expect(feed.state.getLatestValue().activities![0].is_watched).toBe(true);
    expect(feed.state.getLatestValue().activities![1].is_watched).toBeFalsy();
  });

  afterAll(async () => {
    await user1StoryFeed.delete({ hard_delete: true });
    await user2StoriesFeed.delete({ hard_delete: true });

    await client1.disconnectUser();
    await client2.disconnectUser();
  });
});
