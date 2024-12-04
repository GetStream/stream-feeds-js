'use client';
import { Feed } from '../components/Feed';
import { useFeedContext } from '../feed-context';

export default function Home() {
  const { ownFeed } = useFeedContext();

  if (!ownFeed) {
    return '';
  }

  return <Feed feed={ownFeed}></Feed>;
}
