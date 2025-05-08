import {
  CommonWSEvent,
  ConnectionChangedEvent,
} from './common/real-time/event-models';
import { NetworkChangedEvent } from './common/types';
import { FlatFeed } from './FlatFeed';
import { WSEvent } from './gen/models';
import { NotificationFeed } from './NotificationFeed';

export type FeedsEvent =
  | WSEvent
  | CommonWSEvent
  | ConnectionChangedEvent
  | NetworkChangedEvent;

export type StreamFeedClient =
  | ({ type: 'flat' } & FlatFeed)
  | ({ type: 'notification' } & NotificationFeed);

export type ActivityOrCommentId = string;
