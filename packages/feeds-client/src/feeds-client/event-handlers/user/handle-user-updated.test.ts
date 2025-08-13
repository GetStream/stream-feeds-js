import { describe, it, beforeEach, expect } from 'vitest';

import { FeedsClient, handleUserUpdated } from '../..';
import { generateOwnUser, generateUserResponse } from '../../../test-utils';
import { EventPayload } from '../../../types-internal';

describe('handleUserUpdated', () => {
  let feedsClient: FeedsClient;

  beforeEach(() => {
    feedsClient = new FeedsClient('mock-api-key');
    const connectedUser = generateOwnUser();

    feedsClient.state.partialNext({ connected_user: connectedUser });
  });

  it('should update the connected user in the state', () => {
    const stateBefore = feedsClient.state.getLatestValue();

    const event: EventPayload<'user.updated'> = {
      type: 'user.updated',
      created_at: new Date(),
      custom: {},
      user: {
        ...generateUserResponse(),
        ...stateBefore.connected_user!,
      },
    };

    handleUserUpdated.call(feedsClient, event);

    const stateAfter = feedsClient.state.getLatestValue();

    expect(stateAfter.connected_user).toMatchObject({ name: event.user.name });
  });

  it('should not update the connected user if the incoming event contains other user', () => {
    const event: EventPayload<'user.updated'> = {
      type: 'user.updated',
      created_at: new Date(),
      custom: {},
      user: generateUserResponse(),
    };

    const stateBefore = feedsClient.state.getLatestValue();

    handleUserUpdated.call(feedsClient, event);

    const stateAfter = feedsClient.state.getLatestValue();

    expect(stateAfter.connected_user).toBe(stateBefore.connected_user);
  });
});
