import { useOwnFeedsContext } from '@/contexts/OwnFeedsContext';
import { useNotificationStatus } from '@stream-io/feeds-react-native-sdk';
import { useStableCallback } from '@/hooks/useStableCallback';
import React, { useEffect } from 'react';
import { NavigationBackButton } from '@/components/Buttons';

export const NotificationBackButton = () => {
  const { ownNotificationFeed } = useOwnFeedsContext();
  const { unseen = 0 } = useNotificationStatus(ownNotificationFeed) ?? {};

  const markSeen = useStableCallback(async () => {
    try {
      if (unseen > 0) {
        await ownNotificationFeed?.markActivity({
          mark_all_seen: true,
        });
      }
    } catch (error) {
      console.error(
        `An error has occurred while marking notifications as seen for feed ${ownNotificationFeed?.feed}: `,
        error,
      );
    }
  });

  useEffect(() => {
    markSeen();
  }, [markSeen]);

  return <NavigationBackButton preNavigationCallback={markSeen} />;
};
