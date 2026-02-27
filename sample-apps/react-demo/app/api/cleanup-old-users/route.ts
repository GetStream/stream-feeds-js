import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';

const DEFAULT_MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000;
const MAX_WAIT_MS = 60_000;
const CREATED_OLDER_THAN_DAYS = 7;
const CHUNK_SIZE = 100;

/** Retry with exponential backoff on 429 rate limit */
async function retryOnRateLimit<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number } = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const err = error as {
        metadata?: {
          responseCode?: number;
          rateLimit?: { rateLimitReset?: Date | string };
        };
        statusCode?: number;
      };
      const is429 =
        err?.metadata?.responseCode === 429 || err?.statusCode === 429;
      if (!is429 || attempt === maxRetries) throw error;
      const rateLimit = err?.metadata?.rateLimit;
      let waitMs = Math.min(
        INITIAL_DELAY_MS * Math.pow(2, attempt),
        MAX_WAIT_MS,
      );
      if (rateLimit?.rateLimitReset) {
        const resetAt =
          rateLimit.rateLimitReset instanceof Date
            ? rateLimit.rateLimitReset.getTime()
            : new Date(rateLimit.rateLimitReset).getTime();
        waitMs = Math.min(MAX_WAIT_MS, Math.max(100, resetAt - Date.now()));
      }
      console.warn(
        `Rate limited (429). Waiting ${Math.round(waitMs / 1000)}s before retry (attempt ${attempt + 1}/${maxRetries}).`,
      );
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw lastError;
}

/** Returns true if the user should be kept (not deleted). */
function shouldKeepUser(userId: string, demoUserIds: string[]): boolean {
  const inDemoList = demoUserIds.includes(userId);
  const idContainsAdmin = userId.toLowerCase().includes('admin');
  return inDemoList || idContainsAdmin;
}

export async function POST() {
  const key = process.env.NEXT_PUBLIC_API_KEY;
  const secret = process.env.API_SECRET;
  const url = process.env.NEXT_PUBLIC_API_URL;
  const demoUserIds = (process.env.DEMO_USER_IDS?.split(',') ?? [])
    .map((id) => id.trim())
    .filter(Boolean);

  if (!key || !secret) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_API_KEY or API_SECRET' },
      { status: 500 },
    );
  }

  const client = new StreamClient(key, secret, {
    basePath: url,
    timeout: 10000,
  });

  const createdBefore = new Date(
    Date.now() - CREATED_OLDER_THAN_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const userIdsToDelete: string[] = [];
  let offset = 0;
  const maxUsers = 1000;

  try {
    let response: Awaited<ReturnType<typeof client.queryUsers>>;
    do {
      response = await retryOnRateLimit(() =>
        client.queryUsers({
          payload: {
            filter_conditions: {
              created_at: { $lt: createdBefore },
            },
            limit: 100,
            offset,
          },
        }),
      );
      offset += response.users.length;

      for (const user of response.users) {
        if (!shouldKeepUser(user.id, demoUserIds)) {
          userIdsToDelete.push(user.id);
        }
      }
    } while (response.users.length > 0 && offset < maxUsers);

    const deleted: string[] = [];
    const errors: Array<{ userId: string; error: string }> = [];

    for (const user of userIdsToDelete) {
      try {
        await retryOnRateLimit(() =>
          client.feeds.deleteFeedUserData({
            user_id: user,
            hard_delete: true,
          }),
        );
        deleted.push(user);
      } catch (error) {
        errors.push({
          userId: user,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    const userIds = Array.from(userIdsToDelete);
    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
      const chunk = userIds.slice(i, i + CHUNK_SIZE);
      await retryOnRateLimit(() =>
        client.deleteUsers({
          user_ids: chunk,
          user: 'hard',
        }),
      );
      await new Promise((r) => setTimeout(r, 10000));
    }

    return NextResponse.json({
      totalCandidates: userIdsToDelete.length,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('cleanup-old-users API error:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Failed to cleanup old users',
      },
      { status: 500 },
    );
  }
}
