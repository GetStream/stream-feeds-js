'use client';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useState } from 'react';

type ErrorContextValue = {
  throwUnrecoverableError: (error: Error) => void;
  error?: Error;
};

const ErrorContext = createContext<ErrorContextValue>({
  throwUnrecoverableError: () => {},
  error: undefined,
});

export const ErrorContextProvider = ({ children }: PropsWithChildren) => {
  const [error, setError] = useState<Error>();
  const router = useRouter();

  const throwUnrecoverableError = (error: Error) => {
    console.error(error);
    setError(error);
    router.push('/error');
  };

  return (
    <ErrorContext.Provider value={{ error, throwUnrecoverableError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorContext = () => useContext(ErrorContext);
