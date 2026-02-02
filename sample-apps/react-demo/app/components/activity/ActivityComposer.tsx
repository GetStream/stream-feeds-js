import type { ActivityResponse, Attachment } from '@stream-io/feeds-react-sdk';
import { useFeedContext, useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useCallback, useEffect, useState } from 'react';
import { Composer } from '../common/composer/Composer';
import { isOGAttachment } from '../common/attachments/is-og-attachment';
import { Activity } from './Activity';

export const ActivityComposer = ({
  activity,
  parent,
  onSave,
  portalContainer,
  rows,
}: {
  activity?: ActivityResponse;
  parent?: ActivityResponse;
  onSave?: () => void;
  portalContainer?: HTMLElement | null;
  rows?: number;
}) => {
  const client = useFeedsClient();
  const feed = useFeedContext();
  const [initialText, setInitialText] = useState('');
  const [initialAttachments, setInitialAttachments] = useState<Attachment[]>([]);
  const [initialMentionedUsers, setInitialMentionedUsers] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (activity) {
      setInitialText(activity.text ?? '');
      setInitialAttachments(activity.attachments.filter((a) => !isOGAttachment(a)) ?? []);
      setInitialMentionedUsers(activity.mentioned_users?.map((u) => ({ id: u.id, name: u.name || u.id })) ?? []);
    }
  }, [activity]);

  const handleSubmit = useCallback(
    async (text: string, attachments: Attachment[], mentionedUserIds: string[]) => {
      if (activity?.id) {
        await client?.updateActivityPartial({
          id: activity.id,
          set: {
            text,
            attachments,
            mentioned_user_ids: mentionedUserIds,
            parent_id: parent?.id,
          },
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
        });
      }
      onSave?.();
    },
    [feed, client, activity?.id, parent?.id, onSave],
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
        allowEmptyText={!!parent}
        portalContainer={portalContainer}
        rows={rows}
      />
    </div>
  );
};
