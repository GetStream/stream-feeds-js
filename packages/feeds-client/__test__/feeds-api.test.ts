import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import { createTestClient, createTestTokenGenerator } from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFeed } from '../src/StreamFeed';

describe('Feeds API - test with "visible" visibility level', () => {
  const emily = { id: 'emily' };
  const bob = { id: 'bob' };
  const tamara = { id: 'tamara' };
  let emilyClient: StreamFeedsClient;
  let bobClient: StreamFeedsClient;
  let tamaraClient: StreamFeedsClient;
  let emilyFeed: StreamFeed;
  let tamaraFeed: StreamFeed;
  let bobFeed: StreamFeed;

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
    const response = await emilyFeed.getOrCreate({
      visibility_level: 'visible',
      custom: {
        color: 'red',
      },
    });

    expect(response.feed.id).toBe(emilyFeed.id);
    expect(response.feed.visibility_level).toBe('visible');
  });

  it('emily adds bob as feed member', async () => {
    const response = await emilyFeed.addFeedMembers({
      // TODO: we should be able to specify a role here
      new_members: [bob.id],
    });

    // TODO: we should receive the members in response
    expect(response.duration).toBeDefined();
  });

  it(`tamara will follow the emily's feed`, async () => {
    tamaraFeed = tamaraClient.feed('user', uuidv4());
    // TODO: why do we need to provide visibility_level if there is a default for that value (visible)
    await tamaraFeed.getOrCreate({ visibility_level: 'visible' });
    const response = await tamaraFeed.follow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });

    expect(response.created).toBe(true);
  });

  it(`emily posts to the feed`, async () => {
    const response = await emilyFeed.addActivity({
      verb: 'pin',
      object: 'Place:42',
    });

    expect(response.user.id).toEqual(emily.id);
  });

  it(`bob also posts to emily's feed`, async () => {
    bobFeed = bobClient.feed(emilyFeed.group, emilyFeed.id);
    const response = await bobFeed.addActivity({
      verb: 'unpin',
      object: 'Place:42',
    });

    expect(response.user?.id).toBe(bob.id);
  });

  it('tamara can see both activities in her feed', async () => {
    // Would it be possible to have prev/next pagination?
    const response = await tamaraFeed.readFlat({ limit: 5, offset: 0 });

    console.log(response.activities);
    expect(response.activities.length).toBe(2);
  });

  it('tamara can query activities', async () => {
    let response = await tamaraClient.queryActivities({
      filter: {
        origin: `${emilyFeed.group}:${emilyFeed.id}`,
      },
    });

    expect(response.activities.length).toBe(2);

    response = await tamaraClient.queryActivities({
      filter: {
        origin: `${emilyFeed.group}:${emilyFeed.id}`,
        verb: 'pin',
      },
    });

    expect(response.activities.length).toBe(1);
  });

  it(`bob deletes an activity from emily's feed`, async () => {
    const response = await bobClient.queryActivities({
      filter: {
        user_id: bob.id,
      },
    });

    await bobFeed.removeActivityFrom({
      activity_id: response.activities[0].id,
    });
  });

  it(`activity is removed from tamara's feed`, async () => {
    const response = await tamaraFeed.readFlat({ limit: 5, offset: 0 });

    expect(response.activities.length).toBe(1);
  });

  it(`emily removes bob from the feed members`, async () => {
    // TODO: this should accept an array
    await emilyFeed.removeFeedMembers({ remove_members: bob.id });

    // TODO: why this works?
    await bobFeed.addActivity({ verb: 'edit', object: 'Place:42' });
  });

  it(`tamara unfollows the feed`, async () => {
    // TODO: can't provide target group and target id here
    // await tamaraFeed.unfollow();
  });

  afterAll(async () => {
    await emilyFeed.delete();
    await tamaraFeed.delete();
  });
});
