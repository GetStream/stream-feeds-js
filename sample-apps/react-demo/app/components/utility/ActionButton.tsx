import { useCallback, useState } from 'react';
import { ErrorToast } from './ErrorToast';
import { NavLink } from './NavLink';

export const ActionButton = ({
  onClick,
  href,
  icon,
  label,
  isActive,
}: {
  onClick?: () => Promise<any> | undefined | void;
  href?: string;
  icon: string;
  label: string;
  isActive: boolean;
}) => {
  const content = <Content icon={icon} label={label} isActive={isActive} />;
  const [error, setError] = useState<Error | undefined>(undefined);

  const handleClick = useCallback(async () => {
    try {
      setError(undefined);
      await onClick?.();
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  }, [onClick]);

  return <>
    {href ? <div className="btn btn-sm btn-soft"><NavLinkButton href={href}>{content}</NavLinkButton></div> : <button
      type="button"
      className="btn btn-sm btn-soft"
      onClick={handleClick}
    >
      {content}
    </button>
    }
    <ErrorToast error={error} />
  </>
};

export const SecondaryActionButton = ({
  onClick,
  href,
  icon,
  label,
  isActive,
  className,
}: {
  onClick?: () => Promise<any> | undefined | void;
  href?: string;
  icon: string;
  label: string;
  isActive: boolean;
  className?: string;
}) => {
  const [error, setError] = useState<Error | undefined>(undefined);

  const handleClick = useCallback(async () => {
    try {
      setError(undefined);
      await onClick?.();
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  }, [onClick]);

  const content = <Content icon={icon} label={label} isActive={isActive} />;
  return <>

    {href ? <div className={`btn btn-md btn-ghost p-2 ${className}`}><NavLinkButton href={href}>{content}</NavLinkButton></div> : <button
      type="button"
      className={`btn btn-md btn-ghost p-2 ${className}`}
      onClick={handleClick}
    >
      {content}
    </button>
    }
    <ErrorToast error={error} />
  </>
};

const NavLinkButton = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  return <NavLink className="w-full h-full flex flex-row items-center justify-stretch gap-2 min-w-0" href={href}>{children}</NavLink>;
};

const Content = ({
  icon,
  label,
  isActive,
}: {
  icon: string;
  label: string;
  isActive: boolean | undefined;
}) => (
  <>
    <span
      className={`material-symbols-outlined text-[1.1rem]! text-base-content/80 ${isActive ? 'fill' : ''}`}
    >
      {icon}
    </span>
    <span className="text-sm text-base-content/80">{label}</span>
  </>
);
