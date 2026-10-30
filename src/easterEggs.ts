// Easter egg system, ported from GGMV (Code.js ledger + AllMovies.html classified archive).
// Rule from the design spec: eggs decorate, they never change the drawn movie, a score,
// a rank or a veto. Everything shown here is derived from real, shared records.

import { Movie } from './types/cinema';

export type EggId =
  | 'NEAR_MISS'
  | 'DOUBLE_FEATURE'
  | 'DIVIDED_HOUSE'
  | 'WITNESS_PROTECTION'
  | 'EMPTY_REEL'
  | 'CENTURY_ROOM'
  | 'END_CREDIT_SURVIVOR'
  | 'PROPHECY';

export interface EggEvent {
  key: string;
  eggId: EggId;
  operationId: string;
  movieId: string;
  createdAt: string;
  evidence: Record<string, unknown>;
}

export const ACHIEVEMENTS: { id: EggId; name: string; description: string; rule: string }[] = [
  { id: 'NEAR_MISS', name: 'Cú lừa phòng vé', description: 'Fake Victory xuất hiện trong một lượt quay. Phim trúng vẫn được giữ nguyên.', rule: 'Cơ hội 10% mỗi lượt quay.' },
  { id: 'DOUBLE_FEATURE', name: 'Suất chiếu đôi', description: 'Phim vừa bị veto quay trở lại ngay ở lượt rút kế tiếp.', rule: 'Veto một phim rồi rút lại đúng phim đó.' },
  { id: 'DIVIDED_HOUSE', name: 'Hội đồng tan vỡ', description: 'Ba người chấm có ý kiến trái ngược rõ rệt.', rule: 'Cả 3 điểm hợp lệ và cao nhất trừ thấp nhất ít nhất 6 điểm.' },
  { id: 'WITNESS_PROTECTION', name: 'Bảo vệ nhân chứng', description: 'Một bộ phim nhận điểm trung bình cực thấp.', rule: 'Có ít nhất 2 điểm hợp lệ, điểm trung bình không quá 2.' },
  { id: 'EMPTY_REEL', name: 'Cuộn phim cuối cùng', description: 'Kho phim chưa xem đã được dọn sạch.', rule: 'Xem xong khiến danh sách chưa xem không còn phim nào.' },
  { id: 'CENTURY_ROOM', name: 'Phòng chiếu 100', description: 'Câu lạc bộ đã hoàn thành một cột mốc lớn.', rule: 'Đạt ít nhất 100 phim đã xem.' },
  { id: 'PROPHECY', name: 'Đã phán là trúng', description: 'Một thành viên ghi lời tiên tri trước khi quay, và vòng quay chốt đúng phim đó.', rule: 'Chọn phim ở ô Tiên tri trước khi bấm Quay.' },
  { id: 'END_CREDIT_SURVIVOR', name: 'Sống sót qua credit', description: 'Ba suất chiếu hoàn tất đã được chấm điểm trên cùng trình duyệt.', rule: 'Lưu điểm cho 3 phim khác nhau; mỗi trình duyệt nhận một lần.' },
];

// Copy shown in the unlock toast
export const UNLOCK_COPY: Record<EggId, string> = {
  NEAR_MISS: 'Your prize is the film you were going to watch anyway.',
  DOUBLE_FEATURE: 'Two tickets. One option. An evening of unprecedented freedom.',
  DIVIDED_HOUSE: 'Consensus was attempted. The room declined.',
  WITNESS_PROTECTION: 'Identity retained for legal and comedic reasons.',
  EMPTY_REEL: 'Every suspect has been screened. New evidence may be submitted.',
  CENTURY_ROOM: 'One hundred screenings. No consensus was harmed in the making of this archive.',
  END_CREDIT_SURVIVOR: 'You stayed. The credits noticed.',
  PROPHECY: 'The witness made this claim before the reel moved.',
};

export const DEFAULT_HOUSE_NOTE = 'We saw you arrive. We will pretend not to judge.';

export interface Story {
  id: string;
  label: string;
  title: string;
  detail: string;
  movieId?: string;
}

export function judgeScores(movie: Movie): number[] {
  return [movie.scoreTeng, movie.scoreLoc, movie.scoreThanh].filter(
    (s): s is number => typeof s === 'number' && Number.isFinite(s)
  );
}

