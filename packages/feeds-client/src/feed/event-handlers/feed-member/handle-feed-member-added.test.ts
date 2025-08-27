import { beforeEach, describe, expect, it } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleFeedMemberAdded } from './handle-feed-member-added';
import {
  generateFeedResponse,
  generateFeedMemberAddedEvent,
  generateFeedMemberResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils/response-generators';

describe(handleFeedMemberAdded.name, () => {
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

  it('prepends to members if members array exists', () => {
    const existingMember = generateFeedMemberResponse();
    feed.state.partialNext({ members: [existingMember] });

    const event = generateFeedMemberAddedEvent();

    handleFeedMemberAdded.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.members).toHaveLength(2);
    expect(stateAfter.members?.[0]).toBe(event.member);
  });

  it('does not create members array if it does not exist', () => {
    const event = generateFeedMemberAddedEvent();

    const stateBefore = feed.currentState;
    expect(stateBefore.members).toBeUndefined();

    handleFeedMemberAdded.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });

  it('sets own_membership when the added member is the connected user', () => {
    const event = generateFeedMemberAddedEvent({
      member: { user: { id: currentUserId } },
    });

    const stateBefore = feed.currentState;
    expect(stateBefore.own_membership).toBeUndefined();

    handleFeedMemberAdded.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.own_membership).toBe(event.member);
  });
});
