import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { INITIAL_MOVIES, INITIAL_SESSIONS } from './src/data/initialData.ts';
import type { Movie, MovieReview, WeekendSession } from './src/types/cinema.ts';
import { applyJudgeScores, recalcAverage } from './src/utils/judging.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Legacy local storage file: only read once, to seed an empty Firestore database
const DATA_FILE = path.join(__dirname, 'cinema-storage.json');

const VETO_JUDGES = ['Lil Teng', 'Lộc', 'Thành'];
const VETO_CARDS_PER_MONTH = 3;

interface VetoState {
  month: string; // "2026-10"
  cards: Record<string, number>;
}

interface CinemaStore {
  movies: Movie[];
  sessions: WeekendSession[];
}

// Firestore: credentials from FIREBASE_SERVICE_ACCOUNT (service account JSON),
// otherwise Application Default Credentials (Cloud Run service account / GOOGLE_APPLICATION_CREDENTIALS)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
const firebaseCredential = serviceAccount ? cert(JSON.parse(serviceAccount)) : applicationDefault();
initializeApp({ credential: firebaseCredential });
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const moviesCol = db.collection('movies');
const sessionsCol = db.collection('sessions');
const vetoDoc = db.collection('meta').doc('veto');
const eggsCol = db.collection('easterEggs');
// R3 The Prophecy: pre-spin guesses, keyed by the spin's operationId
const propheciesCol = db.collection('prophecies');

// ---------- Easter egg ledger (ported from GGMV "GGMV Easter Egg Events") ----------
// Eggs only decorate: they never change the drawn movie, a score, a rank or a veto.
// One document per "<eggId>:<operationId>", so the same event can never be recorded twice.
const EGG_IDS = ['NEAR_MISS', 'DOUBLE_FEATURE', 'DIVIDED_HOUSE', 'WITNESS_PROTECTION', 'EMPTY_REEL', 'CENTURY_ROOM', 'END_CREDIT_SURVIVOR', 'PROPHECY'] as const;
type EggId = typeof EGG_IDS[number];

interface EggEvent {
  key: string;
  eggId: EggId;
  operationId: string;
  movieId: string;
  createdAt: string;
  evidence: Record<string, unknown>;
}

async function recordEgg(eggId: EggId, operationId: string, movieId: string, evidence: Record<string, unknown>) {
  const key = `${eggId}:${operationId}`;
  const event: EggEvent = { key, eggId, operationId, movieId, createdAt: new Date().toISOString(), evidence };
  try {
    await eggsCol.doc(key).create(event); // fails if it already exists
    return true;
  } catch (err) {
    if ((err as { code?: number }).code !== 6) console.error(`Easter egg ledger write failed: ${eggId}`, err); // 6 = ALREADY_EXISTS
    return false;
  }
}

// Archive milestones, evaluated after a movie becomes watched or is scored
async function evaluateArchiveEggs(movie: Movie) {
  const scores = [movie.scoreTeng, movie.scoreLoc, movie.scoreThanh].filter((s): s is number => typeof s === 'number');
  if (scores.length === 3) {
    const spread = Math.max(...scores) - Math.min(...scores);
    if (spread >= 6) await recordEgg('DIVIDED_HOUSE', movie.id, movie.id, { scores, spread });
  }
  if (scores.length >= 2 && typeof movie.scoreAvg === 'number' && movie.scoreAvg <= 2) {
    await recordEgg('WITNESS_PROTECTION', movie.id, movie.id, { scores, average: movie.scoreAvg });
  }
  if (!movie.watched) return;
  const [unwatched, watched] = await Promise.all([
    moviesCol.where('watched', '==', false).limit(1).get(),
    moviesCol.where('watched', '==', true).count().get(),
  ]);
  if (unwatched.empty) await recordEgg('EMPTY_REEL', 'series-01', movie.id, { watchedMovieId: movie.id });
  const totalScreenings = watched.data().count;
  if (totalScreenings >= 100) await recordEgg('CENTURY_ROOM', 'milestone-century', movie.id, { totalScreenings });
}

// Each document carries an internal `_order` field (higher = shown first) to keep list order
function stripOrder<T>(data: DocumentData): T {
  const { _order, ...rest } = data;
  return rest as T;
}

