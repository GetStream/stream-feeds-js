import { AggregatedActivityResponse } from '@stream-io/feeds-client';

// TODO: Migrate to new API
export const SimpleNotification = ({
  group,
  onMarkRead,
}: {
  group: AggregatedActivityResponse;
  onMarkRead: () => {};
}) => {
  const getNotificationText = (group: AggregatedActivityResponse) => {
    let text = '';
    const previewCount = 5;
    text = Array.from(new Set(group.activities.map((a) => a.user.name)))
      .slice(0, previewCount)
      .join(', ');
    const remainingActors = group.user_count - previewCount;
    if (remainingActors > 0) {
      text += ` and ${remainingActors} more people`;
    }
    const verb = group.activities[0].type;

    switch (verb) {
      case 'follow':
        text += ` started following you`;
        break;
      case 'like':
        text += ` liked your post`;
    }

    return text;
  };

  return (
    <div className="flex items-center justify-between gap-1">
      <div>{getNotificationText(group)}</div>
      {!group && (
        <div className="flex items-center gap-1.5">
          <div className="rounded-full bg-blue-500 w-2 h-2"></div>
          <button
            className="w-max px-1 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => onMarkRead()}
          >
            Mark read
          </button>
        </div>
      )}
    </div>
  );
};
