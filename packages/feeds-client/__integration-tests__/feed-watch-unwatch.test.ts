import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { FeedsClient } from '../src/FeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import { UserRequest } from '../src/gen/models';

describe('Feed watch and unwatch', () => {
  let client: FeedsClient;
  let feed: ReturnType<FeedsClient['feed']>;
  const user: UserRequest = getTestUser();
  const feedGroup = 'user';
  const feedId = crypto.randomUUID();

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed(feedGroup, feedId);
  });

  it(`by default watch is false`, async () => {
    expect(feed.currentState.watch).toBe(false);
  });

  it(`getOrCreate with watch=false`, async () => {
    await feed.getOrCreate({ watch: false });

    expect(feed.currentState.watch).toBe(false);
  });

  it(`query feed with watch=true`, async () => {
    await client.queryFeeds({
      filter: {
        fid: feed.fid,
      },
      watch: true,
    });

    expect(feed.currentState.watch).toBe(true);
  });

  it(`query with watch=false won't update watch if it's already true`, async () => {
    await client.queryFeeds({
      filter: {
        fid: feed.fid,
      },
      watch: false,
    });

    expect(feed.currentState.watch).toBe(true);
  });

  it(`stop watching will set watch to false`, async () => {
    await feed.stopWatching();

    expect(feed.currentState.watch).toBe(false);
  });

  it(`loosing connection will set watch to false, reconnecting will reset watch to true`, async () => {
    await feed.getOrCreate({ watch: true });

    expect(feed.currentState.watch).toBe(true);

    client['eventDispatcher'].dispatch({
      type: 'connection.changed',
      online: false,
    });

    expect(feed.currentState.watch).toBe(false);

    const spy = vi.spyOn(feed, 'getOrCreate');

    client['eventDispatcher'].dispatch({
      type: 'connection.changed',
      online: true,
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        watch: true,
      }),
    );
  });

  afterAll(async () => {
    await feed.delete();
    await client.disconnectUser();
  });
});
