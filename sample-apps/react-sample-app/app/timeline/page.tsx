'use client';
import { Feed } from '../components/Feed';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useFeedContext } from '../own-feeds-context';
import { NewActivity } from '../components/NewActivity';

export default function Timeline() {
  const { ownTimeline, ownFeed } = useFeedContext();

  if (!ownTimeline || !ownFeed) {
    return <LoadingIndicator color="blue"></LoadingIndicator>;
  }

  return (
    <div className="w-full flex flex-col items-center gap-5">
      <NewActivity feed={ownFeed}></NewActivity>
      <Feed feed={ownTimeline}></Feed>
    </div>
  );
}
