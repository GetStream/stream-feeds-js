import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { HealthCheckEvent, UserRequest } from '../src/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from './utils';
import { ConnectedEvent } from '../src/common/real-time/event-models';
import { FeedsClient } from '../src/FeedsClient';
describe('WebSocket connection', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();

  beforeAll(async () => {
    client = createTestClient();
  });

  it('should connect to WebSocket', async () => {
    const spy = vi.fn();
    client.state.subscribe(spy);

    expect(spy).toHaveBeenCalledWith(
      { connected_user: undefined, is_ws_connection_healthy: false },
      undefined,
    );

    await client.connectUser(user, createTestTokenGenerator(user));

    const connectedUser = spy.mock.lastCall?.[0]?.connected_user;
    expect(connectedUser?.id).toBe(user.id);

    const isWsConnectionHealthy =
      spy.mock.lastCall?.[0]?.is_ws_connection_healthy;
    expect(isWsConnectionHealthy).toBe(true);
  });

  it('should be able to watch WS events', async () => {
    const spy = vi.fn();
    // @ts-expect-error API spec doesn't have connection.ok event
    client.on('connection.ok', spy);

    await client.connectUser(user, createTestTokenGenerator(user));

    const event = spy.mock.lastCall?.[0] as ConnectedEvent | undefined;
    expect(event?.type).toBe('connection.ok');
    expect(event?.me?.id).toBe(user.id);
  });

  it('should be able to receive health check events', async () => {
    const spy = vi.fn();
    client.on('health.check', spy);

    await client.connectUser(user, createTestTokenGenerator(user));

    await waitForEvent(client, 'health.check', { timeoutMs: 35000 });

    const event = spy.mock.lastCall?.[0] as HealthCheckEvent | undefined;
    expect(event?.type).toBe('health.check');
  }, 35000);

  afterEach(async () => {
    await client.disconnectUser();
  });
});
