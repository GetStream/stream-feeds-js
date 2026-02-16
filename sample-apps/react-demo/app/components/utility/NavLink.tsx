import { useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const isPathActive = (pathname: string, href: string) =>
  pathname === href || (pathname.startsWith(href + '/') && href !== '/');

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
  const isActive =
    href != null && href !== '' && isPathActive(pathname, href);

  return (
    <NavLink
      className={`
        relative w-full h-full flex flex-row items-center justify-center md:justify-start gap-4
        py-3 px-4 rounded-full
      `}
      href={href}
    >
      {icon && (
        <span className={`material-symbols-outlined text-[26px] ${isActive ? 'fill' : ''}`}>
          {icon}
        </span>
      )}
      {label && <span className="hidden md:block text-xl">{label}</span>}
      {children}
    </NavLink>
  );
};

export const NavLink = ({
  href,
  icon,
  iconActiveVariant = 'fill',
  children,
  className,
}: {
  href?: string;
  icon?: string;
  /** Use 'color' for icons that don't have a filled variant (e.g. search). */
  iconActiveVariant?: 'fill' | 'color';
  children?: React.ReactNode;
  className?: string;
}) => {
  const currentUser = useClientConnectedUser();
  const pathname = usePathname();
  const isActive =
    href != null &&
    href !== '' &&
    isPathActive(pathname, href);

  const iconActiveClass =
    iconActiveVariant === 'color'
      ? isActive
        ? 'text-primary'
        : ''
      : isActive
        ? 'fill'
        : '';

  return (
    <Link
      href={`${href}${href?.includes('?') ? '&' : '?'}user_id=${currentUser?.id}`}
      className={className}
    >
      {icon != null && (
        <span
          className={`material-symbols-outlined text-[26px] ${iconActiveClass}`}
        >
          {icon}
        </span>
      )}
      {children}
    </Link>
  );
};

