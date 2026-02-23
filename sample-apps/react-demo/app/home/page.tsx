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
    <div className="w-full flex items-start gap-3">
      <Avatar user={currentUser} className="size-10 shrink-0" />
      <ActivityComposer />
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
      <section className="w-full border-b border-base-content/10 py-3 flex flex-row gap-2 px-4">
        <StreamFeed feed={ownStoryFeed}>
          <OwnStories />
        </StreamFeed>
        <div
          className="flex-1 min-w-0 overflow-x-auto"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)' }}
        >
          <div className="inline-flex flex-row gap-2 px-3">
            <StreamFeed feed={ownStoryTimeline}>
              <StoryTimeline />
            </StreamFeed>
          </div>
        </div>
      </section>

      {/* Composer Section */}
      <section className="w-full hidden md:block px-4 py-3 border-b border-base-content/10">
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
