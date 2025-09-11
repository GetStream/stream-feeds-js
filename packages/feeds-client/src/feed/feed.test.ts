import { beforeEach, describe, expect, it } from 'vitest';
import { FeedsClient } from '../feeds-client';
import { Feed } from './feed';
import { ActivityResponse } from '../gen/models';
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
