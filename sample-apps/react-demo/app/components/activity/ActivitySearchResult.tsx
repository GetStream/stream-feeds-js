import {
  type ActivityResponse,
  type ActivityState,
  type ActivityWithStateUpdates,
  useFeedsClient,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useEffect, useState } from 'react';
import { Activity } from './Activity';

const selector = (state: ActivityState) => ({
  activity: state.activity,
});

export const ActivitySearchResult = ({
  activity: activityInitialState,
}: {
  activity: ActivityResponse;
}) => {
  const [activityWithStateUpdates, setActivityWithStateUpdates] = useState<
    ActivityWithStateUpdates | undefined
  >();
  const client = useFeedsClient();

  useEffect(() => {
    const _activityWithStateUpdates = client?.activityWithStateUpdates(
      activityInitialState.id,
      {
        fromResponse: activityInitialState,
      },
    );
    setActivityWithStateUpdates(_activityWithStateUpdates);

    return () => _activityWithStateUpdates?.dispose();
  }, [client, activityInitialState]);

  const { activity } = useStateStore(
    activityWithStateUpdates?.state,
    selector,
  ) ?? {
    activity: activityInitialState,
  };

  if (!activity) {
    return null;
  }

  return <Activity activity={activity} location="search" />;
};
