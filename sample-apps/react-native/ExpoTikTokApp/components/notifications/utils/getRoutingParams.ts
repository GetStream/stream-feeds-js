import type { ActivityResponse } from '@stream-io/feeds-react-native-sdk';

export const getRoutingParams = (lastActivity: ActivityResponse) => {
  // Hardcoded because we always want to deep link to the
  // user feed.
  const groupId = 'user';
  const id = lastActivity.notification_context?.target.user_id;
  const activityId = lastActivity.notification_context?.target.id;
  if (lastActivity.type.includes('comment')) {
    return {
      pathname: '/comments-modal',
      params: {
        feedUserId: id,
        feedGroupId: groupId,
        activityId,
      },
    };
  }

  if (lastActivity.type === 'follow') {
    return {
      pathname: '/user-profile-screen',
      params: { userId: id },
    };
  }

  return {
    pathname: '/activity-pager-screen',
    params: {
      activityId,
      groupId,
      id,
    },
  };
}