// Hall of fame ranking score: judges' average, else the members' review average, else 0.
// The archive sorts by this, and the House Edge tie clue reads the same number.
export function rankScore(movie: Movie): number {
  if (typeof movie.scoreAvg === 'number') return movie.scoreAvg;
  return movie.reviews && movie.reviews.length > 0
    ? movie.reviews.reduce((acc, r) => acc + r.rating, 0) / movie.reviews.length
    : 0;
}

function averageOf(movie: Movie): number | null {
  if (typeof movie.scoreAvg === 'number') return movie.scoreAvg;
  const scores = judgeScores(movie);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

const normalizeTitle = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

const byWatchDate = (movies: Movie[]) =>
  movies.filter((m) => m.watched && m.watchedDate).slice().sort((a, b) => (a.watchedDate as string).localeCompare(b.watchedDate as string));

// Films about real tragedies or crimes: playful eggs stay away from them (design doc, season 2)
const SENSITIVE_TITLES = /schindler|pianist|hoi uc ke sat nhan|memories of murder|cuoc san lung|the hunt\b/;

export function isSensitiveFilm(movie: Movie): boolean {
  const text = `${movie.title} ${movie.originalTitle ?? ''}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  return SENSITIVE_TITLES.test(text);
}

// Shiba the critic: one reaction per film, read from its own record. Most films get none.
export function shibaReview(movie: Movie, hour = new Date().getHours()): string | null {
  if (isSensitiveFilm(movie)) return null;
  if (movie.durationMinutes >= 180) return `${movie.durationMinutes} phút. Shiba đã mang theo gối.`;
  if (movie.genres.includes('Kinh dị') && (hour >= 22 || hour < 5)) return 'Phim kinh dị, giờ này. Shiba xem từ sau thùng bắp rang.';
  const score = rankScore(movie);
  if (score >= 8.5) return `${score.toFixed(2)} điểm. Shiba gật gù, chuyện này không xảy ra thường xuyên.`;
  if (score > 0 && score < 5) return `${score.toFixed(2)} điểm. Shiba đã xem, và Shiba không muốn nói về chuyện đó.`;
  return null;
}

// Per-movie stories derived from saved scores and metadata (never changes them)
export function movieStories(movie: Movie, events: EggEvent[]): Story[] {
  const scores = judgeScores(movie);
  const average = averageOf(movie);
  const stories: Story[] = [];
  const add = (id: string, label: string, detail: string) =>
    stories.push({ id, label, title: movie.title, detail, movieId: movie.id });

  if (scores.length >= 2 && average !== null && average <= 2) {
    add('witness-protection', 'Witness Protection · Phim được bảo vệ nhân chứng', 'Identity retained for legal and comedic reasons.');
  }
  if (scores.length === 3 && Math.max(...scores) - Math.min(...scores) >= 6) {
    add('divided-house', 'Divided House · Cả rạp chia phe, phim chịu trận', 'Consensus was attempted. The room declined.');
  }
  if (average !== null && Math.round(average * 100) / 100 === 6.66) {
    add('exact-average', 'Under Review · Điểm 6.66', 'The committee has declined to interpret this.');
  }
  if (movie.watchedDate && movie.year === Number(movie.watchedDate.slice(0, 4))) {
    add('final-frame', 'Shot On This Day · Khung hình chốt sổ', 'For one night, the archive caught up with the film.');
  }
  events
    .filter((e) => e.movieId === movie.id)
    .forEach((e) => {
      if (e.eggId === 'NEAR_MISS') add('near-miss', 'Near-Miss Insurance · Suýt trúng jackpot', 'Your prize was the film the reel had already selected.');
      if (e.eggId === 'DOUBLE_FEATURE') add('double-feature', 'Sold Out · technically', 'Two tickets. One option. An evening of unprecedented freedom.');
      if (e.eggId === 'PROPHECY') add('prophecy', 'The Prophecy · Đã phán là trúng', `${String(e.evidence.member ?? 'A witness')} made this claim before the reel moved.`);
    });
  return stories;
}

// Each judge is the sole high scorer once across three consecutive screenings
function hasThreeCardMonte(movies: Movie[]): boolean {
  const ordered = byWatchDate(movies).filter((m) => judgeScores(m).length === 3);
  for (let i = 0; i <= ordered.length - 3; i++) {
    const winners = ordered.slice(i, i + 3).map((m) => {
      const scores = [m.scoreTeng, m.scoreLoc, m.scoreThanh] as number[];
      const high = Math.max(...scores);
      const top = scores.map((s, idx) => (s === high ? idx : -1)).filter((idx) => idx >= 0);
      return top.length === 1 ? top[0] : -1;
    });
    if (!winners.includes(-1) && new Set(winners).size === 3) return true;
  }
  return false;
}

// Latest run of three consecutive screenings from the same proposer
function threeFilmProposerStreak(movies: Movie[]): { proposer: string; movie: Movie } | null {
  const ordered = byWatchDate(movies).filter((m) => m.suggestedBy);
  for (let i = ordered.length - 1; i >= 2; i--) {
    const p = ordered[i].suggestedBy.trim();
    if (p && p === ordered[i - 1].suggestedBy.trim() && p === ordered[i - 2].suggestedBy.trim()) {
      return { proposer: p, movie: ordered[i] };
    }
  }
  return null;
}

// ---------- Chain B: The House Edge (one clue visible at a time) ----------
// 1. A fake-victory spin (NEAR_MISS) shows ♧ on its CLAIM DENIED stamp.
// 2. Then a real 6-point split (DIVIDED_HOUSE) carries ♧ on each judge's score card.
// 3. Then a real tie for #1 in the hall of fame carries ♧ on its tie marker.
// Ending: THE HOUSE EDGE plaque with the split screening's three real ratings.
export interface HouseEdge {
  step: 0 | 1 | 2 | 3;
  dividedMovieIds: string[];
  tieIds: string[];
  plaqueMovie?: Movie;
}

export function topTieIds(movies: Movie[]): string[] {
  const watched = movies.filter((m) => m.watched);
  if (watched.length < 2) return [];
  const top = Math.max(...watched.map(rankScore));
  if (top <= 0) return [];
  const tied = watched.filter((m) => Math.abs(rankScore(m) - top) < 1e-9);
  return tied.length >= 2 ? tied.map((m) => m.id) : [];
}

export function houseEdge(movies: Movie[], events: EggEvent[]): HouseEdge {
  const watched = movies.filter((m) => m.watched);
  const divided = watched.filter((m) => movieStories(m, []).some((s) => s.id === 'divided-house'));
  const tieIds = topTieIds(movies);
  let step: HouseEdge['step'] = 0;
  if (events.some((e) => e.eggId === 'NEAR_MISS')) {
    step = 1;
    if (divided.length > 0) {
      step = 2;
      if (tieIds.length > 0) step = 3;
    }
  }
  return { step, dividedMovieIds: divided.map((m) => m.id), tieIds, plaqueMovie: divided[divided.length - 1] };
}

// Everything that belongs in the classified archive
// ---------- Chain A: The Missing Frame ----------
// 1. The house note carries ⌁.  2. Searching the archive for ⌁ / "missing frame" lists real
// records with incomplete metadata, each marked FRAME 02.  3. Opening FRAME 02 shows FRAME 03
// (proposer initial + the archive's first screening date) and unlocks the ending: an honest
// contact sheet of records that need correcting. Nothing is edited by the reveal.
const PLACEHOLDER_SYNOPSES = ['Chưa có tóm tắt chi tiết.', 'Một bộ phim xuất sắc do anh em đề xuất.'];
const DEFAULT_POSTER = 'photo-1489599849927-2ee91cede3ba';

export function missingFields(movie: Movie): string[] {
  const missing: string[] = [];
  if (!movie.director) missing.push('đạo diễn');
  if (!movie.synopsis || PLACEHOLDER_SYNOPSES.includes(movie.synopsis)) missing.push('tóm tắt');
  if (!movie.posterUrl || movie.posterUrl.includes(DEFAULT_POSTER)) missing.push('poster');
  if (!movie.watchedDate) missing.push('ngày chiếu');
  if (judgeScores(movie).length < 3) missing.push('điểm giám khảo');
  return missing;
}

export const missingFrameRecords = (movies: Movie[]) =>
  movies.filter((m) => m.watched && missingFields(m).length > 0);

export const isMissingFrameQuery = (q: string) => {
  const t = q.trim().toLowerCase();
  return t === '⌁' || t.includes('missing frame');
};

export function firstScreeningDate(movies: Movie[]): string | null {
  const ordered = byWatchDate(movies);
  return ordered.length ? (ordered[0].watchedDate as string) : null;
}

// ---------- Chain C: After the Credits ----------
// 1. END_CREDIT_SURVIVOR leaves a faint A-13 counter on the archive.  2. The same counter sits
// on the date of a watched film released in a year ending in 13 (none = no clue).  3. Opening it
// links the screening date to the ledger timestamp, then a silent 13-frame end card plays and
// THE ROOM STAYED joins the classified archive.
export function a13Movie(movies: Movie[]): Movie | null {
  const candidates = byWatchDate(movies).filter((m) => m.year % 100 === 13);
  return candidates.length ? candidates[candidates.length - 1] : null;
}

export const creditsEvent = (events: EggEvent[]) => events.find((e) => e.eggId === 'END_CREDIT_SURVIVOR') ?? null;

export interface ChainUnlocks {
  missingFrame: boolean;
  roomStayed: boolean;
}

export function classifiedStories(movies: Movie[], events: EggEvent[], chains: ChainUnlocks = { missingFrame: false, roomStayed: false }): Story[] {
  const watched = movies.filter((m) => m.watched);
  const stories: Story[] = [];

  // Same verified title + year + proposer screened more than once
  const groups = new Map<string, Movie[]>();
  watched.forEach((m) => {
    const key = [normalizeTitle(m.title), m.year, m.suggestedBy.trim()].join('|');
    groups.set(key, [...(groups.get(key) || []), m]);
  });

  watched.forEach((m) => {
    stories.push(...movieStories(m, events));
    const key = [normalizeTitle(m.title), m.year, m.suggestedBy.trim()].join('|');
    if ((groups.get(key) || []).length > 1) {
      stories.push({
        id: 'impossible-continuity',
        label: 'The Impossible Continuity · Lỗi liên tục',
        title: m.title,
        detail: 'This verified title, year and proposer appear in more than one screening.',
        movieId: m.id,
      });
    }
  });

  if (events.some((e) => e.eggId === 'EMPTY_REEL')) {
    stories.push({ id: 'empty-reel', label: 'Closed Case · Series 01', title: 'The Empty Reel · Hòm rỗng, nợ cũ hết', detail: 'Every suspect has been screened. New evidence may be submitted.' });
  }
  if (events.some((e) => e.eggId === 'CENTURY_ROOM')) {
    stories.push({ id: 'century-room', label: 'The Century Room · Phòng trăm suất chiếu', title: '100 screenings. Still no consensus.', detail: 'One hundred screenings. No consensus was harmed in the making of this archive.' });
  }
  if (events.some((e) => e.eggId === 'END_CREDIT_SURVIVOR')) {
    stories.push({ id: 'end-credit', label: 'Stay For The Credits · Sống sót qua hết credit', title: 'The credits noticed.', detail: 'Three completed screenings were scored before anyone left the room.' });
  }
  if (hasThreeCardMonte(watched)) {
    stories.push({ id: 'three-card-monte', label: 'The House Always Wins · Three-Card Monte', title: 'Three judges. Three clean alibis.', detail: 'Each judge was the sole high scorer once across three consecutive screenings.' });
  }
  const missing = missingFrameRecords(movies);
  if (chains.missingFrame && missing.length > 0) {
    stories.push({
      id: 'missing-frame',
      label: '⌁ The Cut That Never Existed · Khung hình mất tích',
      title: `${missing.length} hồ sơ cần bổ sung`,
      detail: missing.map((m) => `${m.title}: thiếu ${missingFields(m).join(', ')}`).join(' · '),
    });
  }
  const credits = creditsEvent(events);
  const a13 = a13Movie(movies);
  if (chains.roomStayed && credits && a13) {
    stories.push({
      id: 'room-stayed',
      label: 'A-13 · The Room Stayed',
      title: `${a13.title}, ${a13.watchedDate}`,
      detail: `Thirteen frames, no sound. The credits were noticed on ${credits.createdAt.slice(0, 10)}; the room stayed for this night.`,
      movieId: a13.id,
    });
  }
  const edge = houseEdge(movies, events);
  if (edge.step === 3 && edge.plaqueMovie) {
    const m = edge.plaqueMovie;
    stories.push({
      id: 'house-edge',
      label: '♧ The House Edge · Nhà cái là cả căn phòng',
      title: 'The house always wins.',
      detail: `Teng ${m.scoreTeng?.toFixed(2)} · Lộc ${m.scoreLoc?.toFixed(2)} · Thành ${m.scoreThanh?.toFixed(2)} on ${m.title}. The house was never the reel; it is the room's disagreement.`,
      movieId: m.id,
    });
  }
  const streak = threeFilmProposerStreak(watched);
  if (streak) {
    stories.push({
      id: 'uncredited-director',
      label: 'The Uncredited Director · Đạo diễn vô danh',
      title: `A film by ${streak.proposer}. Apparently.`,
      detail: `${streak.movie.title} closed a three-screening proposer streak.`,
      movieId: streak.movie.id,
    });
  }
  return stories;
}

