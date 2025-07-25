import {
  Feed,
  FeedState,
  GetOrCreateFeedRequest,
} from '@stream-io/feeds-client';

const promisesByFeedId: Record<string, Promise<FeedState>> = {};

export const initializeFeed = (
  feed: Feed,
  options?: GetOrCreateFeedRequest,
): Promise<FeedState> => {
  const currentState = feed.state.getLatestValue();

  // TODO: find another key to consider feed "initialized"
  if (currentState.watch) {
    return Promise.resolve(currentState);
  }

  if (currentState.is_loading) {
    return new Promise((resolve) => {
      const unsubscribe = feed.state.subscribeWithSelector(
        (v) => ({ is_loading: v.is_loading }),
        ({ is_loading }) => {
          if (is_loading) return;

          unsubscribe();
          resolve(feed.state.getLatestValue());
        },
      );
    });
  }

  const removePromise = () => {
    if (typeof promisesByFeedId[feed.fid] !== 'undefined') {
      delete promisesByFeedId[feed.fid];
    }
  };

  promisesByFeedId[feed.fid] = feed
    .getOrCreate({
      watch: options?.watch,
      followers_pagination: options?.followers_pagination ?? { limit: 5 },
      following_pagination: options?.following_pagination ?? { limit: 5 },
    })
    .then(() => feed.state.getLatestValue())
    .finally(removePromise);

  return promisesByFeedId[feed.fid];
};
