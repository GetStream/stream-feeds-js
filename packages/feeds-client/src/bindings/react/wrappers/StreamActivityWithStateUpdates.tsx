import type { PropsWithChildren } from 'react';

import { StreamActivityWithStateUpdatesContext } from '../contexts/StreamActivityWithStateUpdatesContext';
import type { ActivityWithStateUpdates } from '../../../activity-with-state-updates/activity-with-state-updates';

/**
 * The props for the StreamActivityWithStateUpdates component. It accepts an `ActivityWithStateUpdates` instance.
 */
export type StreamActivityWithStateUpdatesProps = {
  activityWithStateUpdates: ActivityWithStateUpdates;
};

export const StreamActivityWithStateUpdates = ({
  activityWithStateUpdates,
  children,
}: PropsWithChildren<StreamActivityWithStateUpdatesProps>) => {
  return (
    <StreamActivityWithStateUpdatesContext.Provider value={activityWithStateUpdates}>
      {children}
    </StreamActivityWithStateUpdatesContext.Provider>
  );
};

StreamActivityWithStateUpdates.displayName = 'StreamActivityWithStateUpdates';
