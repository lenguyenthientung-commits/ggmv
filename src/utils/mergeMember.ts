// Run tests with: npx tsx --test src/utils/mergeMember.test.ts
import type { Movie, WeekendSession } from '../types/cinema';

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Moves everything `from` did over to `to`. Where both already have an entry (a vote, a review, an RSVP),
// `to` keeps its own and `from`'s is dropped. Judge scores are left alone: they are never recomputed here.
export function mergeMovie(movie: Movie, from: string, to: string): Movie {
  const hasReview = (movie.reviews ?? []).some((r) => same(r.author, to));
  return {
    ...movie,
    suggestedBy: same(movie.suggestedBy, from) ? to : movie.suggestedBy,
    votes: [...new Set(movie.votes.map((v) => (same(v, from) ? to : v)))],
    ...(movie.reviews && {
      reviews: movie.reviews
        .filter((r) => !(same(r.author, from) && hasReview))
        .map((r) => (same(r.author, from) ? { ...r, author: to } : r)),
    }),
  };
}

export function mergeSession(session: WeekendSession, from: string, to: string): WeekendSession {
  const hasRsvp = session.attendees.some((a) => same(a.name, to));
  return {
    ...session,
    snackDuty: session.snackDuty.map((d) => (same(d.person, from) ? { ...d, person: to } : d)),
    attendees: session.attendees
      .filter((a) => !(same(a.name, from) && hasRsvp))
      .map((a) => (same(a.name, from) ? { ...a, name: to } : a)),
  };
}
