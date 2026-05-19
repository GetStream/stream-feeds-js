import { describe, it, expect } from 'vitest';
import { activityFilter, filterAggregatedActivities } from './activity-filter';
import type { GetOrCreateFeedRequest } from '../gen/models';
import {
  createMockAggregatedActivity,
  generateActivityResponse,
} from '../test-utils';

describe('activityFilter', () => {
  it('returns true when requestConfig is undefined', () => {
    const activity = generateActivityResponse();
    expect(activityFilter(activity, undefined)).toBe(true);
  });

  it('returns true when requestConfig has no filter', () => {
    const activity = generateActivityResponse();
    const requestConfig: GetOrCreateFeedRequest = { limit: 10 };
    expect(activityFilter(activity, requestConfig)).toBe(true);
  });

  it('returns true when filter is empty object', () => {
    const activity = generateActivityResponse({ filter_tags: ['blue'] });
    expect(activityFilter(activity, { filter: {} })).toBe(true);
  });

  it('returns true when activity matches filter_tags', () => {
    const activity = generateActivityResponse({
      filter_tags: ['blue', 'green'],
    });
    expect(
      activityFilter(activity, { filter: { filter_tags: ['blue'] } }),
    ).toBe(true);
  });

  it('returns false when activity does not match filter_tags', () => {
    const activity = generateActivityResponse({
      filter_tags: ['red', 'green'],
    });
    expect(
      activityFilter(activity, { filter: { filter_tags: ['blue'] } }),
    ).toBe(false);
  });

  it('returns true when activity matches activity_type (maps to type)', () => {
    const activity = generateActivityResponse({ type: 'hike' });
    expect(
      activityFilter(activity, { filter: { activity_type: 'hike' } }),
    ).toBe(true);
  });

  it('returns false when activity does not match activity_type', () => {
    const activity = generateActivityResponse({ type: 'post' });
    expect(
      activityFilter(activity, { filter: { activity_type: 'hike' } }),
    ).toBe(false);
  });

  it('returns true when activity location is within_bounds', () => {
    const activity = generateActivityResponse({
      location: { lat: 52.38, lng: 4.87 },
    });
    expect(
      activityFilter(activity, {
        filter: {
          within_bounds: {
            $eq: {
              ne_lat: 52.43017,
              ne_lng: 4.924821,
              sw_lat: 52.334272,
              sw_lng: 4.822116,
            },
          },
        },
      }),
    ).toBe(true);
  });

  it('returns false when activity has no location and filter has within_bounds', () => {
    const activity = generateActivityResponse();
    expect(
      activityFilter(activity, {
        filter: {
          within_bounds: {
            $eq: {
              ne_lat: 52.43017,
              ne_lng: 4.924821,
              sw_lat: 52.334272,
              sw_lng: 4.822116,
            },
          },
        },
      }),
    ).toBe(false);
  });

  it('combines filter_tags and activity_type with $and', () => {
    const matchingActivity = generateActivityResponse({
      type: 'hike',
      filter_tags: ['blue'],
    });
    const requestConfig: GetOrCreateFeedRequest = {
      filter: {
        $and: [{ filter_tags: ['blue'] }, { activity_type: 'hike' }],
      },
    };
    expect(activityFilter(matchingActivity, requestConfig)).toBe(true);

    const wrongType = generateActivityResponse({
      type: 'post',
      filter_tags: ['blue'],
    });
    expect(activityFilter(wrongType, requestConfig)).toBe(false);

    const wrongTags = generateActivityResponse({
      type: 'hike',
      filter_tags: ['red'],
    });
    expect(activityFilter(wrongTags, requestConfig)).toBe(false);
  });

  const springSaleActivity = generateActivityResponse({
    id: 'activity-123',
    type: 'post',
    text: 'Check out our spring sale!',
    search_data: {
      campaign: {
        id: 'spring-sale-2025',
        location: {
          mall: 'yorkdale',
          city: 'toronto',
          country: 'canada',
        },
      },
    },
  });

  it('returns true when activity search_data matches $contains (nested campaign id)', () => {
    expect(
      activityFilter(springSaleActivity, {
        filter: {
          search_data: {
            $contains: { campaign: { id: 'spring-sale-2025' } },
          },
        },
      }),
    ).toBe(true);
  });

  it('returns false when activity search_data does not match $contains (wrong campaign id)', () => {
    expect(
      activityFilter(springSaleActivity, {
        filter: {
          search_data: {
            $contains: { campaign: { id: 'winter-sale-2025' } },
          },
        },
      }),
    ).toBe(false);
  });

  it('returns true when activity search_data has path for $path_exists (campaign.location.mall)', () => {
    expect(
      activityFilter(springSaleActivity, {
        filter: {
          search_data: { $path_exists: 'campaign.location.mall' },
        },
      }),
    ).toBe(true);
  });

  it('returns false when activity search_data lacks path for $path_exists', () => {
    expect(
      activityFilter(springSaleActivity, {
        filter: {
          search_data: { $path_exists: 'campaign.location.region' },
        },
      }),
    ).toBe(false);
  });
});

