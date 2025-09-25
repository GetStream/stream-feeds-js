import { useMemo } from 'react';
import { type Feed, FeedOwnCapability, type FeedsClientState } from '@self';
import { useStateStore } from '@stream-io/state-store/react-bindings';
import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useFeedsClient } from '../../contexts/StreamFeedsContext';
import { useStableCallback } from '../internal';

const stableEmptyArray: readonly FeedOwnCapability[] = [];

type KebabToSnakeCase<S extends string> = S extends `${infer T}-${infer U}`
  ? `${T}_${KebabToSnakeCase<U>}`
  : S;

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

  return useMemo(() => {
    const capabilitiesSet = new Set(feedOwnCapabilities);
    return {
      can_add_activity: capabilitiesSet.has(FeedOwnCapability.ADD_ACTIVITY),
      can_add_activity_bookmark: capabilitiesSet.has(
        FeedOwnCapability.ADD_ACTIVITY_BOOKMARK,
      ),
      can_add_activity_reaction: capabilitiesSet.has(
        FeedOwnCapability.ADD_ACTIVITY_REACTION,
      ),
      can_add_comment: capabilitiesSet.has(FeedOwnCapability.ADD_COMMENT),
      can_add_comment_reaction: capabilitiesSet.has(
        FeedOwnCapability.ADD_COMMENT_REACTION,
      ),
      can_create_feed: capabilitiesSet.has(FeedOwnCapability.CREATE_FEED),
      can_delete_any_activity: capabilitiesSet.has(
        FeedOwnCapability.DELETE_ANY_ACTIVITY,
      ),
      can_delete_any_comment: capabilitiesSet.has(
        FeedOwnCapability.DELETE_ANY_COMMENT,
      ),
      can_delete_feed: capabilitiesSet.has(FeedOwnCapability.DELETE_FEED),
      can_delete_own_activity: capabilitiesSet.has(
        FeedOwnCapability.DELETE_OWN_ACTIVITY,
      ),
      can_delete_own_activity_bookmark: capabilitiesSet.has(
        FeedOwnCapability.DELETE_OWN_ACTIVITY_BOOKMARK,
      ),
      can_delete_own_activity_reaction: capabilitiesSet.has(
        FeedOwnCapability.DELETE_OWN_ACTIVITY_REACTION,
      ),
      can_delete_own_comment: capabilitiesSet.has(
        FeedOwnCapability.DELETE_OWN_COMMENT,
      ),
      can_delete_own_comment_reaction: capabilitiesSet.has(
        FeedOwnCapability.DELETE_OWN_COMMENT_REACTION,
      ),
      can_follow: capabilitiesSet.has(FeedOwnCapability.FOLLOW),
      can_pin_activity: capabilitiesSet.has(FeedOwnCapability.PIN_ACTIVITY),
      can_query_feed_members: capabilitiesSet.has(
        FeedOwnCapability.QUERY_FEED_MEMBERS,
      ),
      can_query_follows: capabilitiesSet.has(FeedOwnCapability.QUERY_FOLLOWS),
      can_read_activities: capabilitiesSet.has(
        FeedOwnCapability.READ_ACTIVITIES,
      ),
      can_read_feed: capabilitiesSet.has(FeedOwnCapability.READ_FEED),
      can_unfollow: capabilitiesSet.has(FeedOwnCapability.UNFOLLOW),
      can_update_any_activity: capabilitiesSet.has(
        FeedOwnCapability.UPDATE_ANY_ACTIVITY,
      ),
      can_update_any_comment: capabilitiesSet.has(
        FeedOwnCapability.UPDATE_ANY_COMMENT,
      ),
      can_update_feed: capabilitiesSet.has(FeedOwnCapability.UPDATE_FEED),
      can_update_feed_followers: capabilitiesSet.has(
        FeedOwnCapability.UPDATE_FEED_FOLLOWERS,
      ),
      can_update_feed_members: capabilitiesSet.has(
        FeedOwnCapability.UPDATE_FEED_MEMBERS,
      ),
      can_update_own_activity: capabilitiesSet.has(
        FeedOwnCapability.UPDATE_OWN_ACTIVITY,
      ),
      can_update_own_activity_bookmark: capabilitiesSet.has(
        FeedOwnCapability.UPDATE_OWN_ACTIVITY_BOOKMARK,
      ),
      can_update_own_comment: capabilitiesSet.has(
        FeedOwnCapability.UPDATE_OWN_COMMENT,
      ),
    } satisfies Record<
      `can_${KebabToSnakeCase<
        (typeof FeedOwnCapability)[keyof typeof FeedOwnCapability]
      >}`,
      boolean
    >;
  }, [feedOwnCapabilities]);
};
