import { PollState } from '@stream-io/feeds-client';
import { useStateStore } from '@/app/hooks/useStateStore';
import { usePollContext } from '@/app/poll-context';

export const usePollStateStore = <
  T extends Readonly<Record<string, unknown> | Readonly<unknown[]>>,
>(
  selector: (nextValue: PollState) => T,
): T => {
  const { poll } = usePollContext();
  return useStateStore(poll.state, selector);
};
