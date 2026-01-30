import { type ActivityResponse } from "@stream-io/feeds-react-sdk";
import { Content } from "../common/Content";

export const ActivityContent = ({ activity, withoutInteractions = false }: { activity: ActivityResponse, withoutInteractions?: boolean }) => {
  return (
    <Content text={activity.text} attachments={activity.attachments} moderation={activity.moderation} location="activity" mentioned_users={activity.mentioned_users} withoutInteractions={withoutInteractions} />
  );
};