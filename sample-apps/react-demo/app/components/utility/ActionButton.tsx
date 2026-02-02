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

  const buttonClasses = `
    group inline-flex items-center gap-1 text-base-content/60
    hover:text-primary transition-colors
    ${isActive ? 'text-primary' : ''}
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
  const content = <Content icon={icon} label={label} isActive={isActive} />;

  const buttonClasses = `
    inline-flex items-center gap-2 p-2 rounded-lg
    text-base-content/60 hover:text-base-content
    hover:bg-base-200/50
    transition-all duration-200
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
}: {
  icon: string;
  label: string;
  isActive: boolean | undefined;
}) => (
  <>
    <span
      className={`
        w-9 h-9 rounded-full flex items-center justify-center
        group-hover:bg-primary/10 transition-colors
      `}
    >
      <span
        className={`
          material-symbols-outlined text-[18px]
          ${isActive ? 'fill' : ''}
          ${icon === 'chat_bubble' ? 'translate-y-[1px]' : ''}
        `}
      >
        {icon}
      </span>
    </span>
    <span className="text-[13px] tabular-nums">{label}</span>
  </>
);
