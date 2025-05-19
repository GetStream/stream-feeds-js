import {
  CommonWSEvent,
  ConnectionChangedEvent,
} from './common/real-time/event-models';
import { NetworkChangedEvent } from './common/types';
import { WSEvent } from './gen/models';

export type FeedsEvent =
  | WSEvent
  | CommonWSEvent
  | ConnectionChangedEvent
  | NetworkChangedEvent;

export type ActivityOrCommentId = string;
