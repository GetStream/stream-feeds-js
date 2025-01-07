'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { Error } from './components/Error';

export default function ErrorBoundaryPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return <Error error={error} reset={() => reset()}></Error>;
}
