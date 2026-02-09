import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FeedsClient } from '../src/feeds-client';
import type { ConnectedEvent } from '../src/common/real-time/event-models';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';

describe('connectGuest', () => {
  let client: FeedsClient;

  beforeEach(() => {
    client = createTestClient();
  });

  afterEach(async () => {
    await client.disconnectUser();
  });

  it('throws when called with an existing connection', async () => {
    await client.connectGuest({ user: getTestUser('guest') });

    await expect(
      client.connectGuest({ user: getTestUser('guest-2') }),
    ).rejects.toThrow('Can\'t connect a new user, call "disconnectUser" first');
  });

  it('throws when already connected as a regular user', async () => {
    const user = getTestUser();
    await client.connectUser(user, createTestTokenGenerator(user));

    await expect(
      client.connectGuest({ user: getTestUser('guest') }),
    ).rejects.toThrow('Can\'t connect a new user, call "disconnectUser" first');
  });

  it('creates a guest via API and connects as that user', async () => {
    const id = crypto.randomUUID();
    const guestUserRequest = getTestUser(id);
    const response = await client.connectGuest({ user: guestUserRequest });

    expect(response.user).toBeDefined();
    expect(response.user.id).toContain(id);
    expect(typeof response.user.id).toBe('string');
    expect(response.user.role).toBe('guest');
    expect(response.access_token).toBeDefined();
    expect(typeof response.access_token).toBe('string');
    expect(response.duration).toBeDefined();
  });

  it('sets client state with connected guest user and healthy WebSocket', async () => {
    const spy = vi.fn();
    client.state.subscribe(spy);

    const response = await client.connectGuest({ user: getTestUser('guest') });

    const state = spy.mock.lastCall?.[0];
    expect(state?.connected_user?.id).toBe(response.user.id);
    expect(state?.is_ws_connection_healthy).toBe(true);
    expect(state?.is_anonymous).toBe(false);
  });

  it('emits connection.ok after connecting as guest', async () => {
    const spy = vi.fn();
    // @ts-expect-error API spec doesn't have connection.ok event
    client.on('connection.ok', spy);

    const response = await client.connectGuest({ user: getTestUser('guest') });

    const event = spy.mock.lastCall?.[0] as ConnectedEvent | undefined;
    expect(event?.type).toBe('connection.ok');
    expect(event?.me?.id).toBe(response.user.id);
  });

  it('allows guest to perform API calls (e.g. queryUsers)', async () => {
    await client.connectGuest({ user: getTestUser('guest') });

    const response = await client.queryUsers({
      payload: {
        filter_conditions: {},
      },
    });

    expect(response.users).toBeDefined();
    expect(Array.isArray(response.users)).toBe(true);
  });
});
