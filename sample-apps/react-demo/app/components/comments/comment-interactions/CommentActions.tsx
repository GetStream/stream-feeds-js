import type { CommentResponse } from '@stream-io/feeds-react-sdk';
import {
  FeedOwnCapability,
  useClientConnectedUser,
  useFeedsClient,
  useOwnCapabilities,
} from '@stream-io/feeds-react-sdk';
import { ContentActions } from '../../common/ContentActions';
import { CommentComposer } from '../CommentComposer';

export const CommentActions = ({ comment }: { comment: CommentResponse }) => {
  const client = useFeedsClient();
  const user = useClientConnectedUser();
  const ownCapabilities = useOwnCapabilities();

  const canEdit =
    ownCapabilities.includes(FeedOwnCapability.UPDATE_ANY_COMMENT) ||
    (ownCapabilities.includes(FeedOwnCapability.UPDATE_OWN_COMMENT) && comment.user.id === user?.id);
  const canDelete =
    ownCapabilities.includes(FeedOwnCapability.DELETE_ANY_COMMENT) ||
    (ownCapabilities.includes(FeedOwnCapability.DELETE_OWN_COMMENT) && comment.user.id === user?.id);

  const isModerated = comment.moderation?.action === 'remove';

  const deleteComment = () => client?.deleteComment({ id: comment.id, delete_notification_activity: true });

  return (
    <ContentActions canEdit={canEdit} canDelete={canDelete} isModerated={isModerated} onDelete={deleteComment}>
      {(onClose, dialogElement) => <CommentComposer comment={comment} onSubmitted={onClose} portalContainer={dialogElement} />}
    </ContentActions>
  );
};
