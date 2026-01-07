import type { FeedsClient } from '../../feeds-client';
import type { ThrottledFunction } from './throttle';

const BATCH_OWN_FIELDS_API_LIMIT = 100;

export type GetBatchedOwnFields = {
  feeds: string[];
};

export type GetBatchedOwnFieldsThrottledCallback = [
  feeds: string[],
  callback: (feedsToClear: string[]) => void | Promise<void>,
];

export type ThrottledGetBatchedOwnFields =
  ThrottledFunction<GetBatchedOwnFieldsThrottledCallback>;

export const DEFAULT_BATCH_OWN_FIELDS_THROTTLING_INTERVAL = 2000;

const queuedFeeds: Set<string> = new Set();

export function queueBatchedOwnFields(
  this: FeedsClient,
  { feeds }: GetBatchedOwnFields,
) {
  for (const feed of feeds) {
    queuedFeeds.add(feed);
  }

  if (queuedFeeds.size > 0) {
    this.throttledGetBatchOwnFields(
      [...queuedFeeds].slice(0, BATCH_OWN_FIELDS_API_LIMIT),
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
