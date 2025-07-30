import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FeedsClient } from '../src/feeds-client';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  getServerClient,
  waitForEvent,
} from './utils';
import { UserRequest } from '../src/gen/models';
import { StreamClient } from '@stream-io/node-sdk';

describe('Feed follow and unfollow', () => {
  describe('state update without watching', () => {
    let serverClient: StreamClient;
    let client: FeedsClient;
    let feed: ReturnType<FeedsClient['feed']>;
    const user: UserRequest = getTestUser();
    const secondUser: UserRequest = getTestUser();
    const feedId = crypto.randomUUID();
    const secondUserFeedId = crypto.randomUUID();
    const secondUserTimelineId = crypto.randomUUID();
    let secondUserFeed: ReturnType<StreamClient['feeds']['feed']>;
    let secondUserTimeline: ReturnType<StreamClient['feeds']['feed']>;

    beforeAll(async () => {
      // Create second user and their feeds using server client
      serverClient = getServerClient();
      await serverClient.upsertUsers([secondUser]);

      client = createTestClient();
      await client.connectUser(user, createTestTokenGenerator(user));
      feed = client.feed('user', feedId);

      // Create user feed for second user
      secondUserFeed = serverClient.feeds.feed('user', secondUserFeedId);
      await secondUserFeed.getOrCreate({
        user: { id: secondUser.id },
      });

      // Create timeline feed for second user
      secondUserTimeline = serverClient.feeds.feed(
        'timeline',
        secondUserTimelineId,
      );
      await secondUserTimeline.getOrCreate({
        user: { id: secondUser.id },
      });
    });

    beforeEach(async () => {
      await feed.getOrCreate({
        watch: false,
        followers_pagination: { limit: 10 },
        following_pagination: { limit: 10 },
      });
    });

    it('should update state when following', async () => {
      await feed.follow(secondUserFeed.fid);

      expect(feed.currentState.following).toHaveLength(1);
      expect(feed.currentState.following_count).toEqual(1);
    });

    it('should update state when I unfollow someone', async () => {
      await feed.unfollow(secondUserFeed.fid);

      expect(feed.currentState.following).toHaveLength(0);
      expect(feed.currentState.following_count).toEqual(0);
    });

    afterAll(async () => {
      // Clean up feeds
      await feed.delete();

      await secondUserFeed.delete({ hard_delete: true });
      await secondUserTimeline.delete({ hard_delete: true });

      await client.disconnectUser();

      await serverClient.deleteUsers({
        user_ids: [secondUser.id],
        user: 'hard',
      });
    });
  });

  describe('state update with watching', () => {
    let serverClient: StreamClient;
    let client: FeedsClient;
    let feed: ReturnType<FeedsClient['feed']>;
    const user: UserRequest = getTestUser();
    const secondUser: UserRequest = getTestUser();
    const feedId = crypto.randomUUID();
    const secondUserFeedId = crypto.randomUUID();
    const secondUserTimelineId = crypto.randomUUID();
    let secondUserFeed: ReturnType<StreamClient['feeds']['feed']>;
    let secondUserTimeline: ReturnType<StreamClient['feeds']['feed']>;

    beforeAll(async () => {
      // Create second user and their feeds using server client
      serverClient = getServerClient();
      await serverClient.upsertUsers([secondUser]);

      client = createTestClient();
      await client.connectUser(user, createTestTokenGenerator(user));
      feed = client.feed('user', feedId);

      // Create user feed for second user
      secondUserFeed = serverClient.feeds.feed('user', secondUserFeedId);
      await secondUserFeed.getOrCreate({
        user: { id: secondUser.id },
      });

      // Create timeline feed for second user
      secondUserTimeline = serverClient.feeds.feed(
        'timeline',
        secondUserTimelineId,
      );
      await secondUserTimeline.getOrCreate({
        user: { id: secondUser.id },
      });
    });

    beforeEach(async () => {
      await feed.getOrCreate({
        watch: true,
        followers_pagination: { limit: 10 },
        following_pagination: { limit: 10 },
      });
    });

    it('should update state when following', async () => {
      await Promise.all([
        feed.follow(secondUserFeed.fid),
        waitForEvent(feed, 'feeds.follow.created', { shouldReject: true }),
      ]);

      expect(feed.currentState.following).toHaveLength(1);
      expect(feed.currentState.following_count).toEqual(1);
    });

    it('should update state when someone follows me', async () => {
      await Promise.all([
        serverClient.feeds.follow({
          target: feed.fid,
          source: secondUserTimeline.fid,
        }),
        waitForEvent(feed, 'feeds.follow.created', { shouldReject: true }),
      ]);

      expect(feed.currentState.followers).toHaveLength(1);
      expect(feed.currentState.follower_count).toEqual(1);
    });

    it('should update state when I unfollow someone', async () => {
      await Promise.all([
        feed.unfollow(secondUserFeed.fid),
        waitForEvent(feed, 'feeds.follow.deleted', { shouldReject: true }),
      ]);

      expect(feed.currentState.following).toHaveLength(0);
      expect(feed.currentState.following_count).toEqual(0);
    });

    it('should update state when someone unfollows me', async () => {
      await Promise.all([
        serverClient.feeds.unfollow({
          target: feed.fid,
          source: secondUserTimeline.fid,
        }),
        waitForEvent(feed, 'feeds.follow.deleted', {
          shouldReject: true,
        }),
      ]);

      expect(feed.currentState.following).toHaveLength(0);
      expect(feed.currentState.following_count).toEqual(0);
    });

    afterAll(async () => {
      // Clean up feeds
      await feed.delete();

      await secondUserFeed.delete({ hard_delete: true });
      await secondUserTimeline.delete({ hard_delete: true });

      await client.disconnectUser();

      await serverClient.deleteUsers({
        user_ids: [secondUser.id],
        user: 'hard',
      });
    });
  });
});