describe('filterAggregatedActivities', () => {
  it('returns input unchanged when requestConfig is undefined', () => {
    const groups = [
      createMockAggregatedActivity({
        group: 'g1',
        activities: [generateActivityResponse({ filter_tags: ['blue'] })],
      }),
    ];
    expect(filterAggregatedActivities(groups, undefined)).toBe(groups);
  });

  it('returns input unchanged when filter is empty', () => {
    const groups = [
      createMockAggregatedActivity({
        group: 'g1',
        activities: [generateActivityResponse({ filter_tags: ['blue'] })],
      }),
    ];
    expect(filterAggregatedActivities(groups, { filter: {} })).toBe(groups);
  });

  it('keeps a group with only the matching activities', () => {
    const matching = generateActivityResponse({
      id: 'a-match',
      filter_tags: ['blue'],
    });
    const notMatching = generateActivityResponse({
      id: 'a-miss',
      filter_tags: ['red'],
    });
    const groups = [
      createMockAggregatedActivity({
        group: 'g1',
        activities: [matching, notMatching],
      }),
    ];

    const result = filterAggregatedActivities(groups, {
      filter: { filter_tags: ['blue'] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].group).toBe('g1');
    expect(result[0].activities).toHaveLength(1);
    expect(result[0].activities[0].id).toBe('a-match');
  });

  it('drops a group entirely when no activity matches the filter', () => {
    const groups = [
      createMockAggregatedActivity({
        group: 'g1',
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['red'] }),
          generateActivityResponse({ id: 'a2', filter_tags: ['green'] }),
        ],
      }),
    ];

    const result = filterAggregatedActivities(groups, {
      filter: { filter_tags: ['blue'] },
    });

    expect(result).toHaveLength(0);
  });

  it('keeps groups that have at least one matching activity and drops groups with none', () => {
    const groups = [
      createMockAggregatedActivity({
        group: 'g-match',
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
          generateActivityResponse({ id: 'a2', filter_tags: ['red'] }),
        ],
      }),
      createMockAggregatedActivity({
        group: 'g-miss',
        activities: [
          generateActivityResponse({ id: 'a3', filter_tags: ['red'] }),
        ],
      }),
    ];

    const result = filterAggregatedActivities(groups, {
      filter: { filter_tags: ['blue'] },
    });

    expect(result.map((g) => g.group)).toEqual(['g-match']);
    expect(result[0].activities).toHaveLength(1);
    expect(result[0].activities[0].id).toBe('a1');
  });

  it('applies activity_type filter to activities inside groups', () => {
    const groups = [
      createMockAggregatedActivity({
        group: 'g1',
        activities: [
          generateActivityResponse({ id: 'a1', type: 'hike' }),
          generateActivityResponse({ id: 'a2', type: 'post' }),
        ],
      }),
    ];

    const result = filterAggregatedActivities(groups, {
      filter: { activity_type: 'hike' },
    });

    expect(result).toHaveLength(1);
    expect(result[0].activities.map((a) => a.id)).toEqual(['a1']);
  });

  it('decreases activity_count by the number of filtered-out activities and preserves other server-aggregated counts', () => {
    const groups = [
      createMockAggregatedActivity({
        group: 'g1',
        activity_count: 99,
        user_count: 42,
        score: 7,
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
          generateActivityResponse({ id: 'a2', filter_tags: ['red'] }),
        ],
      }),
    ];

    const result = filterAggregatedActivities(groups, {
      filter: { filter_tags: ['blue'] },
    });

    expect(result[0].activity_count).toBe(98);
    expect(result[0].user_count).toBe(42);
    expect(result[0].score).toBe(7);
  });

  it('keeps activity_count unchanged when no activities are filtered out of a kept group', () => {
    const groups = [
      createMockAggregatedActivity({
        group: 'g1',
        activity_count: 5,
        activities: [
          generateActivityResponse({ id: 'a1', filter_tags: ['blue'] }),
          generateActivityResponse({ id: 'a2', filter_tags: ['blue'] }),
        ],
      }),
    ];

    const result = filterAggregatedActivities(groups, {
      filter: { filter_tags: ['blue'] },
    });

    expect(result[0].activity_count).toBe(5);
  });

  it('floors activity_count at 0 if more activities are filtered out than the server-reported count', () => {
    const groups = [
      createMockAggregatedActivity({
        group: 'g1',
        activity_count: 1,
        activities: [
          generateActivityResponse({ id: 'a-match', filter_tags: ['blue'] }),
          generateActivityResponse({ id: 'a-miss-1', filter_tags: ['red'] }),
          generateActivityResponse({ id: 'a-miss-2', filter_tags: ['red'] }),
        ],
      }),
    ];

    const result = filterAggregatedActivities(groups, {
      filter: { filter_tags: ['blue'] },
    });

    expect(result[0].activity_count).toBe(0);
  });

  it('does not mutate the input groups or their activity arrays', () => {
    const matching = generateActivityResponse({
      id: 'a-match',
      filter_tags: ['blue'],
    });
    const notMatching = generateActivityResponse({
      id: 'a-miss',
      filter_tags: ['red'],
    });
    const group = createMockAggregatedActivity({
      group: 'g1',
      activities: [matching, notMatching],
    });
    const originalActivities = group.activities;

    filterAggregatedActivities([group], { filter: { filter_tags: ['blue'] } });

    expect(group.activities).toBe(originalActivities);
    expect(group.activities).toHaveLength(2);
  });
});
