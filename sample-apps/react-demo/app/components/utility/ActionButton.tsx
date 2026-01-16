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
  return (
    <button
      type="button"
      className="btn btn-sm btn-soft text-base-content/80"
      onClick={onClick}
    >
      {href ? <NavLinkButton href={href}>{content}</NavLinkButton> : content}
    </button>
  );
};

const NavLinkButton = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  return <NavLink href={href}>{children}</NavLink>;
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
      className={`material-symbols-outlined text-[1.1rem]! ${isActive ? 'fill' : ''}`}
    >
      {icon}
    </span>
    <span className="text-sm">{label}</span>
  </>
);
