import { StreamWSEvent } from './real-time/event-models';
import { LogLevel } from './types';

export class EventDispatcher<
  Type extends string = StreamWSEvent['type'],
  Event extends { type: string } = StreamWSEvent,
> {
  private subscribers: Partial<
    Record<Type | 'all', Array<(event: Event) => void> | undefined>
  > = {};

  private readonly logger = (level: LogLevel, message: string, extra: any) => {
    // TODO implement logging
    console.log(level, message, extra);
  };

  dispatch = (event: Event) => {
    const listeners = [
      ...(this.subscribers[event.type as Type] ?? []),
      ...(this.subscribers.all ?? []),
    ];
    for (const fn of listeners) {
      try {
        fn(event);
      } catch (e) {
        this.logger('warn', 'Listener failed with error', e);
      }
    }
  };

  on = (eventName: Type | 'all', handler: (event: Event) => void) => {
    (this.subscribers[eventName] ??= []).push(handler);
    return () => {
      this.off(eventName, handler);
    };
  };

  off = (eventName: Type | 'all', handler: (event: Event) => void) => {
    this.subscribers[eventName] = (this.subscribers[eventName] ?? []).filter(
      (f) => f !== handler,
    );
  };

  offAll = (eventName?: Type | 'all') => {
    if (eventName) {
      this.subscribers[eventName] = [];
    } else {
      this.subscribers = {};
    }
  };
}
