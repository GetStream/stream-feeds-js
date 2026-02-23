'use client';

import { useClientConnectedUser, useNotificationStatus } from '@stream-io/feeds-react-sdk';
import { type PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
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
    <>
      <MobileTopBar />
      <Dock hasUnreadNotifications={unreadCount > 0} />
      <div className="min-h-dvh w-full max-w-[1144px] mx-auto lg:flex lg:gap-4">
        {/* Desktop left sidebar */}
        <aside className="w-[256px] shrink-0 hidden lg:flex flex-col gap-4 pt-4 pb-4 sticky top-0 h-dvh">
          <div className="px-3">
            <StreamLogo />
          </div>
          <nav className="w-full flex flex-col gap-1">
            <ul className="menu w-full gap-0.5">
              <li><HomeLink /></li>
              <li><PopularLink /></li>
              <li>
                <NotificationsLink>
                  <span className={`bg-primary text-primary-content text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center ${unreadCount > 0 ? 'visible' : 'invisible'}`}>
                    {unreadCount}
                  </span>
                </NotificationsLink>
              </li>
              <li><BookmarksLink /></li>
              <li><ProfileLink /></li>
            </ul>
          </nav>
        </aside>

        {/* Center column */}
        <div className="min-h-dvh w-full max-w-[600px] mx-auto lg:border-x lg:border-base-content/10 pt-14 pb-14 lg:pt-0 lg:pb-0 lg:mx-0">
          <main className="w-full flex flex-col items-stretch justify-start lg:min-h-dvh">
            {children}
          </main>
        </div>

        {/* Desktop right sidebar */}
        <aside className="w-[256px] shrink-0 hidden lg:flex flex-col gap-4 pt-4 pb-4 sticky top-0 h-dvh">
          <SearchInput />
          <FollowSuggestions />
        </aside>
      </div>
    </>
  );
};

const MobileTopBar = () => {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <nav className="lg:hidden w-full fixed top-0 left-0 right-0 z-40 bg-base-100/90 backdrop-blur-lg border-b border-base-content/10 grid grid-cols-[auto_1fr_auto] items-center h-14 px-4">
      <StreamLogo />
      {title ? (
        <>
          <div className="flex justify-center">
            <span className="text-base font-semibold">{title}</span>
          </div>
          <div className="invisible" aria-hidden="true"><StreamLogo /></div>
        </>
      ) : (
        <div />
      )}
    </nav>
  );
};

function getPageTitle(pathname: string): string | null {
  if (pathname.startsWith('/notifications')) return 'Notifications';
  if (pathname.startsWith('/explore')) return 'Popular';
  if (pathname.startsWith('/bookmarks')) return 'Bookmarks';
  return null;
}

const Dock = ({
  hasUnreadNotifications,
}: {
  hasUnreadNotifications: boolean;
}) => {
  const dockLinkClass =
    'relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-base-200 transition-colors';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100/90 backdrop-blur-lg border-t border-base-content/10 pb-[env(safe-area-inset-bottom,0.5rem)]">
      <nav className="dock max-w-[600px] mx-auto h-14">
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
    </div>
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
