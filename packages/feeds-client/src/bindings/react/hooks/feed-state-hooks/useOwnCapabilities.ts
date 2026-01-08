import { useStateStore } from '@stream-io/state-store/react-bindings';

import { useFeedContext } from '../../contexts/StreamFeedContext';
import type { Feed, FeedState } from '../../../../feed';
import type { FeedOwnCapability } from '../../../../gen/models';
import { useFeedsClient } from '../../contexts/StreamFeedsContext';

const stableEmptyArray: readonly FeedOwnCapability[] = [];

const selector = (currentState: FeedState) => {
  return {
    feedOwnCapabilities: currentState.own_capabilities ?? stableEmptyArray,
  };
};

export const useOwnCapabilities = (feedFromProps?: Feed | string) => {
  const client = useFeedsClient();
  const feedFromContext = useFeedContext();
  let feed = feedFromProps ?? feedFromContext;
  if (typeof feed === 'string') {
    const [groupId, id] = feed.split(':');
    feed = groupId && id ? client?.feed(groupId, id) : undefined;
  }

  const { feedOwnCapabilities = stableEmptyArray } =
    useStateStore(feed?.state, selector) ?? {};

  return feedOwnCapabilities;
};
