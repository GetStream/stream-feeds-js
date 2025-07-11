import { cookies } from 'next/headers';
import { streamServerClient } from '../client';

export async function GET() {
  const userId = (await cookies()).get('user_id')?.value;

  if (!userId) {
    return new Response(undefined, {
      status: 401,
    });
  }

  const token = streamServerClient().generateUserToken({ user_id: userId });

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
