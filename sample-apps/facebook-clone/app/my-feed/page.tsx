'use client';
import { Feed } from '../components/Feed';
import { useFeedContext } from '../feed-context';

export default function MyFeed() {
  const { ownFeed } = useFeedContext();

  if (!ownFeed) {
    return '';
  }

  return <Feed readOnly={false} feed={ownFeed}></Feed>;
}
