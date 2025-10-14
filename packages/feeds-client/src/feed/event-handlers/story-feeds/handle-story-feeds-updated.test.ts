import {
  generateActivityResponse,
  generateFeedReactionResponse,
} from '../../../test-utils';
import { updateActivities } from './handle-story-feeds-updated';
import { describe, expect, it } from 'vitest';

describe('updateActivities', () => {
  it('should return unchanged if new activities is empty', () => {
    const currentActivities = [generateActivityResponse({ id: 'activity1' })];
    const result = updateActivities([], currentActivities);
    expect(result.changed).toBe(false);
  });

  it('should return unchanged if current activities is undefined', () => {
    const newActivities = [generateActivityResponse({ id: 'activity1' })];
    const result = updateActivities(newActivities, undefined);
    expect(result.changed).toBe(false);
  });

  it('should update existing activities, ignore new ones', () => {
    const newActivities = [
      generateActivityResponse({ id: 'activity1', is_watched: true }),
      generateActivityResponse({ id: 'activity3' }),
    ];
    const currentActivities = [
      generateActivityResponse({
        id: 'activity1',
        own_reactions: [generateFeedReactionResponse({ type: 'like' })],
      }),
      generateActivityResponse({
        id: 'activity2',
      }),
    ];

    const result = updateActivities(newActivities, currentActivities);

    expect(result.changed).toBe(true);
    expect(result.activities).toHaveLength(2);
    expect(result.activities[0].own_reactions).toHaveLength(1);
    expect(result.activities[0].own_reactions[0].type).toBe('like');
    expect(result.activities[0].is_watched).toBe(true);
    expect(result.activities[1].id).toBe('activity2');
  });
});
