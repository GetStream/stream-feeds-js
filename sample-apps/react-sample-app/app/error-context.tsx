'use client';
import { useRouter } from 'next/navigation';
import type {
  PropsWithChildren} from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useAppNotificationsContext } from './app-notifications-context';

type ErrorContextValue = {
  throwUnrecoverableError: (error: Error) => void;
  unrecoverableError?: Error;
  logError: (error: Error) => void;
  logErrorAndDisplayNotification: (error: unknown) => void;
};

const noop = () => {};

const logError = (error: unknown) => {
  console.error(error);
};

const ErrorContext = createContext<ErrorContextValue>({
  throwUnrecoverableError: noop,
  logError,
  logErrorAndDisplayNotification: noop,
  unrecoverableError: undefined,
});

export const ErrorContextProvider = ({ children }: PropsWithChildren) => {
  const { showNotification } = useAppNotificationsContext();
  const [unrecoverableError, setUnrecoverableError] = useState<Error>();
  const router = useRouter();

  const throwUnrecoverableError = useCallback(
    (error: Error) => {
      logError(error);
      setUnrecoverableError(error);
      router.push('/error');
    },
    [router],
  );

  const logErrorAndDisplayNotification: ErrorContextValue['logErrorAndDisplayNotification'] =
    useCallback(
      (error) => {
        let message;

        if (typeof error === 'string') {
          message = error;
        } else if (error instanceof Error) {
          message = error.message;
        } else {
          message = 'An unknown error occurred, see logs for details';
        }

        logError(error);
        showNotification({ message, type: 'error' }, { hideTimeout: 10000 });
      },
      [showNotification],
    );

  return (
    <ErrorContext.Provider
      value={{
        unrecoverableError,
        throwUnrecoverableError,
        logError,
        logErrorAndDisplayNotification,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorContext = () => useContext(ErrorContext);