// The most recent "legendary" screening, used by the midnight intermission card
export function latestLegendaryDate(movies: Movie[]): string | null {
  const legendary = byWatchDate(movies).filter((m) =>
    movieStories(m, []).some((s) => s.id === 'witness-protection' || s.id === 'divided-house')
  );
  return legendary.length ? (legendary[legendary.length - 1].watchedDate as string) : null;
}

// ---------- Per-viewer state (browser only) ----------

const SEEN_KEY = 'ggmv_eggs_seen';
const CHAINS_KEY = 'ggmv_chains';

// Per-viewer chain progress: once you solve a chain, its ending stays open for you
export function loadChainUnlocks(): ChainUnlocks {
  return { missingFrame: false, roomStayed: false, ...readJson<Partial<ChainUnlocks>>(CHAINS_KEY, {}) };
}

export function saveChainUnlock(chain: keyof ChainUnlocks): ChainUnlocks {
  const next = { ...loadChainUnlocks(), [chain]: true };
  writeJson(CHAINS_KEY, next);
  return next;
}
const SURFACE_KEY = 'ggmv_egg_surfaces';
const CREDITS_KEY = 'ggmv_end_credit';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked: eggs still work for this visit
  }
}

// Returns events this viewer has not seen yet, and marks everything as seen.
// A brand-new viewer adopts the existing history silently (no flood of toasts).
export function takeUnseenEvents(events: EggEvent[]): EggEvent[] {
  const stored = readJson<string[] | null>(SEEN_KEY, null);
  const all = events.map((e) => e.key);
  writeJson(SEEN_KEY, all);
  if (stored === null) return [];
  const seen = new Set(stored);
  return events.filter((e) => !seen.has(e.key));
}

