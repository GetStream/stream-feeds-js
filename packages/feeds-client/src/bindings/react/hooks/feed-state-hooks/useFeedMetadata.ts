import { useStateStore } from '@stream-io/state-store/react-bindings';

import { useFeedContext } from '../../contexts/StreamFeedContext';
import type { Feed, FeedState } from '../../../../feed';

/**
 * A React hook that returns a reactive object containing some often used
 * metadata for a feed.
 */
export const useFeedMetadata = (feedFromProps?: Feed) => {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  return useStateStore(feed?.state, selector);
};

const selector = ({
  follower_count = 0,
  following_count = 0,
  created_by,
  created_at,
  updated_at,
  activity_count,
}: FeedState) => ({
  created_by,
  follower_count,
  following_count,
  created_at,
  updated_at,
  activity_count,
});
