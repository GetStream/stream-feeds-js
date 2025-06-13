'use client';
import Link from 'next/link';
import { useUserContext } from '../user-context';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { NotificationBell } from './notifications/NotificationBell';
import {
  ActivitySearchSource,
  FeedSearchSource,
  SearchController,
  UserSearchSource,
} from '@stream-io/feeds-client';
import { Search } from './Search';

export function Header() {
  const { user, logOut, client } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const searchController = useMemo(() => {
    if (!client) {
      return undefined;
    }

    return new SearchController({
      sources: [
        new ActivitySearchSource(client),
        new UserSearchSource(client),
        new FeedSearchSource(client),
      ],
      config: { keepSingleActiveSource: true },
    });
  }, [client]);

  return (
    <ul
      className="flex justify-between items-center gap-3 bg-blue-500 p-6 text-white"
      style={{ height: '5.625rem' }}
    >
      {searchController && <Search searchController={searchController} />}

      {user && (
        <div className="flex items-center gap-3">
          <li>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                id="dropdownButton"
                className="px-4 py-2 bg-blue-600 text-white rounded-md  hover:bg-blue-700 focus:outline-none"
              >
                Menu
              </button>
              <div
                className={`absolute z-50 rounded-md right-0 mt-2 w-48 bg-white shadow-lg ${isMenuOpen ? '' : 'hidden'}`}
              >
                <Link
                  href="/timeline"
                  className="block px-4 py-2 text-gray-800 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Timeline
                </Link>
                <Link
                  href={'/users/' + user.id}
                  className="block px-4 py-2 text-gray-800 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My posts
                </Link>
                <Link
                  href="/users"
                  className="block px-4 py-2 text-gray-800 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Users
                </Link>
                <Link
                  href="/pages"
                  className="block px-4 py-2 text-gray-800 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pages
                </Link>
              </div>
            </div>
          </li>
          {user && (
            <>
              <li>
                <NotificationBell />
              </li>
              <li>
                <Link href={'/users/' + user.id}>
                  <img
                    className="size-8 rounded-full"
                    src={user.image}
                    alt=""
                  />
                </Link>
              </li>
              <li>
                <button
                  className="flex"
                  title="Log out"
                  onClick={() => {
                    logOut().catch((err) => {
                      throw err;
                    });
                    router.push('/login');
                  }}
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </li>
            </>
          )}
        </div>
      )}
    </ul>
  );
}
