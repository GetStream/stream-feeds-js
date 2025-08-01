import type { PollState } from '@stream-io/feeds-react-sdk';
import { useStateStore } from '@stream-io/feeds-react-sdk';
import { usePollContext } from '@/app/poll-context';

export const usePollStateStore = <
  T extends Readonly<Record<string, unknown> | readonly unknown[]>,
>(
  selector: (nextValue: PollState) => T,
): T => {
  const { poll } = usePollContext();
  return useStateStore(poll.state, selector);
};
