import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedsClient } from './feeds-client';
import {
  generateActivityResponse,
  generateFeedMemberResponse,
  generateFeedResponse,
  generateFollowResponse,
} from '../test-utils';
import { FeedOwnCapability } from '..';

describe('Feeds client tests', () => {
  let client: FeedsClient;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
  });

  it(`should find feeds to update for user events`, async () => {
    const feedA = client.feed('user', 'feedA');
    const feedB = client.feed('user', 'feedB');
    const feedC = client.feed('user', 'feedC');
    client['markFeedAsInitialized'](feedA);
    client['markFeedAsInitialized'](feedB);
    client['markFeedAsInitialized'](feedC);
    const activity1 = generateActivityResponse({ id: 'activity1' });

    feedA.state.partialNext({ activities: [activity1] });
    feedB.state.partialNext({ activities: [] });
    feedC.state.partialNext({
      // @ts-expect-error - we're not passing all the required fields
      pinned_activities: [{ activity: activity1 }],
    });

    const feeds = client['findAllActiveFeedsByActivityId'](activity1.id);
    expect(feeds).toHaveLength(2);
    expect(feeds).toContain(feedA);
    expect(feeds).toContain(feedC);
    expect(feeds).not.toContain(feedB);
  });

  describe('client.feed', () => {
    it('should initialize feed state with the given data if feed does not exist', async () => {
      const data = generateFeedResponse({ feed: 'timeline:feed' });
      client['getOrCreateActiveFeed']({
        group: 'timeline',
        id: 'feed',
        data,
        fieldsToUpdate: [],
      });

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);
    });

    it('should update feed state if data is newer than the current state', async () => {
      const data = generateFeedResponse({
        feed: 'timeline:feed',
        follower_count: 5,
      });
      client['getOrCreateActiveFeed']({
        group: 'timeline',
        id: 'feed',
        data,
        fieldsToUpdate: [],
      });

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);

      const newData = { ...data };
      newData.updated_at = new Date(data.updated_at.getTime() + 1000);
      newData.follower_count = 10;
      client['getOrCreateActiveFeed']({
        group: 'timeline',
        id: 'feed',
        data: newData,
        fieldsToUpdate: [],
      });

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(newData);
      expect(
        client['activeFeeds']['timeline:feed']?.currentState.follower_count,
      ).toBe(10);
    });

    it(`should not update feed state if data is older than the current state`, async () => {
      const data = generateFeedResponse({
        feed: 'timeline:feed',
        follower_count: 5,
      });
      client['getOrCreateActiveFeed']({
        group: 'timeline',
        id: 'feed',
        data,
        fieldsToUpdate: [],
      });

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);

      const oldData = { ...data };
      oldData.updated_at = new Date(data.updated_at.getTime() - 1000);
      oldData.follower_count = 3;
      client['getOrCreateActiveFeed']({
        group: 'timeline',
        id: 'feed',
        data: oldData,
        fieldsToUpdate: [],
      });

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);
      expect(
        client['activeFeeds']['timeline:feed']?.currentState.follower_count,
      ).toBe(5);
    });

    it(`should not update own_ fields if fieldsToUpdate is empty array`, async () => {
      const ownFollows = [
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
          target_feed: generateFeedResponse({ feed: 'user:123' }),
        }),
      ];
      const ownFollowings = [
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'user:123' }),
          target_feed: generateFeedResponse({ feed: 'user:456' }),
        }),
      ];
      const ownMembership = generateFeedMemberResponse();
      const ownCapabilities = [FeedOwnCapability.ADD_ACTIVITY];
      const data = generateFeedResponse({
        feed: 'user:123',
        follower_count: 5,
        own_follows: ownFollows,
        own_followings: ownFollowings,
        own_membership: ownMembership,
        own_capabilities: ownCapabilities,
      });
      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data,
        fieldsToUpdate: [
          'own_capabilities',
          'own_follows',
          'own_membership',
          'own_followings',
        ],
      });

      const dataFromWebSocket = { ...data };
      delete dataFromWebSocket.own_follows;
      delete dataFromWebSocket.own_followings;
      delete dataFromWebSocket.own_membership;
      delete dataFromWebSocket.own_capabilities;
      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data: dataFromWebSocket,
        fieldsToUpdate: [],
      });

      expect(client['activeFeeds']['user:123']?.currentState).toMatchObject(
        data,
      );
      expect(
        client['activeFeeds']['user:123']?.currentState.own_follows,
      ).toEqual(ownFollows);
      expect(
        client['activeFeeds']['user:123']?.currentState.own_followings,
      ).toEqual(ownFollowings);
      expect(
        client['activeFeeds']['user:123']?.currentState.own_membership,
      ).toEqual(ownMembership);
      expect(
        client['activeFeeds']['user:123']?.currentState.own_capabilities,
      ).toEqual(ownCapabilities);
    });
  });

  it(`should only update _own fields which are changed`, async () => {
    const ownFollows = [
      generateFollowResponse({
        source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
        target_feed: generateFeedResponse({ feed: 'user:123' }),
      }),
    ];
    const ownFollowings = [
      generateFollowResponse({
        source_feed: generateFeedResponse({ feed: 'user:123' }),
        target_feed: generateFeedResponse({ feed: 'user:456' }),
      }),
    ];
    const ownMembership = generateFeedMemberResponse();
    const ownCapabilities = [FeedOwnCapability.ADD_ACTIVITY];
    const data = generateFeedResponse({
      feed: 'user:123',
      follower_count: 5,
      own_follows: ownFollows,
      own_followings: ownFollowings,
      own_membership: ownMembership,
      own_capabilities: ownCapabilities,
    });
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data,
      fieldsToUpdate: [
        'own_capabilities',
        'own_follows',
        'own_membership',
        'own_followings',
      ],
    });

    const spy = vi.fn();
    const feed = client['activeFeeds']['user:123'];
    feed.state.subscribe(spy);
    spy.mockClear();

    const newData = { ...data };
    data.own_follows = [...ownFollows];
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
      fieldsToUpdate: [
        'own_capabilities',
        'own_follows',
        'own_membership',
        'own_followings',
      ],
    });

    expect(spy).toHaveBeenCalledTimes(0);

    const newOwnFollows = [
      ...ownFollows,
      generateFollowResponse({
        source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
        target_feed: generateFeedResponse({ feed: 'user:456' }),
      }),
    ];
    newData.own_follows = newOwnFollows;

    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
      fieldsToUpdate: [
        'own_capabilities',
        'own_follows',
        'own_membership',
        'own_followings',
      ],
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.lastCall?.[0]).toMatchObject({
      own_follows: newOwnFollows,
    });

    spy.mockClear();
    newData.own_membership = { ...newData.own_membership! };
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
      fieldsToUpdate: [
        'own_capabilities',
        'own_follows',
        'own_membership',
        'own_followings',
      ],
    });

    expect(spy).toHaveBeenCalledTimes(0);

    newData.own_membership!.updated_at = new Date(
      newData.own_membership!.updated_at.getTime() + 1000,
    );
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
      fieldsToUpdate: [
        'own_capabilities',
        'own_follows',
        'own_membership',
        'own_followings',
      ],
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.lastCall?.[0]).toMatchObject({
      own_membership: newData.own_membership,
    });

    spy.mockClear();
    newData.own_capabilities = [...ownCapabilities];
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
      fieldsToUpdate: [
        'own_capabilities',
        'own_follows',
        'own_membership',
        'own_followings',
      ],
    });

    expect(spy).toHaveBeenCalledTimes(0);

    newData.own_capabilities = [
      FeedOwnCapability.ADD_ACTIVITY,
      FeedOwnCapability.DELETE_OWN_ACTIVITY,
    ];
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
      fieldsToUpdate: [
        'own_capabilities',
        'own_follows',
        'own_membership',
        'own_followings',
      ],
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.lastCall?.[0]).toMatchObject({
      own_capabilities: newData.own_capabilities,
    });

    spy.mockClear();
    newData.own_followings = [...ownFollowings];
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
      fieldsToUpdate: [
        'own_capabilities',
        'own_follows',
        'own_membership',
        'own_followings',
      ],
    });

    expect(spy).toHaveBeenCalledTimes(0);

    const newOwnFollowings = [
      ...ownFollowings,
      generateFollowResponse({
        source_feed: generateFeedResponse({ feed: 'user:123' }),
        target_feed: generateFeedResponse({ feed: 'user:789' }),
      }),
    ];
    newData.own_followings = newOwnFollowings;
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
      fieldsToUpdate: [
        'own_capabilities',
        'own_follows',
        'own_membership',
        'own_followings',
      ],
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.lastCall?.[0]).toMatchObject({
      own_followings: newOwnFollowings,
    });
  });

  it(`should throttle calls to ownBatch endpoint`, async () => {
    vi.useFakeTimers();
    vi.spyOn(client, 'ownBatch').mockResolvedValue({ data: {} } as any);
    const throttleTime = 100;
    client['setGetBatchOwnFieldsThrottlingInterval'](throttleTime);

    client['throttledGetBatchOwnFields']!(
      [`feed:1`, `feed:2`, `feed:3`],
      () => {},
    );
    expect(client['ownBatch']).toHaveBeenCalledTimes(1);

    client['throttledGetBatchOwnFields']!(
      [`feed:4`, `feed:5`, `feed:6`],
      () => {},
    );
    expect(client['ownBatch']).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(throttleTime / 2);
    expect(client['ownBatch']).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(throttleTime / 2);
    expect(client['ownBatch']).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  describe('fieldsToUpdate logic', () => {
    it('should only update fields in fieldsToUpdate array', async () => {
      const ownFollows = [
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
          target_feed: generateFeedResponse({ feed: 'user:123' }),
        }),
      ];
      const ownCapabilities = [FeedOwnCapability.ADD_ACTIVITY];
      const data = generateFeedResponse({
        feed: 'user:123',
        own_follows: ownFollows,
        own_capabilities: ownCapabilities,
      });
      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data,
        fieldsToUpdate: ['own_capabilities', 'own_follows'],
      });

      const spy = vi.fn();
      const feed = client['activeFeeds']['user:123'];
      feed.state.subscribe(spy);
      spy.mockClear();

      const newData = { ...data };
      newData.own_capabilities = [
        FeedOwnCapability.ADD_ACTIVITY,
        FeedOwnCapability.DELETE_OWN_ACTIVITY,
      ];
      newData.own_follows = [
        ...ownFollows,
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
          target_feed: generateFeedResponse({ feed: 'user:456' }),
        }),
      ];

      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data: newData,
        fieldsToUpdate: ['own_capabilities', 'own_follows'],
      });

      expect(spy).toHaveBeenCalledTimes(1);
      const updatedState = spy.mock.lastCall?.[0];
      expect(updatedState).toHaveProperty('own_capabilities');
      expect(updatedState).toHaveProperty('own_follows');
      expect(updatedState).not.toHaveProperty('own_membership');
      expect(updatedState).not.toHaveProperty('own_followings');
    });

    it('should not update own_followings when not in fieldsToUpdate array even if changed', async () => {
      const ownFollowings = [
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'user:123' }),
          target_feed: generateFeedResponse({ feed: 'user:456' }),
        }),
      ];
      const data = generateFeedResponse({
        feed: 'user:123',
        own_followings: ownFollowings,
      });
      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data,
        fieldsToUpdate: ['own_capabilities', 'own_follows', 'own_membership'],
      });

      const spy = vi.fn();
      const feed = client['activeFeeds']['user:123'];
      feed.state.subscribe(spy);
      spy.mockClear();

      const newData = { ...data };
      newData.own_followings = [
        ...ownFollowings,
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'user:123' }),
          target_feed: generateFeedResponse({ feed: 'user:789' }),
        }),
      ];

      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data: newData,
        fieldsToUpdate: ['own_capabilities', 'own_follows', 'own_membership'],
      });

      expect(spy).toHaveBeenCalledTimes(0);
      expect(feed.currentState.own_followings).toEqual(ownFollowings);
    });

    it('should update own_followings when in fieldsToUpdate array and changed', async () => {
      const ownFollowings = [
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'user:123' }),
          target_feed: generateFeedResponse({ feed: 'user:456' }),
        }),
      ];
      const data = generateFeedResponse({
        feed: 'user:123',
        own_followings: ownFollowings,
      });
      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data,
        fieldsToUpdate: ['own_followings'],
      });

      const spy = vi.fn();
      const feed = client['activeFeeds']['user:123'];
      feed.state.subscribe(spy);
      spy.mockClear();

      const newOwnFollowings = [
        ...ownFollowings,
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'user:123' }),
          target_feed: generateFeedResponse({ feed: 'user:789' }),
        }),
      ];
      const newData = { ...data };
      newData.own_followings = newOwnFollowings;

      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data: newData,
        fieldsToUpdate: ['own_followings'],
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.lastCall?.[0]).toMatchObject({
        own_followings: newOwnFollowings,
      });
    });

    it('should not update any fields when fieldsToUpdate is empty array', async () => {
      const ownFollows = [
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
          target_feed: generateFeedResponse({ feed: 'user:123' }),
        }),
      ];
      const ownCapabilities = [FeedOwnCapability.ADD_ACTIVITY];
      const data = generateFeedResponse({
        feed: 'user:123',
        own_follows: ownFollows,
        own_capabilities: ownCapabilities,
      });
      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data,
        fieldsToUpdate: ['own_capabilities', 'own_follows'],
      });

      const spy = vi.fn();
      const feed = client['activeFeeds']['user:123'];
      feed.state.subscribe(spy);
      spy.mockClear();

      const newData = { ...data };
      newData.own_capabilities = [
        FeedOwnCapability.ADD_ACTIVITY,
        FeedOwnCapability.DELETE_OWN_ACTIVITY,
      ];
      newData.own_follows = [
        ...ownFollows,
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
          target_feed: generateFeedResponse({ feed: 'user:456' }),
        }),
      ];

      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data: newData,
        fieldsToUpdate: [],
      });

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('should only update fields if they actually changed (equality checks still apply)', async () => {
      const ownFollows = [
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
          target_feed: generateFeedResponse({ feed: 'user:123' }),
        }),
      ];
      const data = generateFeedResponse({
        feed: 'user:123',
        own_follows: ownFollows,
      });
      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data,
        fieldsToUpdate: ['own_follows'],
      });

      const spy = vi.fn();
      const feed = client['activeFeeds']['user:123'];
      feed.state.subscribe(spy);
      spy.mockClear();

      const newData = { ...data };
      newData.own_follows = [...ownFollows]; // Same content, different array reference

      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data: newData,
        fieldsToUpdate: ['own_follows'],
      });

      expect(spy).toHaveBeenCalledTimes(0);
    });
  });

  describe('initializedActiveFeeds tracking', () => {
    it('should only return initialized feeds from findAllActiveFeedsByActivityId', async () => {
      const feedA = client.feed('user', 'feedA');
      const feedB = client.feed('user', 'feedB');
      const activity1 = generateActivityResponse({ id: 'activity1' });

      // Add activity to both feeds
      feedA.state.partialNext({ activities: [activity1] });
      feedB.state.partialNext({ activities: [activity1] });

      // Only feedA is initialized
      vi.spyOn(client, 'getOrCreateFeed').mockResolvedValue({
        activities: [activity1],
        aggregated_activities: [],
        members: [],
        next: undefined,
        prev: undefined,
        feed: generateFeedResponse({ id: 'feedA', group_id: 'user' }),
      } as any);
      await feedA.getOrCreate();

      const feeds = client['findAllActiveFeedsByActivityId'](activity1.id);
      expect(feeds).toHaveLength(1);
      expect(feeds).toContain(feedA);
      expect(feeds).not.toContain(feedB);
    });

    it('should remove feed from initializedActiveFeeds when feed is deleted', async () => {
      const feed = client.feed('user', 'feed1');

      vi.spyOn(client, 'getOrCreateFeed').mockResolvedValue({
        activities: [],
        aggregated_activities: [],
        members: [],
        next: undefined,
        prev: undefined,
        feed: generateFeedResponse({ id: 'feed1', group_id: 'user' }),
      } as any);
      await feed.getOrCreate();

      expect('user:feed1' in client['initializedActiveFeeds']).toBe(true);

      // Simulate feed deletion event - the event handler in constructor will handle it
      client['eventDispatcher'].dispatch({
        type: 'feeds.feed.deleted',
        fid: 'user:feed1',
      } as any);

      expect('user:feed1' in client['initializedActiveFeeds']).toBe(false);
    });

    it('should clear initializedActiveFeeds on disconnectUser', async () => {
      const feed1 = client.feed('user', 'feed1');
      const feed2 = client.feed('user', 'feed2');

      vi.spyOn(client, 'getOrCreateFeed').mockResolvedValue({
        activities: [],
        aggregated_activities: [],
        members: [],
        next: undefined,
        prev: undefined,
        feed: generateFeedResponse({ id: 'feed1', group_id: 'user' }),
      } as any);
      await feed1.getOrCreate();

      vi.spyOn(client, 'getOrCreateFeed').mockResolvedValue({
        activities: [],
        aggregated_activities: [],
        members: [],
        next: undefined,
        prev: undefined,
        feed: generateFeedResponse({ id: 'feed2', group_id: 'user' }),
      } as any);
      await feed2.getOrCreate();

      expect(Object.keys(client['initializedActiveFeeds']).length).toBe(2);
      expect('user:feed1' in client['initializedActiveFeeds']).toBe(true);
      expect('user:feed2' in client['initializedActiveFeeds']).toBe(true);

      await client.disconnectUser();

      expect(Object.keys(client['initializedActiveFeeds']).length).toBe(0);
    });

    it('should not include uninitialized feeds in findAllActiveFeedsByActivityId', () => {
      const feedA = client.feed('user', 'feedA');
      const feedB = client.feed('user', 'feedB');
      const activity1 = generateActivityResponse({ id: 'activity1' });

      // Add activity to both feeds
      feedA.state.partialNext({ activities: [activity1] });
      feedB.state.partialNext({ activities: [activity1] });

      // Neither feed is initialized
      const feeds = client['findAllActiveFeedsByActivityId'](activity1.id);
      expect(feeds).toHaveLength(0);
    });
  });
});
