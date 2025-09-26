import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ThrottledCallback } from './throttle';
import { throttle } from './throttle';

const advance = (ms: number) => vi.advanceTimersByTime(ms);

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('leading:true, trailing:false (default): fires immediately, drops during window, fires again after window on next call', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200);

    t('a');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith('a');

    t('b');
    expect(spy).toHaveBeenCalledTimes(1);

    advance(199);
    t('c');
    expect(spy).toHaveBeenCalledTimes(1);

    advance(1);
    t('d');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('d');
  });

  it('leading:true, trailing:true: first call fires immediately; subsequent calls within window schedule one trailing with latest args', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, { trailing: true });

    t('a');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith('a');

    advance(50);
    t('b');
    advance(50);
    t('c');
    advance(99);
    expect(spy).toHaveBeenCalledTimes(1);

    advance(1);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('c');
  });

  it('leading:true, trailing:true: no double-invoke at boundary (new leading cancels pending trailing)', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, { trailing: true });

    t('a');
    expect(spy).toHaveBeenCalledTimes(1);

    advance(190);
    t('b');
    t('c');
    expect(spy).toHaveBeenCalledTimes(1);

    vi.setSystemTime(200);
    t('d');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('d');

    // even if we advance timers now, there should be no extra trailing (canceled)
    vi.runOnlyPendingTimers();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('leading:true, trailing:true: single call does not later trigger trailing (guard against double with same args)', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, { trailing: true });

    t('a');
    expect(spy).toHaveBeenCalledTimes(1);

    // wait past the window; no additional calls should happen
    vi.runAllTimers();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('leading:true, trailing:true: trailing uses the latest args within the window', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, { trailing: true });

    t('a');
    advance(50);
    t('b');
    advance(50);
    t('c');
    advance(100);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('c');
  });

  it('leading:false, trailing:true: does not call immediately; calls once at end of window with latest args', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, {
      leading: false,
      trailing: true,
    });

    t('a');
    expect(spy).toHaveBeenCalledTimes(0);

    advance(50);
    t('b');
    expect(spy).toHaveBeenCalledTimes(0);

    advance(150);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith('b');

    // next window:
    advance(50);
    t('c');
    expect(spy).toHaveBeenCalledTimes(1);
    advance(99);
    expect(spy).toHaveBeenCalledTimes(1);
    advance(51);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('c');
  });

  it('leading:false, trailing:false: never calls', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, {
      leading: false,
      trailing: false,
    });

    t('a');
    t('b');
    advance(1000);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('preserves `this` on trailing (apply)', () => {
    const seen: any[] = [];
    const obj = {
      x: 42,
      fn(this: any, v: string) {
        seen.push([this, v]);
      },
    };
    const throttled = throttle(obj.fn, 200, { leading: false, trailing: true });

    // Call as a method so `this` is obj
    (obj as any).call = throttled;
    (obj as any).call('hello'); // t=0
    advance(200); // trailing fires

    expect(seen.length).toBe(1);
    expect(seen[0][0]).toBe(obj);
    expect(seen[0][1]).toBe('hello');
  });

  it('schedules trailing for the exact remaining time, not the full timeout', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, { trailing: true });

    t('a');
    advance(50);
    t('b');

    advance(149);
    expect(spy).toHaveBeenCalledTimes(1);

    advance(1);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('b');
  });

  it('after a trailing fires, a call inside the next window does NOT invoke immediately (still throttled)', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, { trailing: true });

    t('a');
    advance(200);

    t('b');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('b');

    advance(50);
    t('c');
    expect(spy).toHaveBeenCalledTimes(2);

    // trailing should kick in at t=400 with 'c'
    advance(150);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenLastCalledWith('c');
  });

  it('does not fire trailing after a new leading crosses the boundary (no boundary double)', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, { trailing: true });

    t('a');
    advance(180);
    t('b');
    // cross the boundary and call immediately, which should:
    // - clear pending trailing
    // - call leading just once
    vi.setSystemTime(200);
    t('c');

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 'a');
    expect(spy).toHaveBeenNthCalledWith(2, 'c');

    // even if we advance timers, no extra trailing should occur
    vi.runOnlyPendingTimers();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('multiple calls in a burst within a window still produce at most one trailing (latest args)', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, { trailing: true });

    t(1);
    for (let i = 2; i <= 10; i++) t(i);
    expect(spy).toHaveBeenCalledTimes(1);

    advance(200);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(10);
  });

  it('does not accidentally schedule trailing when leading:false and trailing:false', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, {
      leading: false,
      trailing: false,
    });

    for (let i = 0; i < 10; i++) t(i);
    advance(1000);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('leading:true, trailing:true: next call well after window leads immediately, not waiting for any lingering timer', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, { trailing: true });

    t('a');
    advance(200);

    t('b');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('b');
  });

  it('works with different timeouts (sanity check)', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 50, { trailing: true });

    t(1);
    advance(30);
    t(2);
    advance(19);
    expect(spy).toHaveBeenCalledTimes(1);
    advance(1);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(2);

    // next cycle:
    advance(10);
    t(3);
    advance(39);
    expect(spy).toHaveBeenCalledTimes(2);
    advance(1);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenLastCalledWith(3);
  });

  it('does not leak extra invocations after long idle periods', () => {
    const spy = vi.fn();
    const t = throttle(spy as ThrottledCallback, 200, { trailing: true });

    t('a');
    advance(180);
    t('b');

    advance(20);
    expect(spy).toHaveBeenCalledTimes(2);

    // wait a long time; nothing else should fire
    advance(10000);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should have correct total invocations on spamming a lot of calls with leading and trailing', () => {
    const spy = vi.fn();
    const calls = 200;

    const t = throttle(spy, 2000, { trailing: true });

    for (let i = 0; i < calls; i++) {
      t(i);
      if (i < calls - 1) vi.advanceTimersByTime(100);
    }
    expect(spy).toHaveBeenCalledTimes(10);

    // one pending trailing for 20000ms is still queued; flush it
    vi.runAllTimers();

    expect(spy).toHaveBeenCalledTimes(11);
    expect(spy).toHaveBeenLastCalledWith(199);
  });
});
