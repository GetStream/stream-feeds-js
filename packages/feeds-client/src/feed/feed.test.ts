import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type Mock } from 'vitest';
import { FeedsClient } from '../feeds-client';
import { Feed } from './feed';
import type { ActivityResponse, GetOrCreateFeedResponse } from '../gen/models';
import { generateActivityResponse, generateFeedResponse } from '../test-utils';
import { clearQueuedFeeds } from '../utils/throttling';
import { StreamApiError, type StreamResponse } from '../common/types';

describe('Feed derived state updates', () => {
  let feed: Feed;
  let client: FeedsClient;
  let activities: ActivityResponse[];

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    const feedResponse = generateFeedResponse({ id: 'main', group_id: 'user' });
    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
    activities = [
      generateActivityResponse(),
      generateActivityResponse(),
      generateActivityResponse(),
    ];
  });

  it('should update the cache if activities change in feed.state', () => {
    let indexedActivityIds = (feed as any).indexedActivityIds;
    expect(indexedActivityIds.size).toEqual(0);

    feed.state.partialNext({ activities });

    indexedActivityIds = (feed as any).indexedActivityIds;
    expect(indexedActivityIds.size).toEqual(3);
    for (const activity of activities) {
      expect(indexedActivityIds.has(activity.id)).toBe(true);
    }
  });

  it('should update the cache if activities are further updated', () => {
    // Include all of them
    feed.state.partialNext({ activities });

    let indexedActivityIds = (feed as any).indexedActivityIds;
    expect(indexedActivityIds.size).toEqual(3);
    for (const activity of activities) {
      expect(indexedActivityIds.has(activity.id)).toBe(true);
    }

    // Take only the last 2
    const newActivities = activities.slice(1);
    feed.state.partialNext({ activities: newActivities });

    indexedActivityIds = (feed as any).indexedActivityIds;
    expect((feed as any).indexedActivityIds.size).toEqual(2);
    for (const activity of newActivities) {
      expect(indexedActivityIds.has(activity.id)).toBe(true);
    }

    // Include all of them again
    feed.state.partialNext({ activities });

    indexedActivityIds = (feed as any).indexedActivityIds;
    expect(indexedActivityIds.size).toEqual(3);
    for (const activity of activities) {
      expect(indexedActivityIds.has(activity.id)).toBe(true);
    }
  });

  it('should not update the cache if the length of activities has not changed', () => {
    feed.state.partialNext({ activities });

    const indexedActivityIdsBefore = (feed as any).indexedActivityIds;
    expect(indexedActivityIdsBefore.size).toEqual(3);
    for (const activity of activities) {
      expect(indexedActivityIdsBefore.has(activity.id)).toBe(true);
    }

    const reversedActivities = activities.toReversed();
    feed.state.partialNext({ activities: reversedActivities });

    const indexedActivityIdsAfter = (feed as any).indexedActivityIds;
    expect(indexedActivityIdsAfter.size).toEqual(3);
    for (const activity of activities) {
      expect(indexedActivityIdsAfter.has(activity.id)).toBe(true);
    }
    expect(indexedActivityIdsBefore).toBe(indexedActivityIdsAfter);
  });
});

