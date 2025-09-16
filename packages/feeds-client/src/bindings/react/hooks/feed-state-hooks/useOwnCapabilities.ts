import { useMemo } from 'react';
import { type Feed, type FeedState, FeedOwnCapability } from '@self';
import { useStateStore } from '@stream-io/state-store/react-bindings';
import { useFeedContext } from '../../contexts/StreamFeedContext';

const stableEmptyArray: readonly FeedOwnCapability[] = [];

const selector = (currentState: FeedState) => ({
  oc: currentState.own_capabilities ?? stableEmptyArray,
});

type KebabToSnakeCase<S extends string> = S extends `${infer T}-${infer U}`
  ? `${T}_${KebabToSnakeCase<U>}`
  : S;

export const useOwnCapabilities = (feedFromProps?: Feed) => {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  const { oc = stableEmptyArray } = useStateStore(feed?.state, selector) ?? {};

  return useMemo(
    () =>
      ({
        can_add_activity: oc.indexOf(FeedOwnCapability.ADD_ACTIVITY) > -1,
        can_add_activity_reaction:
          oc.indexOf(FeedOwnCapability.ADD_ACTIVITY_REACTION) > -1,
        can_add_comment: oc.indexOf(FeedOwnCapability.ADD_COMMENT) > -1,
        can_add_comment_reaction:
          oc.indexOf(FeedOwnCapability.ADD_COMMENT_REACTION) > -1,
        can_bookmark_activity:
          oc.indexOf(FeedOwnCapability.BOOKMARK_ACTIVITY) > -1,
        can_create_feed: oc.indexOf(FeedOwnCapability.CREATE_FEED) > -1,
        can_delete_bookmark: oc.indexOf(FeedOwnCapability.DELETE_BOOKMARK) > -1,
        can_delete_comment: oc.indexOf(FeedOwnCapability.DELETE_COMMENT) > -1,
        can_delete_feed: oc.indexOf(FeedOwnCapability.DELETE_FEED) > -1,
        can_edit_bookmark: oc.indexOf(FeedOwnCapability.EDIT_BOOKMARK) > -1,
        can_follow: oc.indexOf(FeedOwnCapability.FOLLOW) > -1,
        can_remove_activity: oc.indexOf(FeedOwnCapability.REMOVE_ACTIVITY) > -1,
        can_remove_activity_reaction:
          oc.indexOf(FeedOwnCapability.REMOVE_ACTIVITY_REACTION) > -1,
        can_remove_comment_reaction:
          oc.indexOf(FeedOwnCapability.REMOVE_COMMENT_REACTION) > -1,
        can_unfollow: oc.indexOf(FeedOwnCapability.UNFOLLOW) > -1,
        can_update_feed: oc.indexOf(FeedOwnCapability.UPDATE_FEED) > -1,
        can_invite_feed: oc.indexOf(FeedOwnCapability.INVITE_FEED) > -1,
        can_join_feed: oc.indexOf(FeedOwnCapability.JOIN_FEED) > -1,
        can_leave_feed: oc.indexOf(FeedOwnCapability.LEAVE_FEED) > -1,
        can_manage_feed_group:
          oc.indexOf(FeedOwnCapability.MANAGE_FEED_GROUP) > -1,
        can_mark_activity: oc.indexOf(FeedOwnCapability.MARK_ACTIVITY) > -1,
        can_pin_activity: oc.indexOf(FeedOwnCapability.PIN_ACTIVITY) > -1,
        can_query_feed_members:
          oc.indexOf(FeedOwnCapability.QUERY_FEED_MEMBERS) > -1,
        can_query_follows: oc.indexOf(FeedOwnCapability.QUERY_FOLLOWS) > -1,
        can_read_activities: oc.indexOf(FeedOwnCapability.READ_ACTIVITIES) > -1,
        can_read_feed: oc.indexOf(FeedOwnCapability.READ_FEED) > -1,
        can_update_activity: oc.indexOf(FeedOwnCapability.UPDATE_ACTIVITY) > -1,
        can_update_comment: oc.indexOf(FeedOwnCapability.UPDATE_COMMENT) > -1,
        can_update_feed_followers:
          oc.indexOf(FeedOwnCapability.UPDATE_FEED_FOLLOWERS) > -1,
        can_update_feed_members:
          oc.indexOf(FeedOwnCapability.UPDATE_FEED_MEMBERS) > -1,
      }) satisfies Record<
        `can_${KebabToSnakeCase<(typeof FeedOwnCapability)[keyof typeof FeedOwnCapability]>}`,
        boolean
      >,
    [oc],
  );
};
