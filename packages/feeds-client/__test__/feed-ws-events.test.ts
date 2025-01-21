import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';

describe('Feed WS events', () => {
  const emily = { id: 'emily' };
  let emilyClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));

    emilyFeed = emilyClient.feed('user', uuidv4());
    await emilyFeed.getOrCreate({ watch: true });
  });

  it('should update state on new activity', async () => {
    const activity = { verb: 'post', object: uuidv4() };
    void emilyFeed.addActivity(activity);

    await waitForEvent(emilyClient, 'feeds.activity_added');

    expect(emilyFeed.state.getLatestValue().activities?.[0].object).toBe(
      activity.object,
    );
  });

  it('should update state on update activity', async () => {
    const activity = emilyFeed.state.getLatestValue().activities?.[0]!;

    void emilyClient.updateActivity({ id: activity.id, verb: 'like' });

    await waitForEvent(emilyClient, 'feeds.activity_updated');

    expect(emilyFeed.state.getLatestValue().activities?.[0].verb).toBe('like');
  });

  it(`shouldn't add or delete activities on update event`, async () => {
    // TODO
  });

  it('should add new reaction', async () => {
    let activity = emilyFeed.state.getLatestValue().activities?.[0]!;

    emilyClient.feedsAddReactionToActivity({
      id: activity.id,
      type: 'like',
    });

    await waitForEvent(emilyClient, 'feeds.activity_reaction_new');
    activity = emilyFeed.state.getLatestValue().activities?.[0]!;

    expect(activity.latest_reactions.length).toBe(1);
    expect(activity.own_reactions.length).toBe(1);
    expect(activity.reaction_groups.like.count).toBe(1);
  });

  it('should update state on delete activity', async () => {
    const activity = emilyFeed.state.getLatestValue().activities?.[0]!;

    void emilyClient.removeActivityFromFeed({
      id: emilyFeed.id,
      group: emilyFeed.group,
      activity_id: activity.id,
    });

    await waitForEvent(emilyClient, 'feeds.activity_removed');

    expect(emilyFeed.state.getLatestValue().activities?.length).toBe(0);
  });

  afterAll(async () => {
    await emilyFeed.delete();
  });
});
