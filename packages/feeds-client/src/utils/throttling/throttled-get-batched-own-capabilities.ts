import type { FeedsClient } from '../../feeds-client';
import type { ThrottledFunction } from './throttle';

const BATCH_OWN_CAPABILITIES_API_LIMIT = 100;

export type GetBatchedOwnCapabilities = {
  feeds: string[];
};

export type GetBatchedOwnCapabilitiesThrottledCallback = [
  feeds: string[],
  callback: (feedsToClear: string[]) => void | Promise<void>,
];

export type ThrottledGetBatchedOwnCapabilities =
  ThrottledFunction<GetBatchedOwnCapabilitiesThrottledCallback>;

export const DEFAULT_BATCH_OWN_CAPABILITIES_THROTTLING_INTERVAL = 2000;

const queuedFeeds: Set<string> = new Set();

export function queueBatchedOwnCapabilities(
  this: FeedsClient,
  { feeds }: GetBatchedOwnCapabilities,
) {
  for (const feed of feeds) {
    queuedFeeds.add(feed);
  }

  if (queuedFeeds.size > 0) {
    this.throttledGetBatchOwnCapabilities(
      [...queuedFeeds].slice(0, BATCH_OWN_CAPABILITIES_API_LIMIT),
      (feedsToClear: string[]) => {
        for (const feed of feedsToClear) {
          queuedFeeds.delete(feed);
        }
      },
    );
  }
}

export function clearQueuedFeeds() {
  queuedFeeds.clear();
}
