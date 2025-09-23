import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { ActivityResponse, UserRequest } from '../../src/gen/models';

describe('Polls page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activity: ActivityResponse;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate({ watch: true });
    activity = (
      await feed.addActivity({
        type: 'post',
        text: 'Hello, world!',
      })
    ).activity;
  });

  it('Creating a Poll and Sending it as Part of an Activty', async () => {
    const response = await client.createPoll({
      name: 'Where should we host our next company event?',
      options: [
        { text: 'Amsterdam, The Netherlands' },
        { text: 'Boulder, CO' },
      ],
      // Optionally allow users to send text answers (comments)
      allow_answers: true,
    });
    // Attach poll to an activity
    activity = (
      await feed.addActivity({
        type: 'post',
        poll_id: response.poll.id,
      })
    ).activity;

    expect(response.poll.id).toBe(activity.poll?.id);
  });

  it(`Poll options`, async () => {
    const poll = await client.createPoll({
      name: 'Where should we host our next company event?',
      options: [
        {
          text: 'Amsterdam, The Netherlands',
          custom: {
            country: 'Netherlands',
            timezone: 'CET',
          },
        },
        {
          text: 'Boulder, CO',
          custom: {
            country: 'United States',
            timezone: 'MST',
          },
        },
      ],
      custom: {
        category: 'event_planning',
        priority: 'high',
      },
    });

    await client.deletePoll({
      poll_id: poll.poll.id,
    });
  });

  it(`Send Vote on Option`, async () => {
    await client.castPollVote({
      activity_id: activity.id,
      poll_id: activity.poll?.id!,
      vote: {
        option_id: activity.poll?.options[0]?.id!,
      },
    });
  });

  it(`Send an Answer (if answers are configured to be allowed)`, async () => {
    await client.castPollVote({
      activity_id: activity.id,
      poll_id: activity.poll?.id!,
      vote: {
        answer_text: `Let's go somewhere else`,
      },
    });

    await waitForEvent(feed, 'feeds.poll.vote_casted');
  });

  it(`Removing a poll vote`, async () => {
    const poll = client.pollFromState(activity.poll?.id!);
    const voteId = poll?.state.getLatestValue()?.latest_answers[0]?.id!;

    await client.deletePollVote({
      activity_id: activity.id,
      poll_id: activity.poll?.id!,
      vote_id: voteId,
    });
  });

  it('Closing a poll', async () => {
    await client.closePoll({
      poll_id: activity.poll?.id!,
    });
  });

  it(`Retrieving a poll`, async () => {
    const poll = client.pollFromState(activity.poll?.id!);
    const unsubscribe = poll?.state.subscribe((state) => {
      // Called every time the poll state changes
      console.log(state);
    });

    unsubscribe?.();
  });

  it(`Updating a  poll`, async () => {
    const currentPoll = client.pollFromState(activity.poll?.id!);
    await client.updatePoll({
      id: activity.poll?.id!,
      name: 'Where should we host our next company event?',
      options: [
        {
          id: currentPoll?.state.getLatestValue()?.options[0]?.id!,
          text: 'Amsterdam, The Netherlands',
          custom: {
            reason: 'too expensive',
          },
        },
        {
          id: currentPoll?.state.getLatestValue()?.options[0]?.id!,
          text: 'Boulder, CO',
          custom: {
            reason: 'too far',
          },
        },
      ],
    });
  });

  it(`Poll partial update`, async () => {
    await client.updatePollPartial({
      poll_id: activity.poll?.id!,
      set: {
        name: 'Updated poll name',
        unset: ['custom'],
      },
    });
  });

  it(`Add a poll option`, async () => {
    await client.createPollOption({
      poll_id: activity.poll?.id!,
      text: 'Another option',
      custom: {
        added_by: 'user_123',
      },
    });
  });

  it(`Update poll option`, async () => {
    const currentPoll = client.pollFromState(activity.poll?.id!);

    await client.updatePollOption({
      poll_id: activity.poll?.id!,
      id: currentPoll?.state.getLatestValue()?.options[0]?.id!,
      text: 'Updated option',
      custom: {
        my_custom_property: 'my_custom_value',
      },
    });
  });

  it(`Delete Poll Option`, async () => {
    const currentPoll = client.pollFromState(activity.poll?.id!);

    await client.deletePollOption({
      poll_id: activity.poll?.id!,
      option_id: currentPoll?.state.getLatestValue()?.options[0]?.id!,
    });
  });

  it(`Querying votes`, async () => {
    await client.queryPollVotes({
      filter: {
        option_id: { $in: ['option_789', 'option_790'] },
      },
      poll_id: activity.poll?.id!,
    });
  });

  it(`Querying Polls`, async () => {
    await client.queryPolls({
      filter: {
        is_closed: true,
      },
      sort: [{ field: 'created_at', direction: -1 }],
    });
  });

  it(`Deleting a poll`, async () => {
    await client.deletePoll({
      poll_id: activity.poll?.id!,
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
