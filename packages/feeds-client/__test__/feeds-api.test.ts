import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import { createTestClient, createTestTokenGenerator } from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFeed } from '../src/StreamFeed';

describe('Feeds API', () => {
  const emily = { id: 'emily' };
  const bob = { id: 'bob' };
  const tamara = { id: 'tamara' };
  let emilyClient: StreamFeedsClient;
  let bobClient: StreamFeedsClient;
  let tamaraClient: StreamFeedsClient;
  let emilyFeed: StreamFeed;
  let tamaraFeed: StreamFeed;
  let bobFeed: StreamFeed;
  let notificationFeed: StreamFeed;

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
    const response = await emilyFeed.updateFeedMembers({
      update_members: [{ user_id: bob.id }],
    });

    // TODO: we should receive the members in response
    expect(response.duration).toBeDefined();
  });

  it(`tamara will follow the emily's feed`, async () => {
    tamaraFeed = tamaraClient.feed('user', uuidv4());
    await tamaraFeed.getOrCreate();
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

  it(`create an aggregated feed`, async () => {
    notificationFeed = emilyClient.feed('notification', uuidv4());
    await notificationFeed.getOrCreate();
    await notificationFeed.follow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });
    const response = await notificationFeed.readNotification({
      limit: 5,
      offset: 0,
      mark_read: 'pin',
    });

    console.log(response);
    expect(response.groups.length).toBe(2);
    expect(response.unseen);
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
    await emilyFeed.updateFeedMembers({ remove_members: [bob.id] });

    // TODO: why this works - permissions are coming later
    await bobFeed.addActivity({ verb: 'edit', object: 'Place:42' });
  });

  it(`tamara unfollows the feed`, async () => {
    await tamaraFeed.unfollow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });
  });

  afterAll(async () => {
    await emilyFeed.delete();
    await tamaraFeed.delete();
    await notificationFeed.delete();
  });
});
