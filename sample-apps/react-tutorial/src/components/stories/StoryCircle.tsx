import { UserResponse } from '@stream-io/feeds-react-sdk';

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
      className="w-18 flex flex-col items-center justify-center gap-0.5"
      disabled={disabled}
      onClick={onClick}
    >
      <div
        className={`rounded-full ${
          isActive ? 'bg-gradient-to-br from-warning to-error p-[2.5px]' : ''
        }`}
      >
        <div className={`rounded-full ${isActive ? 'bg-base-100 p-0.5' : ''}`}>
          <div className="w-18 h-18 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-semibold">
            <span>{user?.name?.[0]}</span>
          </div>
        </div>
      </div>
      <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
        {user?.name}
      </div>
    </button>
  );
};
