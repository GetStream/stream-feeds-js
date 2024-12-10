import { cookies } from 'next/headers';
import { streamServerClient } from '../client';

export async function POST(request: Request) {
  const body = await request.json();
  const verb = body.verb;
  const objectId = body.objectId;
  const targetUserId = body.targetUserId;
  const userId = (await cookies()).get('user_id')?.value;

  if (!verb || !targetUserId || !objectId) {
    return new Response(undefined, {
      status: 401,
    });
  }

  try {
    /* eslint-disable-next-line @typescript-eslint/dot-notation */
    await streamServerClient['sendRequest'](
      'POST',
      '/api/v2/feeds/feeds/{group}/{id}/add_activity',
      { group: 'notification', id: targetUserId },
      undefined,
      {
        verb,
        object: objectId,
        user_id: userId,
      },
    );
  } catch (err) {
    return new Response(undefined, {
      status: 500,
    });
  }

  return new Response(undefined, {
    status: 201,
  });
}
