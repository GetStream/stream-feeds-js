import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { StateStore } from '../../src/common/StateStore';

const noop = () => {};

export function useStateStore<
  T extends Record<string, unknown>,
  O extends Readonly<Record<string, unknown> | readonly unknown[]>,
>(store: StateStore<T>, selector: (v: T) => O): O;
export function useStateStore<
  T extends Record<string, unknown>,
  O extends Readonly<Record<string, unknown> | readonly unknown[]>,
>(store: StateStore<T> | undefined, selector: (v: T) => O): O | undefined;
export function useStateStore<
  T extends Record<string, unknown>,
  O extends Readonly<Record<string, unknown> | readonly unknown[]>,
>(store: StateStore<T> | undefined, selector: (v: T) => O) {
  const wrappedSubscription = useCallback(
    (onStoreChange: () => void) => {
      const unsubscribe = store?.subscribeWithSelector(selector, onStoreChange);
      return unsubscribe ?? noop;
    },
    [store, selector],
  );

  const wrappedSnapshot = useMemo(() => {
    let cachedTuple: [T, O];

    return () => {
      const currentValue = store?.getLatestValue();

      if (!currentValue) return undefined;

      // store value hasn't changed, no need to compare individual values
      if (cachedTuple && Object.is(cachedTuple[0], currentValue)) {
        return cachedTuple[1];
      }

      const newlySelected = selector(currentValue);

      // store value changed but selected values wouldn't have to, double-check selected
      const selectionsAreEqual = StateStore.doSelectionsEqual(
        cachedTuple?.[1],
        newlySelected,
      );

      if (selectionsAreEqual) return cachedTuple[1];

      cachedTuple = [currentValue, newlySelected];
      return cachedTuple[1];
    };
  }, [store, selector]);

  const state = useSyncExternalStore(wrappedSubscription, wrappedSnapshot);

  return state;
}
