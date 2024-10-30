import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  StreamFeedsClient,
  StreamFeedsClientState,
} from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
} from './create-test-client';
import { ConnectedEvent, UserRequest } from '@stream-io/common';

describe('StreamFeedsClient', () => {
  let client: StreamFeedsClient;
  let user: UserRequest = { id: 'jane' };

  beforeAll(() => {
    client = createTestClient();
  });

  it('should create WS connection', async () => {
    const stateSpy = vi.fn();
    client.state.subscribe(stateSpy);
    const wsSpy = vi.fn();
    client.on('connection.ok', wsSpy);
    await client.connectUser(user, createTestTokenGenerator(user));

    const state = stateSpy.mock.lastCall?.[0] as StreamFeedsClientState;
    expect(state.connectedUser?.id).toBe(user.id);
    const event = wsSpy.mock.lastCall?.[0] as ConnectedEvent;
    expect(event).toBeDefined();
  });

  it('should use REST API', async () => {
    await client.queryUsers({ payload: { filter_conditions: {} } });
  });

  afterAll(async () => {
    await client.disconnectUser();
  });
});
