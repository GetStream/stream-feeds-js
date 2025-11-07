import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FeedsClient } from './feeds-client';
import { connectActivityToFeed, isAnyFeedWatched } from './active-activity';
import { Feed } from '../feed/feed';

describe('active-activity', () => {
  let client: FeedsClient;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
  });

  it(`should set watch flag from existing active feed`, () => {
    const fid = 'test:123';
    client['activeFeeds'] = {
      [fid]: new Feed(client, 'test', '123', undefined, true),
    };

    const feed = connectActivityToFeed.bind(client)({
      fid,
    });

    expect(feed.currentState.watch).toBe(true);
  });

  it(`should set watch flag to false if there is no existing active feed`, () => {
    const fid = 'test:123';
    client['activeFeeds'] = {};

    const feed = connectActivityToFeed.bind(client)({
      fid,
    });

    expect(feed.currentState.watch).toBe(false);
  });

  it(`should return true if any of the feeds is watched`, () => {
    const watchedFeed = new Feed(client, 'test', '123', undefined, true);
    watchedFeed.state.partialNext({
      last_get_or_create_request_config: {
        watch: true,
      },
    });
    client['activeFeeds'] = {
      'test:123': watchedFeed,
      'test:456': new Feed(client, 'test', '456', undefined, false),
    };

    expect(isAnyFeedWatched.call(client, ['test:123', 'test:456'])).toBe(true);

    expect(isAnyFeedWatched.call(client, ['test:456', 'test:789'])).toBe(false);

    expect(isAnyFeedWatched.call(client, ['test:789'])).toBe(false);
  });
});
