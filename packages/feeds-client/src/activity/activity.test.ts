import { describe, expect, it, vi } from 'vitest';
import { Activity } from './activity';
import { FeedsClient } from '../feeds-client';
import {
  generateActivityResponse,
  generateCommentResponse,
  generateFeedResponse,
} from '../test-utils';

describe('Activity tests', () => {
  it(`should create activity`, async () => {
    const activity = new Activity('123', new FeedsClient('mock-api-key'));

    expect(activity.id).toBe('123');
  });

  it(`should save watch state`, async () => {
    const client = new FeedsClient('mock-api-key');
    vi.spyOn(client, 'getActivity').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve({
        activity: generateActivityResponse({
          id: '123',
          feeds: ['user:123'],
        }),
      }),
    );
    vi.spyOn(client, 'getOrCreateFeed').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve(),
    );
    const activity = new Activity('123', client);
    await activity.get();

    expect(activity.currentState.watch).toBe(false);

    await activity.get({ watch: true });

    expect(activity.currentState.watch).toBe(true);
  });

  it(`should set is loading to true when initiating get request`, async () => {
    const client = new FeedsClient('mock-api-key');
    const acitivityResponse = generateActivityResponse({
      id: '123',
      feeds: ['user:123'],
    });
    vi.spyOn(client, 'getActivity').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve({
        activity: acitivityResponse,
      }),
    );
    vi.spyOn(client, 'getOrCreateFeed').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve(),
    );

    const activity = new Activity('123', client);

    const spy = vi.fn();
    activity.state.subscribe(spy);
    spy.mockReset();

    const request = activity.get();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.lastCall?.[0].is_loading).toBe(true);

    await request;

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.lastCall?.[0].is_loading).toBe(false);
  });

  it(`should save activity state`, async () => {
    const client = new FeedsClient('mock-api-key');
    const acitivityResponse = generateActivityResponse({
      id: '123',
      feeds: ['user:123'],
    });
    vi.spyOn(client, 'getActivity').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve({
        activity: acitivityResponse,
      }),
    );
    vi.spyOn(client, 'getOrCreateFeed').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve(),
    );

    const activity = new Activity('123', client);

    const spy = vi.fn();
    activity.state.subscribe(spy);

    const request = activity.get();
    spy.mockReset();
    await request;

    expect(spy).toHaveBeenCalledTimes(1);

    const param = spy.mock.calls[0][0];
    expect(param).toStrictEqual({
      is_loading: false,
      watch: false,
      comments_by_entity_id: {},
      ...acitivityResponse,
    });
  });

  it(`should fetch comments, if comment config is provided`, async () => {
    const client = new FeedsClient('mock-api-key');
    const acitivityResponse = generateActivityResponse({
      id: 'activity-1',
      feeds: ['user:123'],
    });
    vi.spyOn(client, 'getActivity').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve({
        activity: acitivityResponse,
      }),
    );
    vi.spyOn(client, 'getOrCreateFeed').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve(),
    );
    const commentResponse = generateCommentResponse({
      id: 'comment-1',
      object_id: 'activity-1',
      object_type: 'activity',
    });
    const commentsSpy = vi.spyOn(client, 'getComments').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve({
        comments: [commentResponse],
      }),
    );
    const activity = new Activity('activity-1', client);

    const spy = vi.fn();
    activity.state.subscribe(spy);
    const request = activity.get({ comments: { sort: 'first' } });
    spy.mockReset();
    await request;

    expect(commentsSpy).toHaveBeenCalledWith({
      sort: 'first',
      object_id: 'activity-1',
      object_type: 'activity',
      next: undefined,
    });

    expect(spy).toHaveBeenCalledTimes(1);

    const param = spy.mock.calls[0][0];
    expect(param).toStrictEqual({
      comments_by_entity_id: {
        'activity-1': {
          comments: [commentResponse],
          entity_parent_id: undefined,
          pagination: {
            next: undefined,
            loading_next_page: false,
            sort: 'first',
          },
        },
      },
      is_loading: false,
      watch: false,
      ...acitivityResponse,
    });
  });

  it(`should autoselect current_feed if activity belongs to single feed`, async () => {
    const client = new FeedsClient('mock-api-key');
    const feed = generateFeedResponse({
      feed: 'user:123',
    });
    const acitivityResponse = generateActivityResponse({
      id: 'activity-1',
      feeds: [feed.feed],
      current_feed: feed,
    });
    vi.spyOn(client, 'getActivity').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve({
        activity: acitivityResponse,
      }),
    );
    vi.spyOn(client, 'getOrCreateFeed').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve(),
    );
    const activity = new Activity('activity-1', client);

    await activity.get();

    expect(activity.feed?.feed).toBe(feed.feed);
  });

  it(`should autoselect first feed if activity belongs to multiple feeds`, async () => {
    const client = new FeedsClient('mock-api-key');
    const feed = generateFeedResponse({
      feed: 'user:123',
    });
    const acitivityResponse = generateActivityResponse({
      id: 'activity-1',
      feeds: [feed.feed, 'user:456'],
      current_feed: undefined,
    });
    vi.spyOn(client, 'getActivity').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve({
        activity: acitivityResponse,
      }),
    );
    vi.spyOn(client, 'getOrCreateFeed').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve(),
    );
    const activity = new Activity('activity-1', client);

    await activity.get();

    expect(activity.feed?.feed).toBe(feed.feed);
  });

  it(`should accept feed selector, if function is provided`, async () => {
    const client = new FeedsClient('mock-api-key');
    const feed = 'user:123';
    const feed2 = 'user:456';
    const acitivityResponse = generateActivityResponse({
      id: 'activity-1',
      feeds: [feed, feed2],
      current_feed: undefined,
    });
    vi.spyOn(client, 'getActivity').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve({
        activity: acitivityResponse,
      }),
    );
    vi.spyOn(client, 'getOrCreateFeed').mockImplementation(() =>
      // @ts-expect-error - we don't care about the full return value, so type mismatch is fine
      Promise.resolve(),
    );
    const activity = new Activity('activity-1', client);

    const spy = vi.fn();
    spy.mockImplementation(() => feed2);
    await activity.get({
      feedSelector: spy,
    });

    expect(activity.feed?.feed).toBe(feed2);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.lastCall?.[0]).toBe(acitivityResponse);
  });
});
