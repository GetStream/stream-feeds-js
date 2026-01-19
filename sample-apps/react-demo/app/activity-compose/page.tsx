'use client';

import { StreamFeed } from '@stream-io/feeds-react-sdk';
import { ActivityComposer } from '../components/activity/ActivityComposer';
import { useOwnFeedsContext } from '../own-feeds-context';
import { useNavigation } from '../utility/navigation';

export default function ActivityComposePage() {
  const { ownFeed } = useOwnFeedsContext();

  const navigateToHome = useNavigation('/');

  if (!ownFeed) {
    return null;
  }

  return (
    <StreamFeed feed={ownFeed}>
      <ActivityComposer onSave={navigateToHome} />
    </StreamFeed>
  );
}
