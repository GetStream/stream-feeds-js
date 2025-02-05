import { useErrorContext } from '@/app/error-context';
import { useUserContext } from '@/app/user-context';
import {
  AggregatedActivities,
  StreamFeedClient,
} from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';

export const MemberNotification = ({
  group,
  onMarkRead,
}: {
  group: AggregatedActivities;
  onMarkRead: () => {};
}) => {
  const { logError } = useErrorContext();
  const { client } = useUserContext();
  const [feeds, setFeeds] = useState<StreamFeedClient[]>([]);
  const [text, setText] = useState('');
  const numberOfFeedNamesDisplayed = 5;

  useEffect(() => {
    client
      ?.queryFeeds({
        filter: {
          feed_id: {
            $in: group.activities
              .slice(0, numberOfFeedNamesDisplayed)
              .map((a) => a.object.split(':')[1]),
          },
          feed_group: 'page',
        },
      })
      .then((response) => setFeeds(response.feeds))
      .catch((e) => logError(e));
  }, [group, client]);

  useEffect(() => {
    if (feeds.length === 0) {
      setText(`You are added as a member to ${group.activity_count} pages`);
    } else {
      setText(
        `You are now a member of ${feeds.map((f) => `"${f.state.getLatestValue().custom?.name}"`).join(', ')} ${group.activity_count > numberOfFeedNamesDisplayed ? `and ${group.activity_count - numberOfFeedNamesDisplayed} more` : ''} page${group.activity_count === 1 ? '' : 's'}`,
      );
    }
  }, [feeds, group]);

  return (
    <div className="flex items-center justify-between gap-1">
      <div>{text}</div>
      {!group.read && (
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
