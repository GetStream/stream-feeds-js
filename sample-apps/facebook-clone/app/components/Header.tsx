'use client';
import Link from 'next/link';
import { useUserContext } from '../user-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const { user, logOut } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <ul className="flex justify-end items-center bg-blue-500 p-6 text-white">
      {user && (
        <>
          <li className="mr-6">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(isMenuOpen ? false : true)}
                id="dropdownButton"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Menu
              </button>
              <div
                id="dropdownMenu"
                className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ${isMenuOpen ? '' : 'hidden'}`}
              >
                <Link
                  href="/users"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
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
                <img className="size-8 rounded-full" src={user.image} alt="" />
              </li>
              <li className=" ">
                <button
                  className="flex"
                  title="Log out"
                  onClick={() => {
                    logOut();
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
