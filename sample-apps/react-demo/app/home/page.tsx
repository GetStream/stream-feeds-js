'use client';

import { StreamFeed, useClientConnectedUser, useFeedActivities } from '@stream-io/feeds-react-sdk';
import { useOwnFeedsContext } from '../own-feeds-context';
import { ActivityComposer } from '../components/activity/ActivityComposer';
import { ActivityList } from '../components/activity/ActivityList';
import { OwnStories } from '../components/stories/OwnStories';
import { StoryTimeline } from '../components/stories/StoryTimeline';
import { Avatar } from '../components/utility/Avatar';
import { HomePageSkeleton } from '../components/utility/loading-skeletons/HomePageSkeleton';

const HomeActivityComposer = () => {
  const currentUser = useClientConnectedUser();

  return (
    <div className="w-full rounded-xl">
      <div className="w-full flex items-start gap-3">
        <Avatar user={currentUser} className="size-10 md:size-12" />
        <ActivityComposer />
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
  } = useOwnFeedsContext();
  const { activities: timelineActivities, is_loading: isTimelineLoading } = useFeedActivities(ownTimeline);
  const { activities: storyActivities, is_loading: isStoryLoading } = useFeedActivities(ownStoryTimeline);

  const showSkeleton =
    !ownTimeline ||
    !ownFeed ||
    !ownStoryTimeline ||
    !ownStoryFeed ||
    (isTimelineLoading && timelineActivities?.length === 0) ||
    (isStoryLoading && storyActivities?.length === 0);

  if (showSkeleton) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="w-full flex flex-col items-center justify-start">
      {/* Stories Section */}
      <section className="w-full border-b border-base-content/20 py-3 relative">
        <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide">
          <StreamFeed feed={ownStoryFeed}>
            <OwnStories />
          </StreamFeed>
          <StreamFeed feed={ownStoryTimeline}>
            <StoryTimeline />
          </StreamFeed>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-base-100 to-transparent pointer-events-none" />
      </section>

      {/* Composer Section */}
      <section className="w-full hidden md:block pt-3">
        <StreamFeed feed={ownFeed}>
          <HomeActivityComposer />
        </StreamFeed>
      </section>

      {/* Feed Section */}
      <StreamFeed feed={ownTimeline}>
        <section className="w-full">
          <ActivityList location="timeline" error={errors.ownTimeline} />
        </section>
      </StreamFeed>
    </div>
  );
}
