'use client';
import { ActivityComposer } from '../components/ActivityComposer';
import { Feed } from '../components/Feed';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useFeedContext } from '../feed-context';

export default function MyFeed() {
  const { ownFeed } = useFeedContext();

  if (!ownFeed) {
    return <LoadingIndicator color="blue"></LoadingIndicator>;
  }

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <ActivityComposer feed={ownFeed}></ActivityComposer>
      <Feed feed={ownFeed} onNewPost="show-immediately"></Feed>
    </div>
  );
}
