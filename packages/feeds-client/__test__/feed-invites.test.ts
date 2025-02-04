import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';

describe('Feeds API - invites', () => {
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
    tamaraClient = createTestClient();
    await tamaraClient.connectUser(tamara, createTestTokenGenerator(tamara));
  });

  it('emily creates a feed', async () => {
    emilyFeed = emilyClient.feed('user', uuidv4());
    const response = await emilyFeed.getOrCreate({ watch: true });

    expect(response.feed.id).toBe(emilyFeed.id);
    expect(response.feed.visibility_level).toBe('visible');
  });

  it('emily invites tamara and bob', async () => {
    void emilyFeed.update({
      invites: [
        { user_id: bob.id, role: 'feed_member' },
        { user_id: tamara.id },
      ],
    });

    await waitForEvent(emilyClient, 'feeds.member_added');
    await waitForEvent(emilyClient, 'feeds.member_added');

    expect(emilyFeed.state.getLatestValue().members?.length).toBe(2);
    expect(emilyFeed.state.getLatestValue().members?.[0].invited).toBe(true);
    expect(emilyFeed.state.getLatestValue().members?.[0].status).toBe(
      'pending',
    );
    expect(emilyFeed.state.getLatestValue().invites?.length).toBe(2);
  });

  it('bob accepts the invite', async () => {
    bobFeed = bobClient.feed(emilyFeed.group, emilyFeed.id);
    await bobFeed.getOrCreate({ watch: true });

    void bobFeed.update({
      accept_invite: true,
    });

    await waitForEvent(bobClient, 'feeds.member_updated');
    await waitForEvent(emilyClient, 'feeds.member_updated');

    const bobMember = bobFeed.state
      .getLatestValue()
      .members?.find((m) => m.user_id === bob.id);

    expect(bobMember?.status).toBe('member');
    expect(emilyFeed.state.getLatestValue().invites?.length).toBe(1);
  });

  it('tamara rejects the invite', async () => {
    tamaraFeed = tamaraClient.feed(emilyFeed.group, emilyFeed.id);
    await tamaraFeed.getOrCreate({ watch: true });

    void tamaraFeed.update({
      reject_invite: true,
    });

    await waitForEvent(tamaraClient, 'feeds.member_updated');

    expect(tamaraFeed.state.getLatestValue().members?.length).toBe(1);
    expect(tamaraFeed.state.getLatestValue().invites?.length).toBe(1);
    expect(tamaraFeed.state.getLatestValue().invites?.[0].status).toBe(
      'rejected',
    );
  });

  afterAll(async () => {
    await emilyFeed.delete();
  });
});
