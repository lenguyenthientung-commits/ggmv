// Run tests with: npx tsx --test src/utils/session.test.ts
import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'ggmv_session';
export const SESSION_MS = 365 * 24 * 60 * 60 * 1000; // every login lasts one year

const sign = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest('base64url');

// Stateless token "<expiry ms>.<hmac>": no session store, so restarts and free-tier sleeps never log anyone out
export function createSession(secret: string, now = Date.now()): string {
  const expires = String(now + SESSION_MS);
  return `${expires}.${sign(expires, secret)}`;
}

export function verifySession(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token) return false;
  const [expires, mac] = token.split('.');
  if (!expires || !mac || !(Number(expires) > now)) return false;
  const expected = Buffer.from(sign(expires, secret));
  const given = Buffer.from(mac);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function passwordMatches(given: unknown, expected: string): boolean {
  if (typeof given !== 'string') return false;
  // Hash both sides so the comparison has equal lengths and does not leak the real length
  const hash = (s: string) => createHmac('sha256', 'ggmv-password').update(s).digest();
  return timingSafeEqual(hash(given), hash(expected));
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of (header ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return undefined;
}
