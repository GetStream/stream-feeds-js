import { streamServerClient } from '../client';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const cookieId = (await cookies()).get('user_id')?.value;

  // 1) query string: ?user_id=... or ?userId=...
  const url = new URL(req.url);
  const queryUserId =
    url.searchParams.get('user_id') ?? url.searchParams.get('userId');

  const userId = cookieId ?? queryUserId;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'missing_user_id' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = streamServerClient().generateUserToken({ user_id: userId });

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
