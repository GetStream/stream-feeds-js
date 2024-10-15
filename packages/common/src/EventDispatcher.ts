import { StreamWSEvent } from './real-time/event-models';
import { LogLevel } from './types';

export class EventDispatcher {
  private subscribers: Partial<
    Record<
      StreamWSEvent['type'],
      Array<(event: StreamWSEvent) => void> | undefined
    >
  > = {};

  private readonly logger = (level: LogLevel, message: string, extra: any) => {
    // TODO implement logging
    console.log(level, message, extra);
  };

  dispatch = (event: StreamWSEvent) => {
    const listeners = this.subscribers[event.type];
    if (!listeners) return;
    for (const fn of listeners) {
      try {
        fn(event);
      } catch (e) {
        this.logger('warn', 'Listener failed with error', e);
      }
    }
  };

  on = (
    eventName: StreamWSEvent['type'],
    handler: (event: StreamWSEvent) => void,
  ) => {
    (this.subscribers[eventName] ??= []).push(handler);
    return () => {
      this.off(eventName, handler);
    };
  };

  off = (
    eventName: StreamWSEvent['type'],
    handler: (event: StreamWSEvent) => void,
  ) => {
    this.subscribers[eventName] = (this.subscribers[eventName] ?? []).filter(
      (f) => f !== handler,
    );
  };

  offAll = (eventName?: StreamWSEvent['type']) => {
    if (eventName) {
      this.subscribers[eventName] = [];
    } else {
      this.subscribers = {};
    }
  };
}
