import { StreamEvent } from '@stream-io/common';

export type ColorEvent = {
  type: 'color';
  color: string;
};

export type StreamFeedsEvent = StreamEvent | ColorEvent;
