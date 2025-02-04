import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';

describe('Feed followers', () => {
  const emily = { id: 'emily' };
  const tamara = { id: 'tamara' };
  const jane = { id: 'jane' };
  const mark = { id: 'mark' };
  let emilyClient: StreamFeedsClient;
  let tamaraClient: StreamFeedsClient;
  let janeClient: StreamFeedsClient;
  let markClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;
  let tamaraFeed: StreamFlatFeedClient;
  let janeFeed: StreamFlatFeedClient;
  let markFeed: StreamFlatFeedClient;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));
    tamaraClient = createTestClient();
    await tamaraClient.connectUser(tamara, createTestTokenGenerator(tamara));
    janeClient = createTestClient();
    await janeClient.connectUser(jane, createTestTokenGenerator(jane));
    markClient = createTestClient();
    await markClient.connectUser(mark, createTestTokenGenerator(mark));
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

    expect(response.activity.user.id).toEqual(emily.id);
  });

  it('tamara can see the activity in her feed', async () => {
    const response = await tamaraFeed.read({ limit: 5, offset: 0 });

    expect(response.activities.length).toBe(1);
  });

  it('tamara can add a reaction to the activities', async () => {
    const response = await tamaraFeed.read({ limit: 5, offset: 0 });
    const activity = response.activities[0];

    const reactionResponse = await tamaraClient.addReactionToActivity({
      type: 'like',
      id: activity.id,
    });

    expect(reactionResponse.reaction.type).toBe('like');
    expect(reactionResponse.reaction.entity_id).toBe(activity.id);

    const queryResponse = await tamaraClient.queryFeedsReactions({
      id: activity.id,
    });

    expect(queryResponse.reactions.length).toBe(1);
  });

  it('tamara can query activities', async () => {
    let response = await tamaraClient.queryActivities({
      filter: {
        origin: `${emilyFeed.group}:${emilyFeed.id}`,
      },
    });

    expect(response.activities.length).toBe(1);

    response = await tamaraClient.queryActivities({
      filter: {
        origin: `${emilyFeed.group}:${emilyFeed.id}`,
        verb: 'pin',
      },
    });

    expect(response.activities.length).toBe(1);
  });

  it(`mark and jane follows emily's feed`, async () => {
    markFeed = markClient.feed('user', uuidv4());
    await markFeed.getOrCreate();
    void markFeed.follow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });

    await waitForEvent(emilyClient, 'feeds.notification.follow');

    expect(emilyFeed.state.getLatestValue().follower_count).toBe(2);

    janeFeed = janeClient.feed('user', uuidv4());
    await janeFeed.getOrCreate();
    void janeFeed.follow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });

    await waitForEvent(emilyClient, 'feeds.notification.follow');

    expect(emilyFeed.state.getLatestValue().follower_count).toBe(3);
  });

  it(`emily has 3 followers now`, async () => {
    const firstPage = await emilyFeed.getFollowingFeeds({
      limit: 2,
      offset: 0,
    });

    expect(firstPage.followers.length).toBe(2);

    const secondPage = await emilyFeed.getFollowingFeeds({
      limit: 2,
      offset: 2,
    });

    expect(secondPage.followers.length).toBe(1);

    const allFollowers = [...firstPage.followers, ...secondPage.followers];

    expect(allFollowers.find((f) => f.feed.id === markFeed.id)).toBeDefined();
    expect(allFollowers.find((f) => f.feed.id === tamaraFeed.id)).toBeDefined();
    expect(allFollowers.find((f) => f.feed.id === janeFeed.id)).toBeDefined();
  });

  it(`mark follows tamara and jane`, async () => {
    await markFeed.follow({
      target_group: tamaraFeed.group,
      target_id: tamaraFeed.id,
    });
    await markFeed.follow({
      target_group: janeFeed.group,
      target_id: janeFeed.id,
    });

    expect(markFeed.state.getLatestValue().following_count).toBe(3);
  });

  it(`mark now follows 3 feeds`, async () => {
    const firstPage = await markFeed.getFollowedFeeds({ limit: 2 });

    expect(firstPage.followed_feeds.length).toBe(2);

    const secondPage = await markFeed.getFollowedFeeds({
      next: firstPage.next,
    });

    expect(secondPage.followed_feeds.length).toBe(1);
    expect(secondPage.next).toBeUndefined();

    const allFollowingFeeds = [
      ...firstPage.followed_feeds,
      ...secondPage.followed_feeds,
    ];

    expect(
      allFollowingFeeds.find((f) => f.feed.id === emilyFeed.id),
    ).toBeDefined();
    expect(
      allFollowingFeeds.find((f) => f.feed.id === tamaraFeed.id),
    ).toBeDefined();
    expect(
      allFollowingFeeds.find((f) => f.feed.id === janeFeed.id),
    ).toBeDefined();

    const firstPageAgain = await markFeed.getFollowedFeeds({
      prev: secondPage.prev,
    });

    expect(firstPageAgain.followed_feeds.length).toBe(2);
  });

  it(`tamara unfollows the feed, emily now only has 2 followers`, async () => {
    void tamaraFeed.unfollow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });

    await waitForEvent(emilyClient, 'feeds.notification.unfollow');

    expect(emilyFeed.state.getLatestValue().follower_count).toBe(2);
  });

  afterAll(async () => {
    await emilyFeed.delete();
    await tamaraFeed.delete();
    await markFeed.delete();
    await janeFeed.delete();
  });
});
