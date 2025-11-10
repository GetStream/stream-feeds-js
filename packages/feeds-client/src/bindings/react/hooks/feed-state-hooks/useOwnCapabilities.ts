import type {
  FeedOwnCapability,
  Feed,
  FeedsClientState,
  FeedsClient,
  FeedResponse,
} from '@self';
import { useStateStore } from '@stream-io/state-store/react-bindings';
import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useFeedsClient } from '../../contexts/StreamFeedsContext';
import { useCallback } from 'react';

const stableEmptyArray: readonly FeedOwnCapability[] = [];

export const useOwnCapabilities = ({
  feed: feedFromProps,
  client: clientFromProps,
}: {
  feed?: Feed | string | FeedResponse;
  client?: FeedsClient;
}) => {
  const client = useFeedsClient() ?? clientFromProps;
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;
  const fid = typeof feed === 'string' ? feed : feed?.feed;

  const selector = useCallback(
    (currentState: FeedsClientState) => {
      if (!fid) {
        return { feedOwnCapabilities: stableEmptyArray };
      }

      return {
        feedOwnCapabilities:
          currentState.own_capabilities_by_fid[fid] ?? stableEmptyArray,
      };
    },
    [fid],
  );

  const { feedOwnCapabilities = stableEmptyArray } =
    useStateStore(client?.state, selector) ?? {};

  // console.log('GETTING CAPA: ', feed?.feed, feedOwnCapabilities);

  return feedOwnCapabilities;
};
