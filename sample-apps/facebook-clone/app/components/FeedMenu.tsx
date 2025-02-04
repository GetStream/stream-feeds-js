import { StreamFeedClient } from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { useUserContext } from '../user-context';
import { Invite } from './Invite';

type Action = 'invite';

export const FeedMenu = ({ feed }: { feed: StreamFeedClient }) => {
  const { user } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [enabledActions, setEnabledActions] = useState<Action[]>([]);
  const actionMapping: {
    [key in Action]: { label: string; icon: string; handler: () => void };
  } = {
    invite: {
      label: 'Invite followers',
      icon: 'mail',
      handler: () => setIsInviteOpen(true),
    },
  };

  useEffect(() => {
    return feed.state.subscribeWithSelector(
      (s) => ({
        visibility_level: s.visibility_level,
        created_by: s.created_by,
      }),
      ({ visibility_level, created_by }) => {
        if (
          visibility_level === 'private' &&
          user?.id === created_by?.id &&
          !enabledActions.includes('invite')
        ) {
          setEnabledActions([...enabledActions, 'invite']);
        } else if (enabledActions.includes('invite')) {
          setEnabledActions(enabledActions.filter((a) => a !== 'invite'));
        }
      },
    );
  }, [feed, user]);

  if (enabledActions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <button
          className="text-gray-400 flex"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
        <div
          className={`absolute rounded-md right-0 w-48 bg-white shadow-lg flex flex-col items-stretch ${isMenuOpen ? '' : 'hidden'}`}
        >
          {enabledActions.map((a) => (
            <button
              key={a}
              className="text-gray-700 flex gap-1 p-3 items-center rounded-md hover:bg-gray-100"
              onClick={() => {
                actionMapping[a].handler();
                setIsMenuOpen(false);
              }}
            >
              <span className="material-symbols-outlined">
                {actionMapping[a].icon}
              </span>
              <div>{actionMapping[a].label}</div>
            </button>
          ))}
        </div>
      </div>
      <Invite
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        feed={feed}
      ></Invite>
    </>
  );
};
