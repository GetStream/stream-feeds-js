import { useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NavLink = ({
  href,
  icon,
  label,
  children,
}: {
  href?: string;
  icon?: string;
  label?: string;
  children?: React.ReactNode;
}) => {
  const currentUser = useClientConnectedUser();
  const pathname = usePathname();

  const isActive = pathname.startsWith(href ?? '');

  return (
    <Link
      href={`${href}?user_id=${currentUser?.id}`}
      className={`w-full h-full ${isActive ? 'text-primary' : ''}`}
    >
      <div className="w-full h-full flex flex-row items-center justify-center md:justify-stretch">
        <div className="w-full flex items-center justify-center gap-2">
          {icon && <span className="material-symbols-outlined">{icon}</span>}
          {label && <span className="hidden md:block text-sm">{label}</span>}
          {children}
        </div>
      </div>
    </Link>
  );
};
