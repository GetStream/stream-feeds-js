import { describe, it, expect } from 'vitest';

import {
  handleFollowCreated,
  handleFollowDeleted,
  handleFollowUpdated,
} from './follow-utils';
import {
  FollowUpdatedEvent,
  FollowResponse,
  FeedResponse,
  UserResponse,
} from '../gen/models';
import { FeedState } from '../Feed';

describe('follow-utils', () => {
  const mockUser: UserResponse = {
    id: 'user-1',
    created_at: new Date(),
    updated_at: new Date(),
    banned: false,
    language: 'en',
    online: false,
    role: 'user',
    blocked_user_ids: [],
    teams: [],
    custom: {},
  };

  const mockFeed: FeedResponse = {
    id: 'feed-1',
    group_id: 'user',
    created_at: new Date(),
    updated_at: new Date(),
    description: 'Test feed',
    fid: 'user:feed-1',
    follower_count: 0,
    following_count: 0,
    member_count: 0,
    name: 'Test Feed',
    pin_count: 0,
    created_by: mockUser,
    custom: {},
  };

  const mockFollow: FollowResponse = {
    created_at: new Date(),
    updated_at: new Date(),
    follower_role: 'user',
    push_preference: 'all',
    status: 'accepted',
    source_feed: {
      ...mockFeed,
      id: 'source-feed',
      fid: 'user:source-feed',
      created_by: mockUser,
    },
    target_feed: {
      ...mockFeed,
      id: 'target-feed',
      fid: 'user:target-feed',
      created_by: mockUser,
    },
  };

  const mockFollowUpdatedEvent: FollowUpdatedEvent = {
    created_at: new Date(),
    fid: 'user:feed-1',
    custom: {},
    follow: mockFollow,
    type: 'feeds.follow.updated',
  };

  describe('handleFollowCreated', () => {
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

      const result = handleFollowCreated(
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
          fid: 'user:feed-x',
          created_by: {
            ...mockUser,
            id: 'user-x',
          },
          following_count: 1,
        },
        target_feed: {
          ...mockFeed,
          id: 'other-feed',
          fid: 'user:other-feed',
          created_by: mockUser,
        },
      };

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        following: [],
        following_count: 0,
      };

      const result = handleFollowCreated(
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
          fid: 'user:other-feed',
          created_by: {
            ...mockUser,
            id: 'other-user',
          },
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          fid: 'user:feed-1',
          created_by: mockUser,
          follower_count: 1,
        },
      };

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [],
        follower_count: 0,
      };

      const result = handleFollowCreated(
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
          fid: 'user:feed-1',
          created_by: { ...mockUser, id: 'user-1' },
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-x',
          fid: 'user:feed-x',
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

      const result = handleFollowCreated(
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
          fid: 'user:other-feed',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          fid: 'user:feed-1',
          created_by: mockUser,
        },
      };

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: undefined,
        following: undefined,
        own_follows: undefined,
      };

      const result = handleFollowCreated(
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
          fid: 'user:existing-feed',
          created_by: mockUser,
        },
      };

      const follow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'other-feed',
          fid: 'user:other-feed',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          fid: 'user:feed-1',
          created_by: mockUser,
        },
      };

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [existingFollow],
        following: undefined,
        own_follows: undefined,
      };

      const result = handleFollowCreated(
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

  describe('handleFollowDeleted', () => {
    it('should handle when this feed unfollows someone', () => {
      const existingFollow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'feed-1',
          fid: 'user:feed-1',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'other-feed',
          fid: 'user:other-feed',
          created_by: mockUser,
        },
      };

      const follow: FollowResponse = existingFollow;

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        following: [existingFollow],
        following_count: 1,
      };

      const result = handleFollowDeleted(
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
          fid: 'user:other-feed',
          created_by: {
            ...mockUser,
            id: 'other-user',
          },
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          fid: 'user:feed-1',
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

      const result = handleFollowDeleted(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.followers).toHaveLength(0);
      expect(result.data.own_follows).toEqual(currentState.own_follows);
      expect(result.data).toMatchObject(follow.target_feed);
    });

    it('should only remove own_follows when connected user is the source', () => {
      const existingFollow: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'other-feed',
          fid: 'user:other-feed',
          created_by: { ...mockUser, id: 'user-1' },
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          fid: 'user:feed-1',
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

      const result = handleFollowDeleted(
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
          fid: 'user:other-feed',
          created_by: { ...mockUser, id: 'other-user' },
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          fid: 'user:feed-1',
          created_by: mockUser,
        },
      };

      const follow: FollowResponse = existingFollow;

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [existingFollow],
        own_follows: [existingFollow],
      };

      const result = handleFollowDeleted(
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
          fid: 'user:other-feed',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'feed-1',
          fid: 'user:feed-1',
          created_by: mockUser,
        },
      };

      const follow: FollowResponse = existingFollow;

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: undefined,
        own_follows: undefined,
      };

      const result = handleFollowDeleted(
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
          fid: 'user:feed-1',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'target-to-remove',
          fid: 'user:target-to-remove',
          created_by: mockUser,
        },
      };

      const followToKeep: FollowResponse = {
        ...mockFollow,
        source_feed: {
          ...mockFeed,
          id: 'feed-1',
          fid: 'user:feed-1',
          created_by: mockUser,
        },
        target_feed: {
          ...mockFeed,
          id: 'target-to-keep',
          fid: 'user:target-to-keep',
          created_by: mockUser,
        },
      };

      const follow: FollowResponse = followToRemove;

      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        following: [followToRemove, followToKeep],
        following_count: 2,
      };

      const result = handleFollowDeleted(
        follow,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.data.following).toHaveLength(1);
      expect(result.data.following?.[0]).toEqual(followToKeep);
    });
  });

  describe('handleFollowUpdated', () => {
    // TODO: not yet implemented
    it.skip('should return unchanged state (no-op)', () => {
      // @ts-expect-error - we're not testing the full state here
      const currentState: FeedState = {
        followers: [],
        following: [],
        following_count: 0,
      };

      const result = handleFollowUpdated(currentState);

      expect(result.changed).toBe(false);
    });
  });
});
