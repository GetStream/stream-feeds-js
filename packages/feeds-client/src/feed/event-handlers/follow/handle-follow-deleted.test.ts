import type {
  FollowResponse,
  FeedResponse,
  UserResponse,
} from '../../../gen/models';
import { generateFollowResponse } from '../../../test-utils';
import { updateStateFollowDeleted } from './handle-follow-deleted';

import { describe, it, expect, beforeEach } from 'vitest';

describe('handle-follow-deleted', () => {
  describe(updateStateFollowDeleted.name, () => {
    let mockFollow: FollowResponse;
    let mockFeed: FeedResponse;
    let mockUser: UserResponse;

    beforeEach(() => {
      mockFollow = generateFollowResponse();
      mockFeed = mockFollow.source_feed;
      mockUser = mockFeed.created_by;
    });

    it('should handle when this feed unfollows someone', () => {
      const existingFollow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'feed-1',
          feed: 'user:feed-1',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'other-feed',
          feed: 'user:other-feed',
          created_by: mockUser,
        },
      };

      const follow: FollowResponse = existingFollow;

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        following: [existingFollow],
        following_count: 1,
      };

      const result = updateStateFollowDeleted(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.following).toHaveLength(0);
      expect(result.data).toMatchObject(follow.source_feed);
    });

    it('should handle when someone unfollows this feed', () => {
      const existingFollow: FollowResponse = {
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
        },
      };

      const follow: FollowResponse = existingFollow;

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [existingFollow],
        own_follows: [existingFollow],
        following_count: 1,
      };

      const result = updateStateFollowDeleted(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.followers).toHaveLength(0);
      expect(result.data.own_follows).toBe(currentState.own_follows);
      expect(result.data).toMatchObject(follow.target_feed);
    });

    it('should only remove own_follows when connected user is the source', () => {
      const existingFollow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'other-feed',
          feed: 'user:other-feed',
          created_by: { ...mockUser, id: 'user-1' },
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          feed: 'user:feed-1',
          created_by: mockUser,
        },
      };

      const follow: FollowResponse = existingFollow;

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [existingFollow],
        own_follows: [existingFollow],
        following_count: 1,
      };

      const result = updateStateFollowDeleted(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.followers).toHaveLength(0);
      expect(result.data.own_follows).toHaveLength(0);
    });

    it('should not remove own_follows when connected user is not the source', () => {
      const existingFollow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'other-feed',
          feed: 'user:other-feed',
          created_by: { ...mockUser, id: 'other-user' },
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          feed: 'user:feed-1',
          created_by: mockUser,
        },
      };

      const follow: FollowResponse = existingFollow;

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [existingFollow],
        own_follows: [existingFollow],
      };

      const result = updateStateFollowDeleted(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.followers).toHaveLength(0);
      expect(result.data.own_follows).toHaveLength(1); // Should remain unchanged
    });

    it('should not update followers/following when they are undefined in delete', () => {
      const existingFollow: FollowResponse = {
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

      const follow: FollowResponse = existingFollow;

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: undefined,
        own_follows: undefined,
      };

      const result = updateStateFollowDeleted(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.followers).toBeUndefined();
      expect(result.data.own_follows).toBeUndefined();
      expect(result.data).toMatchObject(follow.target_feed);
    });

    it('should filter out the correct follow by target feed id', () => {
      const followToRemove: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'feed-1',
          feed: 'user:feed-1',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'target-to-remove',
          feed: 'user:target-to-remove',
          created_by: mockUser,
        },
      };

      const followToKeep: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'feed-1',
          feed: 'user:feed-1',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'target-to-keep',
          feed: 'user:target-to-keep',
          created_by: mockUser,
        },
      };

      const follow: FollowResponse = followToRemove;

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        following: [followToRemove, followToKeep],
        following_count: 2,
      };

      const result = updateStateFollowDeleted(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.following).toHaveLength(1);
      expect(result.data.following?.[0]).toBe(followToKeep);
    });
  });
});
