import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import { FeedsClient } from '../../src/FeedsClient';
import { Feed } from '../../src/Feed';
import { UserRequest } from '../../src/gen/models';

describe('Follows page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let timeline: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate();
  });

  it(`Follow & Unfollows`, async () => {
    timeline = client.feed('timeline', crypto.randomUUID());
    await timeline.getOrCreate();

    await timeline.follow(feed.fid, {
      push_preference: 'all',
      custom: {
        reason: 'investment',
      },
    });
  });

  it(`Query follows`, async () => {
    const myTimeline = timeline;
    await myTimeline.getOrCreate();

    // Do I follow a list of feeds
    const response = await client.queryFollows({
      filter: {
        source_feed: myTimeline.fid,
        target_feed: { $in: ['user:sara', 'user:adam'] },
      },
    });

    expect(response.follows).toBeDefined();

    const userFeed = feed;

    // Paginating through followers for a feed - won't store followers in state
    const firstPage = await userFeed.queryFollowers({
      limit: 20,
    });

    // Next page - won't store followers in state
    await userFeed.queryFollowers({
      limit: 20,
      next: firstPage.next,
    });

    // or load when reading feed - will store followers in state
    await feed.getOrCreate({
      followers_pagination: {
        limit: 10,
      },
    });

    // and then load next pages (or first if followers are not yet loaded) - will store followers in state
    await feed.loadNextPageFollowers({ limit: 10 });

    expect(feed.state.getLatestValue().followers).toBeDefined();

    // Filter by source - feeds that I follow - won't store followings in state
    await myTimeline.queryFollowing({ limit: 10 });

    // or load when reading feed - will store followings in state
    await feed.getOrCreate({
      following_pagination: {
        limit: 10,
      },
    });

    // and then load next pages (or first if followings are not yet loaded) - will store followings in state
    await feed.loadNextPageFollowing({ limit: 10 });

    expect(feed.state.getLatestValue().following).toBeDefined();
  });

  it(`Follow requests`, async () => {
    const saraFeed = client.feed('user', crypto.randomUUID());
    await saraFeed.getOrCreate({
      // You need to set followers visibility to have follow requests
      data: { visibility: 'followers' },
    });
    const adamTimeline = timeline;
    await adamTimeline.getOrCreate();
    const followRequest = await adamTimeline.follow(saraFeed.fid);

    expect(followRequest.follow.status).toBe('pending');

    await client.acceptFollow({
      source_fid: adamTimeline.fid,
      target_fid: saraFeed.fid,
      // Optionally provide role
      follower_role: 'feed_member',
    });

    await client.rejectFollow({
      source_fid: adamTimeline.fid,
      target_fid: saraFeed.fid,
    });

    await saraFeed.delete({ hard_delete: true });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await timeline.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
