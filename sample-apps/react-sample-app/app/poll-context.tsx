'use client';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import {
  useFeedsClient,
  type ActivityResponse,
  type PollResponseData,
  type StreamPoll,
} from '@stream-io/feeds-react-sdk';

type PollContextValue = {
  poll: StreamPoll;
  activity: ActivityResponse;
};

type PollContextProps = {
  activity: ActivityResponse;
  poll: PollResponseData;
};

const PollContext = createContext<PollContextValue | undefined>(undefined);

export const PollContextProvider = ({
  children,
  activity,
  poll,
}: PropsWithChildren<PollContextProps>) => {
  const client = useFeedsClient();
  const pollFromState = client?.pollFromState(poll.id);

  if (!pollFromState) {
    return null;
  }

  const pollContextValue = useMemo(
    () => ({ poll: pollFromState, activity }),
    [pollFromState, activity],
  );

  return (
    <PollContext.Provider value={pollContextValue}>
      {children}
    </PollContext.Provider>
  );
};

export const usePollContext = () => {
  const ctx = useContext(PollContext);
  if (!ctx) {
    throw new Error('usePollContext must be used within PollContext');
  }

  return ctx;
};
