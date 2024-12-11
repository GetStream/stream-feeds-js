'use client';
import Link from 'next/link';
import { useUserContext } from '../user-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { user, logOut } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <ul
      className="flex justify-end items-center bg-blue-500 p-6 text-white"
      style={{ height: '5.625rem' }}
    >
      {user && (
        <>
          <li className="mr-6">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                id="dropdownButton"
                className="px-4 py-2 bg-blue-600 text-white rounded-md  hover:bg-blue-700 focus:outline-none"
              >
                Menu
              </button>
              <div
                className={`absolute rounded-md right-0 mt-2 w-48 bg-white shadow-lg ${isMenuOpen ? '' : 'hidden'}`}
              >
                <Link
                  href="/home"
                  className="block px-4 py-2 text-gray-800 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/my-feed"
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
              </div>
            </div>
          </li>
          {user && (
            <>
              <li className="mr-3">
                <NotificationBell></NotificationBell>
              </li>
              <li className="mr-3">
                <img className="size-8 rounded-full" src={user.image} alt="" />
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
        </>
      )}
    </ul>
  );
}
