import type { UserResponse } from '@stream-io/feeds-react-sdk';
import { formatDistanceToNow } from 'date-fns';
import { useMemo } from 'react';
import { Avatar } from '../utility/Avatar';
import { NavLink } from '../utility/NavLink';

export const ContentMetadata = ({
  created_at,
  user,
  children,
  location,
  edited_at,
  withLink = true,
  locationCity,
}: {
  created_at: Date;
  user: UserResponse;
  location: 'comment' | 'activity';
  withLink?: boolean;
  children?: React.ReactNode;
  edited_at?: Date;
  locationCity?: string | null;
}) => {
  const formattedCreatedAt = useMemo(() => {
    return formatDistanceToNow(created_at, { addSuffix: true });
  }, [created_at]);


  const avatarContent = (
    <Avatar
      user={user}
      className={location === 'activity' ? 'size-10 md:size-12' : 'size-8 md:size-10'}
    />
  );

  const isActivity = location === 'activity';

  const nameElement = (
    <span className="font-bold text-[15px] hover:underline truncate">
      {user.name}
    </span>
  );

  const metaContent = isActivity ? (
    <div className="flex flex-col min-w-0">
      {withLink ? (
        <NavLink href={`/profile/${user.id}`}>
          {nameElement}
        </NavLink>
      ) : (
        nameElement
      )}
      <div className="flex flex-row items-center justify-start gap-1 min-w-0 text-base-content/50 text-xs">
        <span className="truncate min-w-[3ch]">
          {formattedCreatedAt}
        </span>
        {edited_at && (
          <span className="flex-shrink-0">(edited)</span>
        )}
        {locationCity && (
          <>
            <span className="flex-shrink-0">·</span>
            <NavLink href={`/search?q=${encodeURIComponent(locationCity)}&tab=places`} className="no-underline inline-flex items-center gap-0.5 flex-shrink-0">
              <span className="material-symbols-outlined text-[14px]!">location_on</span>
              <span className="hover:underline">{locationCity}</span>
            </NavLink>
          </>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-row items-center gap-1 min-w-0">
      {withLink ? (
        <NavLink href={`/profile/${user.id}`}>
          <span className="font-bold text-[15px] hover:underline truncate shrink min-w-[40px]">
            {user.name}
          </span>
        </NavLink>
      ) : (
        <span className="font-bold text-[15px] hover:underline truncate shrink min-w-[40px]">
          {user.name}
        </span>
      )}
      <span className="text-base-content/50 flex-shrink-0">·</span>
      <span className="text-base-content/50 text-[15px] flex-shrink-0">
        {formattedCreatedAt}
      </span>
      {edited_at && (
        <span className="text-base-content/40 text-[15px] flex-shrink-0">(edited)</span>
      )}
    </div>
  );

  return (
    <div className="flex flex-row items-center w-full gap-3">
      {withLink ? (
        <NavLink href={`/profile/${user.id}`} className="flex-shrink-0">
          {avatarContent}
        </NavLink>
      ) : (
        <div className="flex-shrink-0">{avatarContent}</div>
      )}
      <div className="flex-1 min-w-0 flex flex-row items-center justify-between gap-2">
        {metaContent}
        {children}
      </div>
    </div>
  );
};
