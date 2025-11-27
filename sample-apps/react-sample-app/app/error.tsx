'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { Error } from './components/Error';
import { useErrorContext } from './error-context';

export default function ErrorBoundaryPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { logError } = useErrorContext();

  useEffect(() => {
    if (error) {
      logError(error);
    }
  }, [error, logError]);

  return <Error error={error} reset={() => reset()}></Error>;
}
