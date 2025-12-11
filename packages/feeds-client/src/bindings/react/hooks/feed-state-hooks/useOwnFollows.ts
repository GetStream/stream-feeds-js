import { useStateStore } from '@stream-io/state-store/react-bindings';

import { useFeedContext } from '../../contexts/StreamFeedContext';
import type { Feed, FeedState } from '../../../../feed';

/**
 * A React hook that returns a reactive array of feeds that the current user
 * owns and are following the respective feed that we are observing.
 */
export const useOwnFollows = (feedFromProps?: Feed) => {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  return useStateStore(feed?.state, selector);
};

const selector = ({ own_follows }: FeedState) => ({
  own_follows,
});
