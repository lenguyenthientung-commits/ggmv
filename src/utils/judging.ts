import type { Movie } from '../types/cinema';

const JUDGES = [
  ['Lil Teng', 'scoreTeng'],
  ['Lộc', 'scoreLoc'],
  ['Thành', 'scoreThanh'],
] as const;

const norm = (s: string) => s.trim().toLowerCase();

// A judge's score as typed: "8,5" and "8.5" both count, anything unreadable means not scored yet.
export function parseScoreInput(raw: string): number | null {
  const value = parseFloat(raw.replace(',', '.'));
  return Number.isFinite(value) ? Math.min(10, Math.max(0, Number(value.toFixed(2)))) : null;
}

// The judges' average only exists once all three have scored; member reviews stand in while no judge has.
export function recalcAverage(movie: Movie) {
  const scores = JUDGES.map(([, key]) => movie[key]).filter((s): s is number => typeof s === 'number' && Number.isFinite(s));
  const reviews = movie.reviews ?? [];
  if (scores.length === 3) {
    movie.scoreAvg = Number((scores.reduce((a, b) => a + b, 0) / 3).toFixed(2));
  } else if (scores.length === 0 && reviews.length > 0) {
    movie.scoreAvg = Number((reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(2));
  } else {
    delete movie.scoreAvg;
  }
}

// Scores in judge order, null = not scored. A judge's existing review follows the new score,
// so the sheet and the review can never show two numbers for one person.
export function applyJudgeScores(movie: Movie, scores: (number | null)[]) {
  JUDGES.forEach(([name, key], i) => {
    const score = scores[i];
    if (score === null) {
      delete movie[key];
      return;
    }
    movie[key] = score;
    const review = movie.reviews?.find((r) => norm(r.author) === norm(name));
    if (review) review.rating = score;
  });
  recalcAverage(movie);
}
