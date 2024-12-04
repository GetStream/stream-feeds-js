'use client';
import { useEffect, useState } from 'react';
import { useUserContext } from '../user-context';
import { UserRequest } from '@stream-io/common';
import { useFeedContext } from '../feed-context';

type FeedCid = string;

type FeedFollowerMapping = { [key: FeedCid]: boolean };

export default function Users() {
  const { users, user } = useUserContext();
  const [filteredUsers, setUsers] = useState<UserRequest[]>([]);
  const { ownTimeline } = useFeedContext();
  const [followerMapping, setFollowerMapping] = useState<FeedFollowerMapping>(
    {},
  );

  useEffect(() => {
    setUsers(users.filter((u) => u.id !== user?.id));
  }, [users, user]);

  useEffect(() => {
    if (!ownTimeline) {
      return;
    }
    ownTimeline
      .getFollowedFeeds({
        offset: 0,
        limit: 30,
        filter: users.map((u) => `user:${u.id}`),
      })
      .then((response) => {
        const mapping: FeedFollowerMapping = {};
        response.followed_feeds.forEach((r) => {
          const fid = `${r.feed.group}:${r.feed.id}`;
          mapping[fid] = true;
        });
        setFollowerMapping(mapping);
      });
  }, [users, ownTimeline]);

  const follow = async (userId: string) => {
    await ownTimeline?.follow({
      target_group: 'user',
      target_id: userId,
    });
    const fid = `user:${userId}`;
    setFollowerMapping({ ...followerMapping, [fid]: true });
  };

  const unfollow = async (userId: string) => {
    await ownTimeline?.unfollow({
      target_group: 'user',
      target_id: userId,
    });
    const fid = `user:${userId}`;
    setFollowerMapping({ ...followerMapping, [fid]: false });
  };

  return (
    <div className="w-3/4 m-auto">
      <h2 className="text-4xl font-extrabold text-center">Users</h2>
      <ul className="divide-y divide-gray-200">
        {filteredUsers.map((user) => (
          <li
            key={user.id}
            className="w-full h-full flex flex-row items-center justify-between gap-1 py-4"
          >
            <div className="flex flex-row items-center gap-1">
              <img className="size-10 rounded-full" src={user.image} alt="" />
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              onClick={() =>
                followerMapping[`user:${user.id}`]
                  ? unfollow(user.id)
                  : follow(user.id)
              }
            >
              {followerMapping[`user:${user.id}`] ? 'Unfollow' : 'Follow'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
