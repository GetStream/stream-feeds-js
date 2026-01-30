'use client';

import { StreamFeed, useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import { useOwnFeedsContext } from '../own-feeds-context';
import { ActivityComposer } from '../components/activity/ActivityComposer';
import { ActivityList } from '../components/activity/ActivityList';
import { OwnStories } from '../components/stories/OwnStories';
import { StoryTimeline } from '../components/stories/StoryTimeline';
import { Avatar } from '../components/utility/Avatar';
import { PullToRefresh } from '../components/utility/PullToRefresh';

const HomeActivityComposer = () => {
  const currentUser = useClientConnectedUser();

  return (
    <div className="w-full p-4 bg-base-100 card border border-base-content/20">
      <div className="w-full flex items-start gap-4">
        <Avatar user={currentUser} className="size-10 md:size-12" />
        <ActivityComposer textareaBorder={false} />
      </div>
    </div>
  );
};

export default function Home() {
  const {
    ownTimeline,
    ownFeed,
    ownStoryTimeline,
    ownStoryFeed,
    errors,
    reloadTimelines,
  } = useOwnFeedsContext();

  if (!ownTimeline || !ownFeed || !ownStoryTimeline || !ownStoryFeed) {
    return null;
  }

  return (
    <PullToRefresh onRefresh={reloadTimelines}>
      <div className="w-full flex flex-col items-center justify-start gap-4">
        <div className="w-full flex flex-row gap-4">
          <StreamFeed feed={ownStoryFeed}>
            <OwnStories />
          </StreamFeed>
          <StreamFeed feed={ownStoryTimeline}>
            <StoryTimeline />
          </StreamFeed>
        </div>
        <div className="w-full hidden md:block">
          <StreamFeed feed={ownFeed}>
            <HomeActivityComposer />
          </StreamFeed>
        </div>
        <StreamFeed feed={ownTimeline}>
          <div className="w-full flex flex-col items-center justify-start gap-4">
            <div className="text-lg font-bold hidden md:block">Latest posts</div>
            <ActivityList location="timeline" error={errors.ownTimeline} />
          </div>
        </StreamFeed>
      </div>
    </PullToRefresh>
  );
}
