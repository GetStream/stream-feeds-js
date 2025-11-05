import { createContext, useContext } from 'react';
import type { Activity } from '../../../activity/activity';

export const StreamActivityContext = createContext<Activity | undefined>(
  undefined,
);

/**
 * The props for the StreamActivityProvider component.
 */
export type StreamActivityContextProps = {
  activity: Activity;
};

/**
 * Hook to access the nearest Activity instance.
 */
export const useActivityContext = () => {
  return useContext(StreamActivityContext);
};
