import {
  useStateStore,
  type Feed,
  type FeedState,
} from '@stream-io/feeds-react-sdk';
import { ToggleFollowButton } from './ToggleFollowButton';
import { Avatar } from './utility/Avatar';
import { NavLink } from './utility/NavLink';

const selector = (state: FeedState) => ({
  createdBy: state.created_by,
  ownFollowings: state.own_followings,
  groupId: state.group_id,
  feedId: state.id,
  name: state.name,
  activityCount: state.activity_count,
});

/** True when the feed owner follows the current user (us). */
const feedOwnerFollowsUs = (ownFollowings: FeedState['own_followings']) =>
  Array.isArray(ownFollowings) && ownFollowings.length > 0;

export const FeedSearchResult = ({
  feed,
  showFollowsYouBadge = false,
}: {
  feed: Feed;
  showFollowsYouBadge?: boolean;
}) => {
  const { createdBy, ownFollowings, groupId, feedId, name, activityCount } = useStateStore(
    feed.state,
    selector,
  );
  const isHashtag = groupId === 'hashtag';
  const followsUs = showFollowsYouBadge && feedOwnerFollowsUs(ownFollowings);

  if (isHashtag) {
    return (
      <div className="w-full flex flex-row items-center gap-2.5 px-4 py-2.5 hover:bg-base-200/50 transition-colors">
        <NavLink
          className="flex-1 flex flex-row items-center gap-2.5 min-w-0"
          href={`/hashtag/${feedId}`}
        >
          <div className="size-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[16px]!">
              tag
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-[13px] truncate hover:underline">
              #{name || feedId}
            </span>
            <div className="text-[12px] text-base-content/60">
              {activityCount ?? 0} {activityCount === 1 ? 'post' : 'posts'}
            </div>
          </div>
        </NavLink>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row items-center gap-3 px-4 py-2.5 hover:bg-base-200/50 transition-colors">
      <NavLink
        className="flex-1 flex flex-row items-center gap-2.5 min-w-0"
        href={`/profile/${createdBy?.id}`}
      >
        <Avatar user={createdBy} className="size-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[13px] truncate hover:underline">
              {createdBy?.name}
            </span>
            {followsUs && (
              <span className="text-[11px] text-base-content/60 shrink-0">
                Follows you
              </span>
            )}
          </div>
          <div className="text-[12px] text-base-content/60 truncate">
            @{createdBy?.id}
          </div>
        </div>
      </NavLink>
      <div className="shrink-0">
        <ToggleFollowButton userId={createdBy?.id ?? ''} size="small" />
      </div>
    </div>
  );
};
