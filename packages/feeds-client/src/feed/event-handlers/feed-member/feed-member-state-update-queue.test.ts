import { beforeEach, describe, expect, it } from 'vitest';
import { shouldUpdateState } from '../../../utils/state-update-queue';
import {
  Feed,
  handleFeedMemberAdded,
  handleFeedMemberRemoved,
  handleFeedMemberUpdated,
} from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import {
  generateFeedMemberResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils';

describe(`Feed member ${shouldUpdateState.name} integration`, () => {
  let feed: Feed;
  let client: FeedsClient;
  let userId: string;

  beforeEach(() => {
    userId = getHumanId();
    client = new FeedsClient('mock-api-key');

    client.state.partialNext({
      connected_user: generateOwnUser({ id: userId }),
    });

    const feedResponse = generateFeedResponse({
      id: 'main',
      group_id: 'user',
      created_by: { id: userId },
    });
    feed = new Feed(client, 'user', 'main', feedResponse);

    const existingMember = generateFeedMemberResponse();
    feed.state.partialNext({ members: [existingMember] });
  });

  describe.each(
    [
      {
        name: 'handleFeedMemberAdded',
        handler: handleFeedMemberAdded,
        makePayload: () => ({
          member: generateFeedMemberResponse({ user: { id: userId } }),
        }),
        expectedMembersCount: 2,
      },
      {
        name: 'handleFeedMemberUpdated',
        handler: handleFeedMemberUpdated,
        makePayload: () => ({
          member: generateFeedMemberResponse({
            user: { id: userId },
            role: 'admin',
          }),
        }),
        expectedMembersCount: 1,
      },
      {
        name: 'handleFeedMemberRemoved',
        handler: handleFeedMemberRemoved,
        makePayload: () => ({ member_id: userId }),
        expectedMembersCount: 1,
      },
    ].map(({ name, handler, makePayload, expectedMembersCount }) => [
      name,
      handler,
      makePayload,
      expectedMembersCount,
    ]),
  )(`%s`, (_name, handler, makePayload, _expectedMembersCount) => {
    it(`skips update if ${shouldUpdateState.name} returns false (HTTP then WS)`, () => {
      feed.state.partialNext({ watch: true });

      const payload = (makePayload as () => Record<string, unknown>)();

      // HTTP first
      (handler as Function).call(feed, payload, false);

      // WS second — should be skipped
      const stateBefore = feed.currentState;
      (handler as Function).call(feed, payload);

      const stateAfter = feed.currentState;
      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it(`skips update if ${shouldUpdateState.name} returns false (WS then HTTP)`, () => {
      feed.state.partialNext({ watch: true });

      const payload = (makePayload as () => Record<string, unknown>)();

      // WS first
      (handler as Function).call(feed, payload);

      // HTTP second — should be skipped
      const stateBefore = feed.currentState;
      (handler as Function).call(feed, payload, false);

      const stateAfter = feed.currentState;
      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the action', () => {
      feed.state.partialNext({ watch: true });

      const otherUserId = getHumanId();
      let payload: Record<string, unknown>;

      if (_name === 'handleFeedMemberRemoved') {
        payload = { member_id: otherUserId, user: { id: otherUserId } };
      } else {
        payload = {
          member: generateFeedMemberResponse({ user: { id: otherUserId } }),
          user: { id: otherUserId },
        };
      }

      (handler as Function).call(feed, payload);

      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue).toEqual(new Set());
    });
  });
});
