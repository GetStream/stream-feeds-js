import type {
  ActivityResponse
} from '@stream-io/feeds-react-sdk';
import {
  useClientConnectedUser,
  useFeedsClient,
  useOwnCapabilities,
} from '@stream-io/feeds-react-sdk';
import { ToggleFollowButton } from '../ToggleFollowButton';
import { ContentMetadata } from '../common/ContentMetadata';
import { ActivityActions } from './activity-interactions/ActivityActions';

export const ActivityHeader = ({
  activity,
  withFollowButton = false,
  withLink = true,
  withActions = false,
}: {
  activity: ActivityResponse;
  withFollowButton?: boolean;
  withLink?: boolean;
  withActions?: boolean;
}) => {
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();

  const [group, id] = activity.current_feed?.feed?.split(':') ?? [];
  const feed = client?.feed(group, id);
  const ownCapabilities = useOwnCapabilities(feed);

  return (
    <ContentMetadata
      created_at={activity.created_at}
      user={activity.user}
      edited_at={activity.edited_at}
      location="activity"
      withLink={withLink}
    >
      {withFollowButton &&
        activity.current_feed?.feed !== `user:${currentUser?.id}` && (
          <ToggleFollowButton userId={activity.current_feed!.created_by.id} />
        )}
      {withActions && <ActivityActions activity={activity} ownCapabilities={ownCapabilities} />}
    </ContentMetadata>
  );
};
