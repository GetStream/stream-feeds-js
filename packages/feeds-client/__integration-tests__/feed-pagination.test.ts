import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FeedsClient } from '../src/FeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import { UserRequest } from '../src/common/gen/models';

describe('Feed Pagination Integration Tests', () => {
  let client: FeedsClient;
  let feed: ReturnType<FeedsClient['feed']>;
  const user: UserRequest = getTestUser();
  const feedGroup = 'user';
  const feedId = crypto.randomUUID();

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed(feedGroup, feedId);
    await feed.getOrCreate();
  });

  // Activity pagination is not supported yet
  it.skip('should fetch and paginate through activities', async () => {
    // Add 3 activities
    const activity1 = await client.addActivity({
      type: 'test',
      fids: [feed.fid],
      text: 'Test activity 1',
    });
    const activity2 = await client.addActivity({
      type: 'test',
      fids: [feed.fid],
      text: 'Test activity 2',
    });
    const activity3 = await client.addActivity({
      type: 'test',
      fids: [feed.fid],
      text: 'Test activity 3',
    });

    // Get first page with limit 2
    const request = feed.getOrCreate({ limit: 2 });

    expect(feed.state.getLatestValue().is_loading_activities).toBe(true);

    await request;

    // Verify first page state
    let state = feed.state.getLatestValue();
    expect(state.is_loading_activities).toBe(false);
    expect(state.activities?.length).toBe(2);
    expect(state.next).toBeDefined();
    expect(state.activities?.[0].id).toBe(activity3.activity.id); // Most recent first
    expect(state.activities?.[1].id).toBe(activity2.activity.id);

    // Get next page
    await feed.getNextPage();

    // Verify final state after pagination
    state = feed.state.getLatestValue();
    expect(state.activities).toBeDefined();
    expect(state.activities?.length).toBe(3);
    expect(state.next).toBeUndefined(); // No more pages
    expect(state.activities?.[0].id).toBe(activity3.activity.id);
    expect(state.activities?.[1].id).toBe(activity2.activity.id);
    expect(state.activities?.[2].id).toBe(activity1.activity.id);
  });

  afterAll(async () => {
    await feed.delete();
    await client.disconnectUser();
  });
});
