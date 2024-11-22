import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import { createTestClient, createTestTokenGenerator } from './utils';
import { v4 as uuidv4 } from 'uuid';
import { FeedMember } from '../src/gen/models';
import { StreamFlatFeed, StreamFlatFeedState } from '../src/StreamFlatFeed';

describe('Feeds state test', () => {
  const emily = { id: 'emily' };
  let emilyClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeed;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));
    emilyFeed = emilyClient.feed('user', uuidv4());
  });

  it('set initial state', async () => {
    expect(emilyFeed.state.getLatestValue().created_by).toBe(undefined);
  });

  it('update state on create', async () => {
    const spy = vi.fn();
    emilyFeed.state.subscribe(spy);

    await emilyFeed.getOrCreate({
      members: [{ user_id: 'bob' }],
      visibility_level: 'visible',
    });

    const currentState = spy.mock.lastCall?.[0] as StreamFlatFeedState;
    expect(
      currentState.members?.find((m) => m.user?.id === 'bob'),
    ).toBeDefined();
  });

  it('subscribe to partial state changes', () => {
    const spy = vi.fn();
    emilyFeed.state.subscribeWithSelector((state) => [state.members], spy);
    spy.mockReset();

    emilyFeed.state.partialNext({
      visibility_level: 'public',
    });

    expect(spy.mock.calls.length).toBe(0);

    emilyFeed.state.partialNext({
      members: [{ user: { id: 'alice' } } as FeedMember],
    });

    expect(spy.mock.calls.length).toBe(1);
  });

  afterAll(async () => {
    await emilyFeed.delete();
  });
});
