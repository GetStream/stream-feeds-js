import type { ConnectedUser, UserResponse } from '@stream-io/feeds-react-sdk';

// Generate a hash from a string
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Generate two colors from a user name for gradient
const generateColorsFromName = (name: string): [string, string] => {
  const hash = hashString(name);

  // Generate hue-based colors
  const hue1 = hash % 360;
  const hue2 = (hue1 + 40) % 360;

  return [
    `oklch(55% 0.15 ${hue1})`,
    `oklch(45% 0.12 ${hue2})`,
  ];
};

export const Avatar = ({ user, className }: { user?: UserResponse | ConnectedUser; className: string }) => {
  const userName = user?.name || '?';
  const userImage = user?.image;
  const [color1, color2] = generateColorsFromName(userName);

  return (
    <div
      className={`avatar flex-shrink-0 flex items-center justify-center @container ${className}`}
    >
      {userImage ? (
        <img
          src={userImage}
          alt={userName}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className="rounded-full w-full h-full flex items-center justify-center text-white font-semibold shadow-inner"
          style={{
            background: `linear-gradient(135deg, ${color1}, ${color2})`,
          }}
        >
          <span className="@max-[2rem]:text-xs text-base uppercase tracking-wide">
            {userName[0]}
          </span>
        </div>
      )}
    </div>
  );
};
