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
      className={`w-[4.2rem] flex flex-col items-stretch justify-stretch gap-0.5`}
      disabled={disabled}
      onClick={onClick}
    >
      <div
        className={`rounded-full p-[0.15rem] flex items-stretch justify-stretch ${
          isActive ? 'bg-gradient-to-br from-warning to-error' : ''
        }`}
      >
        <div
          className={`rounded-full bg-base-100 p-[0.1rem] flex items-stretch justify-stretch`}
        >
          <div className="flex size-[3.7rem] items-stretch justify-stretch">
            <Avatar user={user} />
          </div>
        </div>
      </div>
      <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
        {user?.name}
      </div>
    </button>
  );
};
