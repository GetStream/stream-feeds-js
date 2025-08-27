import { beforeEach, describe, expect, it } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleFeedMemberRemoved } from './handle-feed-member-removed';
import {
  generateFeedResponse,
  generateFeedMemberRemovedEvent,
  generateFeedMemberResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils/response-generators';

describe(handleFeedMemberRemoved.name, () => {
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

  it('removes from members if present', () => {
    const memberToRemove = generateFeedMemberResponse();
    const memberToKeep = generateFeedMemberResponse();
    feed.state.partialNext({ members: [memberToRemove, memberToKeep] });

    const event = generateFeedMemberRemovedEvent({
      member_id: memberToRemove.user.id,
    });

    handleFeedMemberRemoved.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.members).toHaveLength(1);
    expect(stateAfter.members?.[0]).toBe(memberToKeep);
  });

  it('does not change state when members array is undefined', () => {
    const event = generateFeedMemberRemovedEvent();

    const stateBefore = feed.currentState;
    expect(stateBefore.members).toBeUndefined();

    handleFeedMemberRemoved.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });

  it('deletes own_membership when the removed member is the connected user', () => {
    const ownMember = generateFeedMemberResponse({
      user: { id: currentUserId },
    });
    feed.state.partialNext({ own_membership: ownMember, members: [] });

    const event = generateFeedMemberRemovedEvent({ member_id: currentUserId });

    const stateBefore = feed.currentState;
    expect(stateBefore.own_membership).toBe(ownMember);

    handleFeedMemberRemoved.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.own_membership).toBeUndefined();
    expect(stateAfter.members).toBe(stateBefore.members);
  });
});
