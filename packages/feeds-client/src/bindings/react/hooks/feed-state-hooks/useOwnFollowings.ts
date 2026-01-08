import { useStateStore } from '@stream-io/state-store/react-bindings';

import { useFeedContext } from '../../contexts/StreamFeedContext';
import type { Feed, FeedState } from '../../../../feed';

/**
 * A React hook that returns a reactive array of feeds that the feeds's owner is following and is owned by the current user.
 */
export const useOwnFollowings = (feedFromProps?: Feed) => {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  return useStateStore(feed?.state, selector);
};

const selector = ({ own_followings }: FeedState) => ({
  own_followings,
});
