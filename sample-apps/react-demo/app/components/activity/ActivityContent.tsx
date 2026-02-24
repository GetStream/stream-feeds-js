import { type ActivityResponse } from "@stream-io/feeds-react-sdk";
import { Content } from "../common/Content";
import { NavLink } from "../utility/NavLink";

const isPremiumActivity = (activity: ActivityResponse) => activity.visibility === 'tag';

export const ActivityContent = ({ activity, withoutInteractions = false }: { activity: ActivityResponse, withoutInteractions?: boolean }) => {

  return (
    <>
      {isPremiumActivity(activity) && activity.preview && (
        <div className="flex items-center gap-1.5 text-sm" role="status">
          <span className="material-symbols-outlined text-base text-primary" aria-hidden>
            workspace_premium
          </span>
          <span className="text-base-content/60">
            {withoutInteractions ? 'Only premium members can see full post' : <NavLink href={`/profile/${activity.user.id}`} className="link link-primary text-base-content/60 hover:text-primary">
              Become a premium member to see the full post
            </NavLink>}
          </span>
        </div>
      )}
      <Content text={activity.text} attachments={activity.attachments} moderation={activity.moderation} location="activity" mentioned_users={activity.mentioned_users} withoutInteractions={withoutInteractions} linkHashtags />
    </>
  );
};