describe(`getOrCreate`, () => {
  let feed: Feed;
  let client: { [key in keyof FeedsClient]: Mock };

  beforeEach(() => {
    client = {
      getOrCreateFeed: vi.fn().mockResolvedValue({
        activities: [],
        aggregated_activities: [],
        members: [],
        next: 'next',
        prev: undefined,
        limit: 10,
        feed: generateFeedResponse({}),
      }),
      hydratePollCache: vi.fn(),
    } as unknown as { [key in keyof FeedsClient]: Mock };
    const feedResponse = generateFeedResponse({ id: 'main', group_id: 'user' });
    feed = new Feed(
      client as unknown as FeedsClient,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
  });

  it(`should send all params from getOrCreate request that affect activity list when loading next page`, async () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        limit: 10,
        filter: {
          filter_tags: ['green'],
        },
        external_ranking: {
          user_score: 0.8,
        },
        watch: true,
        interest_weights: {
          technology: 0.8,
          travel: -1,
        },
        followers_pagination: {
          limit: 10,
        },
        following_pagination: {
          limit: 10,
        },
        member_pagination: {
          limit: 10,
        },
      },
      next: 'next',
    });

    await feed.getNextPage();

    const config = {
      ...feed.currentState.last_get_or_create_request_config,
      next: 'next',
      watch: undefined,
      member_pagination: {
        limit: 0,
      },
      followers_pagination: {
        limit: 0,
      },
      following_pagination: {
        limit: 0,
      },
      feed_group_id: feed.group,
      feed_id: feed.id,
    };
    const params = client.getOrCreateFeed.mock.calls[0][0];
    expect(params).toStrictEqual(config);
  });

  it(`should prevent duplicate getOrCreate calls with same config`, () => {
    const promise1 = feed.getOrCreate();
    const promise2 = feed.getOrCreate();

    expect(client.getOrCreateFeed).toHaveBeenCalledTimes(1);
    expect(promise1).toEqual(promise2);
  });

  it(`should prevent duplicate getOrCreate calls with same config - non-empty filter`, () => {
    const promise1 = feed.getOrCreate({
      filter: { filter_tags: ['green'] },
      watch: true,
    });
    const promise2 = feed.getOrCreate({
      watch: true,
      filter: { filter_tags: ['green'] },
    });

    expect(client.getOrCreateFeed).toHaveBeenCalledTimes(1);
    expect(promise1).toEqual(promise2);
  });

  it(`should send request if getOrCreate is called serially`, async () => {
    await feed.getOrCreate();
    await feed.getOrCreate();

    expect(client.getOrCreateFeed).toHaveBeenCalledTimes(2);
  });

  it(`should still throw error if we send two requests at the same time with different config (we will fix this later)`, async () => {
    feed.getOrCreate({ filter: { filter_tags: ['green'] } });
    await expect(
      feed.getOrCreate({ filter: { filter_tags: ['blue'] } }),
    ).rejects.toThrow('Only one getOrCreate call is allowed at a time');
  });

  it(`should still throw error if we send getOrCreate and getNextPage at the same time`, async () => {
    feed.state.partialNext({ next: 'next' });
    feed.getNextPage();
    await expect(
      feed.getOrCreate({ filter: { filter_tags: ['green'] } }),
    ).rejects.toThrow('Only one getOrCreate call is allowed at a time');
  });
});

