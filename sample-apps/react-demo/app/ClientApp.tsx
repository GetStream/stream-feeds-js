'use client';

import {
  useCreateFeedsClient,
  StreamFeeds,
  FeedsClient,
} from '@stream-io/feeds-react-sdk';
import * as Sentry from '@sentry/nextjs';
import { AppSkeleton } from './AppSkeleton';
import { OwnFeedsContextProvider } from './own-feeds-context';
import { FollowSuggestionsContextProvider } from './follow-suggestions-context';
import { ConnectionAlert } from './components/utility/ConnectionAlert';
import { generateUsername } from 'unique-username-generator';
import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoadingIndicator } from './components/utility/LoadingIndicator';
import { userIdToName } from './utility/userIdToName';

export const ClientApp = ({ children }: PropsWithChildren) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const userIdFromUrl = searchParams.get('user_id');
  const [testDataGeneration, setTestDataGeneration] = useState<'not-started' | 'in-progress' | 'completed' | 'error'>('completed');
  const USER_ID = useMemo(
    () => {
      if (process.env.NEXT_PUBLIC_USER_ID || userIdFromUrl) {
        setTestDataGeneration('completed');
        return (process.env.NEXT_PUBLIC_USER_ID ?? userIdFromUrl)!;
      } else {
        setTestDataGeneration('not-started');
        return generateUsername('-');
      }
    },
    [],
  );

  // Set user_id as URL parameter if not already present
  useEffect(() => {
    if (!userIdFromUrl && USER_ID) {
      const urlParams = new URLSearchParams(searchParams.toString());
      urlParams.set('user_id', USER_ID);
      router.replace(`?${urlParams.toString()}`);
    }
  }, [userIdFromUrl, USER_ID, searchParams, router]);

  useEffect(() => {
    console.log('testDataGeneration', testDataGeneration);
    if (testDataGeneration !== 'not-started') return;

    setTestDataGeneration('in-progress');

    fetch('/api/create-user', {
      method: 'POST',
      body: JSON.stringify({ userId: USER_ID }),
    })
      .then((res) => {
        if (res.ok) {
          setTestDataGeneration('completed');
        } else {
          setTestDataGeneration('error');
        }
      })
      .catch(() => {
        setTestDataGeneration('error');
      });
  }, [testDataGeneration, USER_ID]);

  const CURRENT_USER = useMemo(
    () => ({
      id: USER_ID,
      name: process.env.NEXT_PUBLIC_USER_NAME ?? userIdToName(USER_ID),
      token: process.env.NEXT_PUBLIC_USER_TOKEN
        ? process.env.NEXT_PUBLIC_USER_TOKEN
        : process.env.NEXT_PUBLIC_TOKEN_URL
          ? () =>
            fetch(
              `${process.env.NEXT_PUBLIC_TOKEN_URL}&user_id=${USER_ID}`,
            ).then((res) => res.json().then((data) => data.token))
          : new FeedsClient(API_KEY!).devToken(USER_ID),
    }),
    [USER_ID, API_KEY],
  );

  const client = useCreateFeedsClient({
    apiKey: API_KEY!,
    tokenOrProvider: CURRENT_USER.token,
    userData: {
      id: CURRENT_USER.id,
      name: CURRENT_USER.name,
    },
    options: {
      base_url: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
      configure_loggers_options: {
        default: {
          level: 'error',
          sink: (...args: any[]) => {
            Sentry.captureException(new Error(args.join(' ')));
          },
        },
      },
    },
  });

  useEffect(() => {
    const off = client?.on('errors.unhandled', async (_) => {
      await client?.disconnectUser();
      await client?.connectUser(CURRENT_USER, CURRENT_USER.token);
    });

    return () => off?.();
  }, [client, CURRENT_USER]);

  if (testDataGeneration === 'error') {
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-screen">
        <div>Data generation failed</div>
        <a href="/" className="btn btn-primary">
          Retry
        </a>
      </div>
    );
  }

  if (!client || testDataGeneration !== 'completed') {
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-screen">
        <LoadingIndicator />
        <div>Generating data...</div>
      </div>
    );
  }

  return (
    <StreamFeeds client={client}>
      <ConnectionAlert />
      <OwnFeedsContextProvider>
        <FollowSuggestionsContextProvider>
          <AppSkeleton>{children}</AppSkeleton>
        </FollowSuggestionsContextProvider>
      </OwnFeedsContextProvider>
    </StreamFeeds>
  );
};
