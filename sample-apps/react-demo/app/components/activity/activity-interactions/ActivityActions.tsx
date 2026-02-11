import {
  type ActivityResponse,
  FeedOwnCapability,
  StreamFeed,
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

  const feed = client?.feed('user', activity.user.id);

  const canEdit =
    ownCapabilities.includes(FeedOwnCapability.UPDATE_ANY_ACTIVITY) ||
    (ownCapabilities.includes(FeedOwnCapability.UPDATE_OWN_ACTIVITY) && activity.user.id === user?.id);
  const canDelete =
    ownCapabilities.includes(FeedOwnCapability.DELETE_ANY_ACTIVITY) ||
    (ownCapabilities.includes(FeedOwnCapability.DELETE_OWN_ACTIVITY) && activity.user.id === user?.id);

  const isModerated = activity.moderation_action === 'remove';

  const deleteActivity = () => client?.deleteActivity({ id: activity.id, delete_notification_activity: true });

  return (
    <ContentActions canEdit={canEdit} canDelete={canDelete} isModerated={isModerated} onDelete={deleteActivity}>
      {(onClose, dialogElement) => feed && <StreamFeed feed={feed}>
        <ActivityComposer activity={activity} onSave={onClose} portalContainer={dialogElement} />
      </StreamFeed>}
    </ContentActions>
  );
};