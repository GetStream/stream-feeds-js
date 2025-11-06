'use client';
import { useEffect, useMemo } from 'react';
import { useUserContext } from '@/app/user-context';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { useParams } from 'next/navigation';
import { useErrorContext } from '@/app/error-context';
import {
  useOwnCapabilities,
  useStateStore,
  type ActivityState,
} from '@stream-io/feeds-react-sdk';
import { Activity } from '@/app/components/Activity';

const selector = (nextState: ActivityState) => nextState;

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { client } = useUserContext();
  const { logErrorAndDisplayNotification } = useErrorContext();

  const activity = useMemo(() => {
    if (!client) return undefined;

    return client.activity(params.id);
  }, [client]);

  useEffect(() => {
    if (!activity) {
      return;
    }

    activity.get({ watch: true }).catch(logErrorAndDisplayNotification);

    return () => {
      activity?.stopWatching();
    };
  }, [logErrorAndDisplayNotification, activity, client]);

  const state = useStateStore(activity?.state, selector) ?? {
    is_inited: false,
  };

  const ownCapabilities = useOwnCapabilities(activity?.feed) ?? [];

  if (!activity || !state.is_inited) {
    return <LoadingIndicator color="blue" />;
  }

  return (
    <>
      <Activity
        activity={state}
        feedOrActivity={activity}
        ownCapabilities={ownCapabilities}
      />
    </>
  );
}
