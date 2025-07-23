import { describe, it, expect } from 'vitest';

import { shouldUpdateState } from './state-update-queue';

describe('state-update-queue', () => {
  describe('shouldUpdateState', () => {
    it('should return true when watch is false', () => {
      const result = shouldUpdateState({
        stateUpdateId: 'test-id',
        stateUpdateQueue: new Set(['other-id']),
        watch: false,
      });

      expect(result).toBe(true);
    });

    it('should return true when watch is true but stateUpdateId is not in queue', () => {
      const stateUpdateQueue = new Set(['other-id-1', 'other-id-2']);

      const result = shouldUpdateState({
        stateUpdateId: 'test-id',
        stateUpdateQueue: stateUpdateQueue,
        watch: true,
      });

      expect(stateUpdateQueue).toContain('test-id');
      expect(result).toBe(true);
    });

    it('should return false and remove stateUpdateId from queue when watch is true and stateUpdateId is in queue', () => {
      const stateUpdateQueue = new Set(['test-id', 'other-id']);

      const result = shouldUpdateState({
        stateUpdateId: 'test-id',
        stateUpdateQueue,
        watch: true,
      });

      expect(result).toBe(false);
      expect(stateUpdateQueue).toEqual(new Set(['other-id']));
    });

    it('should handle empty queue when watch is true', () => {
      const result = shouldUpdateState({
        stateUpdateId: 'test-id',
        stateUpdateQueue: new Set(),
        watch: true,
      });

      expect(result).toBe(true);
    });
  });
});
