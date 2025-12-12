import type { ActivityResponse } from '@stream-io/feeds-react-sdk';

export const ActivitySearchResult = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  return (
    <div className="w-full p-4 bg-base-100 card border border-base-300">
      <div className="w-full flex items-start gap-4">
        <div className="avatar flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary  flex items-center justify-center text-white text-lg font-semibold">
            <span>{activity.user?.name?.[0]}</span>
          </div>
        </div>
        <div className="w-full flex flex-col items-start gap-4">
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-md">{activity.user.name}</span>
            <span className="text-sm text-base-content/80">
              {activity.created_at.toLocaleString()}
            </span>
          </div>
          <p className="w-full">{activity.text}</p>
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <button type="button" className="btn cursor-default">
                💬&nbsp;
                {activity.comment_count}
              </button>
              <button
                type="button"
                className={`btn cursor-default ${
                  activity.own_reactions?.length > 0 ? 'bg-primary' : ''
                }`}
              >
                ❤️&nbsp;
                {activity.reaction_groups.like?.count ?? 0}
              </button>
              <button
                type="button"
                className={`btn cursor-default ${
                  activity.own_bookmarks?.length > 0 ? 'bg-primary' : ''
                }`}
              >
                <span>⭐️&nbsp;</span>
                {activity.bookmark_count}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
