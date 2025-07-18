import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

type ActivityPagerContextValue = {
  activeId?: string;
};

const ActivityPagerContext = createContext<ActivityPagerContextValue>({
  activeId: undefined,
});

export const ActivityPagerContextProvider = ({
  activeId,
  children,
}: PropsWithChildren<ActivityPagerContextValue>) => {
  const contextValue = useMemo(() => ({ activeId }), [activeId]);
  return (
    <ActivityPagerContext.Provider value={contextValue}>
      {children}
    </ActivityPagerContext.Provider>
  );
};

export const useActivityPagerContext = () => useContext(ActivityPagerContext);
