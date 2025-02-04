import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';

describe('Feed members', () => {
  const emily = { id: 'emily' };
  const bob = { id: 'bob' };
  const jane = { id: 'jane' };
  let emilyClient: StreamFeedsClient;
  let bobClient: StreamFeedsClient;
  let janeClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;
  let bobFeed: StreamFlatFeedClient;
  let janeFeed: StreamFlatFeedClient;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));
    bobClient = createTestClient();
    await bobClient.connectUser(bob, createTestTokenGenerator(bob));
    janeClient = createTestClient();
    await janeClient.connectUser(jane, createTestTokenGenerator(jane));
  });

  it('emily creates a feed', async () => {
    emilyFeed = emilyClient.feed('user', uuidv4());
    const response = await emilyFeed.getOrCreate({
      watch: true,
    });

    expect(response.feed.id).toBe(emilyFeed.id);
  });

  it('emily adds bob as feed member', async () => {
    bobClient.on('feeds.notification.member_added', async (event) => {
      if (event.type === 'feeds.notification.member_added') {
        bobFeed = bobClient.feed(event.feed.group, event.feed.id);
        await bobFeed.getOrCreate({ watch: true });
      }
    });

    void emilyFeed.update({
      add_members: [{ user_id: bob.id }],
    });

    await waitForEvent(emilyClient, 'feeds.member_added');

    await waitForEvent(bobClient, 'feeds.member_added');

    expect(emilyFeed.state.getLatestValue().members?.length).toBe(1);
    expect(emilyFeed.state.getLatestValue().members?.[0].user?.id).toBe(bob.id);
    expect(emilyFeed.state.getLatestValue().members?.[0].role).toBe(
      'feed_contributor',
    );
  });

  it(`emily changes bob's role`, async () => {
    // TODO: this should work
    // emilyFeed.on('feeds.member_updated', console.log);
    // void emilyFeed.update({
    //   assign_roles: [{ user_id: bob.id, role: 'admin' }],
    // });
    // await waitForEvent(emilyClient, 'feeds.member_updated');
    // await waitForEvent(bobClient, 'feeds.member_updated');
    // expect(emilyFeed.state.getLatestValue().members?.length).toBe(1);
    // expect(emilyFeed.state.getLatestValue().members?.[0].role).toBe('admin');
    // expect(bobFeed.state.getLatestValue().members?.length).toBe(1);
  });

  it(`jane can see feed members`, async () => {
    janeFeed = janeClient.feed(emilyFeed.group, emilyFeed.id);
    await janeFeed.getOrCreate({ watch: true });

    expect(janeFeed.state.getLatestValue().members?.length).toBe(1);
  });

  it(`emily adds jane as well`, async () => {
    void emilyFeed.update({
      add_members: [{ user_id: jane.id }],
    });

    await waitForEvent(emilyClient, 'feeds.member_added');
    await waitForEvent(bobClient, 'feeds.member_added');
    await waitForEvent(janeClient, 'feeds.member_added');

    expect(emilyFeed.state.getLatestValue().members?.length).toBe(2);
    expect(bobFeed.state.getLatestValue().members?.length).toBe(2);
    expect(janeFeed.state.getLatestValue().members?.length).toBe(2);
  });

  it('emily removes bob from the list', async () => {
    void emilyFeed.update({
      remove_members: [bob.id],
    });

    await waitForEvent(emilyClient, 'feeds.member_removed');
    await waitForEvent(bobClient, 'feeds.member_removed');
    await waitForEvent(janeClient, 'feeds.member_removed');

    expect(emilyFeed.state.getLatestValue().members?.length).toBe(1);
    expect(bobFeed.state.getLatestValue().members?.length).toBe(1);
    expect(janeFeed.state.getLatestValue().members?.length).toBe(1);
  });

  afterAll(async () => {
    await emilyFeed.delete();
  });
});
