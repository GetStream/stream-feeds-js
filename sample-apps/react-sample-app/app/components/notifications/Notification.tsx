import { AggregatedActivityResponse } from '@stream-io/feeds-client';

export const Notification = ({
  group,
  isRead,
  isSeen,
  onMarkRead,
}: {
  group: AggregatedActivityResponse;
  isRead: boolean;
  isSeen: boolean;
  onMarkRead: () => {};
}) => {
  const getNotificationText = (group: AggregatedActivityResponse) => {
    const verb = group.activities[0].type;

    let text = '';

    switch (verb) {
      case 'comment':
        text += `${group.activity_count} new comments`;
        break;
      case 'reaction':
        text += `${group.activity_count} likes`;
        break;
      case 'follow':
        const previewCount = 5;
        text = Array.from(new Set(group.activities.map((a) => a.user.name)))
          .slice(0, previewCount)
          .join(', ');
        const remainingActors = group.user_count - previewCount;
        if (remainingActors > 0) {
          text += ` and ${remainingActors} more people`;
        }
        text += ` started following you`;
        break;
    }

    return text;
  };

  return (
    <div className="flex items-center justify-between gap-1">
      <div>{getNotificationText(group)}</div>
      <div className="flex items-center gap-1.5">
        {!isRead && (
          <button
            className="w-max px-1 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => onMarkRead()}
          >
            Mark read
          </button>
        )}
        <div
          className={`absolute right-1 rounded-full bg-${isSeen ? 'white' : 'blue'}-500 w-2 h-2`}
        ></div>
      </div>
    </div>
  );
};
