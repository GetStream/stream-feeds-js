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
  const tamara = { id: 'tamara' };
  const jane = { id: 'jane' };
  const mark = { id: 'mark' };
  let emilyClient: StreamFeedsClient;
  let bobClient: StreamFeedsClient;
  let tamaraClient: StreamFeedsClient;
  let janeClient: StreamFeedsClient;
  let markClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;
  let tamaraFeed: StreamFlatFeedClient;
  let bobFeed: StreamFlatFeedClient;
  let janeFeed: StreamFlatFeedClient;
  let markFeed: StreamFlatFeedClient;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));
    bobClient = createTestClient();
    await bobClient.connectUser(bob, createTestTokenGenerator(bob));
    tamaraClient = createTestClient();
    await tamaraClient.connectUser(tamara, createTestTokenGenerator(tamara));
    janeClient = createTestClient();
    await janeClient.connectUser(jane, createTestTokenGenerator(jane));
    markClient = createTestClient();
    await markClient.connectUser(jane, createTestTokenGenerator(jane));
  });

  it('emily creates a feed', async () => {
    emilyFeed = emilyClient.feed('user', uuidv4());
    const response = await emilyFeed.getOrCreate({
      visibility_level: 'visible',
      watch: true,
    });

    expect(response.feed.id).toBe(emilyFeed.id);
    expect(response.feed.visibility_level).toBe('visible');
  });

  it('emily adds bob as feed member', async () => {
    void emilyFeed.update({
      add_members: [{ user_id: bob.id }],
    });

    emilyFeed.on('feeds.member_added', console.log);

    bobClient.on('all', console.log);

    await waitForEvent(emilyClient, 'feeds.member_added');
  });

  it(`bob posts to emily's feed`, async () => {
    bobFeed = bobClient.feed(emilyFeed.group, emilyFeed.id);
    const response = await bobFeed.addActivity({
      verb: 'unpin',
      object: 'Place:42',
    });

    expect(response.activity.user.id).toBe(bob.id);
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

  it(`emily removes bob from the feed members`, async () => {
    await emilyFeed.update({ remove_members: [bob.id] });

    await expect(
      bobFeed.addActivity({ verb: 'edit', object: 'Place:42' }),
    ).rejects.toThrowError(
      `Stream error code 17: AddActivity failed with error: "User 'bob' with role 'user' is not allowed to perform action AddActivity in scope 'feeds:visible'"`,
    );
  });

  afterAll(async () => {
    await emilyFeed.delete();
  });
});
