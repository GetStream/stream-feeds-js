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

  const feed = activity.user.id === currentUser?.id ? undefined : client?.feed('user', activity.user.id);
  const ownCapabilities = useOwnCapabilities(feed);

  const locationCity = activity.location ? (activity.custom?.location_city as string | undefined) ?? null : null;

  return (
    <ContentMetadata
      created_at={activity.created_at}
      user={activity.user}
      edited_at={activity.edited_at}
      location="activity"
      withLink={withLink}
      locationCity={locationCity}
    >
      {withFollowButton &&
        feed && (
          <ToggleFollowButton userId={activity.user.id} />
        )}
      {withActions && <ActivityActions activity={activity} ownCapabilities={ownCapabilities} />}
    </ContentMetadata>
  );
};
