'use client';

import { StreamFeed, useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import { ActivityComposer } from '../components/activity/ActivityComposer';
import { useOwnFeedsContext } from '../own-feeds-context';
import { useNavigation } from '../utility/navigation';
import { Avatar } from '../components/utility/Avatar';

export default function ActivityComposePage() {
  const { ownFeed } = useOwnFeedsContext();
  const currentUser = useClientConnectedUser();

  const navigateToHome = useNavigation('/');

  if (!ownFeed) {
    return null;
  }

  return (
    <div className="w-full min-h-[calc(100dvh-8rem)] md:min-h-0 flex flex-col">
      <div className="flex items-center justify-between pb-4 mb-4">
        <span className="font-bold text-lg">New Post</span>
      </div>
      <div className="flex-1 flex gap-3">
        <Avatar user={currentUser} className="size-10 shrink-0" />
        <div className="flex-1">
          <StreamFeed feed={ownFeed}>
            <ActivityComposer onSave={navigateToHome} rows={4} />
          </StreamFeed>
        </div>
      </div>
    </div>
  );
}
