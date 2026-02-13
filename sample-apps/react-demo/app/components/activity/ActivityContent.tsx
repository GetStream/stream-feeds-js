import { type ActivityResponse } from "@stream-io/feeds-react-sdk";
import { Content } from "../common/Content";

const isPremiumActivity = (activity: ActivityResponse) => activity.visibility === 'tag';
const isPrivateActivity = (activity: ActivityResponse) => activity.visibility === 'private';

export const ActivityContent = ({ activity, withoutInteractions = false }: { activity: ActivityResponse, withoutInteractions?: boolean }) => {

  return (
    <>
      {isPremiumActivity(activity) && (
        <div
          className="flex items-center gap-1.5 text-sm mb-1"
          role="status"
          aria-label={activity.preview ? 'Only premium members can see full post' : 'Premium activity'}
        >
          <span className="material-symbols-outlined text-base text-primary" aria-hidden>
            workspace_premium
          </span>
          <span className={activity.preview ? 'text-base-content/60' : 'text-primary font-medium'}>
            {activity.preview ? 'Only premium members can see full post' : 'Premium members only'}
          </span>
        </div>
      )}
      {isPrivateActivity(activity) && (
        <div
          className="flex items-center gap-1.5 text-sm mb-1"
          role="status"
          aria-label="Private — only visible to you"
        >
          <span className="material-symbols-outlined text-base text-base-content/70" aria-hidden>
            lock
          </span>
          <span className="text-base-content/70 font-medium">
            Private — only visible to you
          </span>
        </div>
      )}
      <Content text={activity.text} attachments={activity.attachments} moderation={activity.moderation} location="activity" mentioned_users={activity.mentioned_users} withoutInteractions={withoutInteractions} linkHashtags />
    </>
  );
};