import { StreamEvent } from '@stream-io/common';

// TODO remove this, this is just a test event to test the architecture
export type ColorEvent = {
  type: 'color';
  color: string;
};

export type StreamFeedsEvent = StreamEvent | ColorEvent;
