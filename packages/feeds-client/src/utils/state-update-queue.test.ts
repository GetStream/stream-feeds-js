import { describe, it, expect } from 'vitest';

import { shouldUpdateState } from './state-update-queue';

describe('state-update-queue', () => {
  describe('shouldUpdateState', () => {
    it('should return true when only watch is false', () => {
      const result = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue: new Set(['ws-other-id']),
        watch: false,
        isTriggeredByConnectedUser: true,
      });

      expect(result).toBe(true);
    });

    it('should return true when only isTriggeredByConnectedUser is false', () => {
      const result = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue: new Set(['ws-other-id']),
        watch: true,
        isTriggeredByConnectedUser: false,
      });

      expect(result).toBe(true);
    });

    it('should return true when watch is true and it is triggered by the connected_user, but queueId is not in queue', () => {
      const stateUpdateQueue = new Set(['ws-other-id-1', 'ws-other-id-2']);

      const result = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue: stateUpdateQueue,
        watch: true,
        isTriggeredByConnectedUser: true,
      });

      expect(stateUpdateQueue).toContain('ws-test-id');
      expect(result).toBe(true);
    });

    it('should return false and remove queueId from queue when watch is true and WS initiated queueId is in queue', () => {
      const stateUpdateQueue = new Set(['ws-test-id', 'ws-other-id']);

      const result = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue,
        watch: true,
        fromWs: false,
        isTriggeredByConnectedUser: true,
      });

      expect(result).toBe(false);
      expect(stateUpdateQueue).toEqual(new Set(['ws-other-id']));
    });

    it('should return false and remove queueId from queue when watch is true and HTTP initiated queueId is in queue', () => {
      const stateUpdateQueue = new Set(['http-test-id', 'http-other-id']);

      const result = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue,
        watch: true,
        isTriggeredByConnectedUser: true,
      });

      expect(result).toBe(false);
      expect(stateUpdateQueue).toEqual(new Set(['http-other-id']));
    });

    it('should handle empty queue when conditions are met', () => {
      const result = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue: new Set(),
        watch: true,
        isTriggeredByConnectedUser: true,
      });

      expect(result).toBe(true);
    });

    it('should not clear the queue state if 2 equal HTTP response updates arrive', () => {
      const stateUpdateQueue = new Set<string>();

      const result1 = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue,
        watch: true,
        fromWs: false,
        isTriggeredByConnectedUser: true,
      });

      const result2 = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue,
        watch: true,
        fromWs: false,
        isTriggeredByConnectedUser: true,
      });

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(stateUpdateQueue).toEqual(new Set(['http-test-id']))
    })

    it('should not clear the queue state if 2 equal WS event updates arrive', () => {
      const stateUpdateQueue = new Set<string>();

      const result1 = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue,
        watch: true,
        isTriggeredByConnectedUser: true,
      });

      const result2 = shouldUpdateState({
        stateUpdateQueueId: 'test-id',
        stateUpdateQueue,
        watch: true,
        isTriggeredByConnectedUser: true,
      });

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(stateUpdateQueue).toEqual(new Set(['ws-test-id']))
    })
  });
});
