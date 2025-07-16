import { FeedsEvent } from '../types';
import { LogLevel } from './types';

export class EventDispatcher<
  Type extends string = FeedsEvent['type'],
  Event extends { type: string } = FeedsEvent,
> {
  private subscribers: Partial<
    Record<Type | 'all', Array<(event: Event) => void> | undefined>
  > = {};

  private readonly logger = (_: LogLevel, __: string, ___: any) => {
    // TODO implement logging
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
        // TODO: do we really want to silence this error?
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
