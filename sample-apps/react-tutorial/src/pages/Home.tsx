import { StreamFeed } from '@stream-io/feeds-react-sdk';
import { useOwnFeedContext } from '../own-feeds-context';
import { ActivityComposer } from '../components/activity/ActivityComposer';
import { ActivityList } from '../components/activity/ActivityList';
import { OwnStories } from '../components/stories/OwnStories';
import { StoryTimeline } from '../components/stories/StoryTimeline';

export const Home = () => {
  const { ownTimeline, ownFeed, ownStoryTimeline, ownStoryFeed } =
    useOwnFeedContext();

  if (!ownTimeline || !ownFeed || !ownStoryTimeline || !ownStoryFeed) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <div className="w-full flex flex-row gap-4">
        <StreamFeed feed={ownStoryFeed}>
          <OwnStories />
        </StreamFeed>
        <StreamFeed feed={ownStoryTimeline}>
          <StoryTimeline />
        </StreamFeed>
      </div>
      <StreamFeed feed={ownFeed}>
        <ActivityComposer />
      </StreamFeed>
      <StreamFeed feed={ownTimeline}>
        <div className="w-full flex flex-col items-center justify-start gap-4">
          <div className="text-lg font-bold">Latest posts</div>
          <ActivityList />
        </div>
      </StreamFeed>
    </div>
  );
};
