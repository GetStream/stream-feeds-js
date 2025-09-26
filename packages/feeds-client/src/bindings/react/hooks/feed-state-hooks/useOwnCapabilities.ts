import { useMemo } from 'react';
import { type Feed, FeedOwnCapability, type FeedsClientState } from '@self';
import { useStateStore } from '@stream-io/state-store/react-bindings';
import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useFeedsClient } from '../../contexts/StreamFeedsContext';
import { useStableCallback } from '../internal';

const stableEmptyArray: readonly FeedOwnCapability[] = [];

export const useOwnCapabilities = (feedFromProps?: Feed) => {
  const client = useFeedsClient();
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  const selector = useStableCallback((currentState: FeedsClientState) => {
    const fid = feed?.feed;

    if (!fid) {
      return { feedOwnCapabilities: stableEmptyArray };
    }

    return {
      feedOwnCapabilities:
        currentState.own_capabilities_by_fid[fid] ?? stableEmptyArray,
    };
  });

  const { feedOwnCapabilities = stableEmptyArray } =
    useStateStore(client?.state, selector) ?? {};

  // console.log('GETTING CAPA: ', feed?.feed, feedOwnCapabilities);

  return feedOwnCapabilities;
};