// C4 footer credit: true once both the wheel and the archive were visited within 6 hours
export function markSurface(surface: 'wheel' | 'archive'): boolean {
  const now = Date.now();
  let state = readJson<{ startedAt?: number; wheel?: number; archive?: number }>(SURFACE_KEY, {});
  if (!state.startedAt || now - state.startedAt > 6 * 3600_000) state = { startedAt: now };
  state[surface] = now;
  writeJson(SURFACE_KEY, state);
  return hasCrossSurfaceVisit();
}

export function hasCrossSurfaceVisit(): boolean {
  const state = readJson<{ wheel?: number; archive?: number }>(SURFACE_KEY, {});
  return !!(state.wheel && state.archive && Math.abs(state.wheel - state.archive) < 6 * 3600_000);
}

// End-credit survivor: remember the last 3 distinct movies scored in this browser.
// Returns their ids the first time three are reached, otherwise null.
export function recordScoredScreening(movieId: string): string[] | null {
  const state = readJson<{ movieIds: string[]; awarded?: boolean }>(CREDITS_KEY, { movieIds: [] });
  if (!state.movieIds.includes(movieId)) state.movieIds.push(movieId);
  state.movieIds = state.movieIds.slice(-3);
  let award: string[] | null = null;
  if (state.movieIds.length >= 3 && !state.awarded) {
    state.awarded = true;
    award = state.movieIds;
  }
  writeJson(CREDITS_KEY, state);
  return award;
}
