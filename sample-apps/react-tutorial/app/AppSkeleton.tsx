'use client';

import {
  useClientConnectedUser,
  useNotificationStatus,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useRef, type PropsWithChildren } from 'react';
import { FollowSuggestions } from './components/FollowSuggestions';
import { useOwnFeedsContext } from './own-feeds-context';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export const AppSkeleton = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useClientConnectedUser();
  const { ownNotifications } = useOwnFeedsContext();
  const notificationStatus = useNotificationStatus(ownNotifications);
  const unreadCount = notificationStatus?.unread ?? 0;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchClicked = useCallback(() => {
    const query = searchInputRef.current?.value ?? '';
    if (query) {
      router.push(
        `/search?q=${encodeURIComponent(query)}&user_id=${currentUser?.id}`,
      );
    }
  }, [router, currentUser?.id]);

  if (!currentUser || !ownNotifications) {
    return 'Connecting...';
  }

  const isActive = (path: string) => pathname === path;

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
            <div className="w-full">{children}</div>
          </div>
          <div className="w-[30%] flex flex-col items-stretch justify-start gap-4">
            <div className="join w-full">
              <div className="w-full">
                <label className="input join-item w-full">
                  <input
                    className="w-full"
                    ref={searchInputRef}
                    placeholder="🔍 Search..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        searchClicked();
                      }
                    }}
                  />{' '}
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
          <li>
            <Link
              href={`/home?user_id=${currentUser.id}`}
              className={`flex flex-row items-center gap-2 ${
                isActive('/home') ? 'active' : ''
              }`}
            >
              <div>🏠</div>
              <div>Home</div>
            </Link>
          </li>
          <li>
            <Link
              href={`/explore?user_id=${currentUser.id}`}
              className={`flex flex-row items-center gap-2 ${
                isActive('/explore') ? 'active' : ''
              }`}
            >
              <div>🆕</div>
              <div>Explore</div>
            </Link>
          </li>
          <li>
            <Link
              href={`/notifications?user_id=${currentUser.id}`}
              className={`flex flex-row items-center gap-2 ${
                isActive('/notifications') ? 'active' : ''
              }`}
            >
              <div>🔔</div>
              <div>Notifications</div>
              {unreadCount > 0 && (
                <div className="badge badge-primary badge-xs">
                  {unreadCount}
                </div>
              )}
            </Link>
          </li>
          <li>
            <Link
              href={`/profile?user_id=${currentUser.id}`}
              className={`flex flex-row items-center gap-2 ${
                isActive('/profile') ? 'active' : ''
              }`}
            >
              <div>👤</div>
              <div>Profile</div>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
