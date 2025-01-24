import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import {
  ActivityAddedEvent,
  ActivityReactionNewEvent,
  ActivityReactionUpdatedEvent,
  ActivityRemovedEvent,
  ActivityUpdatedEvent,
  FeedMember,
} from '../src/gen/models';
import {
  StreamFlatFeedClient,
  StreamFlatFeedState,
} from '../src/StreamFlatFeedClient';

describe('Feeds state test', () => {
  const emily = { id: 'emily' };
  let emilyClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));

    emilyFeed = emilyClient.feed('user', uuidv4());
  });

  it('set initial state', async () => {
    expect(emilyFeed.state.getLatestValue().created_by).toBe(undefined);
  });

  it('update state on create', async () => {
    const spy = vi.fn();
    emilyFeed.state.subscribe(spy);

    await emilyFeed.getOrCreate({
      watch: true,
      members: [{ user_id: 'bob' }],
      visibility_level: 'visible',
    });

    const currentState = spy.mock.lastCall?.[0] as StreamFlatFeedState;
    expect(
      currentState.members?.find((m) => m.user?.id === 'bob'),
    ).toBeDefined();
  });

  it('subscribe to partial state changes', () => {
    const spy = vi.fn();
    emilyFeed.state.subscribeWithSelector((state) => [state.members], spy);
    spy.mockReset();

    emilyFeed.state.partialNext({
      visibility_level: 'public',
    });

    expect(spy.mock.calls.length).toBe(0);

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const member: FeedMember = { user: { id: 'alice' } } as FeedMember;
    emilyFeed.state.partialNext({
      members: [member],
    });

    expect(spy.mock.calls.length).toBe(1);
  });

  it('add activities to state on read', async () => {
    const activityResponse = await emilyFeed.addActivity({
      object: 'post:12',
      verb: 'create',
    });

    await emilyFeed.read({ offset: 0, limit: 30 });

    const activities = emilyFeed.state.getLatestValue().activities ?? [];
    expect(activities.length).toBe(1);
    expect(activities[0].id).toBe(activityResponse.activity.id);
  });

  it('add new activity to state on WS event', async () => {
    const request = emilyFeed.addActivity({
      object: 'post:13',
      verb: 'create',
    });

    await waitForEvent(emilyClient, 'feeds.activity_added');

    const activityResponse = await request;

    const activities = emilyFeed.state.getLatestValue().activities ?? [];
    const lastActivity = activities[0];
    expect(activities.length).toBe(2);
    expect(lastActivity.id).toBe(activityResponse.activity.id);

    // check WS event decoding
    expect(lastActivity.created_at instanceof Date).toBe(true);
  });

  it(`shouldn't add same activity twice`, () => {
    const spy = vi.fn();
    emilyFeed.state.subscribe(spy);
    spy.mockReset();
    const event: ActivityAddedEvent & { type: 'feeds.activity_added' } = {
      created_at: new Date(),
      fid: emilyFeed.fid,
      activity: {
        created_at: new Date(),
        id: uuidv4(),
        object: '',
        origin: '',
        public: false,
        updated_at: new Date(),
        verb: '',
        latest_reactions: [],
        own_reactions: [],
        reaction_groups: {},
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
      },
      custom: {},
      type: 'feeds.activity_added',
    };

    emilyFeed.handleWSEvent(event);
    emilyFeed.handleWSEvent(event);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it(`shouldn't add new activity when activity update event is received`, () => {
    const spy = vi.fn();
    emilyFeed.state.subscribe(spy);
    spy.mockReset();
    const event: ActivityUpdatedEvent & { type: 'feeds.activity_updated' } = {
      created_at: new Date(),
      fid: emilyFeed.fid,
      activity: {
        created_at: new Date(),
        id: uuidv4(),
        object: '',
        origin: '',
        public: false,
        updated_at: new Date(),
        verb: '',
        latest_reactions: [],
        own_reactions: [],
        reaction_groups: {},
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
      },
      custom: {},
      type: 'feeds.activity_updated',
    };

    emilyFeed.handleWSEvent(event);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it(`shouldn't update state if delete event received for activity not in state`, () => {
    const spy = vi.fn();
    emilyFeed.state.subscribe(spy);
    spy.mockReset();
    const event: ActivityRemovedEvent & { type: 'feeds.activity_removed' } = {
      created_at: new Date(),
      fid: emilyFeed.fid,
      activity: {
        created_at: new Date(),
        id: uuidv4(),
        object: '',
        origin: '',
        public: false,
        updated_at: new Date(),
        verb: '',
        latest_reactions: [],
        own_reactions: [],
        reaction_groups: {},
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
      },
      custom: {},
      type: 'feeds.activity_removed',
    };

    emilyFeed.handleWSEvent(event);

    expect(spy).toHaveBeenCalledTimes(0);
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

  afterAll(async () => {
    await emilyFeed.delete();
  });
});
