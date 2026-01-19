import { NavLink } from './NavLink';

export const ActionButton = ({
  onClick,
  href,
  icon,
  label,
  isActive,
}: {
  onClick?: () => void;
  href?: string;
  icon: string;
  label: string;
  isActive: boolean;
}) => {
  const content = <Content icon={icon} label={label} isActive={isActive} />;
  return <>

    {href ? <div className="btn btn-sm btn-soft"><NavLinkButton href={href}>{content}</NavLinkButton></div> : <button
      type="button"
      className="btn btn-sm btn-soft"
      onClick={onClick}
    >
      {content}
    </button>
    }
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
  onClick?: () => void;
  href?: string;
  icon: string;
  label: string;
  isActive: boolean;
  className?: string;
}) => {
  const content = <Content icon={icon} label={label} isActive={isActive} />;
  return <>

    {href ? <div className={`btn btn-md btn-ghost p-2 ${className}`}><NavLinkButton href={href}>{content}</NavLinkButton></div> : <button
      type="button"
      className={`btn btn-md btn-ghost p-2 ${className}`}
      onClick={onClick}
    >
      {content}
    </button>
    }
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
