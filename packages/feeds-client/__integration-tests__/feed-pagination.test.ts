import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FeedsClient } from '../src/feeds-client';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import type { UserRequest, AddActivityResponse } from '../src/gen/models';
import type { StreamResponse } from '../src/gen-imports';

describe('Feed Pagination Integration Tests', () => {
  let client: FeedsClient;
  let feed: ReturnType<FeedsClient['feed']>;
  const activities: Array<StreamResponse<AddActivityResponse>> = [];
  const user: UserRequest = getTestUser();
  const feedGroup = 'user';
  const feedId = crypto.randomUUID();

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed(feedGroup, feedId);
    await feed.getOrCreate();
    activities.push(
      await client.addActivity({
        type: 'test',
        feeds: [feed.feed],
        text: 'Test activity 1',
      }),
    );
    activities.push(
      await client.addActivity({
        type: 'test',
        feeds: [feed.feed],
        text: 'Test activity 2',
      }),
    );
    activities.push(
      await client.addActivity({
        type: 'test',
        feeds: [feed.feed],
        text: 'Test activity 3',
      }),
    );
  });

  it('should properly fetch activities through getOrCreate', async () => {
    const [activity1, activity2, activity3] = activities;
    const request = feed.getOrCreate();

    expect(feed.state.getLatestValue().is_loading_activities).toBe(true);

    const response = await request;

    const state = feed.currentState;
    const indexedActivityIds = (feed as any).indexedActivityIds;

    expect(state.is_loading_activities).toBe(false);
    expect(state.activities?.length).toBe(3);
    expect(state.next).not.toBeDefined();
    expect(state.activities?.[0].id).toBe(activity3.activity.id); // Most recent first
    expect(state.activities?.[1].id).toBe(activity2.activity.id);
    expect(state.activities?.[2].id).toBe(activity1.activity.id);
    expect(indexedActivityIds.size).toEqual(response.activities.length);
    expect(indexedActivityIds.size).toEqual(activities.length);
    for (const activityResponse of activities) {
      expect(indexedActivityIds.has(activityResponse.activity.id)).toBe(true);
    }
  });

  it('should fetch and paginate through activities', async () => {
    const [activity1, activity2, activity3] = activities;

    // Get first page with limit 2
    const request = feed.getOrCreate({ limit: 2 });

    expect(feed.state.getLatestValue().is_loading_activities).toBe(true);

    const firstPageResponse = await request;

    // Verify first page state
    let state = feed.state.getLatestValue();
    let indexedActivityIds = (feed as any).indexedActivityIds;

    expect(state.is_loading_activities).toBe(false);
    expect(state.activities?.length).toBe(2);
    expect(state.next).toBeDefined();
    expect(state.activities?.[0].id).toBe(activity3.activity.id); // Most recent first
    expect(state.activities?.[1].id).toBe(activity2.activity.id);
    expect(indexedActivityIds.size).toEqual(
      firstPageResponse.activities.length,
    );
    expect(indexedActivityIds.size).toEqual(2);
    for (const activity of firstPageResponse.activities) {
      expect(indexedActivityIds.has(activity.id)).toBe(true);
    }

    // Get next page
    const secondPageResponse = await feed.getNextPage();

    // Verify final state after pagination
    state = feed.state.getLatestValue();
    indexedActivityIds = (feed as any).indexedActivityIds;

    expect(state.activities).toBeDefined();
    expect(state.activities?.length).toBe(3);
    expect(state.next).toBeUndefined(); // No more pages
    expect(state.activities?.[0].id).toBe(activity3.activity.id);
    expect(state.activities?.[1].id).toBe(activity2.activity.id);
    expect(state.activities?.[2].id).toBe(activity1.activity.id);
    expect(indexedActivityIds.size).toEqual(
      firstPageResponse.activities.length +
        (secondPageResponse?.activities?.length ?? 0),
    );
    expect(indexedActivityIds.size).toEqual(activities.length);
    for (const activityResponse of activities) {
      expect(indexedActivityIds.has(activityResponse.activity.id)).toBe(true);
    }

    // Make sure that `indexedActivityIds` is reset on initial page requery
    const firstPageRequeryResponse = await feed.getOrCreate({ limit: 1 });
    indexedActivityIds = (feed as any).indexedActivityIds;

    expect(indexedActivityIds.size).toEqual(
      firstPageRequeryResponse.activities.length,
    );
    expect(indexedActivityIds.size).toEqual(1);
    for (const activityResponse of firstPageRequeryResponse.activities) {
      expect(indexedActivityIds.has(activityResponse.id)).toBe(true);
    }
  });

  afterAll(async () => {
    await feed.delete();
    await client.disconnectUser();
  });
});
