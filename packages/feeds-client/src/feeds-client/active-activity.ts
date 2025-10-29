import { Feed } from '../feed';
import type { FeedsClient } from './feeds-client';

export async function connectActivityToFeed(
  this: FeedsClient,
  {
    fid,
    watch,
  }: {
    fid: string;
    watch?: boolean;
  },
) {
  const [group, id] = fid.split(':');
  const activeFeed = this.activeFeeds[fid];
  if (watch && !activeFeed?.currentState.watch) {
    await this.getOrCreateFeed({
      feed_group_id: group,
      feed_id: id,
      watch,
    });
  }

  const feed = new Feed(
    this,
    group,
    id,
    undefined,
    activeFeed?.state.getLatestValue().watch ?? watch,
  );

  return feed;
}
