import { beforeEach, describe, expect, it } from 'vitest';
import { FeedsClient } from './feeds-client';
import { generateActivityResponse, generateFeedResponse } from '../test-utils';

describe('Feeds client tests', () => {
  let client: FeedsClient;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
  });

  it(`should find feeds to update for user events`, async () => {
    const feedA = client.feed('user', 'feedA');
    const feedB = client.feed('user', 'feedB');
    const feedC = client.feed('user', 'feedC');
    const activity1 = generateActivityResponse({ id: 'activity1' });

    feedA.state.partialNext({ activities: [activity1] });
    feedB.state.partialNext({ activities: [] });
    feedC.state.partialNext({
      // @ts-expect-error - we're not passing all the required fields
      pinned_activities: [{ activity: activity1 }],
    });

    const feeds = client['findAllActiveFeedsByActivityId'](activity1.id);
    expect(feeds).toHaveLength(2);
    expect(feeds).toContain(feedA);
    expect(feeds).toContain(feedC);
    expect(feeds).not.toContain(feedB);
  });

  describe('client.feed', () => {
    it('should initialize feed state with the given data if feed does not exist', async () => {
      const data = generateFeedResponse({ feed: 'timeline:feed' });
      client['getOrCreateActiveFeed']('timeline', 'feed', data);

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);
    });

    it('should update feed state if data is newer than the current state', async () => {
      const data = generateFeedResponse({
        feed: 'timeline:feed',
        follower_count: 5,
      });
      client['getOrCreateActiveFeed']('timeline', 'feed', data);

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);

      const newData = { ...data };
      newData.updated_at = new Date(data.updated_at.getTime() + 1000);
      newData.follower_count = 10;
      client['getOrCreateActiveFeed']('timeline', 'feed', newData);

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(newData);
      expect(
        client['activeFeeds']['timeline:feed']?.currentState.follower_count,
      ).toBe(10);
    });

    it(`should not update feed state if data is older than the current state`, async () => {
      const data = generateFeedResponse({
        feed: 'timeline:feed',
        follower_count: 5,
      });
      client['getOrCreateActiveFeed']('timeline', 'feed', data);

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);

      const oldData = { ...data };
      oldData.updated_at = new Date(data.updated_at.getTime() - 1000);
      oldData.follower_count = 3;
      client['getOrCreateActiveFeed']('timeline', 'feed', oldData);

      expect(
        client['activeFeeds']['timeline:feed']?.currentState,
      ).toMatchObject(data);
      expect(
        client['activeFeeds']['timeline:feed']?.currentState.follower_count,
      ).toBe(5);
    });

    it(`should update own_ fields if feed data is same as the current state`, async () => {});
  });
});
