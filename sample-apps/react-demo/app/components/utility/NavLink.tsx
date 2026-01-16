import { useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const NavLink = ({
  href,
  back,
  icon,
  label,
  children,
}: {
  href?: string;
  back?: boolean;
  icon: string;
  label?: string;
  children?: React.ReactNode;
}) => {
  const currentUser = useClientConnectedUser();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = pathname.startsWith(href ?? '');

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const buildHref = useCallback(() => {
    if (!href) return '';

    // Split href into base (path + query) and hash
    const hashIndex = href.indexOf('#');
    const base = hashIndex !== -1 ? href.substring(0, hashIndex) : href;
    const hash = hashIndex !== -1 ? href.substring(hashIndex) : '';

    // Add user_id query param (before the hash)
    const separator = base.includes('?') ? '&' : '?';
    const queryString = currentUser?.id
      ? `${separator}user_id=${currentUser.id}`
      : '';

    // Reconstruct: base + query + hash
    return `${base}${queryString}${hash}`;
  }, [href, currentUser?.id]);

  return back ? (
    <button onClick={goBack}>
      <LinkContent icon={icon} label={label} children={children} />
    </button>
  ) : (
    <Link
      href={buildHref()}
      className={`w-full h-full ${isActive ? 'text-primary' : ''}`}
    >
      <LinkContent icon={icon} label={label} children={children} />
    </Link>
  );
};

const LinkContent = ({
  icon,
  label,
  children,
}: {
  icon: string;
  label?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="w-full h-full flex flex-row items-center justify-center md:justify-stretch gap-2">
      <span className="material-symbols-outlined">{icon}</span>
      {label && <div className="hidden md:block">{label}</div>}
      {children}
    </div>
  );
};
