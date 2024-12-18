import { WSEvent } from './gen/models';
import { StreamEvent } from '@stream-io/common';
import { StreamFlatFeedClient } from './StreamFlatFeedClient';
import { StreamNotificationFeedClient } from './StreamNotificationFeedClient';

export type StreamFeedsEvent = WSEvent | StreamEvent;

export type StreamFeedClient =
  | ({ type: 'flat' } & StreamFlatFeedClient)
  | ({ type: 'notification' } & StreamNotificationFeedClient);
