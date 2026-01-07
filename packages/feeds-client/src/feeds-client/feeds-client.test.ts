import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedsClient } from './feeds-client';
import {
  generateActivityResponse,
  generateFeedMemberResponse,
  generateFeedResponse,
  generateFollowResponse,
} from '../test-utils';
import { FeedOwnCapability } from '..';
import { sleep } from '../common/utils';

describe('Feeds client tests', () => {
  let client: FeedsClient;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
  });

  it(`should find feeds to update for user events`, async () => {
    const feedA = client.feed('user', 'feedA');
    const feedB = client.feed('user', 'feedB');
    const feedC = client.feed('user', 'feedC');
    const activity1 = generateActivityResponse({ id: 'activity1' });

    feedA.state.partialNext({ activities: [activity1] });
    feedB.state.partialNext({ activities: [] });
    feedC.state.partialNext({
      // @ts-expect-error - we're not passing all the required fields
      pinned_activities: [{ activity: activity1 }],
    });

    const feeds = client['findAllActiveFeedsByActivityId'](activity1.id);
    expect(feeds).toHaveLength(2);
    expect(feeds).toContain(feedA);
    expect(feeds).toContain(feedC);
    expect(feeds).not.toContain(feedB);
  });

  describe('client.feed', () => {
    it('should initialize feed state with the given data if feed does not exist', async () => {
      const data = generateFeedResponse({ feed: 'timeline:feed' });
      client['getOrCreateActiveFeed']({ group: 'timeline', id: 'feed', data });

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);
    });

    it('should update feed state if data is newer than the current state', async () => {
      const data = generateFeedResponse({
        feed: 'timeline:feed',
        follower_count: 5,
      });
      client['getOrCreateActiveFeed']({ group: 'timeline', id: 'feed', data });

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);

      const newData = { ...data };
      newData.updated_at = new Date(data.updated_at.getTime() + 1000);
      newData.follower_count = 10;
      client['getOrCreateActiveFeed']({
        group: 'timeline',
        id: 'feed',
        data: newData,
      });

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(newData);
      expect(
        client['activeFeeds']['timeline:feed']?.currentState.follower_count,
      ).toBe(10);
    });

    it(`should not update feed state if data is older than the current state`, async () => {
      const data = generateFeedResponse({
        feed: 'timeline:feed',
        follower_count: 5,
      });
      client['getOrCreateActiveFeed']({ group: 'timeline', id: 'feed', data });

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);

      const oldData = { ...data };
      oldData.updated_at = new Date(data.updated_at.getTime() - 1000);
      oldData.follower_count = 3;
      client['getOrCreateActiveFeed']({
        group: 'timeline',
        id: 'feed',
        data: oldData,
      });

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);
      expect(
        client['activeFeeds']['timeline:feed']?.currentState.follower_count,
      ).toBe(5);
    });

    it(`should not update own_ fields if data is from WebSocket`, async () => {
      const ownFollows = [
        generateFollowResponse({
          source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
          target_feed: generateFeedResponse({ feed: 'user:123' }),
        }),
      ];
      const ownMembership = generateFeedMemberResponse();
      const ownCapabilities = [FeedOwnCapability.ADD_ACTIVITY];
      const data = generateFeedResponse({
        feed: 'user:123',
        follower_count: 5,
        own_follows: ownFollows,
        own_membership: ownMembership,
        own_capabilities: ownCapabilities,
      });
      client['getOrCreateActiveFeed']({ group: 'user', id: '123', data });

      const dataFromWebSocket = { ...data };
      delete dataFromWebSocket.own_follows;
      delete dataFromWebSocket.own_membership;
      delete dataFromWebSocket.own_capabilities;
      client['getOrCreateActiveFeed']({
        group: 'user',
        id: '123',
        data: dataFromWebSocket,
        fromWebSocket: true,
      });

      expect(client['activeFeeds']['user:123']?.currentState).toMatchObject(
        data,
      );
      expect(
        client['activeFeeds']['user:123']?.currentState.own_follows,
      ).toEqual(ownFollows);
      expect(
        client['activeFeeds']['user:123']?.currentState.own_membership,
      ).toEqual(ownMembership);
      expect(
        client['activeFeeds']['user:123']?.currentState.own_capabilities,
      ).toEqual(ownCapabilities);
    });
  });

  it(`should only update _own fields which are changed`, async () => {
    const ownFollows = [
      generateFollowResponse({
        source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
        target_feed: generateFeedResponse({ feed: 'user:123' }),
      }),
    ];
    const ownMembership = generateFeedMemberResponse();
    const ownCapabilities = [FeedOwnCapability.ADD_ACTIVITY];
    const data = generateFeedResponse({
      feed: 'user:123',
      follower_count: 5,
      own_follows: ownFollows,
      own_membership: ownMembership,
      own_capabilities: ownCapabilities,
    });
    client['getOrCreateActiveFeed']({ group: 'user', id: '123', data });

    const spy = vi.fn();
    const feed = client['activeFeeds']['user:123'];
    feed.state.subscribe(spy);
    spy.mockClear();

    const newData = { ...data };
    data.own_follows = [...ownFollows];
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
      fromWebSocket: false,
    });

    expect(spy).toHaveBeenCalledTimes(0);

    const newOwnFollows = [
      ...ownFollows,
      generateFollowResponse({
        source_feed: generateFeedResponse({ feed: 'timeline:feed' }),
        target_feed: generateFeedResponse({ feed: 'user:456' }),
      }),
    ];
    newData.own_follows = newOwnFollows;

    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.lastCall?.[0]).toMatchObject({
      own_follows: newOwnFollows,
    });

    spy.mockClear();
    newData.own_membership = { ...newData.own_membership! };
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
    });

    expect(spy).toHaveBeenCalledTimes(0);

    newData.own_membership!.updated_at = new Date(
      newData.own_membership!.updated_at.getTime() + 1000,
    );
    client['getOrCreateActiveFeed']({
      group: 'user',
      id: '123',
      data: newData,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.lastCall?.[0]).toMatchObject({
      own_membership: newData.own_membership,
    });
  });

  it(`should throttle calls to ownBatch endpoint`, async () => {
    vi.spyOn(client, 'ownBatch').mockResolvedValue({ data: {} } as any);
    const throttleTime = 100;
    client['setGetBatchOwnCapabilitiesThrottlingInterval'](throttleTime);

    client['throttledGetBatchOwnFields'](
      [`feed:1`, `feed:2`, `feed:3`],
      () => {},
    );
    expect(client['ownBatch']).toHaveBeenCalledTimes(1);

    client['throttledGetBatchOwnFields']([`feed:4`, `feed:5`, `feed:6`], () => {
      return Promise.resolve();
    });
    expect(client['ownBatch']).toHaveBeenCalledTimes(1);

    await sleep(throttleTime / 2);
    expect(client['ownBatch']).toHaveBeenCalledTimes(1);

    await sleep(throttleTime / 2);
    expect(client['ownBatch']).toHaveBeenCalledTimes(2);
  });
});
