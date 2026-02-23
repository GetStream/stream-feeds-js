'use client';

import { ActivityInteractions } from '@/app/components/activity/activity-interactions/ActivityInteractions';
import { ActivityContent } from '@/app/components/activity/ActivityContent';
import { ActivityHeader } from '@/app/components/activity/ActivityHeader';
import { ActivityParent } from '@/app/components/activity/ActivityParent';
import { CommentComposer } from '@/app/components/comments/CommentComposer';
import { CommentList } from '@/app/components/comments/CommentList';
import { ErrorCard } from '@/app/components/utility/ErrorCard';
import { ActivityDetailsPageSkeleton } from '@/app/components/utility/loading-skeletons/ActivityDetailsPageSkeleton';
import { PollDisplay } from '@/app/components/poll/PollDisplay';
import { Avatar } from '@/app/components/utility/Avatar';
import { NavLink } from '@/app/components/utility/NavLink';
import {
  StreamActivityWithStateUpdates,
  useFeedsClient,
  useStateStore,
  useClientConnectedUser,
  type ActivityState,
  type ActivityWithStateUpdates,
  useOwnFollowings,
  StreamFeed,
} from '@stream-io/feeds-react-sdk';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ActivityResponse, Feed } from '@stream-io/feeds-react-sdk';

const selector = (state: ActivityState) => ({
  activity: state.activity,
});

const CommentRestrictionMessage = ({ restrictReplies }: { restrictReplies?: ActivityResponse['restrict_replies'] }) => {
  const message = restrictReplies === 'nobody'
    ? 'Comments are turned off'
    : 'Only friends can comment';

  return (
    <div className="flex items-center gap-2 py-3 px-4 bg-base-200 rounded-lg text-base-content/60">
      <span className="material-symbols-outlined text-lg">
        {restrictReplies === 'nobody' ? 'comments_disabled' : 'group'}
      </span>
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default function ActivityPage() {
  const id = useParams<{ id: string }>().id;
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();
  const [isLoading, setIsLoading] = useState(true);
  const [activityWithStateUpdates, setActivityWithStateUpdates] = useState<
    ActivityWithStateUpdates | undefined
  >();
  const [error, setError] = useState<string | undefined>(undefined);
  const [activityFeed, setActivityFeed] = useState<Feed | undefined>(undefined);

  useEffect(() => {
    const activityWrapper = client?.activityWithStateUpdates(id);
    setActivityWithStateUpdates(activityWrapper);

    return () => activityWrapper?.dispose();
  }, [client, id]);

  useEffect(() => {
    if (!client) {
      return;
    }
    setIsLoading(true);
    if (!activityWithStateUpdates?.currentState.activity) {
      activityWithStateUpdates?.get({
        comments: {
          limit: 5,
          sort: 'best',
        },
      }).then((activityResponse) => {
        // Get the feed to access own_followings for people_i_follow restriction
        // If activity is posted to multiple feeds, current_feed is not set
        if (activityResponse.current_feed && activityResponse.current_feed.group_id === 'user') {
          const feed = client.feed(
            activityResponse.current_feed.group_id,
            activityResponse.current_feed.id,
          );
          setActivityFeed(feed);
        } else {
          const [feedGroupId, feedId] = activityResponse.feeds.find(feed => feed.startsWith('user:'))?.split(':') ?? [];
          const feed = client.feed(feedGroupId, feedId);
          setActivityFeed(feed);
          return feed.currentState.is_loading ? undefined : feed.getOrCreate({ limit: 0 });
        }
      }).catch((e) => {
        setError(e.message);
        throw e;
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [activityWithStateUpdates, client]);

  const { activity } = useStateStore(
    activityWithStateUpdates?.state,
    selector,
  ) ?? { activity: undefined };

  const { own_followings: ownFollowings } = useOwnFollowings(activityFeed) ?? {};

  const canComment = useMemo(() => {
    const restrictReplies = activity?.restrict_replies ?? 'everyone';

    // Author can always comment
    if (activity?.user.id === currentUser?.id) {
      return true;
    }

    switch (restrictReplies) {
      case 'everyone':
        return true;
      case 'nobody':
        return false;
      case 'people_i_follow':
        return (ownFollowings?.length ?? 0) > 0;
      default:
        return true;
    }
  }, [ownFollowings, activity?.user.id, activity?.restrict_replies, currentUser?.id]);

  if (error) {
    return <ErrorCard message="Failed to load activity" error={`${error}. This can happen if the activity was deleted.`} />;
  }

  if (!activity || !activityWithStateUpdates || isLoading) {
    return <ActivityDetailsPageSkeleton />;
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      {activityFeed && <StreamFeed feed={activityFeed}>
        <div className="px-4 py-3 border-b border-base-content/10">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <NavLink href={`/profile/${activity.user.id}`}>
                <Avatar user={activity.user} className="size-10" />
              </NavLink>
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <ActivityHeader activity={activity} withActions={true} withAvatar={false} />
              <ActivityContent activity={activity} />
              {activity.poll && (
                <PollDisplay poll={activity.poll} activity={activity} />
              )}
              <ActivityParent activity={activity} />
              <ActivityInteractions activity={activity} />
            </div>
          </div>
        </div>
        <div className="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-4 py-3 border-b border-base-content/10">
          <div className="text-base font-semibold">Comments</div>
        </div>
        <div className="px-4 py-3 border-b border-base-content/10">
          {canComment ? (
            <CommentComposer activity={activity} />
          ) : (
            <CommentRestrictionMessage restrictReplies={activity.restrict_replies} />
          )}
        </div>
        <StreamActivityWithStateUpdates activityWithStateUpdates={activityWithStateUpdates}>
          <CommentList />
        </StreamActivityWithStateUpdates>
      </StreamFeed>}
    </div>
  );
}
