import { useFeedActivities, useFeedContext } from '@stream-io/feeds-react-sdk';
import { Activity } from './Activity';
import { ErrorCard } from '../utility/ErrorCard';
import { LoadingIndicator } from '../utility/LoadingIndicator';

export const ActivityList = ({
  location,
  error,
}: {
  location: 'timeline' | 'profile' | 'foryou';
  error?: Error;
}) => {
  const feed = useFeedContext();
  const { activities, loadNextPage, has_next_page, is_loading } =
    useFeedActivities();

  if (error) {
    return <ErrorCard message="Failed to load feed" error={error} />;
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      {is_loading && <LoadingIndicator />}
      {!is_loading && activities?.length === 0 ? (
        <div className="card card-border bg-base-100 w-96">
          <div className="card-body items-center text-center">
            <h2 className="card-title">No posts yet</h2>
            <p>
              {feed?.group === 'foryou'
                ? 'Popular activities will show up here once your application has more content'
                : 'Write something to start your feed ✨'
              }
            </p>
          </div>
        </div>
      ) : (
        <>
          <ul className="list w-full">
            {activities?.map((activity) => (
              <li className="list-row w-full px-0 flex flex-row justify-stretch items-stretch" key={activity.id}>
                <Activity
                  activity={activity}
                  location={location}
                />
              </li>
            ))}
          </ul>
          {has_next_page && (
            <button className="btn btn-soft btn-primary" onClick={loadNextPage}>
              {is_loading ? <LoadingIndicator /> : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
};
