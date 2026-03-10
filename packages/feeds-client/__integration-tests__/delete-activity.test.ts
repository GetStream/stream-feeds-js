import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { UserRequest } from '../src/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from './utils';
import type { FeedsClient } from '../src/feeds-client';
import type { Feed } from '../src/feed';

describe('deleteActivity state updates without watch', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  const feedGroup = 'user';
  const feedId = crypto.randomUUID();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed(feedGroup, feedId);
    await feed.getOrCreate({
      watch: false,
      limit: 25,
    });
  });

  afterAll(async () => {
    await client.disconnectUser();
  });

  it('should remove activity from state after deleteActivity (no watch)', async () => {
    // Add an activity
    const response = await client.addActivity({
      type: 'post',
      feeds: [feed.feed],
      text: 'Activity to delete',
    });
    const activityId = response.activity.id;

    // Verify it's in state
    expect(feed.state.getLatestValue().activities?.length).toBe(1);
    expect(feed.hasActivity(activityId)).toBe(true);

    // Delete the activity
    await client.deleteActivity({ id: activityId });

    // Verify it's removed from state
    expect(feed.state.getLatestValue().activities?.length).toBe(0);
    expect(feed.hasActivity(activityId)).toBe(false);
  });
});

describe('deleteActivity state deduplication with watch', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  const feedGroup = 'user';
  const feedId = crypto.randomUUID();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed(feedGroup, feedId);
    await feed.getOrCreate({
      watch: true,
      limit: 25,
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });

  it('should apply deleteActivity state update once when both HTTP and WS fire', async () => {
    // Add an activity and wait for the WS event so state is stable
    const response = await client.addActivity({
      type: 'post',
      feeds: [feed.feed],
      text: 'Activity to delete with watch',
    });
    const activityId = response.activity.id;

    expect(feed.state.getLatestValue().activities?.length).toBe(1);

    // Subscribe spy to track state changes (exactly one update expected after dedup)
    const stateChangeSpy = vi.fn();
    const unsubscribe = feed.state.subscribe(stateChangeSpy);
    stateChangeSpy.mockClear();

    // Wait for both HTTP and WS so we don't depend on arrival order (WS can beat HTTP).
    const deletePromise = client.deleteActivity({ id: activityId });
    const wsEventPromise = waitForEvent(feed, 'feeds.activity.deleted', {
      timeoutMs: 10000,
    });
    await Promise.all([deletePromise, wsEventPromise]);

    // State should show 0 activities; dedup ensures only one state update
    expect(feed.state.getLatestValue().activities?.length).toBe(0);
    expect(stateChangeSpy.mock.calls.length).toBe(1);

    unsubscribe();
  });
});
