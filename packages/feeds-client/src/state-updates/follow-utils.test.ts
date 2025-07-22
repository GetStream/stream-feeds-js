import { describe, it, expect } from 'vitest';

import {
  handleFollowCreated,
  handleFollowDeleted,
  handleFollowUpdated,
  FollowState,
} from './follow-utils';
import {
  FollowCreatedEvent,
  FollowDeletedEvent,
  FollowUpdatedEvent,
  FollowResponse,
  FeedResponse,
  UserResponse,
} from '../gen/models';

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

  const mockFollowCreatedEvent: FollowCreatedEvent = {
    created_at: new Date(),
    fid: 'user:feed-1',
    custom: {},
    follow: mockFollow,
    type: 'feeds.follow.created',
  };

  const mockFollowDeletedEvent: FollowDeletedEvent = {
    created_at: new Date(),
    fid: 'user:feed-1',
    custom: {},
    follow: mockFollow,
    type: 'feeds.follow.deleted',
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
      const event: FollowCreatedEvent = {
        ...mockFollowCreatedEvent,
        follow: {
          ...mockFollow,
          status: 'pending',
        },
      };

      const currentState: FollowState = {
        followers: [],
        following: [],
      };

      const result = handleFollowCreated(
        event,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(false);
    });

    it('should handle when this feed follows someone', () => {
      const event: FollowCreatedEvent = {
        ...mockFollowCreatedEvent,
        follow: {
          ...mockFollow,
          source_feed: {
            ...mockFeed,
            id: 'feed-x',
            fid: 'user:feed-x',
            created_by: {
              ...mockUser,
              id: 'user-x',
            },
          },
          target_feed: {
            ...mockFeed,
            id: 'other-feed',
            fid: 'user:other-feed',
            created_by: mockUser,
          },
        },
      };

      const currentState: FollowState = {
        following: [],
        following_pagination: { next: undefined },
      };

      const result = handleFollowCreated(
        event,
        currentState,
        'user:feed-x',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.following).toHaveLength(1);
      expect(result.following?.[0]).toEqual(event.follow);
      expect(result).toMatchObject(event.follow.source_feed);
      expect(result.own_follows).toBeUndefined();
    });

    it('should handle when someone follows this feed', () => {
      const event: FollowCreatedEvent = {
        ...mockFollowCreatedEvent,
        follow: {
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
        },
      };

      const currentState: FollowState = {
        followers: [],
        followers_pagination: { next: undefined },
      };

      const result = handleFollowCreated(
        event,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.followers).toHaveLength(1);
      expect(result.followers?.[0]).toEqual(event.follow);
      expect(result).toMatchObject(event.follow.target_feed);
      expect(result.own_follows).toBeUndefined();
    });

    it('should add to own_follows when connected user is the source', () => {
      const event: FollowCreatedEvent = {
        ...mockFollowCreatedEvent,
        follow: {
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
        },
      };

      const currentState: FollowState = {
        followers: [],
        followers_pagination: { next: undefined },
        own_follows: [],
      };

      const result = handleFollowCreated(
        event,
        currentState,
        'user:feed-x',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.own_follows).toHaveLength(1);
      expect(result.own_follows?.[0]).toEqual(event.follow);
    });

    it('should not update followers/following when they are undefined', () => {
      const event: FollowCreatedEvent = {
        ...mockFollowCreatedEvent,
        follow: {
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
        },
      };

      const currentState: FollowState = {
        followers: undefined,
        followers_pagination: { next: 'next-cursor' },
      };

      const result = handleFollowCreated(
        event,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.followers).toBeUndefined();
      expect(result).toMatchObject(event.follow.target_feed);
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

      const event: FollowCreatedEvent = {
        ...mockFollowCreatedEvent,
        follow: {
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
        },
      };

      const currentState: FollowState = {
        followers: [existingFollow],
        followers_pagination: { next: 'next-cursor' },
      };

      const result = handleFollowCreated(
        event,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.followers).toHaveLength(2);
      expect(result.followers?.[0]).toEqual(event.follow);
      expect(result.followers?.[1]).toEqual(existingFollow);
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

      const event: FollowDeletedEvent = {
        ...mockFollowDeletedEvent,
        follow: existingFollow,
      };

      const currentState: FollowState = {
        following: [existingFollow],
      };

      const result = handleFollowDeleted(
        event,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.following).toHaveLength(0);
      expect(result).toMatchObject(event.follow.source_feed);
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

      const event: FollowDeletedEvent = {
        ...mockFollowDeletedEvent,
        follow: existingFollow,
      };

      const currentState: FollowState = {
        followers: [existingFollow],
        own_follows: [existingFollow],
      };

      const result = handleFollowDeleted(
        event,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.followers).toHaveLength(0);
      expect(result.own_follows).toEqual(currentState.own_follows);
      expect(result).toMatchObject(event.follow.target_feed);
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

      const event: FollowDeletedEvent = {
        ...mockFollowDeletedEvent,
        follow: existingFollow,
      };

      const currentState: FollowState = {
        followers: [existingFollow],
        own_follows: [existingFollow],
      };

      const result = handleFollowDeleted(
        event,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.followers).toHaveLength(0);
      expect(result.own_follows).toHaveLength(0);
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

      const event: FollowDeletedEvent = {
        ...mockFollowDeletedEvent,
        follow: existingFollow,
      };

      const currentState: FollowState = {
        followers: [existingFollow],
        own_follows: [existingFollow],
      };

      const result = handleFollowDeleted(
        event,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.followers).toHaveLength(0);
      expect(result.own_follows).toHaveLength(1); // Should remain unchanged
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

      const event: FollowDeletedEvent = {
        ...mockFollowDeletedEvent,
        follow: existingFollow,
      };

      const currentState: FollowState = {
        followers: undefined,
        own_follows: undefined,
      };

      const result = handleFollowDeleted(
        event,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.followers).toBeUndefined();
      expect(result.own_follows).toBeUndefined();
      expect(result).toMatchObject(event.follow.target_feed);
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

      const event: FollowDeletedEvent = {
        ...mockFollowDeletedEvent,
        follow: followToRemove,
      };

      const currentState: FollowState = {
        following: [followToRemove, followToKeep],
      };

      const result = handleFollowDeleted(
        event,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(true);
      expect(result.following).toHaveLength(1);
      expect(result.following?.[0]).toEqual(followToKeep);
    });
  });

  describe('handleFollowUpdated', () => {
    it('should return unchanged state (no-op)', () => {
      const currentState: FollowState = {
        followers: [],
        following: [],
      };

      const result = handleFollowUpdated(
        mockFollowUpdatedEvent,
        currentState,
        'user:feed-1',
        'user-1',
      );

      expect(result.changed).toBe(false);
    });
  });
});
