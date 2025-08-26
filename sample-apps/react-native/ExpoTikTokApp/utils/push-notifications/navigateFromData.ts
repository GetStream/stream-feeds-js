import { router } from 'expo-router';
import { MessagingDataType } from '@/hooks/usePushNotifications';

export const navigateFromData = (data?: MessagingDataType) => {
  if (!data) {
    return;
  }

  const type = data.type as string;
  const activityId = data.activity_id as string;

  switch (type) {
    case 'feeds.comment.added':
    case 'feeds.comment.reaction.added': {
      const fid = data.fid as string;
      const [groupId, id] = fid.split(':');
      router.push({
        pathname: '/comments-modal',
        params: {
          feedUserId: id,
          feedGroupId: groupId,
          activityId,
        },
      });
      return;
    }

    case 'feeds.activity.reaction.added':
    case 'feeds.activity.added': {
      const fid = data.fid as string;
      const [groupId, id] = fid.split(':');
      router.push({
        pathname: '/activity-pager-screen',
        params: {
          groupId,
          id,
          activityId,
        },
      });
      return;
    }

    case 'feeds.follow.created': {
      const fid = (data.source_fid ?? data.fid) as string;
      const [_, id] = fid.split(':');
      router.push({
        pathname: '/user-profile-screen',
        params: {
          userId: id,
        },
      });
      return;
    }

    default:
      return;
  }
};
