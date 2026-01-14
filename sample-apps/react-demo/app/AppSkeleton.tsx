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
        <Dock hasUnreadNotifications={unreadCount > 0} />
      </div>
      <DrawerSide unreadCount={unreadCount} />
    </div>
  );
};

const DrawerSide = ({ unreadCount }: { unreadCount: number }) => {
  return (
    <div className="drawer-side">
      <label
        htmlFor="my-drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <ul className="menu bg-base-200 min-h-full w-60 p-4">
        <li>
          <HomeLink />
        </li>
        <li>
          <ExploreLink />
        </li>
        <li>
          <NotificationsLink>
            {unreadCount > 0 && (
              <div className="badge badge-primary badge-xs position-absolute left-23">
                {unreadCount}
              </div>
            )}
          </NotificationsLink>
        </li>
        <li>
          <ProfileLink />
        </li>
      </ul>
    </div>
  );
};

const Dock = ({
  hasUnreadNotifications,
}: {
  hasUnreadNotifications: boolean;
}) => {
  return (
    <div className="dock md:hidden w-full">
      <button>
        <HomeLink />
      </button>

      <button>
        <ExploreLink />
      </button>

      <button>
        <AddLink />
      </button>

      <button>
        <NotificationsLink>
          {hasUnreadNotifications && (
            <div className="badge badge-primary h-[0.25rem] w-[0.25rem] p-[0.25rem] absolute left-[70%] top-[5%]" />
          )}
        </NotificationsLink>
      </button>

      <button>
        <ProfileLink />
      </button>
    </div>
  );
};

const HomeLink = () => {
  return <NavLink href="/home" icon="home" label="Home" />;
};

const ExploreLink = () => {
  return <NavLink href="/explore" icon="search" label="Explore" />;
};

const NotificationsLink = ({ children }: { children?: React.ReactNode }) => {
  return (
    <NavLink href="/notifications" icon="notifications" label="Notifications">
      {children}
    </NavLink>
  );
};

const ProfileLink = () => {
  return <NavLink href="/profile" icon="account_circle" label="Profile" />;
};

const AddLink = () => {
  return <NavLink href="/add" icon="add" label="Add" />;
};

const NavLink = ({
  href,
  icon,
  label,
  children,
}: {
  href: string;
  icon: string;
  label: string;
  children?: React.ReactNode;
}) => {
  const currentUser = useClientConnectedUser();
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Link
      href={`${href}?user_id=${currentUser?.id}`}
      className={`flex flex-row items-center gap-2 ${
        isActive ? 'text-primary' : ''
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <div className="hidden md:block">{label}</div>
      {children}
    </Link>
  );
};
