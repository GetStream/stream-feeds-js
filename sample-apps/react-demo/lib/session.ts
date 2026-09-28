import { jwtVerify, SignJWT } from 'jose';

/**
 * Sliding: re-issued on every load. Must stay inside the window after which
 * `cleanup-old-users` deletes generated users.
 */
const EXPIRES_IN = '24h';
const ALGORITHM = 'HS256';
/** Domain-separates the signing key from every other use of the secret. */
const KEY_INFO = 'stream-feeds-demo:session';

/** A session resumes its user on a later load, see `middleware.ts`. */
export async function createSession(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(await key());
}

export async function parseSession(
  value: unknown,
): Promise<string | undefined> {
  if (typeof value !== 'string' || !value) return undefined;

  try {
    const { payload } = await jwtVerify(value, await key(), {
      algorithms: [ALGORITHM],
    });
    return payload.sub || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Derived from the Stream secret but distinct from it, so a session can never
 * pass for a Stream token. Web Crypto rather than `node:crypto`, so it also
 * runs in the middleware.
 */
async function key(): Promise<Uint8Array> {
  const secret = process.env.API_SECRET;
  if (!secret) {
    throw new Error('Missing API_SECRET');
  }

  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'HKDF',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: encoder.encode(KEY_INFO),
    },
    baseKey,
    256,
  );
  return new Uint8Array(bits);
}
