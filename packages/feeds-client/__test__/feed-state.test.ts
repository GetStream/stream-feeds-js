import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import { createTestClient, createTestTokenGenerator } from './utils';
import { v4 as uuidv4 } from 'uuid';
import { FeedMember } from '../src/gen/models';
import {
  StreamFlatFeedClient,
  StreamFlatFeedState,
} from '../src/StreamFlatFeedClient';

describe('Feeds state test', () => {
  const emily = { id: 'emily' };
  let emilyClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;

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
      watch: true,
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

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const member: FeedMember = { user: { id: 'alice' } } as FeedMember;
    emilyFeed.state.partialNext({
      members: [member],
    });

    expect(spy.mock.calls.length).toBe(1);
  });

  it('add activities to state on read', async () => {
    const activityResponse = await emilyFeed.addActivity({
      object: 'post:12',
      verb: 'create',
    });

    await emilyFeed.read({ offset: 0, limit: 30 });

    const activities = emilyFeed.state.getLatestValue().activities ?? [];
    expect(activities.length).toBe(1);
    expect(activities[0].id).toBe(activityResponse.activity.id);
  });

  it('add new activity to state on WS event', async () => {
    const activityResponse = await emilyFeed.addActivity({
      object: 'post:13',
      verb: 'create',
    });

    // hacky solution to wait for WS event
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const activities = emilyFeed.state.getLatestValue().activities ?? [];
    const lastActivity = activities[0];
    expect(activities.length).toBe(2);
    expect(lastActivity.id).toBe(activityResponse.activity.id);

    // check WS event decoding
    expect(lastActivity.created_at instanceof Date).toBe(true);
  });

  afterAll(async () => {
    await emilyFeed.delete();
  });
});
