import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { ActionButton } from '../../utility/ActionButton';

export const OpenComments = ({ activity }: { activity: ActivityResponse }) => {
  return (
    <ActionButton
      href={`/activity/${activity.id}`}
      icon="chat_bubble"
      label={activity.comment_count.toString()}
      isActive={false}
    />
  );
};
