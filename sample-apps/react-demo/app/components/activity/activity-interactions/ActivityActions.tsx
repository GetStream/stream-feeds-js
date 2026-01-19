import {
  type ActivityResponse,
  FeedOwnCapability,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { ContentActions } from '../../common/ContentActions';
import { ActivityComposer } from '../ActivityComposer';

export const ActivityActions = ({
  activity,
  ownCapabilities,
}: {
  activity: ActivityResponse;
  ownCapabilities: readonly FeedOwnCapability[];
}) => {
  const client = useFeedsClient();
  const user = useClientConnectedUser();

  const canEdit =
    ownCapabilities.includes(FeedOwnCapability.UPDATE_ANY_ACTIVITY) ||
    (ownCapabilities.includes(FeedOwnCapability.UPDATE_OWN_ACTIVITY) && activity.user.id === user?.id);
  const canDelete =
    ownCapabilities.includes(FeedOwnCapability.DELETE_ANY_ACTIVITY) ||
    (ownCapabilities.includes(FeedOwnCapability.DELETE_OWN_ACTIVITY) && activity.user.id === user?.id);

  const isModerated = activity.moderation_action === 'remove';

  const deleteActivity = async () => {
    try {
      await client?.deleteActivity({ id: activity.id, delete_notification_activity: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ContentActions canEdit={canEdit} canDelete={canDelete} isModerated={isModerated} onDelete={deleteActivity}>
      {(onClose) => <ActivityComposer activity={activity} onSave={onClose} />}
    </ContentActions>
  );
};