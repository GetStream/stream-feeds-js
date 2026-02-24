import type { ReactNode } from 'react';

export const PageHeader = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => {
  return (
    <div className="w-full hidden lg:flex items-center justify-between px-4 py-3 border-b border-base-content/10 sticky top-0 bg-base-100 z-10">
      <div className="text-base font-semibold">{title}</div>
      {children}
    </div>
  );
};
