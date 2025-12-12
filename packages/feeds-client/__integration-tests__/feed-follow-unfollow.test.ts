import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { FeedsClient } from '../src/feeds-client';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  getServerClient,
  waitForEvent,
} from './utils';
import type { UserRequest } from '../src/gen/models';
import type { StreamClient } from '@stream-io/node-sdk';

describe('Feed follow and unfollow', () => {
  describe('state update without watching', () => {
    let serverClient: StreamClient;
    let client: FeedsClient;
    let feed: ReturnType<FeedsClient['feed']>;
    const user: UserRequest = getTestUser('current');
    const secondUser: UserRequest = getTestUser('second');
    const thirdUser: UserRequest = getTestUser('third');
    let secondUserFeed: ReturnType<StreamClient['feeds']['feed']>;
    let secondUserTimeline: ReturnType<StreamClient['feeds']['feed']>;
    let thirdUserFeed: ReturnType<StreamClient['feeds']['feed']>;
    let thirdUserTimeline: ReturnType<StreamClient['feeds']['feed']>;

    beforeAll(async () => {
      // Create second user and their feeds using server client
      serverClient = getServerClient();
      await serverClient.upsertUsers([secondUser]);

      client = createTestClient();
      await client.connectUser(user, createTestTokenGenerator(user));
      feed = client.feed('user', user.id);

      // Create user feed for second user
      secondUserFeed = serverClient.feeds.feed('user', secondUser.id);
      await secondUserFeed.getOrCreate({
        user: { id: secondUser.id },
      });

      // Create timeline feed for second user
      secondUserTimeline = serverClient.feeds.feed('timeline', secondUser.id);
      await secondUserTimeline.getOrCreate({
        user: { id: secondUser.id },
      });

      // Create user feed for third user
      thirdUserFeed = serverClient.feeds.feed('user', thirdUser.id);
      await thirdUserFeed.getOrCreate({
        user: { id: thirdUser.id },
      });

      // Create timeline feed for third user
      thirdUserTimeline = serverClient.feeds.feed('timeline', thirdUser.id);
      await thirdUserTimeline.getOrCreate({
        user: { id: thirdUser.id },
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
      await feed.follow(secondUserFeed.feed);

      expect(feed.currentState.following).toHaveLength(1);
      expect(feed.currentState.following_count).toEqual(1);
    });

    it(`should update state when doing getOrCreateFollows and some feeds already followed`, async () => {
      const initialFollowingCount = feed.currentState.following_count ?? 0;
      const initialFollowing = feed.currentState.following ?? [];

      await client.getOrCreateFollows({
        follows: [
          // Already followed
          { source: feed.feed, target: secondUserFeed.feed },
          // Not yet followed
          { source: feed.feed, target: thirdUserFeed.feed },
        ],
      });

      expect(feed.currentState.following).toHaveLength(
        initialFollowing.length + 1,
      );
      expect(feed.currentState.following_count).toEqual(
        initialFollowingCount + 1,
      );
    });

    it('should update state when I unfollow someone', async () => {
      const initialFollowingCount = feed.currentState.following_count ?? 0;
      const initialFollowing = feed.currentState.following ?? [];

      await feed.unfollow(secondUserFeed.feed);

      expect(feed.currentState.following).toHaveLength(
        initialFollowing.length - 1,
      );
      expect(feed.currentState.following_count).toEqual(
        initialFollowingCount - 1,
      );
    });

    it(`should update state when doing getOrCreateUnfollows and some feeds already unfollowed`, async () => {
      const initialFollowingCount = feed.currentState.following_count ?? 0;
      const initialFollowing = feed.currentState.following ?? [];

      await client.getOrCreateUnfollows({
        follows: [
          // Already unfollowed
          { source: feed.feed, target: secondUserFeed.feed },
          // Not yet unfollowed
          { source: feed.feed, target: thirdUserFeed.feed },
        ],
      });

      expect(feed.currentState.following).toHaveLength(
        initialFollowing.length - 1,
      );
      expect(feed.currentState.following_count).toEqual(
        initialFollowingCount - 1,
      );
    });

    afterAll(async () => {
      // Clean up feeds
      await feed.delete({ hard_delete: true });

      await secondUserFeed.delete({ hard_delete: true });
      await secondUserTimeline.delete({ hard_delete: true });

      await thirdUserFeed.delete({ hard_delete: true });
      await thirdUserTimeline.delete({ hard_delete: true });

      await client.disconnectUser();

      await serverClient.deleteUsers({
        user_ids: [secondUser.id, thirdUser.id],
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
        feed.follow(secondUserFeed.feed),
        waitForEvent(feed, 'feeds.follow.created', { shouldReject: true }),
      ]);

      expect(feed.currentState.following).toHaveLength(1);
      expect(feed.currentState.following_count).toEqual(1);
    });

    it('should update state when someone follows me', async () => {
      await Promise.all([
        serverClient.feeds.follow({
          target: feed.feed,
          source: secondUserTimeline.feed,
        }),
        waitForEvent(feed, 'feeds.follow.created', { shouldReject: true }),
      ]);

      expect(feed.currentState.followers).toHaveLength(1);
      expect(feed.currentState.follower_count).toEqual(1);
    });

    it('should update state when I unfollow someone', async () => {
      await Promise.all([
        feed.unfollow(secondUserFeed.feed),
        waitForEvent(feed, 'feeds.follow.deleted', { shouldReject: true }),
      ]);

      expect(feed.currentState.following).toHaveLength(0);
      expect(feed.currentState.following_count).toEqual(0);
    });

    it('should update state when someone unfollows me', async () => {
      await Promise.all([
        serverClient.feeds.unfollow({
          target: feed.feed,
          source: secondUserTimeline.feed,
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
