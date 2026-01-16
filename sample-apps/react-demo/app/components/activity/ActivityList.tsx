import { useFeedActivities, useFeedContext } from '@stream-io/feeds-react-sdk';
import { Activity } from './Activity';
import { LoadingIndicator } from '../utility/LoadingIndicator';

export const ActivityList = ({
  withFollowButton = false,
}: {
  withFollowButton?: boolean;
}) => {
  const feed = useFeedContext();
  const { activities, loadNextPage, has_next_page, is_loading } =
    useFeedActivities();

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      {is_loading && <LoadingIndicator />}
      {!is_loading && activities?.length === 0 ? (
        <div className="card card-border bg-base-100 w-96">
          <div className="card-body items-center text-center">
            <h2 className="card-title">No posts yet</h2>
            <p>
              {feed?.group === 'timeline'
                ? 'Write something to start your timeline ✨'
                : 'Popular activities will show up here once your application has more content'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {activities?.map((activity) => (
            <div className="w-full" key={activity.id} id={activity.id}>
              <Activity
                activity={activity}
                withFollowButton={withFollowButton}
              />
            </div>
          ))}
          {has_next_page && (
            <button className="btn btn-soft btn-primary" onClick={loadNextPage}>
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
};
