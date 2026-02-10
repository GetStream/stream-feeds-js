import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import { UnhandledErrorType } from '../../src/common/real-time/event-models';
import type { FeedsClient } from '../../src/feeds-client';
import type { UserRequest } from '../../src/gen/models';

describe('Error handling page', () => {
  let client: FeedsClient;
  let user: UserRequest;
  let tokenOrProvider: () => Promise<string>;

  beforeAll(async () => {
    user = getTestUser();
    tokenOrProvider = createTestTokenGenerator(user);
    client = createTestClient();
    await client.connectUser(user, tokenOrProvider);
  });

  it('unhandled errors handler and reconnect pattern', async () => {
    const reconnect = async () => {
      await client.disconnectUser();
      await client.connectUser(user, tokenOrProvider);
    };

    client.on('errors.unhandled', (event) => {
      const errorType = event.error_type;

      switch (errorType) {
        case UnhandledErrorType.ReconnectionReconciliation: {
          void reconnect();
          break;
        }

        case UnhandledErrorType.FetchingOwnFieldsOnNewActivity: {
          void reconnect();
          break;
        }

        default: {
          console.warn(
            `Unrecognized error ${errorType} has been dispatched.`,
          );
        }
      }
    });

    // Handler is registered; we do not trigger an actual unhandled error in this test
  });

  afterAll(async () => {
    await client.disconnectUser();
  });
});
