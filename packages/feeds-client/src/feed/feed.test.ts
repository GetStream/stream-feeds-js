import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type Mock } from 'vitest';
import { FeedsClient } from '../feeds-client';
import { Feed } from './feed';
import type { ActivityResponse } from '../gen/models';
import { generateActivityResponse, generateFeedResponse } from '../test-utils';
import { clearQueuedFeeds } from '../utils/throttling';

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

  it(`should still throw error if we send two requests at the same time with different config (we will fix this later)`, () => {
    feed.getOrCreate({ filter: { filter_tags: ['green'] } });
    expect(
      feed.getOrCreate({ filter: { filter_tags: ['blue'] } }),
    ).rejects.toThrow('Only one getOrCreate call is allowed at a time');
  });

  it(`should still throw error if we send getOrCreate and getNextPage at the same time`, () => {
    feed.state.partialNext({ next: 'next' });
    feed.getNextPage();
    expect(
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
      fromWebSocket: false,
    });
    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: feed2.group_id,
      id: feed2.id,
      data: feed2,
      fromWebSocket: false,
    });
  });

  it(`should set fromWebSocket flag to true if activities are added from a WebSocket event`, () => {
    const currentFeed = generateFeedResponse({
      group_id: 'user',
      id: '123',
      feed: 'user:123',
    });
    feed['newActivitiesAdded'](
      [generateActivityResponse({ current_feed: currentFeed })],
      { fromWebSocket: true },
    );

    expect(client['getOrCreateActiveFeed']).toHaveBeenCalledWith({
      group: currentFeed.group_id,
      id: currentFeed.id,
      data: currentFeed,
      fromWebSocket: true,
    });
  });

  it(`should fetch own_ fields for new feeds received from a WebSocket event, but only once per feed`, () => {
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

    feed['newActivitiesAdded']([activity1, activity2]);

    // Don't call when not from WebSocket
    expect(client['throttledGetBatchOwnFields']).toHaveBeenCalledTimes(0);

    const activity3 = generateActivityResponse({ current_feed: feed1 });
    feed['newActivitiesAdded']([activity3], { fromWebSocket: true });

    // Don't call when feed already seen
    expect(client['throttledGetBatchOwnFields']).toHaveBeenCalledTimes(0);

    const feed3 = generateFeedResponse({
      group_id: 'user',
      id: '789',
      feed: 'user:789',
    });
    const activity4 = generateActivityResponse({ current_feed: feed3 });
    feed['newActivitiesAdded']([activity4], { fromWebSocket: true });

    // Call when feed not seen
    expect(client['throttledGetBatchOwnFields']).toHaveBeenCalledTimes(1);
    const lastCall = client['throttledGetBatchOwnFields'].mock.lastCall;
    expect(lastCall?.[0]).toEqual([feed3.feed]);
  });

  afterEach(() => {
    clearQueuedFeeds();
  });
});
