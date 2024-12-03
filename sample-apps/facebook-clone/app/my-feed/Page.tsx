'use client';
import { useUserContext } from '../user-context';

export default function Home() {
  const { user, client } = useUserContext();
  return <div>Welcome {user?.name}</div>;
}
