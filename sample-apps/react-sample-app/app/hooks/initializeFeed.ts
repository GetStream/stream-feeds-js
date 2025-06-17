import { Feed, FeedState } from '@stream-io/feeds-client';

const promisesByFeedId: Record<string, Promise<FeedState>> = {};

export const initializeFeed = (feed: Feed, options?: { watch?: boolean }) => {
  const currentState = feed.state.getLatestValue();

  if (typeof currentState.created_at !== 'undefined') {
    return Promise.resolve(currentState);
  }

  if (typeof promisesByFeedId[feed.fid] !== 'undefined') {
    return promisesByFeedId[feed.fid];
  }

  if (currentState.is_loading) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        unsubscribe();
        reject(new Error('Timed out while waiting for FeedState.is_loading to flip'));
      }, 5000);

      const unsubscribe = feed.state.subscribeWithSelector(
        (v) => ({ is_loading: v.is_loading }),
        ({ is_loading }) => {
          if (is_loading) return;

          unsubscribe();
          if (typeof t !== 'undefined') clearTimeout(t);
          resolve(feed.state.getLatestValue());
        },
      );
    });
  }

  promisesByFeedId[feed.fid] = feed
    .getOrCreate({ watch: options?.watch })
    .then(() => feed.state.getLatestValue());

  const removePromise = () => {
    if (typeof promisesByFeedId[feed.fid] !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete promisesByFeedId[feed.fid];
    }
  };

  return promisesByFeedId[feed.fid].finally(removePromise);
};
