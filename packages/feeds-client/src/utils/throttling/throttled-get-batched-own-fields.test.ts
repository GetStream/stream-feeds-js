import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  queueBatchedOwnFields,
  clearQueuedFeeds,
} from './throttled-get-batched-own-fields';

describe('queueBatchedOwnFields', () => {
  beforeEach(() => {
    clearQueuedFeeds();
  });

  it('calls throttledGetBatchOwnFields with queued feeds and clears them via callback', () => {
    const throttledGetBatchOwnFields = vi.fn();
    const client: any = { throttledGetBatchOwnFields };

    // First enqueue two feeds → should call with both
    queueBatchedOwnFields.call(client, { feeds: ['feed:1', 'feed:2'] });
    expect(throttledGetBatchOwnFields).toHaveBeenCalledTimes(1);

    const firstArgs = throttledGetBatchOwnFields.mock.calls[0];
    const firstQueued = firstArgs[0] as string[];
    const firstCallback = firstArgs[1] as (feedsToClear: string[]) => void;
    expect(new Set(firstQueued)).toEqual(new Set(['feed:1', 'feed:2']));

    // Simulate downstream completion that clears only `feed:1`
    firstCallback(['feed:1']);

    // Calling again without adding new feeds should pass only the remaining queued feed
    queueBatchedOwnFields.call(client, { feeds: [] });
    expect(throttledGetBatchOwnFields).toHaveBeenCalledTimes(2);

    const secondArgs = throttledGetBatchOwnFields.mock.calls[1];
    const secondQueued = secondArgs[0] as string[];
    const secondCallback = secondArgs[1] as (feedsToClear: string[]) => void;
    expect(secondQueued).toEqual(['feed:2']);

    // Now clear the last remaining feed
    secondCallback(['feed:2']);

    // With nothing queued anymore, a subsequent call should not trigger a throttled call
    queueBatchedOwnFields.call(client, { feeds: [] });
    expect(throttledGetBatchOwnFields).toHaveBeenCalledTimes(2);
  });

  it('should provide no more feeds than the API limit (100)', () => {
    const throttledGetBatchOwnFields = vi.fn();
    const client: any = { throttledGetBatchOwnFields };

    queueBatchedOwnFields.call(client, {
      feeds: Array.from({ length: 101 }, (_, i) => `feed:${i + 1}`),
    });
    expect(throttledGetBatchOwnFields).toHaveBeenCalledTimes(1);
    const args = throttledGetBatchOwnFields.mock.calls[0];

    expect(args[0]).toHaveLength(100);

    const clearCallback = args[1] as (feedsToClear: string[]) => void;
    clearCallback(args[0]);

    queueBatchedOwnFields.call(client, {
      feeds: [`feed:102`],
    });

    expect(throttledGetBatchOwnFields).toHaveBeenCalledTimes(2);
    const args2 = throttledGetBatchOwnFields.mock.calls[1];
    expect(args2[0]).toHaveLength(2);
  });

  it('should not call throttledGetBatchOwnFields if there are no feeds to queue', () => {
    const throttledGetBatchOwnFields = vi.fn();
    const client: any = { throttledGetBatchOwnFields };

    queueBatchedOwnFields.call(client, { feeds: [] });
    expect(throttledGetBatchOwnFields).not.toHaveBeenCalled();
  });
});
