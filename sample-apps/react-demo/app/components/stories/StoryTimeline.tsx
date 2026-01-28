import type {
  AggregatedActivityResponse} from '@stream-io/feeds-react-sdk';
import {
  useAggregatedActivities,
} from '@stream-io/feeds-react-sdk';
import { useState, useCallback } from 'react';
import { StoryViewer } from './StoryViewer';
import { StoryCircle } from './StoryCircle';

export const StoryTimeline = () => {
  const {
    aggregated_activities: stories,
    loadNextPage,
    has_next_page,
  } = useAggregatedActivities() ?? {
    aggregated_activities: [],
  };
  const [selectedStoryGroup, setSelectedStoryGroup] =
    useState<AggregatedActivityResponse | null>(null);

  const closeStoryViewer = useCallback(() => {
    setSelectedStoryGroup(null);
  }, []);

  return (
    <>
      {stories.map((storyGroup) => {
        return (
          <StoryCircle
            key={storyGroup.group}
            isActive={!storyGroup.is_watched}
            onClick={() => setSelectedStoryGroup(storyGroup)}
            user={storyGroup.activities[0].user}
          />
        );
      })}
      {has_next_page && (
        <button className="btn btn-soft btn-primary" onClick={loadNextPage}>
          Load more
        </button>
      )}
      {selectedStoryGroup && (
        <StoryViewer
          key={selectedStoryGroup.group}
          activities={selectedStoryGroup.activities}
          onClose={closeStoryViewer}
        />
      )}
    </>
  );
};
