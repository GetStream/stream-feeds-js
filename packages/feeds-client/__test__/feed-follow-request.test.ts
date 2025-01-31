import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';

describe('Feeds API - follow requests', () => {
  const emily = { id: 'emily' };
  const bob = { id: 'bob' };
  const tamara = { id: 'tamara' };
  let emilyClient: StreamFeedsClient;
  let bobClient: StreamFeedsClient;
  let tamaraClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;
  let tamaraFeed: StreamFlatFeedClient;
  let bobFeed: StreamFlatFeedClient;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));
    bobClient = createTestClient();
    await bobClient.connectUser(bob, createTestTokenGenerator(bob));
    bobFeed = bobClient.feed('user', uuidv4());
    await bobFeed.getOrCreate();
    tamaraClient = createTestClient();
    await tamaraClient.connectUser(tamara, createTestTokenGenerator(tamara));
    tamaraFeed = tamaraClient.feed('user', uuidv4());
    await tamaraFeed.getOrCreate();
  });

  it('emily creates a followers feed', async () => {
    emilyFeed = emilyClient.feed('user', uuidv4());
    const response = await emilyFeed.getOrCreate({
      visibility_level: 'followers',
    });

    expect(response.feed.id).toBe(emilyFeed.id);
    expect(response.feed.visibility_level).toBe('followers');
  });

  it('bob creates a follow request', async () => {
    await bobFeed.follow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });

    await waitForEvent(
      emilyClient,
      'feeds.notification.follow_request_created',
    );
    await waitForEvent(bobClient, 'feeds.notification.follow_request_created');

    expect(
      emilyFeed.state.getLatestValue().follow_requests?.pending.length,
    ).toBe(1);
    expect(
      emilyFeed.state.getLatestValue().follow_requests?.pending?.[0].source_fid,
    ).toBe(bobFeed.fid);
    expect(bobFeed.state.getLatestValue().follow_requests?.pending.length).toBe(
      1,
    );
    expect(
      bobFeed.state.getLatestValue().follow_requests?.pending?.[0].target_fid,
    ).toBe(emilyFeed.fid);
  });

  it('tamara creates a follow request', async () => {
    await tamaraFeed.follow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });

    await waitForEvent(
      emilyClient,
      'feeds.notification.follow_request_created',
    );

    expect(
      emilyFeed.state.getLatestValue().follow_requests?.pending.length,
    ).toBe(2);
  });

  it(`emily accepts bob's request`, async () => {
    await emilyFeed.update({
      accepted_follow_requests: [bobFeed.fid],
    });

    await waitForEvent(emilyClient, 'feeds.notification.follow');
    await waitForEvent(bobClient, 'feeds.notification.follow');

    expect(emilyFeed.state.getLatestValue()?.follower_count).toBe(1);
    expect(
      emilyFeed.state.getLatestValue()?.follow_requests?.pending.length,
    ).toBe(1);
    expect(bobFeed.state.getLatestValue()?.following_count).toBe(1);
  });

  it(`emily rejects tamara's request`, async () => {
    await emilyFeed.update({
      rejected_follow_requests: [tamaraFeed.fid],
    });

    await waitForEvent(
      emilyClient,
      'feeds.notification.follow_request_updated',
    );
    await waitForEvent(
      tamaraClient,
      'feeds.notification.follow_request_updated',
    );

    expect(emilyFeed.state.getLatestValue()?.follower_count).toBe(1);
    expect(
      emilyFeed.state.getLatestValue()?.follow_requests?.pending.length,
    ).toBe(0);
    expect(emilyFeed.state.getLatestValue()?.following_count).toBe(0);
  });

  it('bob unfollows emily', async () => {
    await bobFeed.unfollow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });

    await waitForEvent(emilyClient, 'feeds.notification.unfollow');
    await waitForEvent(bobClient, 'feeds.notification.unfollow');

    expect(emilyFeed.state.getLatestValue()?.follower_count).toBe(0);
    expect(bobFeed.state.getLatestValue()?.following_count).toBe(0);
  });

  afterAll(async () => {
    await emilyFeed.delete();
    await bobFeed.delete();
    await tamaraFeed.delete();
  });
});
