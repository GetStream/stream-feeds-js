import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';
import {
  ActivityAddedEvent,
  ActivityRemovedEvent,
  ActivityUpdatedEvent,
} from '../src/gen/models';

describe('Activities', () => {
  const emily = { id: 'emily' };
  let emilyClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));

    emilyFeed = emilyClient.feed('user', uuidv4());

    await emilyFeed.getOrCreate({ watch: false });
  });

  it('add activities', async () => {
    for (let i = 0; i < 25; i++) {
      await emilyFeed.addActivity({
        object: `post:${i}`,
        verb: 'create',
      });
    }
  });

  it('read latest activities', async () => {
    let state = emilyFeed.state.getLatestValue();

    expect(state.activities).toBeUndefined();
    expect(state.offset).toBe(0);
    expect(state.limit).toBe(0);
    expect(state.has_next_page).toBe(true);

    await emilyFeed.read({ offset: 0, limit: 10 });

    state = emilyFeed.state.getLatestValue();

    expect(state.activities?.length).toBe(10);
    expect(state.offset).toBe(0);
    expect(state.limit).toBe(10);
    expect(state.has_next_page).toBe(true);
  });

  it('read previous page', async () => {
    await emilyFeed.readNextPage();

    const state = emilyFeed.state.getLatestValue();

    expect(state.activities?.length).toBe(20);
    expect(state.offset).toBe(10);
    expect(state.limit).toBe(10);
    expect(state.has_next_page).toBe(true);
  });

  it(`reading the same page twice shouldn't mess up state`, async () => {
    await emilyFeed.read({ offset: 10, limit: 10 });

    const state = emilyFeed.state.getLatestValue();

    expect(state.activities?.length).toBe(20);
    expect(state.offset).toBe(10);
    expect(state.limit).toBe(10);
    expect(state.has_next_page).toBe(true);
  });

  it('read first page', async () => {
    await emilyFeed.readNextPage();

    const state = emilyFeed.state.getLatestValue();

    expect(state.activities?.length).toBe(25);
    expect(state.offset).toBe(20);
    expect(state.limit).toBe(10);
    expect(state.has_next_page).toBe(false);
  });

  it('should update state on new activity', async () => {
    await emilyFeed.getOrCreate({ watch: true });

    const activity = { verb: 'post', object: uuidv4() };
    void emilyFeed.addActivity(activity);

    await waitForEvent(emilyClient, 'feeds.activity_added');

    expect(emilyFeed.state.getLatestValue().activities?.[0].object).toBe(
      activity.object,
    );
  });

  it('should update state on update activity', async () => {
    const activity = emilyFeed.state.getLatestValue().activities![0]!;

    void emilyClient.updateActivity({ id: activity.id, verb: 'like' });

    await waitForEvent(emilyClient, 'feeds.activity_updated');

    expect(emilyFeed.state.getLatestValue().activities?.[0].verb).toBe('like');
  });

  it('should update state on delete activity', async () => {
    const activityCount =
      emilyFeed.state.getLatestValue().activities?.length ?? 0;
    const activity = emilyFeed.state.getLatestValue().activities![0]!;

    void emilyClient.removeActivityFromFeed({
      id: emilyFeed.id,
      group: emilyFeed.group,
      activity_id: activity.id,
    });

    await waitForEvent(emilyClient, 'feeds.activity_removed');

    expect(emilyFeed.state.getLatestValue().activities?.length).toBe(
      activityCount - 1,
    );
  });

  it(`read with offset 0 should reset state`, async () => {
    await emilyFeed.read({ offset: 0, limit: 10 });

    const state = emilyFeed.state.getLatestValue();

    expect(state.activities?.length).toBe(10);
    expect(state.offset).toBe(0);
    expect(state.limit).toBe(10);
    expect(state.has_next_page).toBe(true);
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
        comment_count: 0,
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
        comment_count: 0,
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
        comment_count: 0,
      },
      custom: {},
      type: 'feeds.activity_removed',
    };

    emilyFeed.handleWSEvent(event);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  afterAll(async () => {
    await emilyFeed.delete();
  });
});
