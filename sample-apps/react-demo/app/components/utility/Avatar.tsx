import { UserResponse } from '@stream-io/feeds-react-sdk';

export const Avatar = ({ user }: { user?: UserResponse }) => {
  return (
    <div
      className={`avatar w-full h-full flex-shrink-0 flex items-stretch justify-stretch`}
    >
      <div className="rounded-full w-full h-full bg-gradient-to-br from-primary to-secondary  flex items-center justify-center text-white text-lg font-semibold">
        <span>{user?.name?.[0]}</span>
      </div>
    </div>
  );
};
