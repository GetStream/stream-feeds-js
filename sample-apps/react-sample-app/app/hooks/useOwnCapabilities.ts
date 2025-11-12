import type {
  FeedOwnCapability,
  Feed,
  FeedsClientState,
  FeedResponse,
} from '@stream-io/feeds-react-sdk';
import { useStateStore } from '@stream-io/feeds-react-sdk';
import { useCallback } from 'react';
import { useUserContext } from '../user-context';

const stableEmptyArray: readonly FeedOwnCapability[] = [];

export const useOwnCapabilities = ({
  feed,
}: {
  feed?: Feed | string | FeedResponse;
}) => {
  const { client } = useUserContext();
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

  return feedOwnCapabilities;
};
