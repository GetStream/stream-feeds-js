import { useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const MenuNavLink = ({
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
  const pathname = usePathname();

  const isActive = pathname.startsWith(href ?? '');

  return (
    <NavLink className={`w-full h-full flex flex-row items-center justify-center md:justify-stretch ${isActive ? 'text-primary' : ''}`} href={href}>
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      {label && <span className="hidden md:block text-sm">{label}</span>}
      {children}
    </NavLink>
  );
};

export const NavLink = ({
  href,
  children,
  className,
}: {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const currentUser = useClientConnectedUser();

  return (
    <Link
      href={`${href}?user_id=${currentUser?.id}`}
      className={className}
    >
      {children}
    </Link>
  );
};

