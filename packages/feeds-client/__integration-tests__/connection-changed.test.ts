import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FeedsClient } from '../src/feeds-client';
import type { FeedsEvent } from '../src/types';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import type { UserRequest } from '../src/gen/models';
import type { UnhandledErrorEvent } from '../src/common/real-time/event-models';
import { UnhandledErrorType } from '../src/common/real-time/event-models';

const shouldWatchIndex = (index: number) => index % 2 === 0;

describe('Connection status change', () => {
  let client: FeedsClient;
  let feeds: Array<ReturnType<FeedsClient['feed']>> = [];
  let activities: Array<ReturnType<FeedsClient['activity']>> = [];
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
    activities = [];
    for (let i = 0; i < 2; i++) {
      const activityId = crypto.randomUUID();
      const activity = client.activity(activityId);
      const feed = client.feed(feedGroup, crypto.randomUUID());
      await feed.getOrCreate();
      await feed.addActivity({
        id: activityId,
        type: 'post',
        text: 'test',
      });
      await activity.get({ watch: shouldWatchIndex(i) });
      activities.push(activity);
    }
  });

  it('should set watch to false in watched feeds when losing connection, and to true when reconnecting', async () => {
    for (let i = 0; i < feeds.length; i++) {
      const feed = feeds[i];
      const shouldWatch = shouldWatchIndex(i);
      expect(feed.currentState.watch).toBe(shouldWatch);
    }

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      expect(activity.currentState.watch).toBe(shouldWatchIndex(i));
    }

    client['eventDispatcher'].dispatch({
      type: 'connection.changed',
      online: false,
    });

    for (const feed of feeds) {
      expect(feed.currentState.watch).toBe(false);
    }

    for (const activity of activities) {
      expect(activity.currentState.watch).toBe(false);
    }

    const spies = feeds.map((feed) => vi.spyOn(feed, 'getOrCreate'));
    const activitySpies = activities.map((activity) =>
      vi.spyOn(activity, 'get'),
    );

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

    for (let i = 0; i < activitySpies.length; i++) {
      const spy = activitySpies[i];
      const shouldRewatch = shouldWatchIndex(i);

      if (shouldRewatch) {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({ watch: true }),
        );
      } else {
        expect(spy).not.toHaveBeenCalled();
      }
    }
  });

  it('should dispatch the correct errors.unhandled local event when getOrCreate fails during reconciliation', async () => {
    client['eventDispatcher'].dispatch({
      type: 'connection.changed',
      online: false,
    });

    let watchedCount = 0;
    const failedQueryFeedsIdentifiers: string[] = [];
    const failedQueryActivitiesIdentifiers: string[] = [];

    feeds.forEach((feed, index) => {
      const isWatched = shouldWatchIndex(index);
      if (isWatched) {
        watchedCount++;
      }

      if (isWatched && watchedCount > 1) {
        failedQueryFeedsIdentifiers.push(feed.feed);
        vi.spyOn(feed, 'getOrCreate').mockRejectedValue(
          new Error('This feed has failed its query !'),
        );
      }

      return vi.spyOn(feed, 'getOrCreate');
    });

    activities.forEach((activity, index) => {
      const isWatched = shouldWatchIndex(index);
      if (isWatched) {
        failedQueryActivitiesIdentifiers.push(activity.id);
        vi.spyOn(activity, 'get').mockRejectedValue(
          new Error('This activity has failed its query !'),
        );
      }

      vi.spyOn(activity, 'get');
    });

    const eventCollector: FeedsEvent[] = [];

    client.on('errors.unhandled', (e) => {
      eventCollector.push(e);
    });

    client['eventDispatcher'].dispatch({
      type: 'connection.changed',
      online: true,
    });

    await expect
      .poll(() => eventCollector.length, { interval: 50, timeout: 2000 })
      .toBe(1);

    const event = eventCollector[0];

    expect(event).toEqual({
      type: 'errors.unhandled',
      error_type: UnhandledErrorType.ReconnectionReconciliation,
      failures: expect.any(Array),
    });

    const failures = (event as UnhandledErrorEvent).failures;

    expect(failures.length).to.eq(
      failedQueryFeedsIdentifiers.length +
        failedQueryActivitiesIdentifiers.length,
    );

    for (const failure of failures) {
      expect(failedQueryFeedsIdentifiers.includes(failure.feed)).to.eq(true);
      expect(failure.reason).toBeInstanceOf(Error);
      expect((failure.reason as Error).message).to.eq(
        'This feed has failed its query !',
      );
    }
  });

  afterEach(async () => {
    for (const feed of feeds) {
      await feed.delete({ hard_delete: true });
    }
    for (const activity of activities) {
      await activity.feed?.delete({ hard_delete: true });
    }
    await client.disconnectUser();
    vi.resetAllMocks();
  });
});
