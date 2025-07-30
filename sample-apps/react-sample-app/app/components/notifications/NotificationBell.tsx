import { useEffect, useState } from 'react';
import { useFeedContext } from '../../feed-context';
import { NotificationFeed } from './NotificationFeed';
import { useErrorContext } from '@/app/error-context';

export const NotificationBell = () => {
  const { logError } = useErrorContext();
  const [unseen, setUnseen] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { ownNotifications } = useFeedContext();

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({ unseen: state.notification_status?.unseen ?? 0 }),
      ({ unseen }) => {
        setUnseen(unseen ?? 0);
      },
    );

    return unsubscribe;
  }, [ownNotifications]);

  useEffect(() => {
    if (isMenuOpen && unseen > 0) {
      ownNotifications
        ?.markActivity({
          mark_all_seen: true,
        })
        .catch((error) => {
          logError(error as Error);
        });
    }
  }, [isMenuOpen, unseen]);

  return (
    <>
      <div className="relative">
        <button
          title="Notifications"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          id="dropdownButton"
          className="flex"
        >
          <span className="material-symbols-outlined">notifications</span>
          {unseen > 0 && (
            <div className="rounded-full bg-red-500 text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
              {unseen}
            </div>
          )}
        </button>
        <div
          className={`absolute right-0 mt-2 p-4 min-w-80 flex flex-col gap-3 text-gray-800 bg-white rounded-md shadow-lg ${isMenuOpen ? '' : 'hidden'}`}
        >
          <NotificationFeed isMenuOpen={isMenuOpen}></NotificationFeed>
        </div>
      </div>
    </>
  );
};
