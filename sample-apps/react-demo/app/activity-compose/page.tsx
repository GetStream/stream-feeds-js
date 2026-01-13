'use client';

import { StreamFeed } from '@stream-io/feeds-react-sdk';
import { ActivityComposer } from '../components/activity/ActivityComposer';
import { useOwnFeedsContext } from '../own-feeds-context';

export default function ActivityComposePage() {
  const { ownFeed } = useOwnFeedsContext();

  if (!ownFeed) {
    return null;
  }

  return (
    <StreamFeed feed={ownFeed}>
      <ActivityComposer />
    </StreamFeed>
  );
}
