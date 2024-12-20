'use client';
import { Feed } from '../components/Feed';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useFeedContext } from '../feed-context';

export default function MyFeed() {
  const { ownFeed } = useFeedContext();

  if (!ownFeed) {
    return <LoadingIndicator color="blue"></LoadingIndicator>;
  }

  return <Feed readOnly={false} feed={ownFeed}></Feed>;
}
