import {
  useStateStore,
  type Feed,
  type FeedState,
} from '@stream-io/feeds-react-sdk';
import { ToggleFollowButton } from './ToggleFollowButton';
import { Avatar } from './utility/Avatar';
import { NavLink } from './utility/NavLink';

const selector = (state: FeedState) => ({ createdBy: state.created_by });

export const FeedSearchResult = ({ feed }: { feed: Feed }) => {
  const { createdBy } = useStateStore(feed.state, selector);

  return (
    <div className="w-full flex flex-row items-center justify-stretch gap-2 min-w-0">
      <NavLink className="w-full h-full flex flex-row items-center justify-stretch gap-2 min-w-0" href={`/profile/${createdBy?.id}`}>
        <Avatar user={createdBy} className="size-8 shrink-0" />
        <div className="md:font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
          {createdBy?.name}
        </div>
      </NavLink>
      <ToggleFollowButton userId={createdBy?.id ?? ''} />
    </div>
  );
};
