import { beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';
import {
  ActivityReactionNewEvent,
  ActivityReactionUpdatedEvent,
} from '../src/gen/models';

describe('Activity reactions', () => {
  const emily = { id: 'emily' };
  let emilyClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));

    emilyFeed = emilyClient.feed('user', uuidv4());
    await emilyFeed.getOrCreate({ watch: true });

    await emilyFeed.addActivity({ object: uuidv4(), verb: 'post' });

    await waitForEvent(emilyClient, 'feeds.activity_added');
  });

  it('should add new reaction', async () => {
    let activity = emilyFeed.state.getLatestValue().activities![0]!;

    void emilyClient.addReactionToActivity({
      id: activity.id,
      type: 'like',
    });

    await waitForEvent(emilyClient, 'feeds.activity_reaction_new');
    activity = emilyFeed.state.getLatestValue().activities![0]!;

    expect(activity.latest_reactions.length).toBe(1);
    expect(activity.own_reactions.length).toBe(1);
    expect(activity.reaction_groups.like.count).toBe(1);
  });

  it('should query reactions', async () => {
    const activity = emilyFeed.state.getLatestValue().activities![0]!;
    const response = await emilyClient.queryFeedsReactions({ id: activity.id });

    expect(response.reactions.length).toBe(1);
  });

  it('should update reaction', async () => {
    let activity = emilyFeed.state.getLatestValue().activities![0]!;

    void emilyClient.addReactionToActivity({
      id: activity.id,
      type: 'dislike',
      enforce_unique: true,
    });

    await waitForEvent(emilyClient, 'feeds.activity_reaction_updated');
    activity = emilyFeed.state.getLatestValue().activities![0]!;

    expect(activity.latest_reactions.length).toBe(1);
    expect(activity.own_reactions.length).toBe(1);
    expect(activity.own_reactions[0].type).toBe('dislike');
    expect(activity.reaction_groups.dislike.count).toBe(1);
    expect(activity.reaction_groups.like).toBeUndefined();
  });

  it('should delete reaction', async () => {
    let activity = emilyFeed.state.getLatestValue().activities![0]!;

    void emilyClient.deleteReactionFromActivity({
      id: activity.id,
      type: 'dislike',
    });

    await waitForEvent(emilyClient, 'feeds.activity_reaction_deleted');
    activity = emilyFeed.state.getLatestValue().activities![0]!;

    expect(activity.latest_reactions.length).toBe(0);
    expect(activity.own_reactions.length).toBe(0);
    expect(activity.reaction_groups.like).toBe(undefined);
  });

  it(`should properly set own reaction on reaction events`, () => {
    let activity = emilyFeed.state.getLatestValue().activities![0];
    const reaction = {
      created_at: new Date(),
      entity_id: activity.id,
      entity_type: '',
      score: 0,
      type: 'like',
      updated_at: new Date(),
      user_id: 'emily',
      custom: {},
      user: {
        banned: false,
        created_at: new Date(),
        id: 'emily',
        language: '',
        online: false,
        role: '',
        updated_at: new Date(),
        blocked_user_ids: [],
        teams: [],
        custom: {},
      },
    };
    // Emily sends a reaction
    const event: ActivityReactionNewEvent & {
      type: 'feeds.activity_reaction_new';
    } = {
      created_at: new Date(),
      fid: emilyFeed.fid,
      activity: {
        created_at: new Date(),
        id: activity.id,
        object: '',
        origin: '',
        public: false,
        updated_at: new Date(),
        verb: '',
        latest_reactions: [reaction],
        own_reactions: [],
        reaction_groups: {
          like: {
            count: 1,
            sum_scores: 1,
            first_reaction_at: new Date(),
            last_reaction_at: new Date(),
          },
        },
        user: {
          banned: false,
          created_at: new Date(),
          id: 'emily',
          language: '',
          online: false,
          role: '',
          updated_at: new Date(),
          blocked_user_ids: [],
          teams: [],
          custom: {},
        },
        comment_count: 0,
      },
      reaction,
      custom: {},
      type: 'feeds.activity_reaction_new',
    };

    emilyFeed.handleWSEvent(event);

    activity = emilyFeed.state.getLatestValue().activities![0];

    expect(activity.own_reactions.length).toBe(1);
    expect(activity.own_reactions[0].type).toBe('like');

    // Someone else sends a reacion
    reaction.user_id = 'tom';

    emilyFeed.handleWSEvent(event);

    activity = emilyFeed.state.getLatestValue().activities![0];

    expect(activity.own_reactions.length).toBe(1);
    expect(activity.own_reactions[0].type).toBe('like');

    // Emily updates reaction
    reaction.user_id = 'emily';
    reaction.score = 5;

    const updateEvent: ActivityReactionUpdatedEvent & {
      type: 'feeds.activity_reaction_updated';
    } = {
      created_at: new Date(),
      fid: emilyFeed.fid,
      activity: {
        created_at: new Date(),
        id: activity.id,
        object: '',
        origin: '',
        public: false,
        updated_at: new Date(),
        verb: '',
        latest_reactions: [reaction],
        own_reactions: [],
        reaction_groups: {
          like: {
            count: 1,
            sum_scores: 5,
            first_reaction_at: new Date(),
            last_reaction_at: new Date(),
          },
        },
        user: {
          banned: false,
          created_at: new Date(),
          id: 'emily',
          language: '',
          online: false,
          role: '',
          updated_at: new Date(),
          blocked_user_ids: [],
          teams: [],
          custom: {},
        },
        comment_count: 0,
      },
      reaction,
      custom: {},
      type: 'feeds.activity_reaction_updated',
    };

    emilyFeed.handleWSEvent(updateEvent);

    expect(activity.own_reactions.length).toBe(1);
    expect(activity.own_reactions[0].type).toBe('like');
    expect(activity.own_reactions[0].score).toBe(5);
  });
});
