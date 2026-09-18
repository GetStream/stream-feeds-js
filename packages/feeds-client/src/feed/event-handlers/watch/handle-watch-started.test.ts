import { beforeEach, describe, expect, it } from 'vitest';
import { FeedsClient } from '../../../feeds-client';
import { Feed } from '../../feed';
import { generateFeedResponse } from '../../../test-utils';
import { handleWatchStarted } from './handle-watch-started';

describe('handleWatchStarted', () => {
  let feed: Feed;

  beforeEach(() => {
    const client = new FeedsClient('mock-api-key');
    const feedResponse = generateFeedResponse({ id: 'main', group_id: 'user' });
    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
  });

  it('sets watch and leaves the stored config untouched by default', () => {
    const config = { watch: false, limit: 20 };
    feed.state.partialNext({ last_get_or_create_request_config: config });

    handleWatchStarted.call(feed);

    expect(feed.currentState.watch).toBe(true);
    expect(feed.currentState.last_get_or_create_request_config).toBe(config);
  });

  it('restores the watch intent with setWatchIntent', () => {
    const config = { watch: false, limit: 20 };
    feed.state.partialNext({ last_get_or_create_request_config: config });

    handleWatchStarted.call(feed, { setWatchIntent: true });

    expect(feed.currentState.watch).toBe(true);
    expect(feed.currentState.last_get_or_create_request_config).toEqual({
      watch: true,
      limit: 20,
    });
    expect(feed.currentState.last_get_or_create_request_config).not.toBe(
      config,
    );
    expect(config.watch).toBe(false);
  });

  it('does not invent a config when none was stored', () => {
    handleWatchStarted.call(feed, { setWatchIntent: true });

    expect(feed.currentState.watch).toBe(true);
    expect(feed.currentState.last_get_or_create_request_config).toBeUndefined();
  });
});
