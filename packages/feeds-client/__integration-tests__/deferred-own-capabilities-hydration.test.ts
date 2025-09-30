import {
  describe,
  expect,
  it,
  vi,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
import type { UserRequest } from '../src/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  getTestUser,
  waitForEvent,
} from './utils';
import type { FeedsClient } from '../src/feeds-client';
import type { Feed } from '../src/feed';
import type {
  ActivityResponse,
  StreamClient,
  StreamFeed,
} from '@stream-io/node-sdk';

describe('Deferred own_capabilities hydration', () => {
  const feedGroup = 'timeline';
  const feedId = crypto.randomUUID();
  let clientRef: FeedsClient;
  let serverClient: StreamClient;
  let ownUser: UserRequest = getTestUser();
  let otherUsers: UserRequest[] = [];
  let otherUsersWithExistingActivities: UserRequest[] = [];
  let ownFeedRef: Feed;
  const otherFeeds: StreamFeed[] = [];
  const otherFeedsWithExistingActivities: StreamFeed[] = [];
  const initialActivities: ActivityResponse[] = [];

  beforeAll(async () => {
    ownUser = getTestUser();
    otherUsers = [getTestUser(), getTestUser(), getTestUser()];
    otherUsersWithExistingActivities = [
      getTestUser(),
      getTestUser(),
      getTestUser(),
    ];
    clientRef = createTestClient();
    serverClient = getServerClient();
    await clientRef.connectUser(ownUser, createTestTokenGenerator(ownUser));
    await serverClient.upsertUsers([
      ...otherUsers,
      ...otherUsersWithExistingActivities,
    ]);
    ownFeedRef = clientRef.feed(feedGroup, feedId);
    await ownFeedRef.getOrCreate({
      watch: false,
      member_pagination: { limit: 25 },
      limit: 25,
    });
    const ownActivityResponse = await serverClient.feeds.addActivity({
      user_id: ownUser.id,
      type: 'post',
      feeds: [ownFeedRef.feed],
      text: `Initial activity from ${ownFeedRef.feed}`,
    });
    initialActivities.push(ownActivityResponse.activity);
    for (let i = 0; i < otherUsers.length; i++) {
      const otherUser = otherUsers[i];
      const otherFeed = serverClient.feeds.feed('user', otherUser.id);
      await otherFeed.getOrCreate({ watch: false, user_id: otherUser.id });
      await ownFeedRef.follow(otherFeed.feed);
      otherFeeds.push(otherFeed);
    }

    for (let i = 0; i < otherUsersWithExistingActivities.length; i++) {
      const otherUser = otherUsersWithExistingActivities[i];
      const otherFeed = serverClient.feeds.feed('user', otherUser.id);
      await otherFeed.getOrCreate({ watch: false, user_id: otherUser.id });
      await ownFeedRef.follow(otherFeed.feed);
      otherFeedsWithExistingActivities.push(otherFeed);
      const activityResponse = await serverClient.feeds.addActivity({
        user_id: otherUser.id,
        type: 'post',
        feeds: [otherFeed.feed],
        text: `Initial activity from ${otherFeed.feed}`,
      });
      initialActivities.push(activityResponse.activity);
    }
  });

  it('should properly populate capabilities on getOrCreate', async () => {
    const client = createTestClient();
    await client.connectUser(ownUser, createTestTokenGenerator(ownUser));
    const ownFeed = client.feed(feedGroup, feedId);

    const initialCapabilities =
      client.state.getLatestValue().own_capabilities_by_fid;
    expect(Object.keys(initialCapabilities).length).toBe(0);

    await ownFeed.getOrCreate({ watch: false });

    // should populate from activities after getOrCreate
    const newCapabilities =
      client.state.getLatestValue().own_capabilities_by_fid;
    expect(Object.keys(newCapabilities).length).toBe(4);
    expect(newCapabilities[ownFeed.feed]).toBeDefined();
    for (let i = 0; i < otherFeedsWithExistingActivities.length; i++) {
      const otherFeed = otherFeedsWithExistingActivities[i];
      expect(newCapabilities[otherFeed.feed]).toBeDefined();
    }
  });

  it('should properly populate capabilities on queryFeeds', async () => {
    const client = createTestClient();
    await client.connectUser(ownUser, createTestTokenGenerator(ownUser));
    const ownFeed = client.feed(feedGroup, feedId);

    const initialCapabilities =
      client.state.getLatestValue().own_capabilities_by_fid;
    expect(Object.keys(initialCapabilities).length).toBe(0);

    const feedsToQuery = [ownFeed.feed, otherFeeds[0].feed, otherFeeds[1].feed];

    await client.queryFeeds({ filter: { feed: { $in: feedsToQuery } } });

    const newCapabilities =
      client.state.getLatestValue().own_capabilities_by_fid;
    expect(Object.keys(newCapabilities).length).toBe(3);
    for (const feed of feedsToQuery) {
      expect(newCapabilities[feed]).toBeDefined();
    }
  });

  it('should properly populate capabilities on queryActivities', async () => {
    const client = createTestClient();
    await client.connectUser(ownUser, createTestTokenGenerator(ownUser));

    const initialCapabilities =
      client.state.getLatestValue().own_capabilities_by_fid;
    expect(Object.keys(initialCapabilities).length).toBe(0);

    await client.queryActivities({
      filter: { id: { $in: initialActivities.map((a) => a.id) } },
    });

    // waiting in case some queried activities do not contain `current_feed.own_capabilities`
    await vi.waitFor(
      () => {
        const newCapabilities =
          client.state.getLatestValue().own_capabilities_by_fid;
        expect(Object.keys(newCapabilities).length).toBe(
          initialActivities.length,
        );
        for (const activity of initialActivities) {
          if (activity.current_feed?.feed) {
            expect(newCapabilities[activity.current_feed?.feed]).toBeDefined();
          }
        }
      },
      { timeout: 1000, interval: 50 },
    );
  });

  it('should not add extra capabilities in the cache if they already exist', async () => {
    const client = createTestClient();
    const getCapabilitiesSpy = vi.spyOn(
      client as any,
      'throttledGetBatchOwnCapabilities',
    );
    await client.connectUser(ownUser, createTestTokenGenerator(ownUser));
    const ownFeed = client.feed(feedGroup, feedId);

    await ownFeed.getOrCreate({
      watch: true,
      member_pagination: { limit: 25 },
      limit: 25,
    });

    const initialCapabilities =
      client.state.getLatestValue().own_capabilities_by_fid;

    await ownFeed.addActivity({
      type: 'post',
      text: `Another activity from ${ownFeed.feed}`,
    });

    await waitForEvent(ownFeed, 'feeds.activity.added', { timeoutMs: 1000 });

    const newCapabilities =
      client.state.getLatestValue().own_capabilities_by_fid;
    expect(initialCapabilities).toBe(newCapabilities);
    expect(getCapabilitiesSpy).not.toHaveBeenCalled();
  });

  it('should hydrate with extra capabilities if they do not exist in the cache', async () => {
    const client = createTestClient();
    const getCapabilitiesSpy = vi.spyOn(
      client as any,
      'throttledGetBatchOwnCapabilities',
    );
    await client.connectUser(ownUser, createTestTokenGenerator(ownUser));
    const ownFeed = client.feed(feedGroup, feedId);

    await ownFeed.getOrCreate({
      watch: true,
      member_pagination: { limit: 25 },
      limit: 25,
    });

    const initialCapabilities =
      client.state.getLatestValue().own_capabilities_by_fid;

    for (const key of Object.keys(initialCapabilities)) {
      if (
        ![
          ownFeed.feed,
          ...otherFeedsWithExistingActivities.map((f) => f.feed),
        ].includes(key)
      ) {
        delete initialCapabilities[key];
      }
    }

    client.state.partialNext({ own_capabilities_by_fid: initialCapabilities });

    const otherFeed = otherFeeds[0];
    const otherUser = otherUsers[0];

    await serverClient.feeds.addActivity({
      user_id: otherUser.id,
      type: 'post',
      feeds: [otherFeed.feed],
      text: `Initial activity from ${otherFeed.feed}`,
    });

    await waitForEvent(ownFeed, 'feeds.activity.added', { timeoutMs: 1000 });

    await vi.waitFor(
      () => {
        const finalCapabilities =
          client.state.getLatestValue().own_capabilities_by_fid;
        expect(Object.keys(finalCapabilities).length).toBe(
          Object.keys(initialCapabilities).length + 1,
        );
        expect(finalCapabilities[otherFeed.feed]).toBeDefined();
      },
      { timeout: 1000, interval: 50 },
    );

    expect(getCapabilitiesSpy).toHaveBeenCalledExactlyOnceWith(
      [otherFeed.feed],
      expect.any(Function),
    );
  });

  it('should throttle new capabilities hydration', async () => {
    const client = createTestClient();
    const getCapabilitiesSpy = vi.spyOn(client as any, 'queryFeeds');
    await client.connectUser(ownUser, createTestTokenGenerator(ownUser));
    const ownFeed = client.feed(feedGroup, feedId);

    await ownFeed.getOrCreate({
      watch: true,
      member_pagination: { limit: 25 },
      limit: 25,
    });

    const initialCapabilities =
      client.state.getLatestValue().own_capabilities_by_fid;

    for (const key of Object.keys(initialCapabilities)) {
      if (
        ![
          ownFeed.feed,
          ...otherFeedsWithExistingActivities.map((f) => f.feed),
        ].includes(key)
      ) {
        delete initialCapabilities[key];
      }
    }

    client.state.partialNext({ own_capabilities_by_fid: initialCapabilities });

    for (let i = 0; i < otherUsers.length; i++) {
      const otherFeed = otherFeeds[i];
      const otherUser = otherUsers[i];
      await serverClient.feeds.addActivity({
        user_id: otherUser.id,
        type: 'post',
        feeds: [otherFeed.feed],
        text: `Initial activity from ${otherFeed.feed}`,
      });
    }

    await vi.waitFor(
      () => {
        const finalCapabilities =
          client.state.getLatestValue().own_capabilities_by_fid;
        expect(Object.keys(finalCapabilities).length).toBe(
          Object.keys(initialCapabilities).length + 3,
        );
        for (const otherFeed of otherFeeds) {
          expect(finalCapabilities[otherFeed.feed]).toBeDefined();
        }
      },
      // always leave enough of a timeout for the fetch to fire 3 times;
      // it should of course fire only 2 and be done at most in 2000 + some
      // delta ms, but just in case this behaviour gets broken
      { timeout: 6050, interval: 50 },
    );

    expect(getCapabilitiesSpy).toHaveBeenCalledTimes(2);
    expect(getCapabilitiesSpy.mock.calls[0][0]).toStrictEqual({
      filter: { feed: { $in: [otherFeeds[0].feed] } },
    });
    expect(getCapabilitiesSpy.mock.calls[1][0]).toStrictEqual({
      filter: { feed: { $in: [otherFeeds[1].feed, otherFeeds[2].feed] } },
    });
  });

  afterAll(async () => {
    await ownFeedRef.delete({ hard_delete: true });
    for (let i = 0; i < otherFeeds.length; i++) {
      const otherFeed = otherFeeds[i];
      await otherFeed.delete({ hard_delete: true });
    }
    for (let i = 0; i < otherFeedsWithExistingActivities.length; i++) {
      const otherFeed = otherFeedsWithExistingActivities[i];
      await otherFeed.delete({ hard_delete: true });
    }
    await serverClient.deleteUsers({
      user_ids: [...otherUsers, ...otherUsersWithExistingActivities].map(
        (u) => u.id,
      ),
    });
    await clientRef.disconnectUser();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
});
