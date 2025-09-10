import { describe, it, expect } from 'vitest';

import { shouldUpdateState } from './state-update-queue';

describe('state-update-queue', () => {
  describe('shouldUpdateState', () => {
    it('should return true when watch is false', () => {
      const result = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue: new Set(['ws-other-id']),
        watch: false,
      });

      expect(result).toBe(true);
    });

    it('should return true when watch is true but queueId is not in queue', () => {
      const stateUpdateQueue = new Set(['ws-other-id-1', 'ws-other-id-2']);

      const result = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue: stateUpdateQueue,
        watch: true,
      });

      expect(stateUpdateQueue).toContain('ws-test-id');
      expect(result).toBe(true);
    });

    it('should return false and remove queueId from queue when watch is true and queueId is in queue', () => {
      const stateUpdateQueue = new Set(['ws-test-id', 'ws-other-id']);

      const result = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue,
        watch: true,
        fromWs: false,
      });

      expect(result).toBe(false);
      expect(stateUpdateQueue).toEqual(new Set(['ws-other-id']));
    });

    it('should handle empty queue when watch is true', () => {
      const result = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue: new Set(),
        watch: true,
      });

      expect(result).toBe(true);
    });
  });
});
