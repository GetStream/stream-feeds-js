import type { AggregatedActivityResponse } from '@stream-io/feeds-react-native-sdk';

export const getNotificationText = (aggregatedActivity: AggregatedActivityResponse) => {
  const { activities } = aggregatedActivity;
  const last = activities.at(-1);
  const verb = last?.type;

  let text = '';

  const remainingActors = aggregatedActivity.user_count - 1;
  if (remainingActors > 1) {
    text += ` and ${remainingActors} more people`;
  } else if (remainingActors === 1) {
    text += ' and 1 more person';
  }

  switch (verb) {
    case 'comment': {
      text += ` commented on your post`;
      break;
    }
    case 'reaction': {
      text += ` reacted to your post`;
      break;
    }
    case 'follow': {
      text += ` started following you`;
      break;
    }
    case 'comment_reaction': {
      text += ` reacted to your comment`;
      break;
    }
    default: {
      text += 'Unknown type';
      break;
    }
  }

  return text;
}
