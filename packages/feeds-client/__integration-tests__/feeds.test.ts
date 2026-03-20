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

describe('Feeds API basic test', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
  });

  it('create feed', async () => {
    const request = feed.getOrCreate({ data: { visibility: 'public' } });

    expect(feed.state.getLatestValue().is_loading).toBe(true);

    const response = await request;

    expect(response.feed.id).toBe(feed.id);

    // check date decoding
    expect(Date.now() - response.feed.created_at.getTime()).toBeLessThan(3000);
    expect(feed.state.getLatestValue().is_loading).toBe(false);
  });

  it('delete feed', async () => {
    const response = await feed.delete();

    expect(response).toBeDefined();
  });

  afterAll(async () => {
    await client.disconnectUser();
  });
});

describe('updateFeed state updates without watch', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate({
      watch: false,
      data: { name: 'Original Name' },
    });
  });

  afterAll(async () => {
    await client.disconnectUser();
  });

  it('should update feed state after updateFeed (no watch)', async () => {
    expect(feed.currentState.name).toBe('Original Name');

    await feed.update({ name: 'New Name' });

    expect(feed.currentState.name).toBe('New Name');
    expect(feed.currentState.updated_at).toBeInstanceOf(Date);
  });
});

describe('updateFeed state deduplication with watch', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate({
      watch: true,
      data: { name: 'Original Name' },
    });
  });

  afterAll(async () => {
    await client.disconnectUser();
  });

  it('should apply updateFeed state update once when both HTTP and WS fire', async () => {
    const stateChangeSpy = vi.fn();
    const unsubscribe = feed.state.subscribe(stateChangeSpy);
    stateChangeSpy.mockClear();

    await feed.update({ name: 'Updated Name' });

    expect(feed.currentState.name).toBe('Updated Name');

    const stateChangeCountAfterHttp = stateChangeSpy.mock.calls.length;
    expect(stateChangeCountAfterHttp).toBeGreaterThanOrEqual(1);

    // Wait for the WS event (should be deduplicated)
    await waitForEvent(feed, 'feeds.feed.updated');

    // No additional state change from the WS event
    expect(stateChangeSpy.mock.calls.length).toBe(stateChangeCountAfterHttp);

    unsubscribe();
  });
});

describe('deleteFeed state updates without watch', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate({ watch: false });
  });

  afterAll(async () => {
    await client.disconnectUser();
  });

  it('should set deleted_at on feed state after deleteFeed (no watch)', async () => {
    expect(feed.currentState.deleted_at).toBeUndefined();

    await feed.delete();

    expect(feed.currentState.deleted_at).toBeInstanceOf(Date);
  });
});

describe('deleteFeed state deduplication with watch', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate({ watch: true });
  });

  afterAll(async () => {
    await client.disconnectUser();
  });

  it('should apply deleteFeed state update once when both HTTP and WS fire', async () => {
    const stateChangeSpy = vi.fn();
    const unsubscribe = feed.state.subscribe(stateChangeSpy);
    stateChangeSpy.mockClear();

    await feed.delete();

    expect(feed.currentState.deleted_at).toBeInstanceOf(Date);

    const stateChangeCountAfterHttp = stateChangeSpy.mock.calls.length;
    expect(stateChangeCountAfterHttp).toBeGreaterThanOrEqual(1);

    // Wait for the WS event (should be deduplicated)
    await waitForEvent(feed, 'feeds.feed.deleted');

    // No additional state change from the WS event
    expect(stateChangeSpy.mock.calls.length).toBe(stateChangeCountAfterHttp);

    unsubscribe();
  });
});
