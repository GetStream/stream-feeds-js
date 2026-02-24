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
  activeColor,
}: {
  onClick?: () => Promise<any> | undefined | void;
  href?: string;
  icon: string;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  error?: Error;
  activeColor?: 'primary' | 'green' | 'red';
}) => {
  const color = activeColor ?? 'primary';
  const content = <Content icon={icon} label={label} isActive={isActive} color={color} />;

  const hoverColorClass = {
    primary: 'hover:text-primary',
    green: 'hover:text-green-500',
    red: 'hover:text-red-500',
  }[color];

  const activeColorClass = {
    primary: 'text-primary',
    green: 'text-green-500',
    red: 'text-red-500',
  }[color];

  const buttonClasses = `
    group inline-flex items-center gap-1 text-base-content/60
    ${hoverColorClass} transition-colors
    ${isActive ? activeColorClass : ''}
  `;

  return (
    <>
      {href ? (
        <NavLink href={href} className={buttonClasses}>
          {content}
        </NavLink>
      ) : (
        <button
          type="button"
          className={buttonClasses}
          disabled={disabled}
          onClick={onClick}
        >
          {content}
        </button>
      )}
      <ErrorToast error={error} />
    </>
  );
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
  const content = <Content icon={icon} label={label} isActive={isActive} color="primary" />;

  const buttonClasses = `
    group inline-flex items-center gap-1 text-base-content/60
    hover:text-primary transition-colors
    ${isActive ? 'text-primary' : ''}
    ${className ?? ''}
  `;

  return (
    <>
      {href ? (
        <NavLink href={href} className={buttonClasses}>
          {content}
        </NavLink>
      ) : (
        <button
          type="button"
          className={buttonClasses}
          disabled={disabled}
          onClick={onClick}
        >
          {content}
        </button>
      )}
      <ErrorToast error={error} />
    </>
  );
};

const Content = ({
  icon,
  label,
  isActive,
  color,
}: {
  icon: string;
  label: string;
  isActive: boolean | undefined;
  color: 'primary' | 'green' | 'red';
}) => {
  const hoverBgClass = {
    primary: 'group-hover:bg-primary/10',
    green: 'group-hover:bg-green-500/10',
    red: 'group-hover:bg-red-500/10',
  }[color];

  return (
    <>
      <span
        className={`
          w-9 h-9 rounded-full flex items-center justify-center
          ${hoverBgClass} transition-colors
        `}
      >
        <span
          className={`
            material-symbols-outlined text-[18px]!
            ${isActive ? 'fill' : ''}
            ${icon === 'chat_bubble' ? 'translate-y-[1px]' : ''}
          `}
        >
          {icon}
        </span>
      </span>
      <span className="text-[13px] tabular-nums pr-2">{label}</span>
    </>
  );
};
