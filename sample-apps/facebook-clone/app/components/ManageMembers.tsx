import { FeedMember, StreamFeedClient } from '@stream-io/feeds-client';
import { useEffect, useRef, useState } from 'react';
import { PaginatedList } from './PaginatedList';
import { useErrorContext } from '../error-context';
import { useUserContext } from '../user-context';
import { FullUserResponse } from '@stream-io/common';
import { LoadingIndicator } from './LoadingIndicator';

export const ManageMembers = ({
  feed,
  open,
  onOpenChange,
}: {
  feed: StreamFeedClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { client } = useUserContext();
  const { logError, logErrorAndDisplayNotification } = useErrorContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [members, setMembers] = useState<FeedMember[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [userOptions, setUserOptions] = useState<FullUserResponse[]>([]);
  const [newFeedMemberUserId, setNewFeedMemberUserId] = useState<string>();
  const roles = ['feed_member', 'admin'];
  const [newFeedMemberRole, setNewFeedMemberRole] = useState<string>(roles[0]);
  const [isAddInProgress, setIsAddInProgress] = useState(false);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);

  useEffect(() => {
    return feed.state.subscribeWithSelector(
      (s) => ({ members: s.members ?? [] }),
      ({ members }) => {
        setMembers(members);
      },
    );
  }, [feed]);

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [open]);

  const updateRole = async (feedMember: FeedMember, role: string) => {
    try {
      await feed.update({
        assign_roles: [{ user_id: feedMember.user_id, role }],
      });
    } catch (e) {
      logErrorAndDisplayNotification(e as Error, (e as Error).message);
    }
  };

  const searchUsers = async () => {
    try {
      // TODO: add bouncing
      const response = await client?.queryUsers({
        payload: { filter_conditions: { name: { $autocomplete: userQuery } } },
      });

      const filteredResponse =
        response?.users?.filter((u) => {
          return (
            !members.map((m) => m.user_id).includes(u.id) &&
            feed.state.getLatestValue().created_by?.id !== u.id
          );
        }) ?? [];

      setUserOptions(filteredResponse);
    } catch (e) {
      logError(e as Error);
    }
  };

  useEffect(() => {
    if (!!newFeedMemberUserId || userQuery.length === 0) {
      setUserOptions([]);
    } else {
      void searchUsers();
    }
  }, [userQuery, newFeedMemberUserId]);

  const addMember = async () => {
    setIsAddInProgress(true);
    try {
      await feed.update({
        add_members: [
          { user_id: newFeedMemberUserId!, role: newFeedMemberRole },
        ],
      });
      void fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: newFeedMemberUserId,
          verb: 'added-as-member',
          objectId: feed.fid,
        }),
      }).catch((err) => logError(err));
      setUserQuery('');
      setUserOptions([]);
      setNewFeedMemberUserId(undefined);
      setNewFeedMemberRole(roles[0]);
    } catch (e) {
      logErrorAndDisplayNotification(e as Error, (e as Error).message);
    } finally {
      setIsAddInProgress(false);
    }
  };

  const deleteMember = async (feedMember: FeedMember) => {
    setIsDeleteInProgress(true);
    try {
      await feed.update({
        remove_members: [feedMember.user_id],
      });
    } catch (e) {
      logErrorAndDisplayNotification(e as Error, (e as Error).message);
    } finally {
      setIsDeleteInProgress(false);
    }
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
      onOpenChange(false);
    }
  };

  const renderItem = (feedMember: FeedMember) => {
    return (
      <li
        key={feedMember.user_id}
        className="w-full h-full flex flex-row items-center justify-between gap-1 py-2"
      >
        <div className="flex flex-row items-center gap-1">
          <img
            className="size-10 rounded-full"
            src={feedMember.user?.image}
            alt=""
          />
          <p className="text-sm font-medium text-gray-900 w-32">
            {feedMember.user?.name}
          </p>
          <div className="relative w-64">
            <select
              className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={feedMember?.role}
              onChange={(e) => updateRole(feedMember, e.target.value)}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={isDeleteInProgress}
            onClick={() => deleteMember(feedMember)}
            className="text-red-700 flex gap-1 p-3 items-center rounded-md hover:bg-gray-100"
          >
            {isDeleteInProgress ? (
              <LoadingIndicator></LoadingIndicator>
            ) : (
              <span className="material-symbols-outlined">delete</span>
            )}
          </button>
        </div>
      </li>
    );
  };

  return (
    <dialog
      className={`w-6/12 h-3/6 rounded-lg p-6 bg-white shadow-lg flex flex-col ${open ? '' : 'hidden'}`}
      ref={dialogRef}
    >
      <button className="self-end" onClick={() => closeDialog()}>
        <span className="material-symbols-outlined">close</span>
      </button>
      {open && (
        <div className="flex flex-col gap-3 items-center">
          <h2 className="text-4xl font-extrabold text-center">Members</h2>
          <div>
            <PaginatedList
              items={members}
              isLoading={false}
              hasNext={false}
              renderItem={renderItem}
              onLoadMore={() => {}}
              error={undefined}
              itemsName="members"
            ></PaginatedList>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => {
                  setNewFeedMemberUserId(undefined);
                  setUserQuery(e.target.value);
                }}
                placeholder="Search users..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {userOptions.length > 0 && (
                <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-auto">
                  {userOptions.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => {
                        setNewFeedMemberUserId(user.id);
                        setUserQuery(user.name ?? '');
                      }}
                      className="p-2 cursor-pointer hover:bg-gray-200"
                    >
                      {user.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative">
              <select
                className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newFeedMemberRole}
                onChange={(e) => setNewFeedMemberRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              disabled={!newFeedMemberUserId || isAddInProgress}
              onClick={() => addMember()}
            >
              {isAddInProgress ? <LoadingIndicator></LoadingIndicator> : 'Add'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
};
