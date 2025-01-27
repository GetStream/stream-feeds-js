import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';

describe('Feeds API - follow requests with invites', () => {
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

  it('emily creates a private feed', async () => {
    emilyFeed = emilyClient.feed('user', uuidv4());
    const response = await emilyFeed.getOrCreate({
      visibility_level: 'private',
    });

    expect(response.feed.id).toBe(emilyFeed.id);
    expect(response.feed.visibility_level).toBe('private');
  });

  it('emily invites tamara and bob', async () => {
    await emilyFeed.update({
      invited_follow_requests: [tamaraFeed.fid, bobFeed.fid],
    });

    await waitForEvent(emilyClient, 'feeds.follow_request_created');
    await waitForEvent(bobClient, 'feeds.follow_request_created');
    await waitForEvent(tamaraClient, 'feeds.follow_request_created');

    const invitedFollowRequests =
      emilyFeed.state.getLatestValue().follow_requests?.invites;
    expect(invitedFollowRequests?.length).toBe(2);
    expect(bobFeed.state.getLatestValue().follow_requests?.invites.length).toBe(
      1,
    );
    expect(
      tamaraFeed.state.getLatestValue().follow_requests?.invites.length,
    ).toBe(1);
  });

  it('bob accepts the invite', async () => {
    await bobFeed.follow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });

    await waitForEvent(emilyClient, 'feeds.follow');
    await waitForEvent(bobClient, 'feeds.follow');

    const invitedFollowRequests =
      emilyFeed.state.getLatestValue().follow_requests?.invites;
    expect(invitedFollowRequests?.length).toBe(1);
    expect(emilyFeed.state.getLatestValue().follower_count).toBe(1);
    expect(bobFeed.state.getLatestValue().following_count).toBe(1);
  });

  it('tamara rejects the invite', async () => {
    // TODO: not yet implmemented on backend
  });

  afterAll(async () => {
    await emilyFeed.delete();
    await bobFeed.delete();
    await tamaraFeed.delete();
  });
});
