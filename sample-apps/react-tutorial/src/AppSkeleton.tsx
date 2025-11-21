import {
  useClientConnectedUser,
  useNotificationStatus,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useRef, useState } from 'react';
import { FollowSuggestions } from './components/FollowSuggestions';
import { useOwnFeedsContext } from './own-feeds-context';
import { Explore } from './pages/Explore';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { Home } from './pages/Home';
import { SearchResults } from './pages/SearchResults';

export const AppSkeleton = () => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'notifications' | 'profile' | 'explore' | 'search'
  >('home');
  const currentUser = useClientConnectedUser();
  const { ownNotifications } = useOwnFeedsContext();
  const notificationStatus = useNotificationStatus(ownNotifications);
  const unreadCount = notificationStatus?.unread ?? 0;
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchClicked = useCallback(() => {
    setSearchQuery(searchInputRef.current?.value ?? '');
    setActiveTab('search');
  }, []);

  if (!currentUser || !ownNotifications) {
    return 'Connecting...';
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        <nav className="lg:hidden navbar w-full bg-base-100">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer"
              className="drawer-button btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                {' '}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>{' '}
              </svg>
            </label>
          </div>
        </nav>
        <div className="h-full w-full p-10 flex flex-row gap-10 items-start justify-center">
          <div className="h-full w-[70%] flex flex-col items-center justify-start">
            <div className="w-full">
              {activeTab === 'home' && <Home />}
              {activeTab === 'explore' && <Explore />}
              {activeTab === 'notifications' && <Notifications />}
              {activeTab === 'profile' && <Profile />}
              {activeTab === 'search' && (
                <SearchResults searchQuery={searchQuery} />
              )}
            </div>
          </div>
          <div className="w-[30%] flex flex-col items-stretch justify-start gap-4">
            <div className="join w-full">
              <div className="w-full">
                <label className="input join-item">
                  <input ref={searchInputRef} placeholder="🔍 Search..." />{' '}
                </label>
              </div>
              <button
                onClick={searchClicked}
                className="btn btn-soft btn-primary join-item"
              >
                Search
              </button>
            </div>

            <FollowSuggestions />
          </div>
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 min-h-full w-60 p-4">
          <li onClick={() => setActiveTab('home')}>
            <a className="flex flex-row items-center gap-2">
              <div>🏠</div>
              <div>Home</div>
            </a>
          </li>
          <li onClick={() => setActiveTab('explore')}>
            <a className="flex flex-row items-center gap-2">
              <div>🆕</div>
              <div>Explore</div>
            </a>
          </li>
          <li onClick={() => setActiveTab('notifications')}>
            <a className="flex flex-row items-center gap-2">
              <div>🔔</div>
              <div>Notifications</div>
              {unreadCount > 0 && (
                <div className="badge badge-primary badge-xs">
                  {unreadCount}
                </div>
              )}
            </a>
          </li>
          <li onClick={() => setActiveTab('profile')}>
            <a className="flex flex-row items-center gap-2">
              <div>👤</div>
              <div>Profile</div>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
