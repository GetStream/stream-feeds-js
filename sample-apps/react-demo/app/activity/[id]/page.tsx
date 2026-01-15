'use client';

import { Activity } from '@/app/components/activity/Activity';
import { NavLink } from '@/app/components/NavLink';
import {
  ActivityState,
  useFeedsClient,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

const selector = (state: ActivityState) => ({
  activity: state.activity,
});

export default function ActivityPage() {
  const id = useParams<{ id: string }>().id;
  const client = useFeedsClient();

  const activityWithStateUpdates = client?.activityWithStateUpdates(id);

  useEffect(() => {
    if (!activityWithStateUpdates?.currentState.activity) {
      activityWithStateUpdates?.get();
    }
  }, [activityWithStateUpdates]);

  useEffect(() => () => activityWithStateUpdates?.dispose(), []);

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
