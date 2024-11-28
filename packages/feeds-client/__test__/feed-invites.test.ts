import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import { createTestClient, createTestTokenGenerator } from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeed } from '../src/StreamFlatFeed';

describe('Feeds API - invites', () => {
  const emily = { id: 'emily' };
  const bob = { id: 'bob' };
  const tamara = { id: 'tamara' };
  let emilyClient: StreamFeedsClient;
  let bobClient: StreamFeedsClient;
  let tamaraClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeed;
  let tamaraFeed: StreamFlatFeed;
  let bobFeed: StreamFlatFeed;

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
    const response = await emilyFeed.getOrCreate();

    expect(response.feed.id).toBe(emilyFeed.id);
    expect(response.feed.visibility_level).toBe('visible');
  });

  it('emily invites tamara and bob', async () => {
    const response = await emilyFeed.update({
      invites: [
        { user_id: bob.id, role: 'feed_member' },
        { user_id: tamara.id },
      ],
    });

    expect(response.feed.invites.length).toBe(2);
  });

  it('bob accepts the invite', async () => {
    bobFeed = bobClient.feed(emilyFeed.group, emilyFeed.id);
    await bobFeed.getOrCreate();

    const response = await bobFeed.update({
      accept_invite: true,
    });

    expect(
      response.feed.members.find((m) => m.user_id === bob.id),
    ).toBeDefined();
  });

  it('tamara rejects the invite', async () => {
    tamaraFeed = tamaraClient.feed(emilyFeed.group, emilyFeed.id);
    await tamaraFeed.getOrCreate();

    const response = await tamaraFeed.update({
      reject_invite: true,
    });

    expect(
      response.feed.members.find((m) => m.user_id === tamara.id),
    ).toBeUndefined();
  });

  it('there are no pedning invites', async () => {
    const respone = await emilyFeed.getOrCreate();

    expect(respone.feed.members.length).toBe(1);

    expect(respone.feed.invites.length).toBe(1);
    expect(respone.feed.invites[0].status).toBe('rejected');
  });

  afterAll(async () => {
    await emilyFeed.delete();
  });
});
