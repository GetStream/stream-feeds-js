import { WSEvent } from './gen/models';
import { StreamEvent } from '@stream-io/common';

export type StreamFeedsEvent = WSEvent | StreamEvent;
