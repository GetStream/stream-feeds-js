import type { ActivityWithStateUpdates } from './activity-with-state-updates';

export function getFeed(this: ActivityWithStateUpdates) {
  return this.feed;
}
