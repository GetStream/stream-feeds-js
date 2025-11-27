'use client';
import { Feed } from '../components/Feed';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useOwnFeedsContext } from '../own-feeds-context';
import { NewActivity } from '../components/NewActivity';
import { StreamFeed } from '@stream-io/feeds-react-sdk';

export default function Timeline() {
  const { ownTimeline, ownFeed } = useOwnFeedsContext();

  if (!ownTimeline || !ownFeed) {
    return <LoadingIndicator color="blue"></LoadingIndicator>;
  }

  return (
    <div className="w-full flex flex-col items-center gap-5">
      <StreamFeed feed={ownFeed}>
        <NewActivity />
      </StreamFeed>
      <StreamFeed feed={ownTimeline}>
        <Feed />
      </StreamFeed>
    </div>
  );
}
