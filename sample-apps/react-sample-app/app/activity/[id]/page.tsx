'use client';
import { useEffect, useMemo } from 'react';
import { useUserContext } from '@/app/user-context';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { useParams } from 'next/navigation';
import { useErrorContext } from '@/app/error-context';
import {
  Feed,
  useOwnCapabilities,
  useStateStore,
  type ActivityState,
} from '@stream-io/feeds-react-sdk';
import { Activity } from '@/app/components/Activity';

const selector = (nextState: ActivityState) => ({
  activity: nextState.activity,
  isLoading: nextState.is_loading,
});

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { client } = useUserContext();
  const { logErrorAndDisplayNotification, logError } = useErrorContext();

  const activityWithStateUpdates = useMemo(() => {
    if (!client) return undefined;

    return client.activityWithStateUpdates(params.id);
  }, [client]);

  useEffect(() => {
    if (!activityWithStateUpdates) {
      return;
    }

    let feed: Feed | undefined;
    let shouldStopWatching: boolean = false;
    activityWithStateUpdates
      .get()
      .then((response) => {
        const fid = response.feeds[0];
        const [group, id] = fid.split(':')[0];
        feed = client?.feed(group, id);
        if (!feed?.currentState.watch) {
          shouldStopWatching = true;
          feed?.getOrCreate({ watch: true }).catch(logError);
        }
      })
      .catch(logErrorAndDisplayNotification);

    return () => {
      if (shouldStopWatching) {
        feed?.stopWatching();
      }
    };
  }, [logErrorAndDisplayNotification, activityWithStateUpdates, client]);

  const { activity, isLoading } = useStateStore(
    activityWithStateUpdates?.state,
    selector,
  ) ?? { activity: undefined, isLoading: false };

  if (!activityWithStateUpdates || !isLoading || !activity) {
    return <LoadingIndicator color="blue" />;
  }

  const ownCapabilities = useOwnCapabilities(activity.feeds[0]) ?? [];

  return (
    <>
      <Activity
        activity={activity}
        feedOrActivity={activityWithStateUpdates}
        ownCapabilities={ownCapabilities}
      />
    </>
  );
}
