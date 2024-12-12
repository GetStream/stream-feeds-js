import { useEffect, useState } from 'react';
import { useFeedContext } from '../../feed-context';
import { NotificationFeed } from './NotificationFeed';
import { usePathname, useRouter } from 'next/navigation';

export const NotificationBell = () => {
  const [unseen, setUnseen] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const { ownNotifications } = useFeedContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({ unseen: state.unseen }),
      ({ unseen }) => {
        setUnseen(unseen ?? 0);
      },
    );

    return unsubscribe;
  }, [ownNotifications]);

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({ has_next_page: state.has_next_page }),
      ({ has_next_page }) => {
        setHasNextPage(has_next_page);
      },
    );

    return unsubscribe;
  }, [ownNotifications]);

  useEffect(() => {
    if (isMenuOpen && unseen > 0) {
      ownNotifications
        ?.read({ limit: 30, offset: 0, mark_seen: 'current' })
        .then(() => {
          ownNotifications
            ?.read({
              limit: 30,
              offset: 0,
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    }
  }, [isMenuOpen, unseen]);

  const navigateToNotifications = () => {
    if (pathname !== '/my-notifications') {
      router.push('my-notifications');
    }
    setIsMenuOpen(false);
  };

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
            <div className="rounded-full bg-red-500 text-xs p-0.5 px-1.5">
              {unseen}
            </div>
          )}
        </button>
        <div
          className={`absolute right-0 mt-2 p-4 min-w-80 flex flex-col gap-3  bg-white rounded-md shadow-lg ${isMenuOpen ? '' : 'hidden'}`}
        >
          <NotificationFeed
            loadMoreText={
              hasNextPage
                ? 'See all unread notifications'
                : 'See all notifications'
            }
            onLoadMore={() => navigateToNotifications()}
          ></NotificationFeed>
        </div>
      </div>
    </>
  );
};
