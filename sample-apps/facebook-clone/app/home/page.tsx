'use client';
import { Feed } from '../components/Feed';
import { useFeedContext } from '../feed-context';

export default function Home() {
  const { ownTimeline } = useFeedContext();

  if (!ownTimeline) {
    return '';
  }

  return <Feed readOnly={true} feed={ownTimeline}></Feed>;
}
