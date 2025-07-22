import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FeedsClient } from '../src/FeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  getServerClient,
} from './utils';
import { UserRequest } from '../src/gen/models';

describe('Feed follow and unfollow', () => {
  let client: FeedsClient;
  let feed: ReturnType<FeedsClient['feed']>;
  const user: UserRequest = getTestUser();
  const secondUser: UserRequest = getTestUser();
  const feedGroup = 'user';
  const feedId = crypto.randomUUID();
  const secondUserFeedId = crypto.randomUUID();
  const secondUserTimelineId = crypto.randomUUID();

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed(feedGroup, feedId);

    // Create second user and their feeds using server client
    const serverClient = getServerClient();
    await serverClient.upsertUsers([secondUser]);

    // Create user feed for second user
    const secondUserFeed = serverClient.feeds.feed('user', secondUserFeedId);
    await secondUserFeed.getOrCreate({
      data: { visibility: 'public' },
      user: { id: secondUser.id },
    });

    // Create timeline feed for second user
    const secondUserTimeline = serverClient.feeds.feed(
      'timeline',
      secondUserTimelineId,
    );
    await secondUserTimeline.getOrCreate({
      data: { visibility: 'private' },
      user: { id: secondUser.id },
    });

    // Make timeline follow user feed
    await serverClient.feeds.follow({
      target: secondUserFeed.fid,
      source: secondUserTimeline.fid,
    });
  });

  afterAll(async () => {
    // Clean up feeds
    await feed.delete();

    // Clean up second user's feeds and user
    const serverClient = getServerClient();
    const secondUserFeed = serverClient.feeds.feed('user', secondUserFeedId);
    const secondUserTimeline = serverClient.feeds.feed(
      'timeline',
      secondUserTimelineId,
    );

    await secondUserFeed.delete({ hard_delete: true });
    await secondUserTimeline.delete({ hard_delete: true });
    await serverClient.deleteUsers({ user_ids: [secondUser.id], user: 'hard' });

    await client.disconnectUser();
  });
});
