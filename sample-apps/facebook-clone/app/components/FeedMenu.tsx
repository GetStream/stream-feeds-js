import { StreamFeedClient } from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { useUserContext } from '../user-context';
import { InviteFollowers } from './InviteFollowers';
import { ManageMembers } from './ManageMembers';

type Action = 'invite' | 'update-feed-members';

export const FeedMenu = ({ feed }: { feed: StreamFeedClient }) => {
  const { user } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [enabledActions, setEnabledActions] = useState<Action[]>([]);
  const actionMapping: {
    [key in Action]: { label: string; icon: string; handler: () => void };
  } = {
    invite: {
      label: 'Invite followers',
      icon: 'mail',
      handler: () => setIsInviteOpen(true),
    },
    'update-feed-members': {
      label: 'Manage members',
      icon: 'group',
      handler: () => setIsMemberModalOpen(true),
    },
  };

  useEffect(() => {
    return feed.state.subscribeWithSelector(
      (s) => ({
        own_capabilities: s.own_capabilities,
        visibility_level: s.visibility_level,
        created_by: s.created_by,
      }),
      ({ own_capabilities, visibility_level, created_by }) => {
        if (
          own_capabilities?.includes('update-feed-members') &&
          !enabledActions.includes('update-feed-members')
        ) {
          setEnabledActions([...enabledActions, 'update-feed-members']);
        } else if (
          !own_capabilities?.includes('update-feed-members') &&
          enabledActions.includes('update-feed-members')
        ) {
          setEnabledActions(
            enabledActions.filter((a) => a !== 'update-feed-members'),
          );
        }
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
      <InviteFollowers
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        feed={feed}
      ></InviteFollowers>
      <ManageMembers
        feed={feed}
        open={isMemberModalOpen}
        onOpenChange={setIsMemberModalOpen}
      ></ManageMembers>
    </>
  );
};
