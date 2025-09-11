import { useEffect, useState } from 'react';
import { useFeedContext } from '../../feed-context';
import { NotificationFeed } from './NotificationFeed';
import { useErrorContext } from '@/app/error-context';
import { useNotificationStatus } from '@stream-io/feeds-react-sdk';

export const NotificationBell = () => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { ownNotifications } = useFeedContext();
  const { unseen = 0 } = useNotificationStatus(ownNotifications) ?? {};

  useEffect(() => {
    if (!isMenuOpen || unseen <= 0) return;

    ownNotifications
      ?.markActivity({
        mark_seen: ownNotifications.state
          .getLatestValue()
          .aggregated_activities!.map((a) => a.group),
      })
      .catch(logErrorAndDisplayNotification);
  }, [isMenuOpen, logErrorAndDisplayNotification, ownNotifications, unseen]);

  return (
    <div className="relative">
      <button
        title="Notifications"
        onClick={() => setIsMenuOpen((open) => !open)}
        id="dropdownButton"
        className="flex"
      >
        <div className="material-symbols-outlined">notifications</div>
        {unseen > 0 && (
          <div className="rounded-full bg-red-500 text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
            {unseen}
          </div>
        )}
      </button>
      <div
        className={`absolute right-0 mt-2 p-4 min-w-80 flex z-10 flex-col gap-3 text-gray-800 bg-white rounded-md shadow-lg ${isMenuOpen ? '' : 'hidden'}`}
      >
        <NotificationFeed isMenuOpen={isMenuOpen} />
      </div>
    </div>
  );
};
