import { Feed, FeedState } from '../../../src/Feed';
import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useStateStore } from '../useStateStore';

/**
 * A React hook that returns a reactive object containing some often used
 * metadata for a feed.
 */
export const useFeedMetadata = (feedFromProps?: Feed) => {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  return useStateStore(feed?.state, selector);
}

const selector = ({
  follower_count = 0,
  following_count = 0,
  created_by,
  created_at,
  updated_at,
}: FeedState) => ({
  createdBy: created_by,
  followerCount: follower_count,
  followingCount: following_count,
  createdAt: created_at,
  updateAt: updated_at,
});