describe(`newActivitiesAdded`, () => {
  let feed: Feed;
  let client: Record<
    keyof FeedsClient | 'getOrCreateActiveFeed' | 'throttledGetBatchOwnFields',
    Mock
  >;

  beforeEach(() => {
    client = {
      getOrCreateActiveFeed: vi.fn(),
      hydratePollCache: vi.fn(),
      throttledGetBatchOwnFields: vi.fn(),
      feed: vi.fn().mockReturnValue({
        currentState: {
          own_capabilities: undefined,
        },
      }),
    } as unknown as Record<
      | keyof FeedsClient
      | 'getOrCreateActiveFeed'
      | 'throttledGetBatchOwnFields',
      Mock
    >;
    const feedResponse = generateFeedResponse({
      id: 'user-123',
      group_id: 'user',
    });
    feed = new Feed(
      client as unknown as FeedsClient,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
  });

  it('should not create feeds if enrichment options are set to skip_all', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          skip_all: true,
        },
      },
    });

    feed['newActivitiesAdded']([generateActivityResponse()]);

    expect(client['getOrCreateActiveFeed']).not.toHaveBeenCalled();
  });

  it('should not create feeds if enrichment options are set to skip_activity_current_feed', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          skip_activity_current_feed: true,
        },
      },
    });

    feed['newActivitiesAdded']([generateActivityResponse()]);

    expect(client['getOrCreateActiveFeed']).not.toHaveBeenCalled();
  });

  it('should deduplicate feeds from acitivties', () => {
    const feed1 = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    const feed2 = generateFeedResponse({
      group_id: 'user',
      id: '456',
      feed: 'user:456',
    });
    const activity1 = generateActivityResponse({ current_feed: feed1 });
    const activity2 = generateActivityResponse({ current_feed: feed2 });
    const activity3 = generateActivityResponse({ current_feed: feed1 });

    feed['newActivitiesAdded']([activity1, activity2, activity3]);

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledTimes(2);
    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: feed1.group_id,
      id: feed1.id,
      data: feed1,
      fieldsToUpdate: ['own_membership', 'own_capabilities', 'own_follows'],
    });
    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: feed2.group_id,
      id: feed2.id,
      data: feed2,
      fieldsToUpdate: ['own_membership', 'own_capabilities', 'own_follows'],
    });
  });

  it(`should pass empty fieldsToUpdate array when hasOwnFields is false`, () => {
    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: false },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: [],
    });
  });

  it(`should fetch own_ fields if own_capabilities is undefined`, () => {
    const feed1 = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    const activity1 = generateActivityResponse({ current_feed: feed1 });

    feed['newActivitiesAdded']([activity1]);

    // Don't call when not from WebSocket
    expect(client['throttledGetBatchOwnFields']).toHaveBeenCalledTimes(0);

    const feed2 = generateFeedResponse({
      group_id: 'user',
      id: '789',
      feed: 'user:789',
    });
    const activity2 = generateActivityResponse({ current_feed: feed2 });
    feed['newActivitiesAdded']([activity2], { hasOwnFields: false });

    // Call when feed not seen
    expect(client['throttledGetBatchOwnFields']).toHaveBeenCalledTimes(1);
    const lastCall = client['throttledGetBatchOwnFields'].mock.lastCall;
    expect(lastCall?.[0]).toEqual([feed2.feed]);
  });

  it('should include own_followings in fieldsToUpdate when enrich_own_followings is true and not from WebSocket', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          enrich_own_followings: true,
        },
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: [
        'own_membership',
        'own_capabilities',
        'own_follows',
        'own_followings',
      ],
    });
  });

  it('should not include own_followings in fieldsToUpdate when enrich_own_followings is false and not from WebSocket', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          enrich_own_followings: false,
        },
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: ['own_membership', 'own_capabilities', 'own_follows'],
    });
  });

  it('should not include own_followings in fieldsToUpdate when enrich_own_followings is undefined and not from WebSocket', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {},
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: ['own_membership', 'own_capabilities', 'own_follows'],
    });
  });

  it('should always include own_capabilities, own_follows, own_membership when not from WebSocket', () => {
    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    const call = client['getOrCreateActiveFeed'].mock.calls[0][0];
    expect(call.fieldsToUpdate).toContain('own_capabilities');
    expect(call.fieldsToUpdate).toContain('own_follows');
    expect(call.fieldsToUpdate).toContain('own_membership');
  });

  it('should not include own_capabilities in fieldsToUpdate when skip_own_capabilities is true', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          skip_own_capabilities: true,
        },
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: ['own_membership', 'own_follows'],
    });
  });

  it('should include own_capabilities in fieldsToUpdate when skip_own_capabilities is false', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          skip_own_capabilities: false,
        },
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: ['own_membership', 'own_capabilities', 'own_follows'],
    });
  });

  it('should not include own_follows in fieldsToUpdate when skip_own_follows is true', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          skip_own_follows: true,
        },
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: ['own_membership', 'own_capabilities'],
    });
  });

  it('should include own_follows in fieldsToUpdate when skip_own_follows is false', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          skip_own_follows: false,
        },
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: ['own_membership', 'own_capabilities', 'own_follows'],
    });
  });

  it('should not include own_capabilities or own_follows when both skip options are true', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          skip_own_capabilities: true,
          skip_own_follows: true,
        },
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: ['own_membership'],
    });
  });

  it('should respect skip_own_capabilities and skip_own_follows when enrich_own_followings is true', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          skip_own_capabilities: true,
          skip_own_follows: true,
          enrich_own_followings: true,
        },
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: ['own_membership', 'own_followings'],
    });
  });

  it('should respect skip_own_capabilities when enrich_own_followings is true', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          skip_own_capabilities: true,
          enrich_own_followings: true,
        },
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: ['own_membership', 'own_follows', 'own_followings'],
    });
  });

  it('should respect skip_own_follows when enrich_own_followings is true', () => {
    feed.state.partialNext({
      last_get_or_create_request_config: {
        enrichment_options: {
          skip_own_follows: true,
          enrich_own_followings: true,
        },
      },
    });

    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { hasOwnFields: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fieldsToUpdate: ['own_membership', 'own_capabilities', 'own_followings'],
    });
  });

  afterEach(() => {
    clearQueuedFeeds();
  });
});

