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
import type { StreamClient } from '@stream-io/node-sdk';

describe('Deferred own_ fields hydration', () => {
  let clientRef: FeedsClient;
  let serverClient: StreamClient;
  let ownUser: UserRequest = getTestUser();
  let otherUsers: UserRequest[] = [];
  let ownTimeline: Feed;
  let ownFeed: Feed;

  beforeAll(async () => {
    ownUser = getTestUser();
    otherUsers = [getTestUser()];
    clientRef = createTestClient();
    serverClient = getServerClient();
    await clientRef.connectUser(ownUser, createTestTokenGenerator(ownUser));
    await serverClient.upsertUsers([...otherUsers]);
    ownTimeline = clientRef.feed('timeline', ownUser.id);
    ownFeed = clientRef.feed('user', ownUser.id);
    await ownFeed.getOrCreate();
    await ownTimeline.getOrCreate({
      watch: false,
      limit: 25,
    });
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

    const timeline = client.feed('timeline', ownUser.id, {
      onNewActivity: () => 'add-to-start',
    });
    await timeline.getOrCreate({
      watch: true,
      limit: 25,
    });

    const otherUser = otherUsers[0];

    serverClient.feeds.addActivity({
      user_id: otherUser.id,
      type: 'post',
      feeds: [`user:${otherUser.id}`],
      text: `Initial activity from ${otherUser.id}`,
    });

    await waitForEvent(timeline, 'feeds.activity.added', {
      timeoutMs: 10000,
      shouldReject: true,
    });

    await vi.waitFor(
      () => {
        const feed = client.feed('user', otherUser.id);
        expect(feed.currentState.own_capabilities).toBeDefined();
        expect(feed.currentState.own_follows).toBeDefined();
        expect(feed.currentState.own_followings).toBeDefined();
        expect(feed.currentState.own_membership).toBeDefined();
      },
      { timeout: 10000, interval: 50 },
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
