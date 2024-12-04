import {
  Activity as StreamActivity,
  StreamFlatFeedClient,
} from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { Activity } from './Activity';

export const Feed = ({ feed }: { feed: StreamFlatFeedClient }) => {
  const [activities, setActivities] = useState<StreamActivity[]>([]);

  useEffect(() => {
    const unsubscribe = feed.state.subscribeWithSelector(
      (state) => ({ activities: state.activities }),
      ({ activities }) => {
        setActivities(activities || []);
      },
    );

    return unsubscribe;
  }, [feed]);

  return (
    <>
      <div className="w-3/4 flex flex-col gap-3">
        <div>
          <textarea></textarea>
          <button>Post</button>
        </div>
        {activities.map((a) => (
          <Activity activity={a}></Activity>
        ))}
      </div>
    </>
  );
};
