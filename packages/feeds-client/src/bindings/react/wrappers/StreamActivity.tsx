import type { PropsWithChildren } from 'react';
import type { Activity } from '../../../activity/activity';
import { StreamActivityContext } from '../contexts/StreamActivityContext';

/**
 * The props for the StreamActivity component. It accepts an `Activity` instance.
 */
export type StreamActivityProps = {
  activity: Activity;
};

export const StreamActivity = ({
  activity,
  children,
}: PropsWithChildren<StreamActivityProps>) => {
  return (
    <StreamActivityContext.Provider value={activity}>
      {children}
    </StreamActivityContext.Provider>
  );
};

StreamActivity.displayName = 'StreamActivity';
