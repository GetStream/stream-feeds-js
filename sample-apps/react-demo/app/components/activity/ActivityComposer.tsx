import type { ActivityResponse, Attachment } from '@stream-io/feeds-react-sdk';
import { useFeedContext, useFeedsClient } from '@stream-io/feeds-react-sdk';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Composer } from '../common/composer/Composer';
import { isOGAttachment } from '../common/attachments/is-og-attachment';
import { Activity } from './Activity';
import { PollComposerModal, type PollData, type PollComposerModalHandle } from '../poll/PollComposerModal';
import { ActivitySettingsModal, type RestrictRepliesValue, type ActivitySettings, type ActivitySettingsModalHandle } from './ActivitySettingsModal';
import { LocationModal, type LocationData, type LocationModalHandle } from './LocationModal';
import { useOwnFeedsContext } from '@/app/own-feeds-context';

export const ActivityComposer = ({
  activity,
  parent,
  onSave,
  portalContainer,
  rows,
  children,
}: {
  activity?: ActivityResponse;
  parent?: ActivityResponse;
  onSave?: () => void;
  portalContainer?: HTMLElement | null;
  rows?: number;
  children?: ReactNode;
}) => {
  const client = useFeedsClient();
  const feed = useFeedContext();
  const [initialText, setInitialText] = useState('');
  const [initialAttachments, setInitialAttachments] = useState<Attachment[]>([]);
  const [initialMentionedUsers, setInitialMentionedUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [initialSelectedHashtags, setInitialSelectedHashtags] = useState<Array<{ id: string; name: string }>>([]);
  const [attachedPoll, setAttachedPoll] = useState<PollData | null>(null);
  const [activitySettings, setActivitySettings] = useState<ActivitySettings>({ restrictReplies: 'everyone', activityVisibility: 'public' });
  const [attachedLocation, setAttachedLocation] = useState<LocationData | null>(null);
  const pollModalRef = useRef<PollComposerModalHandle>(null);
  const settingsModalRef = useRef<ActivitySettingsModalHandle>(null);
  const locationModalRef = useRef<LocationModalHandle>(null);
  const existingPollIdRef = useRef<string | null>(null);
  const { reloadTimelines } = useOwnFeedsContext();

  useEffect(() => {
    if (activity) {
      setInitialText(activity.text ?? '');
      setInitialAttachments(activity.attachments.filter((a) => !isOGAttachment(a)) ?? []);
      setInitialMentionedUsers(activity.mentioned_users?.map((u) => ({ id: u.id, name: u.name || u.id })) ?? []);
      const hashtagFeeds = activity.feeds?.filter((f) => f.startsWith('hashtag:')) ?? [];
      setInitialSelectedHashtags(
        hashtagFeeds.map((f) => {
          const id = f.slice('hashtag:'.length);
          return { id, name: id };
        }),
      );
      setActivitySettings({
        restrictReplies: activity.restrict_replies ?? 'everyone',
        activityVisibility: activity.visibility === 'tag' ? 'premium' : activity.visibility === 'private' ? 'private' : 'public',
      });
      if (activity.poll) {
        existingPollIdRef.current = activity.poll.id;
        setAttachedPoll({
          name: activity.poll.name,
          options: activity.poll.options.map((o) => o.text),
          enforce_unique_vote: activity.poll.enforce_unique_vote,
          description: activity.poll.description ?? '',
          allow_user_suggested_options: activity.poll.allow_user_suggested_options ?? false,
        });
      } else {
        existingPollIdRef.current = null;
        setAttachedPoll(null);
      }
      if (activity.location) {
        setAttachedLocation({
          city: activity.custom?.location_city ?? 'Unknown',
          lat: activity.location.lat,
          lng: activity.location.lng,
        });
      } else {
        setAttachedLocation(null);
      }
    } else {
      setInitialSelectedHashtags([]);
    }
  }, [activity]);

  const handlePollSubmit = useCallback((pollData: PollData) => {
    existingPollIdRef.current = null;
    setAttachedPoll(pollData);
  }, []);

  const handleRemovePoll = useCallback(async () => {
    const pollIdToDelete = existingPollIdRef.current;

    if (pollIdToDelete && client) {
      await client.deletePoll({ poll_id: pollIdToDelete });
    }

    existingPollIdRef.current = null;
    setAttachedPoll(null);
  }, [client]);

  const handleOpenPollModal = useCallback(() => {
    pollModalRef.current?.open();
  }, []);

  const handleOpenSettingsModal = useCallback(() => {
    settingsModalRef.current?.open();
  }, []);

  const handleSettingsSave = useCallback((value: ActivitySettings) => {
    setActivitySettings(value);
  }, []);

  const handleOpenLocationModal = useCallback(() => {
    locationModalRef.current?.open();
  }, []);

  const handleLocationConfirm = useCallback((location: LocationData) => {
    setAttachedLocation(location);
  }, []);

  const handleRemoveLocation = useCallback(() => {
    setAttachedLocation(null);
  }, []);

  const handleCreateHashtag = useCallback(async (name: string): Promise<{ id: string; name: string }> => {
    const trimmedName = name.trim();
    const res = await fetch('/api/create-hashtag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error ?? 'Failed to create hashtag');
    }
    const data = (await res.json()) as { id: string; name: string };
    return { id: data.id, name: data.name };
  }, []);

  const handleSubmit = useCallback(
    async (text: string, attachments: Attachment[], mentionedUserIds: string[], selectedHashtagIds: string[]) => {
      let pollId: string | undefined;
      const hadExistingPoll = !!activity?.poll;

      // Create a new poll when attaching a new one (not when editing and keeping the existing poll)
      if (attachedPoll && client && !existingPollIdRef.current) {
        const pollResponse = await client.createPoll({
          name: attachedPoll.name,
          options: attachedPoll.options.map((optionText) => ({ text: optionText })),
          enforce_unique_vote: attachedPoll.enforce_unique_vote,
          ...(attachedPoll.description && { description: attachedPoll.description }),
          allow_user_suggested_options: attachedPoll.allow_user_suggested_options,
        });
        pollId = pollResponse.poll.id;
      }

      const visibilityFields =
        activitySettings.activityVisibility === 'premium'
          ? { visibility: 'tag' as const, visibility_tag: 'premium' }
          : activitySettings.activityVisibility === 'private'
            ? { visibility: 'private' as const }
            : { visibility: 'public' as const };

      const locationFields = attachedLocation
        ? { location: { lat: attachedLocation.lat, lng: attachedLocation.lng }, custom: { location_city: attachedLocation.city } }
        : {};

      if (!feed?.feed) {
        return;
      }

      const feeds = [feed.feed, ...selectedHashtagIds.map((id) => `hashtag:${id}`)];
      // Temporary fix to missing WS fan-out for private activities
      const shouldReload = visibilityFields.visibility === 'private';

      if (activity?.id) {
        const removedExistingPoll = hadExistingPoll && !attachedPoll;
        const hadExistingLocation = !!activity.location;
        const removedLocation = hadExistingLocation && !attachedLocation;
        const unsetFields: string[] = [];
        if (removedExistingPoll) unsetFields.push('poll_id');
        if (activitySettings.activityVisibility !== 'premium') unsetFields.push('visibility_tag');
        if (removedLocation) {
          unsetFields.push('location');
          unsetFields.push('custom.location_city');
        }
        await client?.updateActivityPartial({
          id: activity.id,
          set: {
            text,
            attachments,
            feeds,
            mentioned_user_ids: mentionedUserIds,
            parent_id: parent?.id,
            restrict_replies: activitySettings.restrictReplies,
            ...visibilityFields,
            ...(pollId && { poll_id: pollId }),
            ...locationFields,
          },
          ...(unsetFields.length > 0 && { unset: unsetFields }),
          handle_mention_notifications: true,
        });
      } else {
        await client?.addActivity({
          feeds,
          text,
          type: 'post',
          attachments,
          create_notification_activity: true,
          mentioned_user_ids: mentionedUserIds,
          parent_id: parent?.id,
          poll_id: pollId,
          restrict_replies: activitySettings.restrictReplies,
          ...visibilityFields,
          ...locationFields,
        });
        // Reset settings to default only for new posts
        setActivitySettings({ restrictReplies: 'everyone', activityVisibility: 'public' });
      }

      if (shouldReload) {
        reloadTimelines();
      }

      // Clear attached poll and location after successful submission
      setAttachedPoll(null);
      setAttachedLocation(null);
      onSave?.();
    },
    [feed, client, activity?.id, parent?.id, onSave, activity?.poll, attachedPoll, activitySettings, attachedLocation, activity?.location, reloadTimelines],
  );

  return (
    <div className="w-full flex flex-col gap-3">
      {parent && (
        <div className="relative">
          <div className="border border-base-300 rounded-lg p-4 bg-base-200/50">
            <div className="text-xs text-base-content/60 mb-2 font-medium">Reposting</div>
            <Activity activity={parent} location="preview" />
          </div>
          <div className="absolute left-6 -bottom-3 w-0.5 h-3 bg-base-300" />
        </div>
      )}
      <Composer
        variant="activity"
        initialText={initialText}
        initialAttachments={initialAttachments}
        initialMentionedUsers={initialMentionedUsers}
        initialSelectedHashtags={initialSelectedHashtags}
        onSubmit={handleSubmit}
        allowEmptyText={!!parent || !!attachedPoll}
        portalContainer={portalContainer}
        rows={rows}
        attachedPoll={attachedPoll}
        onRemovePoll={handleRemovePoll}
        attachedLocation={attachedLocation}
        onRemoveLocation={handleRemoveLocation}
        enableHashtags
        onCreateHashtag={handleCreateHashtag}
        {...(activity ? { submitLabel: 'Save', placeholder: 'Edit your post...' } : {})}
      >
        {children}
        <button
          type="button"
          className="w-9 h-9 rounded-full hover:bg-primary/10 flex items-center justify-center text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
          onClick={handleOpenLocationModal}
          aria-label="Add location"
          disabled={!!attachedLocation}
        >
          <span className="material-symbols-outlined text-xl">location_on</span>
        </button>
        <button
          type="button"
          className="w-9 h-9 rounded-full hover:bg-primary/10 flex items-center justify-center text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
          onClick={handleOpenPollModal}
          aria-label="Create poll"
          disabled={!!attachedPoll}
        >
          <span className="material-symbols-outlined text-xl">ballot</span>
        </button>
        <button
          type="button"
          className="w-9 h-9 rounded-full hover:bg-primary/10 flex items-center justify-center text-primary transition-colors"
          onClick={handleOpenSettingsModal}
          aria-label="Post settings"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
      </Composer>
      {portalContainer
        ? createPortal(
          <>
            <PollComposerModal ref={pollModalRef} onSubmit={handlePollSubmit} />
            <ActivitySettingsModal
              ref={settingsModalRef}
              initialValue={activitySettings}
              onSave={handleSettingsSave}
            />
            <LocationModal ref={locationModalRef} onConfirm={handleLocationConfirm} />
          </>,
          document.body,
        )
        : (
          <>
            <PollComposerModal ref={pollModalRef} onSubmit={handlePollSubmit} />
            <ActivitySettingsModal
              ref={settingsModalRef}
              initialValue={activitySettings}
              onSave={handleSettingsSave}
            />
            <LocationModal ref={locationModalRef} onConfirm={handleLocationConfirm} />
          </>
        )}
    </div>
  );
};
