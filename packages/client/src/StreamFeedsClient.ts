import { StreamClient, StreamClientState } from '@stream-io/common';

export type StreamFeedsClientState = StreamClientState & {
  color: string;
};

export class StreamFeedsClient extends StreamClient {}
