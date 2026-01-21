import type { ActivityWithStateUpdates } from '../activity-with-state-updates/activity-with-state-updates';
import { Feed } from '../feed';
import type { FeedsClient } from './feeds-client';

export function connectActivityToFeed(
  this: FeedsClient,
  {
    fid,
  }: {
    fid: string;
  },
) {
  const [group, id] = fid.split(':');
  const activeFeed = this.activeFeeds[fid];

  const feed = new Feed(
    this,
    group,
    id,
    undefined,
    activeFeed?.currentState.watch,
  );

  return feed;
}

export function isAnyFeedWatched(this: FeedsClient, fids: string[]) {
  for (const fid of fids) {
    const feed = this.activeFeeds[fid];
    if (feed && feed.currentState.last_get_or_create_request_config?.watch) {
      return true;
    }
  }

  return false;
}

export function disconnectActivityFromFeed(
  this: FeedsClient,
  activity: ActivityWithStateUpdates,
) {
  const index = this.activeActivities.indexOf(activity);
  if (index !== -1) {
    this.activeActivities.splice(index, 1);
  }
}
