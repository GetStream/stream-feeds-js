'use client';
import type {
  UserRequest} from '@stream-io/feeds-react-sdk';
import {
  StreamFeeds,
  useCreateFeedsClient
} from '@stream-io/feeds-react-sdk';
import { OwnFeedsContextProvider } from './own-feeds-context';
import { useUserContext } from './user-context';
import { PageLayout } from './page-layout';
import { useCallback } from 'react';

const UnauthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return <PageLayout>{children}</PageLayout>;
};

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

const AuthenticatedLayout = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserRequest;
}) => {
  const tokenProvider = useCallback(async () => {
    const response = await fetch('/api/create-token');
    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`);
    }
    const data = await response.json();
    return data.token;
  }, []);

  const client = useCreateFeedsClient({
    apiKey,
    userData: user,
    tokenOrProvider: tokenProvider,
    options: {
      base_url: apiUrl,
    },
  });

  if (!client) {
    return null;
  }

  return (
    <>
      <StreamFeeds client={client}>
        <OwnFeedsContextProvider>
          <PageLayout>{children}</PageLayout>
        </OwnFeedsContextProvider>
      </StreamFeeds>
    </>
  );
};

export const LayoutSwitcher = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserContext();

  if (user) {
    return <AuthenticatedLayout user={user}>{children}</AuthenticatedLayout>;
  }
  return <UnauthenticatedLayout>{children}</UnauthenticatedLayout>;
};
