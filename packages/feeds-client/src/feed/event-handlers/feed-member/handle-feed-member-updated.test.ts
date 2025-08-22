import { beforeEach, describe, expect, it } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleFeedMemberUpdated } from './handle-feed-member-updated';
import {
  generateFeedResponse,
  generateFeedMemberUpdatedEvent,
  generateFeedMemberResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils/response-generators';

describe(handleFeedMemberUpdated.name, () => {
  let feed: Feed;
  let client: FeedsClient;
  let currentUserId: string;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    currentUserId = getHumanId();
    client.state.partialNext({
      connected_user: generateOwnUser({ id: currentUserId }),
    });
    const feedResponse = generateFeedResponse({
      id: 'main',
      group_id: 'user',
      created_by: { id: currentUserId },
    });
    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
  });

  it('updates an existing member in members array', () => {
    const member1 = generateFeedMemberResponse();
    const member2 = generateFeedMemberResponse();
    feed.state.partialNext({ members: [member1, member2] });

    const event = generateFeedMemberUpdatedEvent({
      member: { user: { id: member1.user.id }, role: 'admin' },
    });

    handleFeedMemberUpdated.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.members).toHaveLength(2);
    expect(stateAfter.members?.[0]).toBe(event.member);
    expect(stateAfter.members?.[1]).toBe(member2);
  });

  it('does not modify members when target is not present', () => {
    const existingMember = generateFeedMemberResponse();
    feed.state.partialNext({ members: [existingMember] });

    const event = generateFeedMemberUpdatedEvent();

    const stateBefore = feed.currentState;
    handleFeedMemberUpdated.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });

  it('sets own_membership when the updated member is the connected user', () => {
    const event = generateFeedMemberUpdatedEvent({
      member: {
        user: { id: currentUserId },
        role: 'owner',
        status: 'member',
      },
    });

    const stateBefore = feed.currentState;
    expect(stateBefore.own_membership).toBeUndefined();

    handleFeedMemberUpdated.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.own_membership).toBe(event.member);
  });
});
