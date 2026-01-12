import type { FeedsClient } from './feeds-client';
import type { Feed } from '../feed';

export function markFeedAsInitialized(this: FeedsClient, feed: Feed): void {
  this.markFeedAsInitialized(feed);
}
