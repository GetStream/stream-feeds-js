'use client';
import { useUserContext } from '../user-context';

export default function Home() {
  const { user } = useUserContext();
  return <div>Welcome {user?.name}</div>;
}
