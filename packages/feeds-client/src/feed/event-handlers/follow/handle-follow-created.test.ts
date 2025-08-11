import {
  FeedResponse,
  FollowResponse,
  UserResponse,
} from '../../../gen/models';
import { generateFollowResponse } from '../../../test-utils';
import { updateStateFollowCreated } from './handle-follow-created';

import { describe, it, expect, beforeEach } from 'vitest';

describe('handle-follow-created', () => {
  describe(updateStateFollowCreated.name, () => {
    let mockFollow: FollowResponse;
    let mockFeed: FeedResponse;
    let mockUser: UserResponse;

    beforeEach(() => {
      mockFollow = generateFollowResponse();
      mockFeed = mockFollow.source_feed;
      mockUser = mockFeed.created_by;
    });

    it('should return unchanged state for non-accepted follows', () => {
      const follow: FollowResponse = {
        ...mockFollow,
        status: 'pending',
      };

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [],
        following: [],
      };

      const result = updateStateFollowCreated(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(false);
    });

    it('should handle when this feed follows someone', () => {
      const follow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'feed-x',
          feed: 'user:feed-x',
          created_by: {
            ...mockUser,
            id: 'user-x',
          },
          following_count: 1,
        },
        target_feed: {
          ...mockFeed,
          id: 'other-feed',
          feed: 'user:other-feed',
          created_by: mockUser,
        },
      };

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        following: [],
        following_count: 0,
      };

      const result = updateStateFollowCreated(
        follow,
        currentState,
        'user:feed-x',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.following).toHaveLength(1);
      expect(result.data.following?.[0]).toEqual(follow);
      expect(result.data).toMatchObject(follow.source_feed);
      expect(result.data.own_follows).toBeUndefined();
      expect(result.data.following_count).toEqual(1);
    });

    it('should handle when someone follows this feed', () => {
      const follow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'other-feed',
          feed: 'user:other-feed',
          created_by: {
            ...mockUser,
            id: 'other-user',
          },
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          feed: 'user:feed-1',
          created_by: mockUser,
          follower_count: 1,
        },
      };

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [],
        follower_count: 0,
      };

      const result = updateStateFollowCreated(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.followers).toHaveLength(1);
      expect(result.data.followers?.[0]).toEqual(follow);
      expect(result.data).toMatchObject(follow.target_feed);
      expect(result.data.own_follows).toBeUndefined();
      expect(result.data.follower_count).toEqual(1);
    });

    it('should add to own_follows when connected user is the source', () => {
      const follow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'feed-1',
          feed: 'user:feed-1',
          created_by: { ...mockUser, id: 'user-1' },
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-x',
          feed: 'user:feed-x',
          created_by: {
            ...mockUser,
            id: 'user-x',
          },
        },
      };

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [],
        own_follows: [],
      };

      const result = updateStateFollowCreated(
        follow,
        currentState,
        'user:feed-x',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.own_follows).toHaveLength(1);
      expect(result.data.own_follows?.[0]).toEqual(follow);
    });

    it('should not update followers/following when they are undefined', () => {
      const follow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'other-feed',
          feed: 'user:other-feed',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          feed: 'user:feed-1',
          created_by: mockUser,
        },
      };

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: undefined,
        following: undefined,
        own_follows: undefined,
      };

      const result = updateStateFollowCreated(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.followers).toBeUndefined();
      expect(result.data).toMatchObject(follow.target_feed);
    });

    it('should add new followers to the top of existing arrays', () => {
      const existingFollow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'existing-feed',
          feed: 'user:existing-feed',
          created_by: mockUser,
        },
      };

      const follow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'other-feed',
          feed: 'user:other-feed',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          feed: 'user:feed-1',
          created_by: mockUser,
        },
      };

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [existingFollow],
        following: undefined,
        own_follows: undefined,
      };

      const result = updateStateFollowCreated(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.followers).toHaveLength(2);
      expect(result.data.followers?.[0]).toEqual(follow);
      expect(result.data.followers?.[1]).toEqual(existingFollow);
    });
  });
});
