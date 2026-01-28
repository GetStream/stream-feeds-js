import { createContext, useContext } from 'react';

import type { ActivityWithStateUpdates } from '../../../activity-with-state-updates/activity-with-state-updates';

export const StreamActivityWithStateUpdatesContext = createContext<ActivityWithStateUpdates | undefined>(undefined);

/**
 * The props for the StreamActivityWithStateUpdatesProvider component.
 */
export type StreamActivityWithStateUpdatesContextProps = {
  activityWithStateUpdates: ActivityWithStateUpdates;
};

/**
 * Hook to access the nearest ActivityWithStateUpdates instance.
 */
export const useActivityWithStateUpdatesContext = () => {
  return useContext(StreamActivityWithStateUpdatesContext);
};
