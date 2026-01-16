import {
  useStateStore,
  type Feed,
  type FeedState,
} from '@stream-io/feeds-react-sdk';
import { ToggleFollowButton } from './ToggleFollowButton';
import { Avatar } from './utility/Avatar';

const selector = (state: FeedState) => ({ createdBy: state.created_by });

export const FeedSearchResult = ({ feed }: { feed: Feed }) => {
  const { createdBy } = useStateStore(feed.state, selector);

  return (
    <div className="w-full flex flex-row items-center gap-2">
      <div className="size-8">
        <Avatar user={createdBy} />
      </div>
      <div className="md:font-semibold flex-grow w-full overflow-hidden text-ellipsis whitespace-nowrap">
        {createdBy?.name}
      </div>
      <ToggleFollowButton userId={createdBy?.id ?? ''} />
    </div>
  );
};
