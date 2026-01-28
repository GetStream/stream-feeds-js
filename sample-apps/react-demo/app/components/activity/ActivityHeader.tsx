import type {
  ActivityResponse} from '@stream-io/feeds-react-sdk';
import {
  useClientConnectedUser,
} from '@stream-io/feeds-react-sdk';
import { ToggleFollowButton } from '../ToggleFollowButton';
import { ContentMetadata } from '../utility/ContentMetadata';

export const ActivityHeader = ({
  activity,
  withFollowButton = false,
}: {
  activity: ActivityResponse;
  withFollowButton?: boolean;
}) => {
  const currentUser = useClientConnectedUser();

  return (
    <ContentMetadata
      created_at={activity.created_at}
      user={activity.user}
      location="activity"
    >
      {withFollowButton &&
        activity.current_feed?.feed !== `user:${currentUser?.id}` && (
          <ToggleFollowButton userId={activity.current_feed!.created_by.id} />
        )}
    </ContentMetadata>
  );
};
