import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import {
  createTestClient,
  createTestTokenGenerator,
  waitForEvent,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';

describe('Comments', () => {
  const emily = { id: 'emily' };
  let emilyClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;
  let activityId: string;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));

    emilyFeed = emilyClient.feed('user', uuidv4());

    await emilyFeed.getOrCreate({ watch: false });

    const response = await emilyFeed.addActivity({
      object: `post:${uuidv4()}`,
      verb: 'create',
    });

    activityId = response.activity.id;

    for (let i = 0; i < 25; i++) {
      await emilyClient.addComment({
        activity_id: activityId,
        text: `comment${i}`,
      });
    }

    await emilyFeed.getOrCreate({ watch: true });
    await emilyFeed.read({ offset: 0, limit: 10 });
  });

  it('add and update comment before comments were quired', async () => {
    const spy = vi.fn();
    emilyFeed.state.subscribeWithSelector(
      (state) => ({ comments: state.activity_comments[activityId] }),
      spy,
    );
    spy.mockReset();

    const response = await emilyClient.addComment({
      text: `this is a text comment`,
      activity_id: activityId,
    });

    await waitForEvent(emilyClient, 'feeds.activity_comment_new');

    expect(spy.mock.calls.length).toBe(0);

    await emilyClient.updateComment({
      text: `this is a text comment - updated`,
      comment_id: response.comment.id,
      activity_id: activityId,
    });

    await waitForEvent(emilyClient, 'feeds.activity_comment_updated');

    expect(spy.mock.calls.length).toBe(0);
  });

  it('query comments', async () => {
    await emilyFeed.queryActivityComments(
      { activityId },
      {
        limit: 10,
      },
    );

    expect(
      emilyFeed.state.getLatestValue().activity_comments[activityId]?.comments
        ?.length,
    ).toBe(10);
  });

  it('query next page', async () => {
    // TODO: can't test pagination due to backend issue
    // const next =
    //   emilyFeed.state.getLatestValue().activity_comments[activityId]?.next;
    // await emilyFeed.queryActivityComments(activityId, {
    //   next,
    //   limit: 10,
    // });
    // expect(
    //   emilyFeed.state.getLatestValue().activity_comments[activityId]?.comments
    //     ?.length,
    // ).toBe(20);
  });

  it('query same page - make sure comments are not duplicated', async () => {
    // TODO: can't test pagination due to backend issue
  });

  it('add comment', async () => {
    const numberOfCommentsInState =
      emilyFeed.state.getLatestValue().activity_comments[activityId].comments
        .length;
    const commentCount =
      emilyFeed.state
        .getLatestValue()
        .activities?.find((a) => a.id === activityId)?.comment_count ?? 0;

    void emilyClient.addComment({
      text: 'hi',
      activity_id: activityId,
    });

    await Promise.all([
      waitForEvent(emilyClient, 'feeds.activity_comment_new'),
      waitForEvent(emilyClient, 'feeds.activity_updated'),
    ]);

    expect(
      emilyFeed.state.getLatestValue().activity_comments[activityId]?.comments
        ?.length,
    ).toBe(numberOfCommentsInState + 1);

    expect(
      emilyFeed.state
        .getLatestValue()
        .activities?.find((a) => a.id === activityId)?.comment_count,
    ).toBe(commentCount + 1);
  });

  it('update comment', async () => {
    const comment =
      emilyFeed.state.getLatestValue().activity_comments[activityId]
        .comments[0];

    void emilyClient.updateComment({
      activity_id: comment.activity_id,
      comment_id: comment.id,
      text: 'Hi 👋',
    });

    await waitForEvent(emilyClient, 'feeds.activity_comment_updated');

    expect(
      emilyFeed.state.getLatestValue().activity_comments[activityId].comments[0]
        .text,
    ).toBe('Hi 👋');
  });

  it('reply to comment', async () => {
    let comment =
      emilyFeed.state.getLatestValue().activity_comments[activityId]
        .comments[0];

    // We need to query comments otherwise new replies won't be added on WS events
    await emilyFeed.queryActivityComments({ activityId, parentId: comment.id });
    void emilyClient.addComment({
      activity_id: comment.activity_id,
      text: 'This is a reply',
      parent_id: comment.id,
    });

    await Promise.all([
      waitForEvent(emilyClient, 'feeds.activity_comment_new'),
      waitForEvent(emilyClient, 'feeds.activity_comment_updated'),
    ]);

    expect(
      emilyFeed.state.getLatestValue().activity_comments[comment.id].comments
        .length,
    ).toBe(1);

    comment =
      emilyFeed.state.getLatestValue().activity_comments[activityId]
        .comments[0];
    // TODO: backend issue
    // expect(comment.reply_count).toBe(1);
  });

  it('add reaction to comment', async () => {
    // TODO: implement me
  });

  it('delete reaction from comment', async () => {
    // TODO: implement me
  });

  it('delete comment', async () => {
    // TODO: figure out: hard or soft delete?
    // let comment =
    //   emilyFeed.state.getLatestValue().activity_comments[activityId]
    //     .comments[0];
    // const numberOfCommentsInState =
    //   emilyFeed.state.getLatestValue().activity_comments[activityId].comments
    //     .length;
    // const commentCount =
    //   emilyFeed.state
    //     .getLatestValue()
    //     .activities?.find((a) => a.id === activityId)?.comment_count ?? 0;
    // void emilyClient.removeComment({
    //   comment_id: comment.id,
    //   activity_id: activityId,
    // });
    // await Promise.all([
    //   waitForEvent(emilyClient, 'feeds.activity_comment_new'),
    //   waitForEvent(emilyClient, 'feeds.activity_updated'),
    // ]);
    // expect(
    //   emilyFeed.state.getLatestValue().activity_comments[activityId]?.comments
    //     ?.length,
    // ).toBe(numberOfCommentsInState - 1);
    // expect(
    //   emilyFeed.state
    //     .getLatestValue()
    //     .activities?.find((a) => a.id === activityId)?.comment_count,
    // ).toBe(commentCount - 1);
  });

  it('add comment - make sure comments are ordered by created_at', async () => {
    const olderEvent = {
      comment: {
        activity_id: activityId,
        created_at: new Date('2025-02-07T15:32:46.086Z'),
        custom: {},
        deleted_at: null,
        feed_fid: emilyFeed.fid,
        id: uuidv4(),
        mentioned_user_ids: [],
        parent_id: undefined,
        pin_expires: null,
        pinned_at: null,
        pinned_by_id: null,
        reaction_counts: {},
        reply_count: 0,
        text: 'this is a text comment',
        updated_at: '2025-02-07T15:32:46.086Z',
        user_id: emily.id,
      },
      created_at: '2025-02-07T15:32:46.095Z',
      custom: {},
      fid: 'user:7b87e341-257a-4177-9a64-7ae08192c342',
      received_at: '2025-02-07T15:32:46.101Z',
      type: 'feeds.activity_comment_new',
    };

    const newerEvent = {
      comment: {
        activity_id: activityId,
        created_at: new Date('2025-02-07T17:32:46.086Z'),
        custom: {},
        deleted_at: null,
        feed_fid: emilyFeed.fid,
        id: uuidv4(),
        mentioned_user_ids: [],
        parent_id: undefined,
        pin_expires: null,
        pinned_at: null,
        pinned_by_id: null,
        reaction_counts: {},
        reply_count: 0,
        text: 'this is a text comment',
        updated_at: '2025-02-07T15:32:46.086Z',
        user_id: emily.id,
      },
      created_at: '2025-02-07T15:32:46.095Z',
      custom: {},
      fid: 'user:7b87e341-257a-4177-9a64-7ae08192c342',
      received_at: '2025-02-07T15:32:46.101Z',
      type: 'feeds.activity_comment_new',
    };

    // @ts-expect-error type:string
    emilyFeed.handleWSEvent(newerEvent);
    // @ts-expect-error type:string
    emilyFeed.handleWSEvent(olderEvent);

    const comments =
      emilyFeed.state.getLatestValue().activity_comments[activityId].comments;
    const olderCommentIndex = comments.findIndex(
      (c) => c.id === olderEvent.comment.id,
    );
    const newerCommentIndex = comments.findIndex(
      (c) => c.id === newerEvent.comment.id,
    );

    expect(newerCommentIndex).toBeLessThan(olderCommentIndex);
  });

  it(`receiving event to a not loaded comment shouldn't update state`, async () => {});

  afterAll(async () => {
    await emilyFeed.delete();
  });
});
