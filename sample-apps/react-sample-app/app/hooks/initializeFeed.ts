import { Feed, FeedState } from '@stream-io/feeds-client';

const promisesByFeedId: Record<string, Promise<FeedState>> = {};

export const initializeFeed = (
  feed: Feed,
  options?: { watch?: boolean },
): Promise<FeedState> => {
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
        reject(
          new Error('Timed out while waiting for FeedState.is_loading to flip'),
        );
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

  const removePromise = () => {
    if (typeof promisesByFeedId[feed.fid] !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete promisesByFeedId[feed.fid];
    }
  };

  promisesByFeedId[feed.fid] = feed
    .getOrCreate({
      watch: options?.watch,
      followers_pagination: { limit: 5 },
      following_pagination: { limit: 5 },
    })
    .then(() => feed.state.getLatestValue())
    .finally(removePromise);

  return promisesByFeedId[feed.fid];
};
