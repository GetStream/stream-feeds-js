'use client';
import type { UserRequest } from '@stream-io/feeds-react-sdk';
import { useRouter } from 'next/navigation';
import { useUserContext } from '../user-context';

export default function Login() {
  const { users, logIn } = useUserContext();
  const router = useRouter();

  const login = async (user: UserRequest) => {
    logIn(user);
    router.push('/timeline');
  };

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center">
        Choose a user to log in
      </h2>
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.id}>
            <button
              className="w-full h-full flex items-center gap-1 py-4"
              onClick={() => login(user)}
            >
              <img className="size-10 rounded-full" src={user.image} alt="" />
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
