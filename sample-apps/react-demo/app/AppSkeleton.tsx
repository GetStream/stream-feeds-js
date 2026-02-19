'use client';

import { useClientConnectedUser, useNotificationStatus } from '@stream-io/feeds-react-sdk';
import { type PropsWithChildren } from 'react';
import { FollowSuggestions } from './components/FollowSuggestions';
import { useOwnFeedsContext } from './own-feeds-context';
import { SearchInput } from './components/utility/SearchInput';
import { MenuNavLink, NavLink } from './components/utility/NavLink';
import { StreamLogo } from './components/utility/StreamLogo';

export const AppSkeleton = ({ children }: PropsWithChildren) => {
  const { ownNotifications } = useOwnFeedsContext();
  const notificationStatus = useNotificationStatus(ownNotifications);
  const unreadCount = notificationStatus?.unread ?? 0;

  return (
    <div className="min-h-dvh w-full max-w-7xl mx-auto lg:flex">
      {/* Desktop left sidebar */}
      <aside className="w-1/4 hidden lg:flex flex-col items-end py-10 sticky top-0 h-dvh px-4">
        <nav className="flex flex-col gap-1">
          <ul className="menu gap-0.5">
            <li>
              <div className="py-2 mb-2 hover:bg-transparent cursor-default">
                <StreamLogo />
              </div>
            </li>
            <li><HomeLink /></li>
            <li><PopularLink /></li>
            <li>
              <NotificationsLink>
                <span className={`bg-primary text-primary-content text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center ${unreadCount > 0 ? 'visible' : 'invisible'}`}>
                  {unreadCount}
                </span>
              </NotificationsLink>
            </li>
            <li><BookmarksLink /></li>
            <li><ProfileLink /></li>
          </ul>
        </nav>
      </aside>

      {/* Center column: mobile drawer wraps the shared main content */}
      <div className="drawer min-h-dvh lg:w-1/2 lg:border-x lg:border-base-content/20">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content h-dvh overflow-hidden flex flex-col lg:h-auto lg:overflow-visible">
          {/* Mobile/tablet top navbar */}
          <nav className="hidden md:flex lg:hidden navbar w-full bg-base-100 sticky top-0 z-40 border-b border-base-content/20 shrink-0">
            <div className="flex-none">
              <label
                htmlFor="my-drawer"
                className="drawer-button btn btn-square btn-ghost hover:bg-base-200"
              >
                <span className="material-symbols-outlined">menu</span>
              </label>
            </div>
            <div className="flex-1 flex justify-center">
              <StreamLogo />
            </div>
            <div className="w-10"></div>
          </nav>
          <main className="w-full flex flex-col items-stretch justify-start flex-1 min-h-0 overflow-y-auto pb-20 md:pb-10 lg:pb-0 lg:overflow-visible lg:min-h-dvh">
            <div className="w-full min-w-0 self-stretch px-4 pt-4 md:py-8 lg:py-10">
              {children}
            </div>
          </main>
          {/* Spacer reserves space so main scrollbar ends above the dock */}
          <div className="h-20 shrink-0 md:hidden" aria-hidden />
          <Dock hasUnreadNotifications={unreadCount > 0} />
        </div>
        <DrawerSide unreadCount={unreadCount} />
      </div>

      {/* Desktop right sidebar */}
      <aside className="w-1/4 hidden lg:flex flex-col items-start py-10 sticky top-0 h-dvh px-4">
        <div className="w-full flex flex-col gap-4">
          <SearchInput />
          <FollowSuggestions />
        </div>
      </aside>
    </div>
  );
};

const DrawerSide = ({ unreadCount }: { unreadCount: number }) => {
  return (
    <div className="drawer-side z-50">
      <label
        htmlFor="my-drawer"
        aria-label="close sidebar"
        className="drawer-overlay !bg-black/40"
      ></label>
      <div className="min-h-dvh w-[25%] bg-base-100 flex flex-col">
        <div className="p-4">
          <StreamLogo />
        </div>
        <ul className="menu flex-1 px-3 gap-0.5">
          <li>
            <HomeLink />
          </li>
          <li>
            <PopularLink />
          </li>
          <li>
            <NotificationsLink>
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-content text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount}
                </span>
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
    </div>
  );
};

const Dock = ({
  hasUnreadNotifications,
}: {
  hasUnreadNotifications: boolean;
}) => {
  const dockLinkClass =
    'relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-base-200 transition-colors';

  return (
    <nav className="dock md:hidden w-full flex items-center justify-around px-4 py-2">
      <NavLink href="/home" icon="home" iconActiveVariant="color" className={dockLinkClass} />
      <NavLink href="/explore" icon="search" iconActiveVariant="color" className={dockLinkClass} />
      <NavLink href="/activity-compose" icon="add_box" iconActiveVariant="color" className={dockLinkClass} />
      <NavLink href="/notifications" icon="notifications" iconActiveVariant="color" className={dockLinkClass}>
        {hasUnreadNotifications && (
          <span className="absolute top-2.5 right-4 w-2 h-2 bg-primary rounded-full" />
        )}
      </NavLink>
      <DockProfileLink className={dockLinkClass} />
    </nav>
  );
};

const DockProfileLink = ({ className }: { className?: string }) => {
  const currentUser = useClientConnectedUser();

  return (
    <NavLink
      href={`/profile/${currentUser?.id}`}
      icon="person"
      iconActiveVariant="color"
      className={className}
    />
  );
};

const HomeLink = () => {
  return <MenuNavLink href="/home" icon="home" label="Home" />;
};

const PopularLink = () => {
  return <MenuNavLink href="/explore" icon="whatshot" label="Popular" />;
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

const BookmarksLink = () => {
  return <MenuNavLink href="/bookmarks" icon="bookmark" label="Bookmarks" />;
};
