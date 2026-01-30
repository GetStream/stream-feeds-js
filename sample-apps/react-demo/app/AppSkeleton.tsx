'use client';

import { useClientConnectedUser, useNotificationStatus } from '@stream-io/feeds-react-sdk';
import { type PropsWithChildren } from 'react';
import { FollowSuggestions } from './components/FollowSuggestions';
import { useOwnFeedsContext } from './own-feeds-context';
import { SearchInput } from './components/utility/SearchInput';
import { MenuNavLink } from './components/utility/NavLink';

export const AppSkeleton = ({ children }: PropsWithChildren) => {
  const { ownNotifications } = useOwnFeedsContext();
  const notificationStatus = useNotificationStatus(ownNotifications);
  const unreadCount = notificationStatus?.unread ?? 0;

  return (
    <div className="h-full max-h-full w-full max-w-7xl mx-auto">
      <div className="drawer h-full max-h-full lg:drawer-open">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content max-h-full min-h-0 h-full max-h-full flex flex-col gap-1 items-center justify-center">
          <nav className="hidden md:flex lg:hidden navbar w-full bg-base-100">
            <div className="flex-none lg:hidden">
              <label
                htmlFor="my-drawer"
                className="drawer-button btn btn-square btn-ghost"
              >
                <span className="material-symbols-outlined">menu</span>
              </label>
            </div>
          </nav>
          <div className="h-full max-h-full overflow-y-auto w-full md:p-10 p-4 flex flex-row gap-10 items-start justify-center">
            <div className="h-full max-h-full lg:w-[70%] w-full flex flex-col items-center justify-start">
              <div className="w-full h-full max-h-full">
                {children}
              </div>
            </div>
            <div className="lg:flex hidden w-[30%] flex-col items-stretch justify-start gap-4">
              <SearchInput />
              <FollowSuggestions />
            </div>
          </div>
          <Dock hasUnreadNotifications={unreadCount > 0} />
        </div>
        <DrawerSide unreadCount={unreadCount} />
      </div>
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
      <ul className="menu min-h-full w-60 p-4">
        <li>
          <HomeLink />
        </li>
        <li>
          <PopularLink />
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
          <BookmarksLink />
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
            <div className="badge badge-primary h-[0.25rem] w-[0.25rem] p-[0.25rem] absolute left-[60%] top-[15%]" />
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
  return <MenuNavLink href="/home" icon="home" label="Home" />;
};

const PopularLink = () => {
  return <MenuNavLink href="/explore" icon="whatshot" label="Popular" />;
};

const ExploreLink = () => {
  return <MenuNavLink href="/explore" icon="search" />;
};

const NotificationsLink = ({ children }: { children?: React.ReactNode }) => {
  return (
    <MenuNavLink href="/notifications" icon="notifications" label="Notifications">
      {children}
    </MenuNavLink>
  );
};

const ProfileLink = () => {
  const currentUser = useClientConnectedUser();

  return <MenuNavLink href={`/profile/${currentUser?.id}`} icon="account_circle" label="Profile" />;
};

const AddLink = () => {
  return <MenuNavLink href="/activity-compose" icon="add" label="Add" />;
};

const BookmarksLink = () => {
  return <MenuNavLink href="/bookmarks" icon="bookmark" label="Bookmarks" />;
};
