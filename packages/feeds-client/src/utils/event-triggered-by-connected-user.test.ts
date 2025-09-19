import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { eventTriggeredByConnectedUser as eventTriggeredByConnectedUserInternal } from './event-triggered-by-connected-user';
import { FeedsClient } from '../feeds-client';
import { Feed } from '../feed';
import {
  generateFeedResponse,
  generateOwnUser, generateUserResponse,
  getHumanId,
} from '../test-utils';

describe('eventTriggeredByConnectedUser', () => {
  let feed: Feed;
  let client: FeedsClient;
  let currentUserId: string;

  let eventTriggeredByConnectedUser: OmitThisParameter<typeof eventTriggeredByConnectedUserInternal>

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    currentUserId = getHumanId();

    client.state.partialNext({
      connected_user: generateOwnUser({ id: currentUserId }),
    });

    const feedResponse = generateFeedResponse({
      id: 'main',
      group_id: 'user',
      created_by: { id: currentUserId },
    });

    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );

    eventTriggeredByConnectedUser = eventTriggeredByConnectedUserInternal.bind(feed);
  });

  afterEach(() => {
    vi.resetAllMocks();
  })

  it('returns true when payload.user.id matches connected_user.id', () => {
    const user = generateUserResponse({ id: currentUserId });
    const result = eventTriggeredByConnectedUser({ user });
    expect(result).toBe(true);
  });

  it('returns true when payload.user is undefined and connected_user exists', () => {
    const result = eventTriggeredByConnectedUser({});
    expect(result).toBe(true);
  });

  it('returns false when payload.user.id differs from connected_user.id', () => {
    const user = generateUserResponse({ id: getHumanId() });
    const result = eventTriggeredByConnectedUser({ user });
    expect(result).toBe(false);
  });

  it('returns false when connected_user is undefined (even if payload.user present)', () => {
    // @ts-expect-error using protected value only in tests
    feed.client.state.partialNext({ connected_user: undefined });
    const user = generateUserResponse({ id: currentUserId });
    const result1 = eventTriggeredByConnectedUser({ user });
    const result2 = eventTriggeredByConnectedUser({});
    expect(result1).toBe(false);
    expect(result2).toBe(false);
  });
});
