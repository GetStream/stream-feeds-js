import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo } from 'react';
import type { ActivityResponse } from '@stream-io/feeds-react-native-sdk';

type ActivityContextValue = ActivityResponse;

const ActivityContext = createContext<ActivityContextValue>(undefined!);

export const ActivityProvider = ({
  activity,
  children,
}: PropsWithChildren<{ activity: ActivityContextValue }>) => {
  const contextValue = useMemo(() => activity, [activity]);
  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityContext = () => useContext(ActivityContext);
