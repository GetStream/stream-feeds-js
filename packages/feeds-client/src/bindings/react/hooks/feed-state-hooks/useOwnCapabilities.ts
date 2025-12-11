import { useCallback } from 'react';
import { useStateStore } from '@stream-io/state-store/react-bindings';

import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useFeedsClient } from '../../contexts/StreamFeedsContext';
import type { Feed } from '../../../../feed';
import type { FeedOwnCapability } from '../../../../gen/models';
import type { FeedsClientState } from '../../../../feeds-client';

const stableEmptyArray: readonly FeedOwnCapability[] = [];

export const useOwnCapabilities = (feedFromProps?: Feed | string) => {
  const client = useFeedsClient();
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
