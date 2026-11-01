// Run with: npx tsx --test src/utils/judging.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Movie } from '../types/cinema';
import { applyJudgeScores, parseScoreInput, recalcAverage } from './judging';
import { rankScore } from '../easterEggs';

const movie = (fields: Partial<Movie> = {}) => ({ id: 'm', ...fields }) as Movie;
const review = (author: string, rating: number) => ({ id: author, author, rating, badge: '', comment: 'hay', createdAt: '' });

test('reads typed scores, with either decimal mark', () => {
  assert.equal(parseScoreInput('8,5'), 8.5);
  assert.equal(parseScoreInput('8.'), 8);
  assert.equal(parseScoreInput('12'), 10);
  assert.equal(parseScoreInput(''), null);
  assert.equal(parseScoreInput('.'), null);
});

test('no average and no rank until all three judges have scored', () => {
  const m = movie({ scoreAvg: 9 });
  applyJudgeScores(m, [10, null, null]);
  assert.equal(m.scoreTeng, 10);
  assert.equal('scoreLoc' in m, false);
  assert.equal(m.scoreAvg, undefined);
  assert.equal(rankScore(m), 0);

  applyJudgeScores(m, [10, 8, 6]);
  assert.equal(m.scoreAvg, 8);
  assert.equal(rankScore(m), 8);
});

test('a partly scored film stays unranked even with a review or an old average', () => {
  assert.equal(rankScore(movie({ scoreTeng: 10, reviews: [review('Lil Teng', 10)] })), 0);
  assert.equal(rankScore(movie({ scoreTeng: 10, scoreAvg: 10 })), 0);
});

test('reviews stand in only while no judge has scored', () => {
  const m = movie({ reviews: [review('Nem', 7), review('Shiba', 8)] });
  recalcAverage(m);
  assert.equal(m.scoreAvg, 7.5);
  assert.equal(rankScore(m), 7.5);
});

test('three real zeros are an average, not a missing score', () => {
  const m = movie();
  applyJudgeScores(m, [0, 0, 0]);
  assert.equal(m.scoreAvg, 0);
});

test('a new score updates that judge\'s review and keeps the comment', () => {
  const m = movie({ reviews: [review('Lộc', 9), review('Nem', 5)] });
  applyJudgeScores(m, [null, 8, null]);
  assert.equal(m.reviews![0].rating, 8);
  assert.equal(m.reviews![0].comment, 'hay');
  assert.equal(m.reviews![1].rating, 5);
});
