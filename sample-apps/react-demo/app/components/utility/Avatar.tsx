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

  // Generate first color (hue based on hash, high saturation, medium lightness)
  const hue1 = hash % 360;
  const saturation1 = 60 + (hash % 25); // 60-85%
  const lightness1 = 40 + (hash % 20); // 40-60%
  const color1 = `hsl(${hue1}, ${saturation1}%, ${lightness1}%)`;

  // Generate second color (complementary hue offset, different saturation/lightness)
  const hue2 = (hue1 + 120 + (hash % 60)) % 360; // Offset by 120-180 degrees (complementary colors)
  const saturation2 = 50 + ((hash >> 8) % 30); // 50-80%
  const lightness2 = 35 + ((hash >> 8) % 25); // 35-60%
  const color2 = `hsl(${hue2}, ${saturation2}%, ${lightness2}%)`;

  return [color1, color2];
};

export const Avatar = ({ user, className }: { user?: UserResponse | ConnectedUser; className: string }) => {
  const userName = user?.name || '?';
  const [color1, color2] = generateColorsFromName(userName);

  return (
    <div
      className={`avatar flex-shrink-0 flex items-stretch justify-stretch @container ${className}`}
    >
      <div
        className="rounded-full w-[inherit] h-[inherit] flex items-center justify-center text-white text-lg font-semibold"
        style={{
          background: `linear-gradient(to bottom right, ${color1}, ${color2})`,
        }}
      >
        <span className="@max-[2rem]:text-xs text-lg">{userName[0]}</span>
      </div>
    </div>
  );
};