describe('synchronize retry', () => {
  let feed: Feed;
  let client: { [key in keyof FeedsClient]: Mock };
  let getOrCreateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    client = {
      getOrCreateFeed: vi.fn().mockResolvedValue({
        activities: [],
        aggregated_activities: [],
        members: [],
        next: 'next',
        prev: undefined,
        limit: 10,
        feed: generateFeedResponse({}),
      }),
      hydratePollCache: vi.fn(),
    } as unknown as { [key in keyof FeedsClient]: Mock };
    const feedResponse = generateFeedResponse({ id: 'main', group_id: 'user' });
    feed = new Feed(
      client as unknown as FeedsClient,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
    getOrCreateSpy = vi.spyOn(feed, 'getOrCreate');
  });

  afterEach(() => {
    vi.useRealTimers();
    getOrCreateSpy.mockRestore();
  });

  it('should not synchronize if watch is false', async () => {
    feed.state.partialNext({
      last_get_or_create_request_config: { watch: false },
    });

    await feed.synchronize();

    expect(getOrCreateSpy).not.toHaveBeenCalled();
  });

  it('should synchronize and retry on failure', async () => {
    const mockResponse: StreamResponse<GetOrCreateFeedResponse> = {
      activities: [],
      aggregated_activities: [],
      members: [],
      next: undefined,
      prev: undefined,
      duration: '10ms',
      feed: generateFeedResponse({}),
    };

    getOrCreateSpy
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(mockResponse);

    feed.state.partialNext({
      last_get_or_create_request_config: { watch: true },
    });

    const synchronizePromise = feed.synchronize();
    await vi.runAllTimersAsync();
    await synchronizePromise;

    expect(getOrCreateSpy).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries exceeded during synchronize', async () => {
    getOrCreateSpy.mockRejectedValue(new Error('Persistent error'));

    feed.state.partialNext({
      last_get_or_create_request_config: { watch: true },
    });

    const synchronizePromise = feed.synchronize();
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise =
      expect(synchronizePromise).rejects.toThrow('Persistent error');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(getOrCreateSpy).toHaveBeenCalledTimes(4); // initial + 3 retries
  });

  it('should pass the same request config on retry', async () => {
    const requestConfig = {
      watch: true,
      limit: 20,
      filter: { filter_tags: ['important'] },
    };
    const mockResponse: StreamResponse<GetOrCreateFeedResponse> = {
      activities: [],
      aggregated_activities: [],
      members: [],
      next: undefined,
      prev: undefined,
      duration: '10ms',
      feed: generateFeedResponse({}),
    };

    getOrCreateSpy
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(mockResponse);

    feed.state.partialNext({
      last_get_or_create_request_config: requestConfig,
    });

    const synchronizePromise = feed.synchronize();
    await vi.runAllTimersAsync();
    await synchronizePromise;

    expect(getOrCreateSpy).toHaveBeenCalledTimes(2);
    expect(getOrCreateSpy).toHaveBeenNthCalledWith(1, requestConfig);
    expect(getOrCreateSpy).toHaveBeenNthCalledWith(2, requestConfig);
  });

  it('should reset inProgressGetOrCreate before retrying', async () => {
    const mockResponse: StreamResponse<GetOrCreateFeedResponse> = {
      activities: [],
      aggregated_activities: [],
      members: [],
      next: undefined,
      prev: undefined,
      duration: '10ms',
      feed: generateFeedResponse({}),
    };

    getOrCreateSpy
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(mockResponse);

    feed.state.partialNext({
      last_get_or_create_request_config: { watch: true },
    });

    // Set up an in-progress request
    feed['inProgressGetOrCreate'] = {
      request: { watch: true },
      promise: Promise.resolve(mockResponse),
    };

    const synchronizePromise = feed.synchronize();

    // inProgressGetOrCreate should be reset before calling getOrCreate
    expect(feed['inProgressGetOrCreate']).toBeUndefined();

    await vi.runAllTimersAsync();
    await synchronizePromise;
  });

  it('should not retry on 4xx client errors during synchronize', async () => {
    const clientError = new StreamApiError(
      'Bad Request',
      { response_code: 400 },
      4,
    );
    getOrCreateSpy.mockRejectedValue(clientError);

    feed.state.partialNext({
      last_get_or_create_request_config: { watch: true },
    });

    const synchronizePromise = feed.synchronize();
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise =
      expect(synchronizePromise).rejects.toThrow('Bad Request');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(getOrCreateSpy).toHaveBeenCalledTimes(1); // No retries for client errors
  });

  it('should retry on 5xx server errors during synchronize', async () => {
    const serverError = new StreamApiError(
      'Internal Server Error',
      { response_code: 500 },
      16,
    );
    const mockResponse: StreamResponse<GetOrCreateFeedResponse> = {
      activities: [],
      aggregated_activities: [],
      members: [],
      next: undefined,
      prev: undefined,
      duration: '10ms',
      feed: generateFeedResponse({}),
    };

    getOrCreateSpy
      .mockRejectedValueOnce(serverError)
      .mockRejectedValueOnce(serverError)
      .mockResolvedValue(mockResponse);

    feed.state.partialNext({
      last_get_or_create_request_config: { watch: true },
    });

    const synchronizePromise = feed.synchronize();
    await vi.runAllTimersAsync();
    await synchronizePromise;

    expect(getOrCreateSpy).toHaveBeenCalledTimes(3);
  });
});

