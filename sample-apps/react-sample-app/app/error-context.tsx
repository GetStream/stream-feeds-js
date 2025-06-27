'use client';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { useAppNotificationsContext } from './app-notifications-context';

type ErrorContextValue = {
  throwUnrecoverableError: (error: Error) => void;
  unrecoverableError?: Error;
  logError: (error: Error) => void;
  logErrorAndDisplayNotification: (error: Error, message: string) => void;
};

const ErrorContext = createContext<ErrorContextValue>({
  throwUnrecoverableError: () => {},
  logError: () => {},
  logErrorAndDisplayNotification: () => {},
  unrecoverableError: undefined,
});

export const ErrorContextProvider = ({ children }: PropsWithChildren) => {
  const { showNotification } = useAppNotificationsContext();
  const [unrecoverableError, setUnrecoverableError] = useState<Error>();
  const router = useRouter();

  const throwUnrecoverableError = (error: Error) => {
    logError(error);
    setUnrecoverableError(error);
    router.push('/error');
  };

  const logError = (error: Error) => {
    console.error(error);
  };

  const logErrorAndDisplayNotification = (error: Error, message: string) => {
    logError(error);
    showNotification({ message, type: 'error' }, { hideTimeout: 10000 });
  };

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
