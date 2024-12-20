'use client';
import { Feed } from '../components/Feed';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useFeedContext } from '../feed-context';

export default function Home() {
  const { ownTimeline } = useFeedContext();

  if (!ownTimeline) {
    return <LoadingIndicator color="blue"></LoadingIndicator>;
  }

  return <Feed readOnly={true} feed={ownTimeline}></Feed>;
}
