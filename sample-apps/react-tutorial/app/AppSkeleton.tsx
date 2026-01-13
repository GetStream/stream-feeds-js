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
    <div className="drawer h-full max-h-full lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content max-h-full min-h-0 h-full max-h-full flex flex-col gap-1 items-center justify-center">
        <nav className="hidden md:flex lg:hidden navbar w-full bg-base-100">
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
        <div className="h-full max-h-full overflow-y-auto w-full p-10 flex flex-row gap-10 items-start justify-center">
          <div className="h-full max-h-full lg:w-[70%] w-full flex flex-col items-center justify-start">
            <div className="w-full max-h-full">{children}</div>
          </div>
          <div className="lg:flex hidden w-[30%] flex-col items-stretch justify-start gap-4">
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
        <div className="dock md:hidden w-full">
          <button>
            <HomeLink
              href={`/home?user_id=${currentUser.id}`}
              isActive={isActive('/home')}
            />
          </button>

          <button>
            <ExploreLink
              href={`/explore?user_id=${currentUser.id}`}
              isActive={isActive('/explore')}
            />
          </button>

          <button className="dock-active">
            <AddLink
              href={`/add?user_id=${currentUser.id}`}
              isActive={isActive('/add')}
            />
          </button>

          <button>
            <NotificationsLink
              href={`/notifications?user_id=${currentUser.id}`}
              isActive={isActive('/notifications')}
            />
          </button>

          <button>
            <ProfileLink
              href={`/profile?user_id=${currentUser.id}`}
              isActive={isActive('/profile')}
            />
          </button>
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
            <HomeLink
              href={`/home?user_id=${currentUser.id}`}
              isActive={isActive('/home')}
            />
          </li>
          <li>
            <ExploreLink
              href={`/explore?user_id=${currentUser.id}`}
              isActive={isActive('/explore')}
            />
          </li>
          <li>
            <NotificationsLink
              href={`/notifications?user_id=${currentUser.id}`}
              isActive={isActive('/notifications')}
            />
          </li>
          <li>
            <ProfileLink
              href={`/profile?user_id=${currentUser.id}`}
              isActive={isActive('/profile')}
            />
          </li>
        </ul>
      </div>
    </div>
  );
};

const HomeLink = ({ href, isActive }: { href: string; isActive: boolean }) => {
  return (
    <Link
      href={href}
      className={`flex flex-row items-center gap-2 ${
        isActive ? 'text-primary' : ''
      }`}
    >
      <span className="material-symbols-outlined">home</span>
      <div className="hidden md:block">Home</div>
    </Link>
  );
};

const ExploreLink = ({
  href,
  isActive,
}: {
  href: string;
  isActive: boolean;
}) => {
  return (
    <Link
      href={href}
      className={`flex flex-row items-center gap-2 ${
        isActive ? 'text-primary' : ''
      }`}
    >
      <span className="material-symbols-outlined">search</span>
      <div className="hidden md:block">Explore</div>
    </Link>
  );
};

const NotificationsLink = ({
  href,
  isActive,
}: {
  href: string;
  isActive: boolean;
}) => {
  return (
    <Link
      href={href}
      className={`flex flex-row items-center gap-2 ${
        isActive ? 'text-primary' : ''
      }`}
    >
      <span className="material-symbols-outlined">notifications</span>
      <div className="hidden md:block">Notifications</div>
    </Link>
  );
};

const ProfileLink = ({
  href,
  isActive,
}: {
  href: string;
  isActive: boolean;
}) => {
  return (
    <Link
      href={href}
      className={`flex flex-row items-center gap-2 ${
        isActive ? 'text-primary' : ''
      }`}
    >
      <span className="material-symbols-outlined">account_circle</span>
      <div className="hidden md:block">Profile</div>
    </Link>
  );
};

const AddLink = ({ href, isActive }: { href: string; isActive: boolean }) => {
  return (
    <Link
      href={href}
      className={`flex flex-row items-center gap-2 ${
        isActive ? 'text-primary' : ''
      }`}
    >
      <span className="material-symbols-outlined">add</span>
      <div className="hidden md:block">Add</div>
    </Link>
  );
};
