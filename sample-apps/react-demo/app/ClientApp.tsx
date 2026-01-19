'use client';

import {
  useCreateFeedsClient,
  StreamFeeds,
  FeedsClient,
} from '@stream-io/feeds-react-sdk';
import { AppSkeleton } from './AppSkeleton';
import { OwnFeedsContextProvider } from './own-feeds-context';
import { FollowSuggestionsContextProvider } from './follow-suggestions-context';
import { generateUsername } from 'unique-username-generator';
import { useEffect, useMemo, type PropsWithChildren } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoadingIndicator } from './components/utility/LoadingIndicator';
import { userIdToUserName } from './utility/user-id-to-name';

export const ClientApp = ({ children }: PropsWithChildren) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const userIdFromUrl = searchParams.get('user_id');
  const USER_ID = useMemo(
    () =>
      process.env.NEXT_PUBLIC_USER_ID ?? userIdFromUrl ?? generateUsername('-'),
    [userIdFromUrl],
  );

  // Set user_id as URL parameter if not already present
  useEffect(() => {
    if (!userIdFromUrl && USER_ID) {
      const urlParams = new URLSearchParams(searchParams.toString());
      urlParams.set('user_id', USER_ID);
      router.replace(`?${urlParams.toString()}`);
    }
  }, [userIdFromUrl, USER_ID, searchParams, router]);

  const CURRENT_USER = useMemo(
    () => ({
      id: USER_ID,
      name: process.env.NEXT_PUBLIC_USER_NAME ?? userIdToUserName(USER_ID),
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
    },
  });

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <StreamFeeds client={client}>
      <OwnFeedsContextProvider>
        <FollowSuggestionsContextProvider>
          <AppSkeleton>{children}</AppSkeleton>
        </FollowSuggestionsContextProvider>
      </OwnFeedsContextProvider>
    </StreamFeeds>
  );
};
