import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';

type ActivityPagerContextValue = {
  currentIndex: number;
  activeId?: string;
};

const ActivityPagerContext = createContext<ActivityPagerContextValue>({
  currentIndex: 0,
  activeId: undefined,
});

export const ActivityPagerContextProvider = ({ currentIndex, activeId, children }: PropsWithChildren<ActivityPagerContextValue>) => {
  const contextValue = useMemo(() => ({ currentIndex, activeId }), [currentIndex, activeId])
  return (
    <ActivityPagerContext.Provider
      value={contextValue}
    >
      {children}
    </ActivityPagerContext.Provider>
  );
};

export const useActivityPagerContext = () => useContext(ActivityPagerContext);
