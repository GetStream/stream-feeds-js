export const LoadingIndicator = ({ className = 'loading-sm' }: { className?: string }) => {
  return (
    <span className={`loading loading-spinner ${className}`}></span>
  );
};
