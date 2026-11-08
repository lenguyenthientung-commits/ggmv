// Run with: npx tsx --test src/utils/session.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SESSION_MS, createSession, passwordMatches, readCookie, verifySession } from './session';

test('a login lasts one year, not a day longer', () => {
  const t0 = 1_000_000;
  const token = createSession('secret', t0);
  assert.equal(verifySession(token, 'secret', t0 + SESSION_MS - 1), true);
  assert.equal(verifySession(token, 'secret', t0 + SESSION_MS), false);
});

test('a token signed with another secret, or edited, is rejected', () => {
  const token = createSession('secret');
  assert.equal(verifySession(token, 'other'), false);
  const [expires, mac] = token.split('.');
  assert.equal(verifySession(`${Number(expires) + 1}.${mac}`, 'secret'), false);
  assert.equal(verifySession(undefined, 'secret'), false);
  assert.equal(verifySession('garbage', 'secret'), false);
});

test('password check is exact', () => {
  assert.equal(passwordMatches('gay-gang', 'gay-gang'), true);
  assert.equal(passwordMatches('gay-gang ', 'gay-gang'), false);
  assert.equal(passwordMatches(undefined, 'gay-gang'), false);
});

test('readCookie picks one cookie out of the header', () => {
  assert.equal(readCookie('a=1; ggmv_session=x.y; b=2', 'ggmv_session'), 'x.y');
  assert.equal(readCookie(undefined, 'ggmv_session'), undefined);
});
