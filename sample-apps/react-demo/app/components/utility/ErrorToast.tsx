import { useEffect, useState } from 'react';

const AUTO_DISMISS_MS = 5000;

export const ErrorToast = ({ error }: { error: Error | undefined }) => {
  const [visibleError, setVisibleError] = useState<Error | undefined>(error);

  useEffect(() => {
    if (error) {
      setVisibleError(error);
    }
  }, [error]);

  useEffect(() => {
    if (!visibleError) return;

    const timeout = setTimeout(() => {
      setVisibleError(undefined);
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timeout);
  }, [visibleError]);

  if (!visibleError) return null;

  return (
    <div className="toast toast-center z-1000">
      <div className="alert alert-error">Failed operation: {visibleError.message}</div>
    </div>
  );
};
