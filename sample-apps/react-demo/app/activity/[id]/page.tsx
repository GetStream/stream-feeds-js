'use client';

import { ActivityActions } from '@/app/components/activity/activity-actions/ActivityActions';
import { ActivityContent } from '@/app/components/activity/ActivityContent';
import { ActivityHeader } from '@/app/components/activity/ActivityHeader';
import { CommentComposer } from '@/app/components/comments/CommentComposer';
import { CommentList } from '@/app/components/comments/CommentList';
import { LoadingIndicator } from '@/app/components/utility/LoadingIndicator';
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

  if (!activity || !activityWithStateUpdates) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ActivityHeader activity={activity} />
      <ActivityContent activity={activity} />
      <ActivityActions activity={activity} />
      <CommentComposer activity={activity}></CommentComposer>
      <CommentList activityWithStateUpdates={activityWithStateUpdates} />
    </div>
  );
}
