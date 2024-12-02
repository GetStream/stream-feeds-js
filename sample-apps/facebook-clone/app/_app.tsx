'use client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { UserContextProvider, useUserContext } from './user-context';
import { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { user } = useUserContext();

  console.log('itt');

  useEffect(() => {
    console.log('itt2');
    const handleRouteChange = (url: string) => {
      console.log(user);
      const userIsAuthenticated = !!user;

      if (!userIsAuthenticated && url !== '/login') {
        router.replace('/login');
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [user, router]);

  return (
    <UserContextProvider>
      <Component {...pageProps}></Component>
    </UserContextProvider>
  );
}