describe('Feed.addActivity', () => {
  let feed: Feed;
  let client: FeedsClient;
  let addActivityMock: Mock;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    client.state.partialNext({
      connected_user: { id: 'current-user-id' },
    });
    addActivityMock = vi.fn().mockResolvedValue({
      activity: generateActivityResponse({
        id: 'new-activity-id',
        user: { id: 'current-user-id' } as any,
      }),
      duration: '10ms',
    });
    (client as any).addActivity = addActivityMock;
    const feedResponse = generateFeedResponse({ id: 'main', group_id: 'user' });
    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
  });

  it('adds activity to start when onNewActivity returns add-to-start', async () => {
    feed.state.partialNext({ activities: [] });
    feed.onNewActivity = () => 'add-to-start';
    await feed.addActivity({ type: 'post', text: 'hello' });
    expect(feed.currentState.activities).toHaveLength(1);
    expect(feed.currentState.activities?.[0].id).toBe('new-activity-id');
  });

  it('adds activity to end when onNewActivity returns add-to-end', async () => {
    const existing = generateActivityResponse();
    feed.state.partialNext({ activities: [existing] });
    feed.onNewActivity = () => 'add-to-end';
    await feed.addActivity({ type: 'post', text: 'hello' });
    expect(feed.currentState.activities).toHaveLength(2);
    expect(feed.currentState.activities?.[0]).toBe(existing);
    expect(feed.currentState.activities?.[1].id).toBe('new-activity-id');
  });

  it('does not add activity when onNewActivity returns ignore', async () => {
    feed.state.partialNext({ activities: [] });
    feed.onNewActivity = () => 'ignore';
    await feed.addActivity({ type: 'post', text: 'hello' });
    expect(feed.currentState.activities).toHaveLength(0);
  });

  it('adds current user activity to start by default when no onNewActivity', async () => {
    feed.state.partialNext({
      activities: [],
      last_get_or_create_request_config: {},
    });
    await feed.addActivity({ type: 'post', text: 'hello' });
    expect(feed.currentState.activities).toHaveLength(1);
    expect(feed.currentState.activities?.[0].id).toBe('new-activity-id');
  });
});
