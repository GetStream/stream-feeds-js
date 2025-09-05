import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FeedsClient } from '../src/feeds-client';
import { FeedsEvent } from '../src/types';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import { UserRequest } from '../src/gen/models';
import {
  UnhandledErrorEvent,
  UnhandledErrorType,
} from '../src/common/real-time/event-models';

const shouldWatchIndex = (index: number) => index % 2 === 0;

describe('Connection status change', () => {
  let client: FeedsClient;
  let feeds: Array<ReturnType<FeedsClient['feed']>> = [];
  const user: UserRequest = getTestUser();
  const feedGroup = 'user';

  beforeEach(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feeds = [];
    for (let i = 0; i < 5; i++) {
      const feedId = crypto.randomUUID();
      const feed = client.feed(feedGroup, feedId);

      const shouldWatch = shouldWatchIndex(i);
      await feed.getOrCreate({ watch: shouldWatch });

      feeds.push(feed);
    }
  });

  it('should set watch to false in watched feeds when losing connection, and to true when reconnecting', async () => {
    for (let i = 0; i < feeds.length; i++) {
      const feed = feeds[i];
      const shouldWatch = shouldWatchIndex(i);
      expect(feed.currentState.watch).toBe(shouldWatch);
    }

    // Accessing private property to simulate losing connection
    // eslint-disable-next-line dot-notation
    client['eventDispatcher'].dispatch({
      type: 'connection.changed',
      online: false,
    });

    for (const feed of feeds) {
      expect(feed.currentState.watch).toBe(false);
    }

    const spies = feeds.map(feed => vi.spyOn(feed, 'getOrCreate'));

    // Accessing private property to simulate losing connection
    // eslint-disable-next-line dot-notation
    client['eventDispatcher'].dispatch({
      type: 'connection.changed',
      online: true,
    });

    for (let i = 0; i < spies.length; i++) {
      const spy = spies[i];
      const shouldRewatch = shouldWatchIndex(i);

      if (shouldRewatch) {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            watch: true,
          }),
        );
      } else {
        expect(spy).not.toHaveBeenCalled();
      }
    }
  });

  it('should dispatch the correct errors.unhandled local event when getOrCreate fails during reconciliation', async () => {
    for (let i = 0; i < feeds.length; i++) {
      const feed = feeds[i];
      const shouldWatch = shouldWatchIndex(i);
      expect(feed.currentState.watch).toBe(shouldWatch);
    }

    // Accessing private property to simulate losing connection
    // eslint-disable-next-line dot-notation
    client['eventDispatcher'].dispatch({
      type: 'connection.changed',
      online: false,
    });

    for (const feed of feeds) {
      expect(feed.currentState.watch).toBe(false);
    }

    let watchedCount = 0;
    const failedQueryFeedsIdentifiers: string[] = [];

    const spies = feeds.map((feed, index) => {
      const isWatched = shouldWatchIndex(index);
      if (isWatched) {
        watchedCount++;
      }

      if (isWatched && watchedCount > 1) {
        failedQueryFeedsIdentifiers.push(feed.feed);
        return vi.spyOn(feed, 'getOrCreate').mockRejectedValue(new Error('This feed has failed its query !'));
      }

      return vi.spyOn(feed, 'getOrCreate');
    });

    const eventCollector: FeedsEvent[] = [];

    client.on('errors.unhandled', (e) => {
      eventCollector.push(e);
    })

    // Accessing private property to simulate losing connection
    // eslint-disable-next-line dot-notation
    client['eventDispatcher'].dispatch({
      type: 'connection.changed',
      online: true,
    });

    for (let i = 0; i < spies.length; i++) {
      const spy = spies[i];
      const shouldRewatch = shouldWatchIndex(i);

      if (shouldRewatch) {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            watch: true,
          }),
        );
      } else {
        expect(spy).not.toHaveBeenCalled();
      }
    }

    await expect.poll(() => eventCollector.length, { interval: 50, timeout: 2000 }).toBe(1);

    const event = eventCollector[0];

    expect(event).toEqual({
      type: 'errors.unhandled',
      error_type: UnhandledErrorType.ReconnectionReconciliation,
      failures: expect.any(Array),
    });

    const failures = (event as UnhandledErrorEvent).failures;

    expect(failures.length).to.eq(2);
    console.log(failedQueryFeedsIdentifiers)
    expect(failures.length).to.eq(failedQueryFeedsIdentifiers.length);

    for (const failure of failures) {
      expect(failedQueryFeedsIdentifiers.includes(failure.feed)).to.eq(true);
      expect(failure.reason).toBeInstanceOf(Error);
      expect((failure.reason as Error).message).to.eq('This feed has failed its query !')
    }
  })

  afterEach(async () => {
    for (const feed of feeds) {
      await feed.delete();
    }
    await client.disconnectUser();
    vi.resetAllMocks();
  })
});
