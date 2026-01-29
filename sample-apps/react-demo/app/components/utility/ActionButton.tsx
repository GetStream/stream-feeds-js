import { ErrorToast } from './ErrorToast';
import { NavLink } from './NavLink';

export const ActionButton = ({
  onClick,
  href,
  icon,
  label,
  isActive,
  disabled,
  error,
}: {
  onClick?: () => Promise<any> | undefined | void;
  href?: string;
  icon: string;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  error?: Error;
}) => {
  const content = <Content icon={icon} label={label} isActive={isActive} />;

  return <>
    {href ? <div className="btn btn-sm btn-soft"><NavLinkButton href={href}>{content}</NavLinkButton></div> : <button
      type="button"
      className="btn btn-sm btn-soft"
      disabled={disabled}
      onClick={onClick}
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
  disabled,
  className,
  error,
}: {
  onClick?: () => Promise<any> | undefined | void;
  href?: string;
  icon: string;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  className?: string;
  error?: Error;
}) => {
  const content = <Content icon={icon} label={label} isActive={isActive} />;
  return <>

    {href ? <div className={`btn btn-md btn-ghost p-2 ${className}`}><NavLinkButton href={href}>{content}</NavLinkButton></div> : <button
      type="button"
      className={`btn btn-md btn-ghost p-2 ${className}`}
      disabled={disabled}
      onClick={onClick}
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
