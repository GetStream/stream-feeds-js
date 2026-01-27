'use client';

import { ActivityInteractions } from '@/app/components/activity/activity-interactions/ActivityInteractions';
import { ActivityContent } from '@/app/components/activity/ActivityContent';
import { ActivityHeader } from '@/app/components/activity/ActivityHeader';
import { ActivityParent } from '@/app/components/activity/ActivityParent';
import { CommentComposer } from '@/app/components/comments/CommentComposer';
import { CommentList } from '@/app/components/comments/CommentList';
import { ErrorCard } from '@/app/components/utility/ErrorCard';
import { LoadingIndicator } from '@/app/components/utility/LoadingIndicator';
import {
  StreamActivityWithStateUpdates,
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
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const _activityWithStateUpdates = client?.activityWithStateUpdates(id);
    setActivityWithStateUpdates(_activityWithStateUpdates);

    return () => _activityWithStateUpdates?.dispose();
  }, [client, id]);

  useEffect(() => {
    if (!activityWithStateUpdates?.currentState.activity) {
      activityWithStateUpdates?.get().catch((e) => {
        setError(e.message);
        throw e;
      });
    }
  }, [activityWithStateUpdates]);

  const { activity } = useStateStore(
    activityWithStateUpdates?.state,
    selector,
  ) ?? { activity: undefined };

  if (error) {
    return <ErrorCard message="Failed to load activity" error={`${error}. This can happen if the activity was deleted.`} />;
  }

  if (!activity || !activityWithStateUpdates) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="flex-shrink-0 flex flex-col gap-4">
        <ActivityHeader activity={activity} withActions={true} />
        <ActivityContent activity={activity} />
        <ActivityParent activity={activity} />
        <ActivityInteractions activity={activity} />
        <div className="text-lg font-semibold">Comments</div>
        <CommentComposer activity={activity} />
      </div>
      <StreamActivityWithStateUpdates activityWithStateUpdates={activityWithStateUpdates}>
        <CommentList />
      </StreamActivityWithStateUpdates>
    </div>
  );
}
