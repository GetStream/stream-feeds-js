import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { StreamClient } from '../src/StreamClient';
import { UserRequest } from '../src/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
} from './create-test-client';
import { ConnectedEvent } from '../src/real-time/event-models';

describe('WebSocket connection', () => {
  let client: StreamClient;
  const user: UserRequest = { id: 'jane' };

  beforeAll(() => {
    client = createTestClient();
  });

  it('should connect to WebSocket', async () => {
    const spy = vi.fn();
    client.state.subscribe(spy);

    expect(spy).toHaveBeenCalledWith({ connectedUser: undefined }, undefined);

    await client.connectUser(user, createTestTokenGenerator(user));

    const connectedUser = spy.mock.lastCall?.[0]?.connectedUser;
    expect(connectedUser?.id).toBe(user.id);
  });

  it('should be able to watch WS events', async () => {
    const spy = vi.fn();
    client.on('connection.ok', spy);

    await client.connectUser(user, createTestTokenGenerator(user));

    const event = spy.mock.lastCall?.[0] as ConnectedEvent | undefined;
    expect(event?.type).toBe('connection.ok');
    expect(event?.me?.id).toBe(user.id);
  });

  afterEach(async () => {
    await client.disconnectUser();
  });
});
