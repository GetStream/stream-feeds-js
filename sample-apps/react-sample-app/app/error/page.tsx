'use client';
import { useErrorContext } from '../error-context';
import { useRouter } from 'next/navigation';
import { useUserContext } from '../user-context';
import { useCallback } from 'react';
import { Error } from '../components/Error';

export default function ErrorPage() {
  const router = useRouter();
  const { unrecoverableError, throwUnrecoverableError } = useErrorContext();
  const { logOut } = useUserContext();

  const reset = useCallback(() => {
    logOut().catch((err) => {
      throwUnrecoverableError(err);
    });
    router.push('/login');
  }, [logOut]);

  return <Error error={unrecoverableError} reset={reset}></Error>;
}
