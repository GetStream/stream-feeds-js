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
import type { ActivityResponse, StreamClient } from '@stream-io/node-sdk';

describe('Deferred own_ fields hydration', () => {
  const feedGroup = 'timeline';
  const feedId = crypto.randomUUID();
  let clientRef: FeedsClient;
  let serverClient: StreamClient;
  let ownUser: UserRequest = getTestUser();
  let otherUsers: UserRequest[] = [];
  let ownTimeline: Feed;
  let ownFeed: Feed;
  const initialActivities: ActivityResponse[] = [];

  beforeAll(async () => {
    ownUser = getTestUser();
    otherUsers = [getTestUser()];
    clientRef = createTestClient();
    serverClient = getServerClient();
    await clientRef.connectUser(ownUser, createTestTokenGenerator(ownUser));
    await serverClient.upsertUsers([...otherUsers]);
    ownTimeline = clientRef.feed(feedGroup, feedId);
    ownFeed = clientRef.feed('user', ownUser.id);
    await ownFeed.getOrCreate();
    await ownTimeline.getOrCreate({
      watch: false,
      limit: 25,
    });
    const ownActivityResponse = await serverClient.feeds.addActivity({
      user_id: ownUser.id,
      type: 'post',
      feeds: [ownTimeline.feed],
      text: `Initial activity from ${ownTimeline.feed}`,
    });
    initialActivities.push(ownActivityResponse.activity);
    for (let i = 0; i < otherUsers.length; i++) {
      const otherUser = otherUsers[i];
      const otherFeed = serverClient.feeds.feed('user', otherUser.id);
      await otherFeed.getOrCreate({ user_id: otherUser.id });
      const otherTimeline = serverClient.feeds.feed('timeline', otherUser.id);
      await otherTimeline.getOrCreate({ user_id: otherUser.id });
      await ownTimeline.follow(otherFeed.feed);
      // Ensures data in own_followings
      await serverClient.feeds.follow({
        source: otherTimeline.feed,
        target: ownFeed.feed,
      });
      // Ensures data in own_membership
      await serverClient.feeds.updateFeedMembers({
        feed_id: otherUser.id,
        feed_group_id: 'user',
        members: [{ user_id: ownUser.id, role: 'feed_member' }],
        operation: 'upsert',
      });
    }
  });

  it('should hydrate with own_ fields if they do not exist in the cache', async () => {
    const client = createTestClient();
    await client.connectUser(ownUser, createTestTokenGenerator(ownUser));
    const ownBatchThrottledSpy = vi.spyOn(
      client as any,
      'throttledGetBatchOwnFields',
    );

    await ownTimeline.getOrCreate({
      watch: true,
      limit: 25,
    });

    const otherUser = otherUsers[0];

    await serverClient.feeds.addActivity({
      user_id: otherUser.id,
      type: 'post',
      feeds: [`user:${otherUser.id}`],
      text: `Initial activity from ${otherUser.id}`,
    });

    await waitForEvent(ownFeed, 'feeds.activity.added', { timeoutMs: 1000 });

    const feed = client.feed('user', otherUser.id);
    await vi.waitFor(
      () => {
        expect(feed.state.getLatestValue().own_capabilities).toBeDefined();
        expect(feed.state.getLatestValue().own_follows).toBeDefined();
        expect(feed.state.getLatestValue().own_followings).toBeDefined();
        expect(feed.state.getLatestValue().own_membership).toBeDefined();
      },
      { timeout: 1000, interval: 50 },
    );

    expect(ownBatchThrottledSpy).toHaveBeenCalledExactlyOnceWith(
      [`user:${otherUser.id}`],
      expect.any(Function),
    );
  });

  afterAll(async () => {
    await ownTimeline.delete({ hard_delete: true });
    await ownFeed.delete({ hard_delete: true });
    for (let i = 0; i < otherUsers.length; i++) {
      await serverClient.feeds.deleteFeed({
        feed_group_id: 'user',
        feed_id: otherUsers[i].id,
        hard_delete: true,
      });
      await serverClient.feeds.deleteFeed({
        feed_group_id: 'timeline',
        feed_id: otherUsers[i].id,
        hard_delete: true,
      });
    }
    await serverClient.deleteUsers({
      user_ids: [...otherUsers].map((u) => u.id),
    });
    await clientRef.disconnectUser();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
});
