'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUserContext } from '@/app/user-context';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { useParams } from 'next/navigation';
import { useErrorContext } from '@/app/error-context';
import {
  Feed,
  FeedOwnCapability,
  useOwnCapabilities,
  useStateStore,
  type ActivityState,
} from '@stream-io/feeds-react-sdk';
import { Reactions } from '@/app/components/reactions/Reactions';
import { ToggleBookmark } from '@/app/components/activity/ToggleBookmark';
import { ActivityMetadata } from '@/app/components/activity/ActivityMetadata';
import { ActivityActions } from '@/app/components/activity/ActivityActions';
import { ActivityContent } from '@/app/components/activity/ActivityContent';
import { ActivityCommentSection } from '@/app/components/comments/ActivityCommentSection';

// I need the isMounted to prevent this error from Next:
// "Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering."
// root cause: state store using useSyncExternalStore
export default function ActivityPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingIndicator color="blue" />;
  }

  return <ActivityPageContent />;
}

function ActivityPageContent() {
  const params = useParams<{ id: string }>();
  const { client } = useUserContext();
  const { logErrorAndDisplayNotification, logError } = useErrorContext();
  const [editedActivityText, setEditedActivityText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [feed, setFeed] = useState<Feed | undefined>();

  const activityWithStateUpdates = useMemo(() => {
    if (!client || !params?.id) return undefined;

    return client.activityWithStateUpdates(params.id);
  }, [client, params?.id]);

  useEffect(() => {
    if (!activityWithStateUpdates) {
      return;
    }

    let shouldStopWatching: boolean = false;
    activityWithStateUpdates
      .get()
      .then((response) => {
        const fid = response.feeds[0];
        const [group, id] = fid.split(':');
        const feed = client?.feed(group, id);
        setFeed(feed);
        if (!feed?.currentState.watch && !feed?.currentState.is_loading) {
          shouldStopWatching = true;
          return feed
            ?.getOrCreate({
              watch: true,
              limit: 0,
              followers_pagination: { limit: 0 },
              following_pagination: { limit: 0 },
            })
            .catch(logError);
        }
      })
      .catch(logErrorAndDisplayNotification);

    return () => {
      if (shouldStopWatching) {
        feed?.stopWatching();
      }
    };
  }, [logErrorAndDisplayNotification, activityWithStateUpdates, client]);

  const ownCapabilities = useOwnCapabilities({ feed, client });

  const activitySelector = useCallback((state: ActivityState) => {
    return {
      activity: state.activity,
      isLoading: state.is_loading,
    };
  }, []);
  const { activity, isLoading } = useStateStore(
    activityWithStateUpdates?.state,
    activitySelector,
  ) ?? { activity: undefined, isLoading: false };

  useEffect(() => {
    if (isEditing) {
      setEditedActivityText(activity?.text ?? '');
    }
  }, [activity, isEditing]);

  const canSendReaction = ownCapabilities.includes(
    FeedOwnCapability.ADD_ACTIVITY_REACTION,
  );

  if (!activityWithStateUpdates || isLoading || !activity) {
    return <LoadingIndicator color="blue" />;
  }

  return (
    <div className="w-full p-3 gap-3 flex flex-col rounded-md">
      <div className="flex items-center gap-1">
        <ActivityMetadata activity={activity} />
        <ActivityActions
          activity={activity}
          ownCapabilities={ownCapabilities}
          updatedText={editedActivityText}
          onEditStart={() => setIsEditing(true)}
          onEditCancel={() => setIsEditing(false)}
        />
      </div>
      <ActivityContent
        activity={activity}
        isEditing={isEditing}
        updatedText={editedActivityText}
        onUpdatedTextChange={setEditedActivityText}
      />
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <Reactions
            type="like"
            object={activity}
            canReact={canSendReaction}
            showCounter={true}
          />
        </div>

        <div className="flex items-center gap-1 text-sm px-1">
          <ToggleBookmark activity={activity} />
        </div>
      </div>
      <ActivityCommentSection
        activityWithStateUpdates={activityWithStateUpdates}
        activity={activity}
      />
    </div>
  );
}
