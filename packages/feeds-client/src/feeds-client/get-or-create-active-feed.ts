import type { FeedsClient } from './feeds-client';

export function getOrCreateActiveFeed(
  this: FeedsClient,
  ...args: Parameters<FeedsClient['getOrCreateActiveFeed']>
) {
  return this.getOrCreateActiveFeed(...args);
}
