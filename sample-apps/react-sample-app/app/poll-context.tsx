'use client';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ActivityResponse, Poll, StreamPoll } from '@stream-io/feeds-client';
import { useUserContext } from '@/app/user-context';

type PollContextValue = {
  poll: StreamPoll;
  activity: ActivityResponse;
};

type PollContextProps = {
  activity: ActivityResponse;
  poll: Poll;
}

const PollContext = createContext<PollContextValue | undefined>(undefined);

export const PollContextProvider = ({ children, activity, poll }: PropsWithChildren<PollContextProps>) => {
  const { client } = useUserContext();
  const pollFromState = client?.pollFromState(poll.id);

  if (!pollFromState) {
    return null;
  }

  const pollContextValue = useMemo(() => ({ poll: pollFromState, activity }), [pollFromState, activity]);

  return (
    <PollContext.Provider
      value={pollContextValue}
    >
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
}
