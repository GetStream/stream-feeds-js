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
  withAvatar = true,
}: {
  activity: ActivityResponse;
  withFollowButton?: boolean;
  withLink?: boolean;
  withActions?: boolean;
  withAvatar?: boolean;
}) => {
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();

  const [group, id] = activity.current_feed?.feed.split(':') ?? [];
  const feed = group && id ? client?.feed(group, id) : undefined;
  const ownCapabilities = useOwnCapabilities(feed);
  const shouldShowFollowButton = activity.user.id === currentUser?.id ? undefined : activity.current_feed?.group_id === 'user' ? client?.feed('user', activity.current_feed.id) : undefined;

  const locationCity = activity.location ? (activity.custom?.location_city as string | undefined) ?? null : null;

  const isPremium = activity.visibility === 'tag';
  const isPrivate = activity.visibility === 'private';

  const badge = isPremium ? (
    <>
      <span className="text-base-content/70 flex-shrink-0">·</span>
      <span className="inline-flex items-center gap-0.5 flex-shrink-0 text-primary text-[13px]">
        <span className="material-symbols-outlined text-[14px]!">workspace_premium</span>
        Premium
      </span>
    </>
  ) : isPrivate ? (
    <>
      <span className="text-base-content/70 flex-shrink-0">·</span>
      <span className="inline-flex items-center gap-0.5 flex-shrink-0 text-base-content/70 text-[13px]" role="status" aria-label="Private — only visible to you">
        <span className="material-symbols-outlined text-[14px]!" aria-hidden="true">lock</span>
        Private
      </span>
    </>
  ) : null;

  return (
    <ContentMetadata
      created_at={activity.created_at}
      user={activity.user}
      edited_at={activity.edited_at}
      location="activity"
      withLink={withLink}
      withAvatar={withAvatar}
      locationCity={locationCity}
      badge={badge}
    >
      {withFollowButton &&
        shouldShowFollowButton && (
          <ToggleFollowButton userId={activity.user.id} size="small" />
        )}
      {withActions && <ActivityActions activity={activity} ownCapabilities={ownCapabilities} />}
    </ContentMetadata>
  );
};
