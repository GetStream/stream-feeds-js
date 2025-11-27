'use client';
import { useErrorContext } from '../error-context';
import { useRouter } from 'next/navigation';
import { useUserContext } from '../user-context';
import { useCallback } from 'react';
import { Error } from '../components/Error';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';

export default function ErrorPage() {
  const router = useRouter();
  const { unrecoverableError, throwUnrecoverableError } = useErrorContext();
  const { logOut } = useUserContext();
  const client = useFeedsClient();

  const reset = useCallback(() => {
    logOut();
    client?.disconnectUser().catch((err) => {
      throwUnrecoverableError(err);
    });
    router.push('/login');
  }, [logOut]);

  return <Error error={unrecoverableError} reset={reset}></Error>;
}
