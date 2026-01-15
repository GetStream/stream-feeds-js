import {
  useStateStore,
  type Feed,
  type FeedState,
} from '@stream-io/feeds-react-sdk';
import { ToggleFollowButton } from './ToggleFollowButton';

const selector = (state: FeedState) => ({ createdBy: state.created_by });

export const FeedSearchResult = ({ feed }: { feed: Feed }) => {
  const { createdBy } = useStateStore(feed.state, selector);

  return (
    <div className="w-full flex flex-row items-center gap-2">
      <div className="avatar flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary  flex items-center justify-center text-white text-md font-semibold">
          <span>{createdBy?.name?.[0]}</span>
        </div>
      </div>
      <div className="md:font-semibold flex-grow w-full overflow-hidden text-ellipsis whitespace-nowrap">
        {createdBy?.name}
      </div>
      <ToggleFollowButton userId={createdBy?.id ?? ''} />
    </div>
  );
};
