import type { ActivityResponse, Attachment } from '@stream-io/feeds-react-sdk';
import { useFeedContext, useFeedsClient } from '@stream-io/feeds-react-sdk';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Composer } from '../common/composer/Composer';
import { isOGAttachment } from '../common/attachments/is-og-attachment';
import { Activity } from './Activity';
import { PollComposerModal, type PollData, type PollComposerModalHandle } from '../poll/PollComposerModal';

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
  const [attachedPoll, setAttachedPoll] = useState<PollData | null>(null);
  const pollModalRef = useRef<PollComposerModalHandle>(null);
  const existingPollIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activity) {
      setInitialText(activity.text ?? '');
      setInitialAttachments(activity.attachments.filter((a) => !isOGAttachment(a)) ?? []);
      setInitialMentionedUsers(activity.mentioned_users?.map((u) => ({ id: u.id, name: u.name || u.id })) ?? []);
      if (activity.poll) {
        existingPollIdRef.current = activity.poll.id;
        setAttachedPoll({
          name: activity.poll.name,
          options: activity.poll.options.map((o) => o.text),
          enforce_unique_vote: activity.poll.enforce_unique_vote,
        });
      } else {
        existingPollIdRef.current = null;
        setAttachedPoll(null);
      }
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

  const handleSubmit = useCallback(
    async (text: string, attachments: Attachment[], mentionedUserIds: string[]) => {
      let pollId: string | undefined;
      const hadExistingPoll = !!activity?.poll;

      // Create a new poll when attaching a new one (not when editing and keeping the existing poll)
      if (attachedPoll && client && !existingPollIdRef.current) {
        const pollResponse = await client.createPoll({
          name: attachedPoll.name,
          options: attachedPoll.options.map((optionText) => ({ text: optionText })),
          enforce_unique_vote: attachedPoll.enforce_unique_vote,
        });
        pollId = pollResponse.poll.id;
      }

      if (activity?.id) {
        const removedExistingPoll = hadExistingPoll && !attachedPoll;
        await client?.updateActivityPartial({
          id: activity.id,
          set: {
            text,
            attachments,
            mentioned_user_ids: mentionedUserIds,
            parent_id: parent?.id,
            ...(pollId && { poll_id: pollId }),
          },
          ...(removedExistingPoll && { unset: ['poll_id'] }),
          handle_mention_notifications: true,
        });
      } else {
        await feed?.addActivity({
          text,
          type: 'post',
          attachments,
          create_notification_activity: true,
          mentioned_user_ids: mentionedUserIds,
          parent_id: parent?.id,
          poll_id: pollId,
        });
      }

      // Clear attached poll after successful submission
      setAttachedPoll(null);
      onSave?.();
    },
    [feed, client, activity?.id, parent?.id, onSave, activity?.poll, attachedPoll],
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
        onSubmit={handleSubmit}
        allowEmptyText={!!parent || !!attachedPoll}
        portalContainer={portalContainer}
        rows={rows}
        attachedPoll={attachedPoll}
        onRemovePoll={handleRemovePoll}
      >
        {children}
        <button
          type="button"
          className="w-9 h-9 rounded-full hover:bg-primary/10 flex items-center justify-center text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
          onClick={handleOpenPollModal}
          aria-label="Create poll"
          disabled={!!attachedPoll}
        >
          <span className="material-symbols-outlined text-xl">ballot</span>
        </button>
      </Composer>
      <PollComposerModal ref={pollModalRef} onSubmit={handlePollSubmit} />
    </div>
  );
};
