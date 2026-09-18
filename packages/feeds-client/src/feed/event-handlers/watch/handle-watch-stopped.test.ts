import { beforeEach, describe, expect, it } from 'vitest';
import { FeedsClient } from '../../../feeds-client';
import { Feed } from '../../feed';
import { generateFeedResponse } from '../../../test-utils';
import { handleWatchStopped } from './handle-watch-stopped';

describe('handleWatchStopped', () => {
  let feed: Feed;

  beforeEach(() => {
    const client = new FeedsClient('mock-api-key');
    const feedResponse = generateFeedResponse({ id: 'main', group_id: 'user' });
    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
      true,
    );
  });

  describe('without clearWatchIntent (connection lost)', () => {
    it('clears watch but keeps the watch intent so reconnect can recover', () => {
      const config = { watch: true, limit: 20 };
      feed.state.partialNext({ last_get_or_create_request_config: config });

      handleWatchStopped.call(feed);

      expect(feed.currentState.watch).toBe(false);
      // same reference - the stored config is left completely untouched
      expect(feed.currentState.last_get_or_create_request_config).toBe(config);
    });
  });

  describe('with clearWatchIntent (explicit stopWatching)', () => {
    it('clears watch and the stored watch intent', () => {
      feed.state.partialNext({
        last_get_or_create_request_config: { watch: true, limit: 20 },
      });

      handleWatchStopped.call(feed, { clearWatchIntent: true });

      expect(feed.currentState.watch).toBe(false);
      expect(feed.currentState.last_get_or_create_request_config).toEqual({
        watch: false,
        limit: 20,
      });
    });

    it('produces a new last_get_or_create_request_config reference', () => {
      const config = { watch: true, limit: 20 };
      feed.state.partialNext({ last_get_or_create_request_config: config });

      handleWatchStopped.call(feed, { clearWatchIntent: true });

      expect(feed.currentState.last_get_or_create_request_config).not.toBe(
        config,
      );
      // the caller's object must not be mutated in place
      expect(config.watch).toBe(true);
    });

    it('leaves last_get_or_create_request_config undefined if it was never set', () => {
      expect(
        feed.currentState.last_get_or_create_request_config,
      ).toBeUndefined();

      expect(() =>
        handleWatchStopped.call(feed, { clearWatchIntent: true }),
      ).not.toThrow();

      expect(feed.currentState.watch).toBe(false);
      expect(
        feed.currentState.last_get_or_create_request_config,
      ).toBeUndefined();
    });
  });
});
