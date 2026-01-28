'use client';
import { useCallback, useEffect, useState } from 'react';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { useParams } from 'next/navigation';
import { useErrorContext } from '@/app/error-context';
import type {
  ActivityWithStateUpdates,
  Feed,
} from '@stream-io/feeds-react-sdk';
import {
  FeedOwnCapability,
  useClientConnectedUser,
  useFeedsClient,
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
  const client = useFeedsClient();
  const user = useClientConnectedUser();
  const { logErrorAndDisplayNotification, logError } = useErrorContext();
  const [editedActivityText, setEditedActivityText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [feed, setFeed] = useState<Feed | undefined>();
  const [activityWithStateUpdates, setActivityWithStateUpdates] = useState<
    ActivityWithStateUpdates | undefined
  >();

  useEffect(() => {
    if (!client || !params?.id) {
      setActivityWithStateUpdates(undefined);
      return;
    }

    const _activityWithStateUpdates = client.activityWithStateUpdates(
      params.id,
    );
    setActivityWithStateUpdates(_activityWithStateUpdates);

    return () => {
      _activityWithStateUpdates?.dispose();
    };
  }, [client, params?.id]);

  useEffect(() => {
    if (!activityWithStateUpdates || !user?.id) {
      return;
    }

    let shouldStopWatching: boolean = false;
    let _feed: Feed | undefined;
    activityWithStateUpdates
      .get()
      .then((response) => {
        const fid = response.feeds[0];
        const [group, id] = fid.split(':');
        _feed = client?.feed(group, id);
        setFeed(_feed);
        if (
          !(_feed?.id === user.id) &&
          !_feed?.currentState.watch &&
          !_feed?.currentState.is_loading
        ) {
          shouldStopWatching = true;
          return _feed
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
        _feed?.stopWatching();
      }
    };
  }, [
    logErrorAndDisplayNotification,
    logError,
    activityWithStateUpdates,
    client,
    user?.id,
  ]);

  const ownCapabilities = useOwnCapabilities(feed);

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
