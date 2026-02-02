import type { UserResponse } from '@stream-io/feeds-react-sdk';
import { Avatar } from '../utility/Avatar';

export const StoryCircle = ({
  isActive,
  onClick,
  disabled,
  user,
}: {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  user?: UserResponse;
}) => {
  return (
    <button
      className="w-[4.5rem] flex flex-col items-center cursor-pointer gap-1 group"
      disabled={disabled}
      onClick={onClick}
    >
      <div
        className={`rounded-full p-[2px] ${
          isActive
            ? 'bg-gradient-to-br from-primary to-blue-400'
            : 'bg-base-300'
        }`}
      >
        <div className="rounded-full bg-base-100 p-[2px]">
          <Avatar user={user} className="size-14" />
        </div>
      </div>
      <span className="w-full text-center text-xs text-base-content/70 truncate">
        {user?.name}
      </span>
    </button>
  );
};
