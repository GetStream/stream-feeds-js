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
}: {
  created_at: Date;
  user: UserResponse;
  location: 'comment' | 'activity';
  withLink?: boolean;
  children?: React.ReactNode;
  edited_at?: Date;
}) => {
  const formattedCreatedAt = useMemo(() => {
    return formatDistanceToNow(created_at, { addSuffix: true });
  }, [created_at]);

  const formattedEditedAt = useMemo(() => {
    return edited_at ? formatDistanceToNow(edited_at, { addSuffix: true }) : null;
  }, [edited_at]);
  const content = <>
    <Avatar
      user={user}
      className={location === 'activity' ? 'size-10 md:size-12' : 'size-8 md:size-10'}
    />
    <div
      className={`flex ${location === 'activity' ? 'flex-col flex-1 items-start' : 'w-full flex-row gap-1 items-center'}`}
    >
      <div className={`font-semibold text-md`}>{user.name}</div>
      {location === 'comment' && (
        <div className="text-sm text-base-content/80">-</div>
      )}
      <div className="text-sm text-base-content/80 flex-1 w-full min-w-0">
        {formattedCreatedAt}
        {edited_at ? <span className="text-sm text-base-content/80"> (edited {formattedEditedAt})</span> : null}
      </div>
    </div>
  </>

  return (
    <div className="flex flex-row items-center w-full gap-2">
      {withLink ? <NavLink className="w-full h-full flex flex-row items-center justify-stretch gap-2 min-w-0" href={`/profile/${user.id}`}>{content}</NavLink> : content}
      {children}
    </div>
  );
};
