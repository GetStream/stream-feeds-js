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

export const FeedSearchResult = ({ feed }: { feed: Feed }) => {
  const { createdBy, ownFollowings, groupId, feedId, name, activityCount } = useStateStore(
    feed.state,
    selector,
  );
  const isHashtag = groupId === 'hashtag';
  const followsUs = feedOwnerFollowsUs(ownFollowings);

  if (isHashtag) {
    return (
      <div className="w-full flex flex-row items-center gap-3 py-3 hover:bg-base-300/30 transition-colors -mx-1 px-1 rounded-lg">
        <NavLink
          className="flex-1 flex flex-row items-center gap-3 min-w-0"
          href={`/hashtag/${feedId}`}
        >
          <div className="size-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">
              tag
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-[15px] truncate hover:underline">
              #{name || feedId}
            </span>
            <div className="text-[13px] text-base-content/50">
              {activityCount ?? 0} {activityCount === 1 ? 'post' : 'posts'}
            </div>
          </div>
        </NavLink>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row items-center gap-3 py-3 hover:bg-base-300/30 transition-colors -mx-1 px-1 rounded-lg">
      <NavLink
        className="flex-1 flex flex-row items-center gap-3 min-w-0"
        href={`/profile/${createdBy?.id}`}
      >
        <Avatar user={createdBy} className="size-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[15px] truncate hover:underline">
              {createdBy?.name}
            </span>
            {followsUs && (
              <span
                className="badge badge-sm badge-ghost text-primary font-medium border border-primary/30 bg-primary/5 gap-1 shrink-0"
                title="Follows you"
              >
                Follows you
              </span>
            )}
          </div>
          <div className="text-[15px] text-base-content/50 truncate">
            @{createdBy?.id}
          </div>
        </div>
      </NavLink>
      <div className="shrink-0">
        <ToggleFollowButton userId={createdBy?.id ?? ''} />
      </div>
    </div>
  );
};
