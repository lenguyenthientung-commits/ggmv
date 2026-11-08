// Run with: npx tsx --test src/utils/mergeMember.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Movie, MovieReview, WeekendSession } from '../types/cinema';
import { mergeMovie, mergeSession } from './mergeMember';

const review = (author: string, rating: number) => ({ id: author, author, rating, comment: '', createdAt: '' }) as MovieReview;
const movie = (f: Partial<Movie>) => ({ id: 'm', suggestedBy: 'Lộc', votes: [], ...f }) as Movie;

test('suggestions and votes move over, and a double vote counts once', () => {
  const m = mergeMovie(movie({ suggestedBy: 'Shiba', votes: ['Shiba', 'Lộc', 'Thành'] }), 'Shiba', 'Thành');
  assert.equal(m.suggestedBy, 'Thành');
  assert.deepEqual(m.votes, ['Thành', 'Lộc']);
});

test('a lone Shiba review becomes Thành\'s; when Thành has one already it wins', () => {
  assert.deepEqual(mergeMovie(movie({ reviews: [review('Shiba', 6)] }), 'Shiba', 'Thành').reviews?.map((r) => r.author), ['Thành']);
  const both = mergeMovie(movie({ reviews: [review('Shiba', 6), review('Thành', 9)] }), 'Shiba', 'Thành').reviews!;
  assert.deepEqual(both.map((r) => [r.author, r.rating]), [['Thành', 9]]);
});

test('a movie with no reviews gets no reviews field', () => {
  assert.equal('reviews' in mergeMovie(movie({}), 'Shiba', 'Thành'), false);
});

test('session: snack duty is renamed, RSVP is kept once', () => {
  const s = { snackDuty: [{ person: 'Shiba', item: 'x' }], attendees: [{ name: 'Shiba', status: 'going' }, { name: 'Thành', status: 'maybe' }] } as WeekendSession;
  const r = mergeSession(s, 'Shiba', 'Thành');
  assert.equal(r.snackDuty[0].person, 'Thành');
  assert.deepEqual(r.attendees, [{ name: 'Thành', status: 'maybe' }]);
});
