'use client';
import { UserRequest } from '@stream-io/common';
import { useRouter } from 'next/navigation';
import { useUserContext } from '../user-context';
import { useErrorContext } from '../error-context';

import React, { useEffect, useState } from 'react';
// import { randomUUID } from 'crypto';

class Client {
  public readonly id: string;
  public apiKey: string;
  public userData: { id: string; name?: string } | null;
  constructor(apiKey: string) {
    this.id = window.crypto.randomUUID(); // randomUUID is not available in all environments, consider using a polyfill or alternative
    this.apiKey = apiKey;
    this.userData = null;
  }

  connect(userData: NonNullable<typeof this.userData>) {
    this.userData = userData;

    const { promise, resolve } = Promise.withResolvers();

    setTimeout(() => {
      resolve(userData.id);
    }, 500);

    return promise;
  }

  disconnect() {
    const { promise, resolve } = Promise.withResolvers();

    setTimeout(() => {
      resolve(this.userData?.id);
    }, 500);

    return promise;
  }
}

const useWhatever = (
  apiKey: string,
  userData: NonNullable<Client['userData']>,
) => {
  const [client, setClient] = useState(() => new Client(apiKey));
  const [cachedUserData, setCachedUserData] = useState(userData);

  if (apiKey !== client.apiKey) {
    setClient(() => new Client(apiKey));
  }

  if (cachedUserData.id !== userData.id) {
    setCachedUserData(userData);
  }

  useEffect(() => {
    const promise = client.connect(cachedUserData).then(() => {
      console.log('sheesh connected user:', cachedUserData.id);
    });

    return () => {
      promise
        .then(() => client.disconnect())
        .then(() =>
          console.log('sheesh disconnected user:', cachedUserData.id),
        );
    };
  }, [cachedUserData, client]);

  return client;
};

const users_ = [
  { id: 'john', name: 'John Doe' },
  { id: 'jane', name: 'Jane Doe' },
  { id: 'alice', name: 'Alice Smith' },
];
const apiKeys = ['1', '2', '3'];

export default function Login() {
  const { users, logIn } = useUserContext();
  const { throwUnrecoverableError } = useErrorContext();
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const apiKey = apiKeys[0]; //index % apiKeys.length];
  const user = users_[index % users_.length];

  const t = useWhatever(apiKey, user);
  console.log('sheesh:', t.id);

  const login = (user: UserRequest) => {
    logIn(user).catch((err) => {
      throwUnrecoverableError(err);
    });
    router.push('/timeline');
  };

  return (
    <div>
      {user.name}
      <h2
        onClick={() => setIndex((pv) => pv + 1)}
        className="text-4xl font-extrabold text-center"
      >
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
