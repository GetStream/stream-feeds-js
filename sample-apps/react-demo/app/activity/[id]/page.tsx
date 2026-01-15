'use client';

import { Activity } from '@/app/components/activity/Activity';
import { NavLink } from '@/app/components/NavLink';
import {
  useFeedsClient,
  useStateStore,
  type ActivityState,
  type ActivityWithStateUpdates,
} from '@stream-io/feeds-react-sdk';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const selector = (state: ActivityState) => ({
  activity: state.activity,
});

export default function ActivityPage() {
  const id = useParams<{ id: string }>().id;
  const client = useFeedsClient();
  const [activityWithStateUpdates, setActivityWithStateUpdates] = useState<
    ActivityWithStateUpdates | undefined
  >();

  useEffect(() => {
    const _activityWithStateUpdates = client?.activityWithStateUpdates(id);
    setActivityWithStateUpdates(_activityWithStateUpdates);

    return () => _activityWithStateUpdates?.dispose();
  }, [client, id]);

  useEffect(() => {
    if (!activityWithStateUpdates?.currentState.activity) {
      activityWithStateUpdates?.get();
    }
  }, [activityWithStateUpdates]);

  const { activity } = useStateStore(
    activityWithStateUpdates?.state,
    selector,
  ) ?? { activity: undefined };

  if (!activity) {
    return null;
  }

  return (
    <>
      <NavLink href={`/home#${id}`} icon="arrow_back"></NavLink>
      <Activity activity={activity} />
    </>
  );
}
