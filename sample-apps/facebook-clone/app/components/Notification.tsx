import { useEffect, useState } from 'react';
import { useFeedContext } from '../feed-context';
import { AggregatedActivities } from '@stream-io/feeds-client';

export const Notification = () => {
  const [unseen, setUnseen] = useState(0);
  const [groups, setGroups] = useState<AggregatedActivities[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { ownNotifications } = useFeedContext();

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({ unseen: state.unseen }),
      ({ unseen }) => {
        setUnseen(unseen ?? 0);
      },
    );

    return unsubscribe;
  }, [ownNotifications]);

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({ groups: state.groups }),
      ({ groups }) => {
        setGroups(groups ?? []);
      },
    );

    return unsubscribe;
  }, [ownNotifications]);

  const getNotificationText = (group: AggregatedActivities) => {
    let text = '';
    const previewCount = 5;
    text = Array.from(new Set(group.activities.map((a) => a.user.name)))
      .slice(0, previewCount)
      .join(', ');
    const remainingActors = group.actor_count - previewCount;
    if (remainingActors > 0) {
      text += ` and ${remainingActors} more people`;
    }
    const verb = group.activities[0].verb;

    switch (verb) {
      case 'follow':
        text += ` started following you`;
        break;
      case 'unfollow':
        text += ` unfollowed you`;
        break;
    }

    return text;
  };

  const markRead = async (group: AggregatedActivities) => {
    await ownNotifications?.read({ limit: 30, offset: 0, mark_read: group.id });
    await ownNotifications?.read({ limit: 30, offset: 0 });
  };

  useEffect(() => {
    if (isMenuOpen && unseen > 0) {
      ownNotifications
        ?.read({ limit: 30, offset: 0, mark_seen: 'current' })
        .then(() => {
          ownNotifications
            ?.read({
              limit: 30,
              offset: 0,
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    }
  }, [isMenuOpen, unseen]);

  return (
    <>
      <div className="relative">
        <button
          title="Notifications"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          id="dropdownButton"
          className="flex"
        >
          <span className="material-symbols-outlined">notifications</span>
          {unseen > 0 && (
            <div className="rounded-full bg-red-500 text-xs p-0.5 px-1.5">
              {unseen}
            </div>
          )}
        </button>
        <div
          className={`absolute right-0 mt-2 p-4 min-w-80 flex flex-col gap-3  bg-white rounded-md shadow-lg ${isMenuOpen ? '' : 'hidden'}`}
        >
          {groups.length === 0 && <div>You're all caught up 🎉</div>}
          {groups.map((g, i) => (
            <div
              key={`notification${i}`}
              className="text-gray-800 flex items-center justify-between gap-1"
            >
              <div>{getNotificationText(g)}</div>
              {!g.read && (
                <div className="flex items-center gap-1.5">
                  <div className="rounded-full bg-blue-500 w-2 h-2"></div>
                  <button
                    className="px-1 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                    onClick={() => markRead(g)}
                  >
                    Mark read
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
