import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FeedsClient } from './feeds-client';
import { connectActivityToFeed } from './active-activity';
import { Feed } from '../feed/feed';

describe('active-activity', () => {
  let client: FeedsClient;
  let watchFeedSpy: ReturnType<typeof vi.spyOn<any, 'getOrCreateFeed'>>;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    watchFeedSpy = vi
      .spyOn(client, 'getOrCreateFeed')
      // @ts-expect-error - we don't care about the return value, so type mismatch is fine
      .mockImplementation(() => Promise.resolve(undefined));
  });

  it('should start watching if watch is true, and feed is not in active feeds', async () => {
    client['activeFeeds'] = {};

    const fid = 'test:123';
    const feed = await connectActivityToFeed.bind(client)({
      fid,
      watch: true,
    });

    expect(watchFeedSpy).toHaveBeenCalledWith({
      feed_group_id: 'test',
      feed_id: '123',
    });

    expect(feed.currentState.watch).toBe(true);
  });

  it('should start watching if watch is true, and feed is in active feeds but not watched', async () => {
    const fid = 'test:123';
    client['activeFeeds'] = {
      [fid]: new Feed(client, 'test', '123', undefined, false),
    };
    watchFeedSpy = vi
      .spyOn(client, 'getOrCreateFeed')
      // @ts-expect-error - we don't care about the return value, so type mismatch is fine
      .mockImplementation(() => {
        client['activeFeeds'][fid].currentState.watch = true;
        return Promise.resolve(undefined);
      });

    const feed = await connectActivityToFeed.bind(client)({
      fid,
      watch: true,
    });

    expect(watchFeedSpy).toHaveBeenCalledWith({
      feed_group_id: 'test',
      feed_id: '123',
    });

    expect(feed.currentState.watch).toBe(true);
  });

  it(`should not start watching if watch is false`, async () => {
    client['activeFeeds'] = {};

    const fid = 'test:123';
    const feed = await connectActivityToFeed.bind(client)({
      fid,
      watch: false,
    });

    expect(watchFeedSpy).not.toHaveBeenCalled();

    expect(feed.currentState.watch).toBe(false);
  });

  it(`should not start watching if watch is true but feed is in active feeds and already watched`, async () => {
    const fid = 'test:123';
    client['activeFeeds'] = {
      [fid]: new Feed(client, 'test', '123', undefined, true),
    };

    const feed = await connectActivityToFeed.bind(client)({
      fid,
      watch: true,
    });

    expect(watchFeedSpy).not.toHaveBeenCalled();
    expect(feed.currentState.watch).toBe(true);
  });

  it(`should not start watching if watch is false, but feed is in active feeds and already watched`, async () => {
    const fid = 'test:123';
    client['activeFeeds'] = {
      [fid]: new Feed(client, 'test', '123', undefined, true),
    };

    const feed = await connectActivityToFeed.bind(client)({
      fid,
      watch: false,
    });

    expect(watchFeedSpy).not.toHaveBeenCalled();
    expect(feed.currentState.watch).toBe(true);
  });

  afterEach(() => {
    watchFeedSpy.mockRestore();
  });
});
