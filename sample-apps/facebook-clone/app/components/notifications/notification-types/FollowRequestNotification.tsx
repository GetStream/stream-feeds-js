import { useFeedContext } from '@/app/feed-context';
import { AggregatedActivities } from '@stream-io/feeds-client';

export const FollowRequestNotification = ({
  group,
  onMarkRead,
}: {
  group: AggregatedActivities;
  onMarkRead: () => {};
}) => {
  const { ownFeed } = useFeedContext();

  const accept = (userId: string) => {
    ownFeed?.update({ accepted_follow_requests: [`timeline:${userId}`] });
    onMarkRead();
  };

  const decline = (userId: string) => {
    ownFeed?.update({ rejected_follow_requests: [`timeline:${userId}`] });
    onMarkRead();
  };

  return (
    <div className="text-gray-800 flex flex-col gap-3">
      {group.activities.map((a) => (
        <div className="w-full flex items-center justify-between" key={a.id}>
          {a.user?.name} wants to follow you
          <button
            className="w-max px-1 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => accept(a.user.id!)}
          >
            <span className="material-symbols-outlined">check</span>
          </button>
          <button
            className="w-max px-1 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => decline(a.user.id!)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
