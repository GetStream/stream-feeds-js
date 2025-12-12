import type { FeedResponse } from '../gen/models';
import type { FeedsClient } from './feeds-client';

export function getOrCreateActiveFeed(
  this: FeedsClient,
  group: string,
  id: string,
  data?: FeedResponse,
  watch?: boolean,
) {
  return this.getOrCreateActiveFeed(group, id, data, watch);
}
