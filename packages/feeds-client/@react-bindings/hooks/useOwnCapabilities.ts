import { useMemo } from 'react';
import type { Feed, FeedState } from '../../src/Feed';
import { FeedOwnCapability } from '../../src/gen/models';
import { useStateStore } from './useStateStore';
import { useFeedContext } from '../contexts/StreamFeedContext';

const stableEmptyArray: readonly FeedOwnCapability[] = [];

const selector = (currentState: FeedState) => ({
  oc: currentState.own_capabilities ?? stableEmptyArray,
});

type KebabToCamelCase<S extends string> = S extends `${infer T}-${infer U}`
  ? `${T}${Capitalize<KebabToCamelCase<U>>}`
  : S;

export const useOwnCapabilities = () => {
  const feed = useFeedContext();
  const { oc = stableEmptyArray } = useStateStore(feed?.state, selector) ?? {};

  return useMemo(
    () =>
      ({
        canAddActivity: oc.indexOf(FeedOwnCapability.ADD_ACTIVITY) > -1,
        canAddActivityReaction:
          oc.indexOf(FeedOwnCapability.ADD_ACTIVITY_REACTION) > -1,
        canAddComment: oc.indexOf(FeedOwnCapability.ADD_COMMENT) > -1,
        canAddCommentReaction:
          oc.indexOf(FeedOwnCapability.ADD_COMMENT_REACTION) > -1,
        canBookmarkActivity:
          oc.indexOf(FeedOwnCapability.BOOKMARK_ACTIVITY) > -1,
        canCreateFeed: oc.indexOf(FeedOwnCapability.CREATE_FEED) > -1,
        canDeleteBookmark: oc.indexOf(FeedOwnCapability.DELETE_BOOKMARK) > -1,
        canDeleteComment: oc.indexOf(FeedOwnCapability.DELETE_COMMENT) > -1,
        canDeleteFeed: oc.indexOf(FeedOwnCapability.DELETE_FEED) > -1,
        canEditBookmark: oc.indexOf(FeedOwnCapability.EDIT_BOOKMARK) > -1,
        canFollow: oc.indexOf(FeedOwnCapability.FOLLOW) > -1,
        canRemoveActivity: oc.indexOf(FeedOwnCapability.REMOVE_ACTIVITY) > -1,
        canRemoveActivityReaction:
          oc.indexOf(FeedOwnCapability.REMOVE_ACTIVITY_REACTION) > -1,
        canRemoveCommentReaction:
          oc.indexOf(FeedOwnCapability.REMOVE_COMMENT_REACTION) > -1,
        canUnfollow: oc.indexOf(FeedOwnCapability.UNFOLLOW) > -1,
        canUpdateFeed: oc.indexOf(FeedOwnCapability.UPDATE_FEED) > -1,
        canInviteFeed: oc.indexOf(FeedOwnCapability.INVITE_FEED) > -1,
        canJoinFeed: oc.indexOf(FeedOwnCapability.JOIN_FEED) > -1,
        canLeaveFeed: oc.indexOf(FeedOwnCapability.LEAVE_FEED) > -1,
        canManageFeedGroup:
          oc.indexOf(FeedOwnCapability.MANAGE_FEED_GROUP) > -1,
        canMarkActivity: oc.indexOf(FeedOwnCapability.MARK_ACTIVITY) > -1,
        canPinActivity: oc.indexOf(FeedOwnCapability.PIN_ACTIVITY) > -1,
        canQueryFeedMembers:
          oc.indexOf(FeedOwnCapability.QUERY_FEED_MEMBERS) > -1,
        canQueryFollows: oc.indexOf(FeedOwnCapability.QUERY_FOLLOWS) > -1,
        canReadActivities: oc.indexOf(FeedOwnCapability.READ_ACTIVITIES) > -1,
        canReadFeed: oc.indexOf(FeedOwnCapability.READ_FEED) > -1,
        canUpdateActivity: oc.indexOf(FeedOwnCapability.UPDATE_ACTIVITY) > -1,
        canUpdateComment: oc.indexOf(FeedOwnCapability.UPDATE_COMMENT) > -1,
        canUpdateFeedFollowers:
          oc.indexOf(FeedOwnCapability.UPDATE_FEED_FOLLOWERS) > -1,
        canUpdateFeedMembers:
          oc.indexOf(FeedOwnCapability.UPDATE_FEED_MEMBERS) > -1,
      }) satisfies Record<
        `can${Capitalize<KebabToCamelCase<(typeof FeedOwnCapability)[keyof typeof FeedOwnCapability]>>}`,
        boolean
      >,
    [oc],
  );
};
