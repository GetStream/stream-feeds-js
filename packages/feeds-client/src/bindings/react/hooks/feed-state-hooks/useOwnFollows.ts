import { Feed, FeedState } from '@self';
import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useStateStore } from '../useStateStore';

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
