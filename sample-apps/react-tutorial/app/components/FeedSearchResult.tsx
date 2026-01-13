import type { FeedResponse, FeedState } from '@stream-io/feeds-react-sdk';
import { ToggleFollowButton } from './ToggleFollowButton';

export const FeedSearchResult = ({
  feed,
}: {
  feed: FeedResponse | FeedState;
}) => {
  return (
    <div className="w-full flex flex-row items-center gap-2">
      <div className="avatar flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary  flex items-center justify-center text-white text-md font-semibold">
          <span>{feed.created_by?.name?.[0]}</span>
        </div>
      </div>
      <div className="font-semibold flex-grow w-full overflow-hidden text-ellipsis whitespace-nowrap">
        {feed.created_by?.name}
      </div>
      <ToggleFollowButton userId={feed.created_by?.id ?? ''} />
    </div>
  );
};
