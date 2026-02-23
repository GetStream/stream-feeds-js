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
  withAvatar = true,
  locationCity,
  badge,
}: {
  created_at: Date;
  user: UserResponse;
  location: 'comment' | 'activity';
  withLink?: boolean;
  withAvatar?: boolean;
  children?: React.ReactNode;
  edited_at?: Date;
  locationCity?: string | null;
  badge?: React.ReactNode;
}) => {
  const formattedCreatedAt = useMemo(() => {
    return formatDistanceToNow(created_at, { addSuffix: true });
  }, [created_at]);

  const avatarContent = (
    <Avatar
      user={user}
      className={location === 'activity' ? 'size-10' : 'size-8 md:size-10'}
    />
  );

  const nameElement = withLink ? (
    <NavLink href={`/profile/${user.id}`}>
      <span className="font-semibold text-[15px] hover:underline truncate shrink min-w-[40px]">
        {user.name}
      </span>
    </NavLink>
  ) : (
    <span className="font-semibold text-[15px] truncate shrink min-w-[40px]">
      {user.name}
    </span>
  );

  const metaContent = (
    <div className="flex flex-row items-center gap-1 min-w-0">
      {nameElement}
      <span className="text-base-content/70 flex-shrink-0">·</span>
      <span className="text-base-content/70 text-[13px] flex-shrink-0">
        {formattedCreatedAt}
      </span>
      {edited_at && (
        <span className="text-base-content/60 text-[13px] flex-shrink-0">(edited)</span>
      )}
      {locationCity && (
        <>
          <span className="text-base-content/70 flex-shrink-0">·</span>
          <NavLink href={`/search?q=${encodeURIComponent(locationCity)}&tab=places`} className="no-underline inline-flex items-center gap-0.5 flex-shrink-0 text-base-content/70 text-[13px]">
            <span className="material-symbols-outlined text-[14px]!">location_on</span>
            <span className="hover:underline">{locationCity}</span>
          </NavLink>
        </>
      )}
      {badge}
    </div>
  );

  return (
    <div className="flex flex-row items-center w-full gap-3">
      {withAvatar && (
        withLink ? (
          <NavLink href={`/profile/${user.id}`} className="flex-shrink-0">
            {avatarContent}
          </NavLink>
        ) : (
          <div className="flex-shrink-0">{avatarContent}</div>
        )
      )}
      <div className="flex-1 min-w-0 flex flex-row items-center justify-between gap-2">
        {metaContent}
        {children && (
          <div className="flex items-center gap-2 -my-2 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
