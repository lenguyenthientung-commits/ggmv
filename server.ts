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
import type { Movie, WeekendSession } from './src/types/cinema.ts';

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
    const { title, originalTitle, year, durationMinutes, genres, director, suggestedBy, vibe, platform, posterUrl, trailerUrl, synopsis, whyWatch } = req.body;
    if (!title || !suggestedBy) {
      res.status(400).json({ error: 'Tên phim và người đề xuất là bắt buộc' });
      return;
    }

    const newMovie: Movie = {
      id: `movie-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      originalTitle: originalTitle ? originalTitle.trim() : undefined,
      year: Number(year) || new Date().getFullYear(),
      durationMinutes: Number(durationMinutes) || 120,
      genres: Array.isArray(genres) && genres.length > 0 ? genres : ['Chính kịch'],
      director: director ? director.trim() : undefined,
      suggestedBy: suggestedBy.trim(),
      vibe: vibe || 'Hành động đỉnh cao',
      platform: platform || 'Netflix',
      posterUrl: posterUrl?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      trailerUrl: trailerUrl?.trim() || undefined,
      synopsis: synopsis ? synopsis.trim() : 'Chưa có tóm tắt chi tiết.',
      whyWatch: whyWatch ? whyWatch.trim() : 'Anh em nên xem bộ này!',
      votes: [suggestedBy.trim()], // Automatically 1 vote from submitter
      watched: false,
      createdAt: new Date().toISOString(),
    };

    await moviesCol.doc(newMovie.id).set({ ...newMovie, _order: Date.now() });
    res.status(201).json(newMovie);
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
    const { watched, rating, comment, author, badge } = req.body;
    const movie = await updateDoc<Movie>(moviesCol, id, movie => {
      if (typeof watched === 'boolean') {
        movie.watched = watched;
        if (watched && !movie.watchedDate) {
          movie.watchedDate = new Date().toISOString().split('T')[0];
        }
      }

      if (rating && author && comment) {
        if (!movie.reviews) {
          movie.reviews = [];
        }
        movie.reviews.push({
          id: `rev-${Date.now()}`,
          author: author.trim(),
          rating: Number(rating),
          badge: badge || 'Siêu phẩm',
          comment: comment.trim(),
          createdAt: new Date().toISOString(),
        });
        movie.watched = true;
        if (!movie.watchedDate) {
          movie.watchedDate = new Date().toISOString().split('T')[0];
        }
      }
    });
    if (!movie) {
      res.status(404).json({ error: 'Không tìm thấy phim' });
      return;
    }
    res.json(movie);
  }));

  // Save the three judges' scores: marks the movie watched with the VIP gold ticket
  app.post('/api/movies/:id/scores', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { scoreTeng, scoreLoc, scoreThanh, adminNote } = req.body;
    const scores = [scoreTeng, scoreLoc, scoreThanh].map(Number);
    if (scores.some(s => !Number.isFinite(s) || s < 0 || s > 10)) {
      res.status(400).json({ error: 'Điểm phải là số từ 0 đến 10' });
      return;
    }

    const movie = await updateDoc<Movie>(moviesCol, id, movie => {
      [movie.scoreTeng, movie.scoreLoc, movie.scoreThanh] = scores;
      movie.scoreAvg = Number(((scores[0] + scores[1] + scores[2]) / 3).toFixed(2));
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
    res.json(movie);
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
      time: time || '20:30',
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

  // Reset demo data: wipes movies, sessions and veto cards, then writes the sample data
  app.post('/api/reset', asyncHandler(async (_req, res) => {
    await Promise.all([db.recursiveDelete(moviesCol), db.recursiveDelete(sessionsCol), vetoDoc.delete()]);
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
    res.status(500).json({ error: 'Lỗi máy chủ khi đọc/ghi Firestore' });
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
