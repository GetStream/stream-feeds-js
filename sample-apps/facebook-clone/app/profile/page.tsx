'use client';
import { useFeedContext } from '../feed-context';
import { FeedMetadata } from '../components/FeedMetadata';
import { LoadingIndicator } from '../components/LoadingIndicator';

export default function Profile() {
  const { ownFeed, ownTimeline } = useFeedContext();

  if (!ownFeed || !ownTimeline) {
    return <LoadingIndicator color="blue"></LoadingIndicator>;
  }

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center">Profile</h2>
      <FeedMetadata feed={ownFeed} timeline={ownTimeline}></FeedMetadata>
    </div>
  );
}
