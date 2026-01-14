import { useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NavLink = ({
  href,
  icon,
  label,
  children,
}: {
  href: string;
  icon: string;
  label: string;
  children?: React.ReactNode;
}) => {
  const currentUser = useClientConnectedUser();
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Link
      href={`${href}?user_id=${currentUser?.id}`}
      className={`flex flex-row items-center gap-2 ${
        isActive ? 'text-primary' : ''
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <div className="hidden md:block">{label}</div>
      {children}
    </Link>
  );
};
