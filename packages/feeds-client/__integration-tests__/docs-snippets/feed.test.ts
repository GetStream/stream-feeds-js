import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { UserRequest } from '../../src/gen/models';

describe('Feeds page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let invitingFeed: Feed;
  let johnClient: FeedsClient;
  let john: { id: string };
  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    invitingFeed = feed;
    johnClient = createTestClient();
    john = getTestUser('john');
    await johnClient.connectUser(john, createTestTokenGenerator(john));
  });

  it(`Creating Feed`, async () => {
    // Feed with no extra fields, of feed group "user"
    await feed.getOrCreate();
    // Subscribe to WebSocket events for state updates
    await feed.getOrCreate({ watch: true });

    // More options
    await feed.getOrCreate({
      data: {
        description: 'My personal feed',
        name: 'jack',
        visibility: 'public',
        filter_tags: ['tech', 'hiking', 'cooking'],
      },
    });
  });

  it(`reading a feed`, async () => {
    await feed.getOrCreate({ watch: true });
    const currentState = feed.state.getLatestValue();

    const visivility = currentState.visibility;
    const name = currentState.name;
    const description = currentState.description;
    const activities = currentState.activities;
    const members = currentState.members;

    expect(visivility).toBeDefined();
    expect(name).toBeDefined();
    expect(description).toBeDefined();
    expect(activities).toBeDefined();
    expect(members).toBeDefined();

    // Or subscribe to state changes
    const unsubscribe = feed.state.subscribe((state) => {
      // Called everytime the state changes
      console.log(state);
    });

    // or if you care only part of the state
    const unsubscribe2 = feed.state.subscribeWithSelector(
      (state) => ({
        activities: state.activities,
      }),
      (state, prevState) => {
        console.log(state.activities, prevState?.activities);
      },
    );

    unsubscribe();
    unsubscribe2();
  });

  it(`reading a feed - config params`, async () => {
    await feed.getOrCreate({
      limit: 10,
      filter: {
        filter_tags: ['green'], // filter activities with filter tag green
      },
      external_ranking: {
        user_score: 0.8, // additional data used for ranking
      },
      followers_pagination: {
        limit: 10,
      },
      following_pagination: {
        limit: 10,
      },
      member_pagination: {
        limit: 10,
      },
      // TODO: needs server-side support
      // view: 'myview', // overwrite the default ranking or aggregation logic for this feed. good for split testing
    });
  });

  it(`feed pagination`, async () => {
    // First page
    await feed.getOrCreate({
      limit: 10,
    });
    // Second page
    await feed.getNextPage();

    console.log(feed.state.getLatestValue().is_loading_activities);
    console.log(feed.state.getLatestValue().next);
    expect(feed.state.getLatestValue().activities).toBeDefined();
  });

  it(`filtering activities`, async () => {
    feed = client.feed(feed.group, feed.id, {
      onNewActivity: ({ activity }) =>
        activity.filter_tags?.includes('blue') ? 'add-to-start' : 'ignore',
    });

    // Add a few activities
    await client.upsertActivities({
      activities: [
        {
          feeds: [feed.feed],
          type: 'post',
          text: 'first',
          filter_tags: ['green', 'blue'],
        },
        {
          feeds: [feed.feed],
          type: 'post',
          text: 'second',
          filter_tags: ['yellow', 'blue'],
        },
        {
          feeds: [feed.feed],
          type: 'post',
          text: 'third',
          filter_tags: ['orange'],
        },
      ],
    });

    await feed.getOrCreate({
      filter: {
        filter_tags: ['blue'],
      },
    });

    await feed.getOrCreate({
      filter: {
        $and: [{ filter_tags: ['green'] }, { filter_tags: ['orange'] }],
      },
    });
  });

  it(`updating a feed`, async () => {
    await feed.update({
      name: 'Updated feed name',
      filter_tags: ['tech', 'hiking', 'cooking'],
      custom: {
        color: 'blue',
      },
    });
  });

  it(`feed members`, async () => {
    const userId = crypto.randomUUID();
    const serverClient = getServerClient();
    await serverClient.upsertUsers([{ id: userId }]);

    // The following methods are available to add or edit the members of a feed
    const response = await feed.updateFeedMembers({
      operation: 'upsert',
      members: [
        {
          user_id: userId,
          custom: {
            joined: '2024-01-01',
          },
        },
      ],
    });

    expect(response.added[0].role).toBe('feed_member');

    // Remove members
    await feed.updateFeedMembers({
      operation: 'remove',
      members: [
        {
          user_id: userId,
        },
      ],
    });

    // Set members (overwrites the list)
    await feed.updateFeedMembers({
      operation: 'set',
      members: [
        {
          user_id: userId,
        },
      ],
    });

    // Remove members
    await feed.updateFeedMembers({
      operation: 'remove',
      members: [
        {
          user_id: userId,
        },
      ],
    });

    await feed.updateFeedMembers({
      operation: 'upsert',
      members: [
        {
          user_id: userId,
          invite: true,
          custom: {
            reason: 'community builder',
          },
        },
      ],
    });

    await serverClient.deleteUsers({ user_ids: [userId], user: 'hard' });
  });

  it('Member invites', async () => {
    await invitingFeed.updateFeedMembers({
      operation: 'upsert',
      members: [
        {
          user_id: john.id,
          invite: true,
          custom: {
            reason: 'community builder',
          },
        },
      ],
    });

    const feedWithInvite = johnClient.feed(invitingFeed.group, invitingFeed.id);
    // Then John can accept or reject
    await feedWithInvite.rejectFeedMemberInvite();

    // await feedWithInvite.acceptFeedMemberInvite();
  });

  it(`Query Feed Members`, async () => {
    await feed.queryFeedMembers({
      filter: {
        role: 'moderator',
      },
    });
  });

  it(`Query feeeds`, async () => {
    const firstPage = await client.queryFeeds({
      filter: {
        created_by_id: 'john',
      },
      limit: 10,
      sort: [{ field: 'created_at', direction: -1 }],
    });
    const secondPage = await client.queryFeeds({
      filter: {
        created_by_id: 'john',
      },
      limit: 10,
      sort: [{ field: 'created_at', direction: -1 }],
      next: firstPage.next,
    });

    expect(secondPage.feeds).toBeDefined();

    await client.queryFeeds({
      filter: {
        members: { $in: ['john'] },
      },
    });

    await client.queryFeeds({
      filter: {
        visibility: { $eq: 'public' },
        name: { $q: 'Sports' },
      },
    });
    // search public feeds by description
    await client.queryFeeds({
      filter: {
        // Shorthand for the $eq operator
        visibility: 'public',
        description: { $autocomplete: 'tech' },
      },
    });

    // search public feeds created by users with 'Thompson' in their name
    await client.queryFeeds({
      filter: {
        visibility: 'public',
        'created_by.name': { $q: 'Thompson' },
      },
    });
  });

  it(`deleting a feed`, async () => {
    await feed.delete({ hard_delete: true });
  });

  afterAll(async () => {
    await client.disconnectUser();
  });
});
