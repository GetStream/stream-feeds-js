import type { UserResponse } from '@stream-io/feeds-react-sdk';
import { formatDistanceToNow } from 'date-fns';
import { useMemo } from 'react';
import { Avatar } from './Avatar';

export const ContentMetadata = ({
  created_at,
  user,
  children,
  location,
}: {
  created_at: Date;
  user: UserResponse;
  location: 'comment' | 'activity';
  children?: React.ReactNode;
}) => {
  const formattedCreatedAt = useMemo(() => {
    return formatDistanceToNow(created_at, { addSuffix: true });
  }, [created_at]);

  return (
    <div className="flex flex-row items-center w-full gap-2">
      <div
        className={`${location === 'activity' ? 'size-10 md:size-12' : 'size-8 md:size-10'}`}
      >
        <Avatar user={user} />
      </div>
      <div
        className={`flex ${location === 'activity' ? 'flex-col flex-1 items-start' : 'flex-row gap-1 items-center'}`}
      >
        <span className={`font-semibold text-md`}>{user.name}</span>
        {location === 'comment' && (
          <span className="text-sm text-base-content/80">-</span>
        )}
        <span className="text-sm text-base-content/80">
          {formattedCreatedAt}
        </span>
      </div>
      {children}
    </div>
  );
};
