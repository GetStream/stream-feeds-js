import { useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NavLink = ({
  href,
  icon,
  label,
  children,
  hideLabel = false,
}: {
  href: string;
  icon: string;
  label: string;
  hideLabel?: boolean;
  children?: React.ReactNode;
}) => {
  const currentUser = useClientConnectedUser();
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Link
      href={`${href}?user_id=${currentUser?.id}`}
      className={`flex flex-row items-center justify-center md:justify-stretch gap-2 w-full h-full ${
        isActive ? 'text-primary' : ''
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {!hideLabel && <div className="hidden md:block">{label}</div>}
      {children}
    </Link>
  );
};
