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

  const [group, id] = activity.current_feed?.feed.split(':') ?? [];
  const feed = group && id ? client?.feed(group, id) : undefined;
  const ownCapabilities = useOwnCapabilities(feed);
  const shouldShowFollowButton = activity.user.id === currentUser?.id ? undefined : activity.current_feed?.group_id === 'user' ? client?.feed('user', activity.current_feed.id) : undefined;

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
        shouldShowFollowButton && (
          <ToggleFollowButton userId={activity.user.id} />
        )}
      {withActions && <ActivityActions activity={activity} ownCapabilities={ownCapabilities} />}
    </ContentMetadata>
  );
};
