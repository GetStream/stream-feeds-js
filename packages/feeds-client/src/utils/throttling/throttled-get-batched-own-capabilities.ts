import type { FeedsClient } from '@self';

// TODO: This should be replaced with the actual type once backend implements it
export type GetBatchedOwnCapabilities = {
  feeds: string[];
};

const queuedFeeds: Set<string> = new Set();

export function queueBatchedOwnCapabilities(
  this: FeedsClient,
  { feeds }: GetBatchedOwnCapabilities,
) {
  for (const feed of feeds) {
    queuedFeeds.add(feed);
  }

  if (queuedFeeds.size > 0) {
    this.throttledGetBatchedOwnCapabilities([...queuedFeeds], (feedsToClear: string[]) => {
      for (const feed of feedsToClear) {
        queuedFeeds.delete(feed);
      }
    });
  }
}
