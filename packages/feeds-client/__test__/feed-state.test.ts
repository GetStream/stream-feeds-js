import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
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
    await emilyFeed.read({ offset: 0, limit: 25 });

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

  it('subscribe to partial state changes - comments', () => {
    const spy = vi.fn();
    const activityId = '1';
    emilyFeed.state.subscribeWithSelector(
      (state) => ({ comments: state.activity_comments[activityId]?.comments }),
      spy,
    );
    spy.mockReset();

    emilyFeed.state.partialNext({
      activity_comments: { 2: { comments: [], next: undefined } },
    });

    expect(spy.mock.calls.length).toBe(0);

    emilyFeed.state.partialNext({
      activity_comments: {
        2: { comments: [], next: undefined },
        [activityId]: { comments: [], next: undefined },
      },
    });

    expect(spy.mock.calls.length).toBe(1);
  });

  it('should properly decode dates in WS events', async () => {
    const request = emilyFeed.addActivity({
      object: 'post:13',
      verb: 'create',
    });

    await waitForEvent(emilyClient, 'feeds.activity_added');

    const activityResponse = await request;

    const activities = emilyFeed.state.getLatestValue().activities ?? [];
    const lastActivity = activities[0];
    expect(lastActivity.id).toBe(activityResponse.activity.id);

    // check WS event decoding
    expect(lastActivity.created_at instanceof Date).toBe(true);
  });

  it('should delete feed', async () => {
    expect(emilyFeed.state.getLatestValue().deleted_at).toBeUndefined();

    void emilyFeed.delete();

    await waitForEvent(emilyClient, 'feeds.feed_deleted');

    expect(emilyFeed.state.getLatestValue().deleted_at).toBeDefined();
  });

  afterAll(async () => {
    if (!emilyFeed.state.getLatestValue().deleted_at) {
      await emilyFeed.delete();
    }
  });
});
