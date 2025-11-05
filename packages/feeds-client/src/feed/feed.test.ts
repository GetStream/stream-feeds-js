import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Mock } from 'vitest';
import { FeedsClient } from '../feeds-client';
import { Feed } from './feed';
import type { ActivityResponse } from '../gen/models';
import { generateActivityResponse, generateFeedResponse } from '../test-utils';

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
      hydrateCapabilitiesCache: vi.fn(),
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
        activity_selector_options: {
          sort: [
            {
              field: 'created_at',
              direction: 'desc',
            },
          ],
        },
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

  it(`should prevent duplicate getOrCreate calls with same config`, async () => {
    const promise1 = feed.getOrCreate();
    const promise2 = feed.getOrCreate();

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