async function listDocs<T>(col: CollectionReference): Promise<T[]> {
  const snap = await col.orderBy('_order', 'desc').get();
  return snap.docs.map(d => stripOrder<T>(d.data()));
}

// Read-modify-write one document in a transaction; returns null when it does not exist
async function updateDoc<T>(col: CollectionReference, id: string, mutate: (item: T) => void): Promise<T | null> {
  return db.runTransaction(async tx => {
    const ref = col.doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const item = stripOrder<T>(snap.data()!);
    mutate(item);
    tx.set(ref, { ...item, _order: snap.get('_order') });
    return item;
  });
}

async function writeAll(data: CinemaStore) {
  const batch = db.batch();
  data.movies.forEach((m, i) => batch.set(moviesCol.doc(m.id), { ...m, _order: data.movies.length - i }));
  data.sessions.forEach((s, i) => batch.set(sessionsCol.doc(s.id), { ...s, _order: data.sessions.length - i }));
  await batch.commit();
}

function loadLegacyFile(): CinemaStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      if (Array.isArray(parsed.movies) && Array.isArray(parsed.sessions)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading cinema-storage.json:', err);
  }
  return { movies: INITIAL_MOVIES, sessions: INITIAL_SESSIONS };
}

// First run against an empty database: import cinema-storage.json (or the sample data)
async function seedIfEmpty() {
  const [movies, sessions] = await Promise.all([moviesCol.limit(1).get(), sessionsCol.limit(1).get()]);
  if (!movies.empty || !sessions.empty) return;
  const data = loadLegacyFile();
  await writeAll(data);
  console.log(`Firestore trống: đã nhập ${data.movies.length} phim và ${data.sessions.length} buổi chiếu.`);
}

function currentVetoMonth(): string {
  // en-CA formats as YYYY-MM-DD
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).slice(0, 7);
}

function freshVetoState(): VetoState {
  return {
    month: currentVetoMonth(),
    cards: Object.fromEntries(VETO_JUDGES.map(j => [j, VETO_CARDS_PER_MONTH])),
  };
}

// Express 4 does not catch rejected promises: forward them to the error handler
const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  const OMDB_API_KEY = process.env.OMDB_API_KEY;
  if (!OMDB_API_KEY) {
    console.warn('OMDB_API_KEY chưa được cấu hình: tính năng tự điền thông tin phim từ OMDb sẽ bị tắt.');
  }

  // OMDB Proxy: Search movies by keyword
  app.get('/api/omdb/search', async (req: Request, res: Response) => {
    if (!OMDB_API_KEY) {
      res.status(503).json({ results: [], error: 'Chưa cấu hình OMDB_API_KEY trên server' });
      return;
    }
    try {
      const q = req.query.q as string;
      if (!q || !q.trim()) {
        res.json({ results: [] });
        return;
      }
      const resp = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(q.trim())}&type=movie`);
      const data = await resp.json();
      if (data.Response === 'True' && Array.isArray(data.Search)) {
        const results = data.Search.slice(0, 8).map((item: { Title: string; Year: string; imdbID: string; Poster: string }) => ({
          imdbID: item.imdbID,
          title: item.Title,
          year: item.Year,
          poster: item.Poster !== 'N/A' ? item.Poster : null,
        }));
        res.json({ results });
      } else {
        res.json({ results: [], error: data.Error || 'Không tìm thấy phim' });
      }
    } catch (err) {
      console.error('OMDB search error:', err);
      res.status(500).json({ error: 'Lỗi khi tìm kiếm phim qua OMDB' });
    }
  });

  // OMDB Proxy: Get detailed movie information by IMDb ID or Title
  app.get('/api/omdb/details', async (req: Request, res: Response) => {
    if (!OMDB_API_KEY) {
      res.status(503).json({ error: 'Chưa cấu hình OMDB_API_KEY trên server' });
      return;
    }
    try {
      const imdbID = req.query.imdbID as string;
      const title = req.query.title as string;
      if (!imdbID && !title) {
        res.status(400).json({ error: 'Thiếu imdbID hoặc title' });
        return;
      }

      const param = imdbID
        ? `i=${encodeURIComponent(imdbID)}`
        : `t=${encodeURIComponent(title)}`;

      const resp = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&${param}&plot=full`);
      const data = await resp.json();

      if (data.Response === 'True') {
        const runtimeMatch = data.Runtime ? data.Runtime.match(/\d+/) : null;
        const durationMinutes = runtimeMatch ? parseInt(runtimeMatch[0], 10) : 120;

        const GENRE_MAP: Record<string, string> = {
          'action': 'Hành động',
          'adventure': 'Phiêu lưu',
          'animation': 'Hoạt hình',
          'comedy': 'Hài hước',
          'crime': 'Tội phạm',
          'documentary': 'Tài liệu',
          'drama': 'Kịch tính',
          'family': 'Gia đình',
          'fantasy': 'Khoa học viễn tưởng',
          'history': 'Lịch sử',
          'horror': 'Kinh dị',
          'music': 'Âm nhạc',
          'mystery': 'Tâm lý',
          'romance': 'Lãng mạn',
          'sci-fi': 'Khoa học viễn tưởng',
          'thriller': 'Kịch tính',
          'war': 'Hành động',
          'western': 'Hành động',
        };

        const rawGenres = (data.Genre || '').split(',').map((g: string) => g.trim());
        const mappedGenres = rawGenres.map((g: string) => {
          const lower = g.toLowerCase();
          return GENRE_MAP[lower] || g;
        }).filter(Boolean);

        const genres = Array.from(new Set(mappedGenres.length > 0 ? mappedGenres : ['Hành động']));

        let vibe = 'Hành động đỉnh cao';
        const genreStr = (data.Genre || '').toLowerCase();
        if (genreStr.includes('comedy')) vibe = 'Hài bựa';
        else if (genreStr.includes('horror')) vibe = 'Kinh dị thót tim';
        else if (genreStr.includes('mystery') || genreStr.includes('thriller') || genreStr.includes('sci-fi')) vibe = 'Căng não';
        else if (genreStr.includes('animation') || genreStr.includes('family')) vibe = 'Ấm áp hoài niệm';

        res.json({
          title: data.Title,
          originalTitle: data.Title,
          year: parseInt(data.Year, 10) || new Date().getFullYear(),
          durationMinutes,
          genres,
          director: data.Director !== 'N/A' ? data.Director : '',
          country: data.Country && data.Country !== 'N/A' ? data.Country : '',
          synopsis: data.Plot !== 'N/A' ? data.Plot : '',
          posterUrl: data.Poster !== 'N/A' ? data.Poster : '',
          vibe,
          imdbRating: data.imdbRating !== 'N/A' ? data.imdbRating : null,
          imdbID: data.imdbID,
        });
      } else {
        res.status(404).json({ error: data.Error || 'Không tìm thấy chi tiết phim' });
      }
    } catch (err) {
      console.error('OMDB details error:', err);
      res.status(500).json({ error: 'Lỗi khi lấy chi tiết phim từ OMDB' });
    }
  });

  // API Endpoints
  app.get('/api/movies', asyncHandler(async (_req, res) => {
    res.json(await listDocs<Movie>(moviesCol));
  }));

  app.post('/api/movies', asyncHandler(async (req, res) => {
    const { title, originalTitle, year, durationMinutes, genres, director, country, suggestedBy, vibe, platform, posterUrl, trailerUrl, watchUrl, synopsis, whyWatch } = req.body;
    if (!title || !suggestedBy) {
      res.status(400).json({ error: 'Tên phim và người đề xuất là bắt buộc' });
      return;
    }

    const normalizeTitle = (value: unknown) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
    const incomingTitles = [title, originalTitle].map(normalizeTitle).filter(Boolean);
    const incomingYear = Number(year) || undefined;

    const newMovie: Movie = {
      id: `movie-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      originalTitle: originalTitle ? originalTitle.trim() : undefined,
      year: Number(year) || new Date().getFullYear(),
      durationMinutes: Number(durationMinutes) || 120,
      genres: Array.isArray(genres) && genres.length > 0 ? genres : ['Chính kịch'],
      director: director ? director.trim() : undefined,
      country: typeof country === 'string' && country.trim() ? country.trim().slice(0, 200) : undefined,
      suggestedBy: suggestedBy.trim(),
      vibe: vibe || 'Hành động đỉnh cao',
      platform: platform || 'Netflix',
      posterUrl: posterUrl?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      trailerUrl: trailerUrl?.trim() || undefined,
      watchUrl: watchUrl?.trim() || undefined,
      synopsis: synopsis ? synopsis.trim() : 'Chưa có tóm tắt chi tiết.',
      whyWatch: whyWatch ? whyWatch.trim() : 'Anh em nên xem bộ này!',
      votes: [suggestedBy.trim()], // Automatically 1 vote from submitter
      watched: false,
      createdAt: new Date().toISOString(),
    };

    await db.runTransaction(async (transaction) => {
      const existingSnapshot = await transaction.get(moviesCol);
      const duplicate = existingSnapshot.docs.find(doc => {
        const movie = doc.data() as Movie;
        const existingTitles = [movie.title, movie.originalTitle].map(normalizeTitle);
        const titleMatches = incomingTitles.some(candidate => existingTitles.includes(candidate));
        return titleMatches && (!incomingYear || !movie.year || Number(movie.year) === incomingYear);
      });
      if (duplicate) {
        const movie = duplicate.data() as Movie;
        throw Object.assign(new Error(`“${movie.title}” (${movie.year}) đã có trong kho.`), { status: 409 });
      }
      transaction.set(moviesCol.doc(newMovie.id), { ...newMovie, _order: Date.now() });
    });
    res.status(201).json(newMovie);
  }));

  app.patch('/api/movies/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { watchUrl } = req.body;
    const movie = await updateDoc<Movie>(moviesCol, id, m => {
      if (watchUrl !== undefined) {
        m.watchUrl = watchUrl ? String(watchUrl).trim() : undefined;
      }
    });
    if (!movie) {
      res.status(404).json({ error: 'Không tìm thấy phim' });
      return;
    }
    res.json(movie);
  }));

  app.delete('/api/movies/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ref = moviesCol.doc(id);
    if ((await ref.get()).exists) {
      await ref.delete();
      res.json({ success: true, id });
    } else {
      res.status(404).json({ error: 'Không tìm thấy phim' });
    }
  }));

  // Toggle vote
  app.post('/api/movies/:id/vote', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userName } = req.body;
    if (!userName || typeof userName !== 'string') {
      res.status(400).json({ error: 'Tên người vote là bắt buộc' });
      return;
    }
    const name = userName.trim();
    const movie = await updateDoc<Movie>(moviesCol, id, movie => {
      if (movie.votes.includes(name)) {
        movie.votes = movie.votes.filter(v => v !== name);
      } else {
        movie.votes.push(name);
      }
    });
    if (!movie) {
      res.status(404).json({ error: 'Không tìm thấy phim' });
      return;
    }
    res.json(movie);
  }));

  // Toggle Watched / Add Review
  app.post('/api/movies/:id/watched', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { watched, rating, comment, author, badge, markWatched } = req.body;
    const movie = await updateDoc<Movie>(moviesCol, id, movie => {
      if (typeof watched === 'boolean') {
        movie.watched = watched;
        if (watched && !movie.watchedDate) {
          movie.watchedDate = new Date().toISOString().split('T')[0];
        } else if (!watched) {
          delete movie.watchedDate;
        }
      }

      if (rating !== undefined && rating !== null && author) {
        if (!movie.reviews) {
          movie.reviews = [];
        }
        const trimmedAuthor = author.trim();
        const existingIdx = movie.reviews.findIndex(r => r.author.trim().toLowerCase() === trimmedAuthor.toLowerCase());
        const newReview: MovieReview = {
          id: existingIdx >= 0 ? movie.reviews[existingIdx].id : `rev-${Date.now()}`,
          author: trimmedAuthor,
          rating: Number(rating),
          badge: badge || 'Siêu phẩm',
          comment: comment && comment.trim() ? comment.trim() : 'Đã xem và chấm điểm',
          createdAt: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          movie.reviews[existingIdx] = newReview;
        } else {
          movie.reviews.push(newReview);
        }

        // Sync individual judge scores if author is one of the three judges
        const norm = (s: string) => s.trim().toLowerCase();
        if (norm(trimmedAuthor) === norm('Lil Teng')) movie.scoreTeng = Number(rating);
        if (norm(trimmedAuthor) === norm('Lộc')) movie.scoreLoc = Number(rating);
        if (norm(trimmedAuthor) === norm('Thành')) movie.scoreThanh = Number(rating);

        const jScores = [movie.scoreTeng, movie.scoreLoc, movie.scoreThanh].filter((s): s is number => typeof s === 'number' && Number.isFinite(s));
        if (jScores.length > 0) movie.statusBadge = '🎟️ Vé Vàng VIP';
        recalcAverage(movie);

        // Mark watched only when explicitly requested (markWatched === true) or all 3 judges have scored
        const allJudgesRated = movie.scoreTeng !== undefined && movie.scoreLoc !== undefined && movie.scoreThanh !== undefined;

        if (markWatched === true || allJudgesRated) {
          movie.watched = true;
          if (!movie.watchedDate) {
            movie.watchedDate = new Date().toISOString().split('T')[0];
          }
        }
      }
    });
    if (!movie) {
      res.status(404).json({ error: 'Không tìm thấy phim' });
      return;
    }
    await evaluateArchiveEggs(movie).catch(err => console.error('Easter egg evaluation failed', err));
    res.json(movie);
  }));

  // Delete review and rating
  app.delete('/api/movies/:id/reviews/:reviewId', asyncHandler(async (req, res) => {
    const { id, reviewId } = req.params;
    const movie = await updateDoc<Movie>(moviesCol, id, movie => {
      if (!movie.reviews) return;
      const targetReview = movie.reviews.find(r => r.id === reviewId);
      if (!targetReview) return;

      movie.reviews = movie.reviews.filter(r => r.id !== reviewId);

      // If author was a judge, clear their score
      const norm = (s: string) => s.trim().toLowerCase();
      if (norm(targetReview.author) === norm('Lil Teng')) delete movie.scoreTeng;
      if (norm(targetReview.author) === norm('Lộc')) delete movie.scoreLoc;
      if (norm(targetReview.author) === norm('Thành')) delete movie.scoreThanh;

      const jScores = [movie.scoreTeng, movie.scoreLoc, movie.scoreThanh].filter((s): s is number => typeof s === 'number' && Number.isFinite(s));
      if (jScores.length === 0) delete movie.statusBadge;
      recalcAverage(movie);
    });
    if (!movie) {
      res.status(404).json({ error: 'Không tìm thấy phim' });
      return;
    }
    await evaluateArchiveEggs(movie).catch(err => console.error('Easter egg evaluation failed', err));
    res.json(movie);
  }));

  // Save the judges' scores (null = not scored yet): marks the movie watched with the VIP gold ticket
  app.post('/api/movies/:id/scores', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { scoreTeng, scoreLoc, scoreThanh, adminNote } = req.body;
    const scores = [scoreTeng, scoreLoc, scoreThanh].map(s => (s === null || s === undefined ? null : Number(s)));
    if (scores.some(s => s !== null && (!Number.isFinite(s) || s < 0 || s > 10))) {
      res.status(400).json({ error: 'Điểm phải là số từ 0 đến 10' });
      return;
    }

    const movie = await updateDoc<Movie>(moviesCol, id, movie => {
      applyJudgeScores(movie, scores);
      movie.adminNote = typeof adminNote === 'string' ? adminNote.trim() : '';
      movie.statusBadge = '🎟️ Vé Vàng VIP';
      movie.watched = true;
      if (!movie.watchedDate) {
        movie.watchedDate = new Date().toISOString().split('T')[0];
      }
    });
    if (!movie) {
      res.status(404).json({ error: 'Không tìm thấy phim' });
      return;
    }
    await evaluateArchiveEggs(movie).catch(err => console.error('Easter egg evaluation failed', err));
    res.json(movie);
  }));

  // Easter eggs: the shared ledger (seen-state is kept per viewer in the browser)
  app.get('/api/eggs', asyncHandler(async (_req, res) => {
    const snap = await eggsCol.orderBy('createdAt').get();
    res.json(snap.docs.map(d => d.data()));
  }));

  // R3 The Prophecy: a member files a guess BEFORE the reel moves. The server timestamp
  // is the provenance, so a lucky guess cannot be claimed after the result is known.
  app.post('/api/eggs/prophecy', asyncHandler(async (req, res) => {
    const { operationId, guessMovieId, member } = req.body;
    if (typeof operationId !== 'string' || typeof guessMovieId !== 'string' || typeof member !== 'string' || !member.trim()) {
      res.status(400).json({ error: 'Thiếu thông tin lời tiên tri' });
      return;
    }
    try {
      await propheciesCol.doc(operationId).create({ operationId, guessMovieId, member: member.trim(), createdAt: new Date().toISOString() });
    } catch (err) {
      if ((err as { code?: number }).code === 6) {
        res.status(409).json({ error: 'Lượt quay này đã có lời tiên tri' });
        return;
      }
      throw err;
    }
    res.status(201).json({ filed: true });
  }));

  // A finished spin: NEAR_MISS when the fake-victory flourish played, DOUBLE_FEATURE when
  // the movie just vetoed came straight back, PROPHECY when the filed guess matches.
  // Presentation records only.
  app.post('/api/eggs/spin', asyncHandler(async (req, res) => {
    const { operationId, movieId, movieTitle, showedFakeVictory, vetoedMovieId } = req.body;
    if (typeof operationId !== 'string' || typeof movieId !== 'string') {
      res.status(400).json({ error: 'Thiếu operationId hoặc movieId' });
      return;
    }
    const recorded: EggId[] = [];
    if (showedFakeVictory === true && await recordEgg('NEAR_MISS', operationId, movieId, { title: String(movieTitle), presentationOnly: true })) {
      recorded.push('NEAR_MISS');
    }
    if (vetoedMovieId && String(vetoedMovieId) === movieId &&
      await recordEgg('DOUBLE_FEATURE', operationId, movieId, { title: String(movieTitle), vetoedMovieId: String(vetoedMovieId) })) {
      recorded.push('DOUBLE_FEATURE');
    }
    const prophecy = await propheciesCol.doc(operationId).get();
    if (prophecy.exists && prophecy.get('guessMovieId') === movieId &&
      await recordEgg('PROPHECY', operationId, movieId, {
        title: String(movieTitle),
        member: prophecy.get('member'),
        guessedAt: prophecy.get('createdAt'),
      })) {
      recorded.push('PROPHECY');
    }
    res.json({ recorded });
  }));

  // Third distinct screening scored from the same browser
  app.post('/api/eggs/end-credit', asyncHandler(async (req, res) => {
    const { operationId, movieIds } = req.body;
    if (typeof operationId !== 'string' || !Array.isArray(movieIds) || new Set(movieIds).size < 3) {
      res.status(400).json({ error: 'Cần 3 phim khác nhau' });
      return;
    }
    const recorded = await recordEgg('END_CREDIT_SURVIVOR', operationId, 'end-credit-survivor', {
      screenedMovieIds: movieIds.slice(-3).map(String),
      browserProfileScoped: true,
    });
    res.json({ recorded });
  }));

  // Veto cards: 3 per judge per month, shared by everyone (resets when the month changes)
  app.get('/api/veto', asyncHandler(async (_req, res) => {
    const snap = await vetoDoc.get();
    const veto = snap.data() as VetoState | undefined;
    res.json(veto && veto.month === currentVetoMonth() ? veto : freshVetoState());
  }));

  app.post('/api/veto/use', asyncHandler(async (req, res) => {
    const { judge } = req.body;
    const result = await db.runTransaction(async tx => {
      const snap = await tx.get(vetoDoc);
      const stored = snap.data() as VetoState | undefined;
      const veto = stored && stored.month === currentVetoMonth() ? stored : freshVetoState();
      if (typeof judge !== 'string' || !(judge in veto.cards)) {
        return { status: 400, body: { error: 'Giám khảo không hợp lệ' } };
      }
      if (veto.cards[judge] <= 0) {
        return { status: 409, body: { error: `${judge} đã hết Lá Bài Veto tháng này!`, ...veto } };
      }
      veto.cards[judge]--;
      tx.set(vetoDoc, veto);
      return { status: 200, body: veto };
    });
    res.status(result.status).json(result.body);
  }));

  // Weekend Sessions
  app.get('/api/sessions', asyncHandler(async (_req, res) => {
    res.json(await listDocs<WeekendSession>(sessionsCol));
  }));

  app.post('/api/sessions', asyncHandler(async (req, res) => {
    const { title, date, time, selectedMovieId, location, snackDuty, attendees } = req.body;
    const newSession: WeekendSession = {
      id: `session-${Date.now()}`,
      title: title || 'Kèo Chiếu Phim Cuối Tuần',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '09:00',
      selectedMovieId: selectedMovieId || undefined,
      location: location || 'Phòng khách anh em',
      snackDuty: Array.isArray(snackDuty) ? snackDuty : [],
      attendees: Array.isArray(attendees) ? attendees : [],
      status: 'upcoming',
    };
    await sessionsCol.doc(newSession.id).set({ ...newSession, _order: Date.now() });
    res.status(201).json(newSession);
  }));

  // Choose the movie for an existing session
  app.patch('/api/sessions/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { selectedMovieId } = req.body;
    if (typeof selectedMovieId !== 'string' || !(await moviesCol.doc(selectedMovieId).get()).exists) {
      res.status(400).json({ error: 'Phim không hợp lệ' });
      return;
    }
    const session = await updateDoc<WeekendSession>(sessionsCol, id, session => {
      session.selectedMovieId = selectedMovieId;
    });
    if (!session) {
      res.status(404).json({ error: 'Không tìm thấy buổi chiếu' });
      return;
    }
    res.json(session);
  }));

  // Check-in to session
  app.post('/api/sessions/:id/checkin', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, status, note } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Thiếu tên người tham gia' });
      return;
    }
    const session = await updateDoc<WeekendSession>(sessionsCol, id, session => {
      const existing = session.attendees.find(a => a.name.toLowerCase() === name.trim().toLowerCase());
      if (existing) {
        existing.status = status || 'going';
        if (note !== undefined) existing.note = note;
      } else {
        session.attendees.push({
          name: name.trim(),
          status: status || 'going',
          note: note || '',
        });
      }
    });
    if (!session) {
      res.status(404).json({ error: 'Không tìm thấy buổi chiếu' });
      return;
    }
    res.json(session);
  }));

  // Add snack duty
  app.post('/api/sessions/:id/snack', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { person, item } = req.body;
    if (typeof person !== 'string' || !person.trim() || typeof item !== 'string' || !item.trim()) {
      res.status(400).json({ error: 'Thiếu người phụ trách hoặc món ăn' });
      return;
    }
    const session = await updateDoc<WeekendSession>(sessionsCol, id, session => {
      session.snackDuty.push({ person: person.trim(), item: item.trim() });
    });
    if (!session) {
      res.status(404).json({ error: 'Không tìm thấy buổi chiếu' });
      return;
    }
    res.json(session);
  }));

  // Reset demo data: wipes movies, sessions, veto cards and the easter egg ledger, then writes the sample data
  app.post('/api/reset', asyncHandler(async (_req, res) => {
    await Promise.all([db.recursiveDelete(moviesCol), db.recursiveDelete(sessionsCol), db.recursiveDelete(eggsCol), db.recursiveDelete(propheciesCol), vetoDoc.delete()]);
    await writeAll({ movies: INITIAL_MOVIES, sessions: INITIAL_SESSIONS });
    res.json({ success: true, message: 'Đã khôi phục dữ liệu mẫu thành công' });
  }));

  // Static / Vite middleware
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('API error:', err);
    const status = typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number' ? err.status : 500;
    res.status(status).json({ error: status === 409 && err instanceof Error ? err.message : 'Server error' });
  });

  // Fail fast with a clear message: without credentials the Firestore client crashes the process later
  try {
    await firebaseCredential.getAccessToken();
    await seedIfEmpty();
  } catch (err) {
    console.error(
      'Không kết nối được Firestore. Đặt FIREBASE_SERVICE_ACCOUNT trong .env (nội dung file JSON service account) ' +
      'hoặc chạy trên Cloud Run với service account có quyền Cloud Datastore User.\n',
      err instanceof Error ? err.message : err
    );
    process.exit(1);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`GAY GANG CINEMA server running on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
