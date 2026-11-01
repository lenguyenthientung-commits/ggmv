import React, { useState, useEffect, useCallback } from 'react';
import { Movie, WeekendSession } from './types/cinema';
import { INITIAL_MOVIES, INITIAL_SESSIONS } from './data/initialData';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { MovieList } from './components/MovieList';
import { RandomWheel } from './components/RandomWheel';
import { WeekendSessionSection } from './components/WeekendSessionSection';
import { WatchedArchive } from './components/WatchedArchive';
import { AddMovieModal } from './components/AddMovieModal';
import { CinemaScreenModal } from './components/CinemaScreenModal';
import { MovieStats } from './components/MovieStats';
import { MemberAchievements } from './components/MemberAchievements';
import { CinemaRulesModal } from './components/CinemaRulesModal';
import { ThemeId, Mode, loadTheme, loadMode, saveAppearance, applyAppearance } from './theme';
import { WorldPref, loadWorldPref, saveWorldPref, resolveWorld, worldById } from './seasons/worlds';
import { WorldCurtain } from './seasons/WorldCurtain';
import { EggEvent, DEFAULT_HOUSE_NOTE, takeUnseenEvents, markSurface, hasCrossSurfaceVisit } from './easterEggs';
import { ProjectorDust, IntermissionCard, BadgeToast, FxLayer, CinemaFactTrigger, HiddenCameo, ShibaUsher, SymmetryTitle, badgeCopy } from './components/EasterEggs';
import { clubBadges, archiveBadgeIds, takeNewArchiveBadges, findBadge } from './badges';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('cinebro_user') || 'Shiba';
  });

  const [activeTab, setActiveTab] = useState<'movies' | 'wheel' | 'sessions' | 'archive' | 'achievements' | 'stats'>('movies');
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [sessions, setSessions] = useState<WeekendSession[]>(INITIAL_SESSIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cinemaModalMovie, setCinemaModalMovie] = useState<Movie | null>(null);
  const [pendingScoreId, setPendingScoreId] = useState<string | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [themeId, setThemeId] = useState<ThemeId>(() => loadTheme());
  const [mode, setMode] = useState<Mode>(() => loadMode());

  // Seasonal world ("Linh hồn & Thể xác"): opt-in, off by default
  const [worldPref, setWorldPrefState] = useState<WorldPref>(() => loadWorldPref());
  const world = worldById(resolveWorld(worldPref));
  const [curtainFor, setCurtainFor] = useState<string | null>(null);
  const setWorldPref = (pref: WorldPref) => {
    saveWorldPref(pref);
    setWorldPrefState(pref);
    const next = resolveWorld(pref);
    if (next && next !== world?.id) setCurtainFor(next); // entering a new world
  };
  const closeCurtain = useCallback(() => setCurtainFor(null), []);

  // Appearance: CSS keys off <html data-theme / data-mode / data-world>
  useEffect(() => {
    applyAppearance(themeId, mode, world?.id ?? null);
    saveAppearance(themeId, mode);
    if (mode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const follow = () => applyAppearance(themeId, mode, world?.id ?? null);
    media.addEventListener('change', follow);
    return () => media.removeEventListener('change', follow);
  }, [themeId, mode, world?.id]);

  // Persist user selection
  const handleSetUser = (name: string) => {
    setCurrentUser(name);
    localStorage.setItem('cinebro_user', name);
  };

  // Fetch initial data from server
  const fetchData = useCallback(async () => {
    try {
      const [resMovies, resSessions] = await Promise.all([
        fetch('/api/movies'),
        fetch('/api/sessions'),
      ]);
      if (resMovies.ok) {
        const moviesData = await resMovies.json();
        if (Array.isArray(moviesData)) {
          setMovies(moviesData);
          setMoviesLoaded(true);
        }
      }
      if (resSessions.ok) {
        const sessionsData = await resSessions.json();
        if (Array.isArray(sessionsData)) setSessions(sessionsData);
      }
    } catch {
      // Fallback already populated with INITIAL_MOVIES and INITIAL_SESSIONS
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Easter eggs: shared ledger + a toast the first time this viewer meets each badge
  const [eggEvents, setEggEvents] = useState<EggEvent[]>([]);
  const [toastQueue, setToastQueue] = useState<string[]>([]);
  const [moviesLoaded, setMoviesLoaded] = useState(false);
  const [creditShifted, setCreditShifted] = useState(() => hasCrossSurfaceVisit());
  const dismissToast = useCallback(() => setToastQueue(q => q.slice(1)), []);

  const fetchEggs = useCallback(async () => {
    try {
      const res = await fetch('/api/eggs');
      if (!res.ok) return;
      const events: EggEvent[] = await res.json();
      setEggEvents(events);
      const unseen = takeUnseenEvents(events);
      const unseenKeys = new Set(unseen.map(e => e.key));
      const known = new Set(events.filter(e => !unseenKeys.has(e.key)).map(e => e.eggId));
      const firsts = [...new Set(unseen.map(e => e.eggId))].filter(id => !known.has(id));
      if (firsts.length) setToastQueue(q => [...q, ...firsts]);
    } catch {
      // eggs are optional: never surface an error for them
    }
  }, []);

  useEffect(() => {
    fetchEggs();
  }, [fetchEggs]);

  // Archive milestones are computed here, so this viewer is told about new ones here too
  useEffect(() => {
    if (!moviesLoaded) return;
    const unlocked = clubBadges(movies, []).filter(b => b.unlocked && archiveBadgeIds.includes(b.id)).map(b => b.id);
    const fresh = takeNewArchiveBadges(unlocked);
    if (fresh.length) setToastQueue(q => [...q, ...fresh]);
  }, [movies, moviesLoaded]);

  // Secret badges announce themselves from anywhere in the app
  useEffect(() => {
    const onBadge = (e: Event) => setToastQueue(q => [...q, (e as CustomEvent<string>).detail]);
    window.addEventListener('ggmv:badge', onBadge);
    return () => window.removeEventListener('ggmv:badge', onBadge);
  }, []);

  // C4 footer credit: the wheel and the archive both visited in one sitting
  useEffect(() => {
    if (activeTab === 'wheel' || activeTab === 'archive') {
      if (markSurface(activeTab)) setCreditShifted(true);
    }
  }, [activeTab]);

  // Handle add movie
  const handleAddMovie = async (movieData: Partial<Movie>) => {
    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData),
      });
      if (res.ok) {
        const savedMovie = await res.json();
        setMovies(prev => [savedMovie, ...prev]);
      } else {
        // Optimistic local fallback
        const fallbackMovie: Movie = {
          id: `movie-${Date.now()}`,
          title: movieData.title || 'Phim mới',
          originalTitle: movieData.originalTitle,
          year: movieData.year || 2024,
          durationMinutes: movieData.durationMinutes || 120,
          genres: movieData.genres || ['Chính kịch'],
          director: movieData.director,
          country: movieData.country,
          suggestedBy: movieData.suggestedBy || currentUser,
          vibe: movieData.vibe || 'Hành động đỉnh cao',
          platform: movieData.platform || 'Netflix',
          posterUrl: movieData.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
          trailerUrl: movieData.trailerUrl,
          watchUrl: movieData.watchUrl,
          synopsis: movieData.synopsis || '',
          whyWatch: movieData.whyWatch || '',
          votes: [currentUser],
          watched: false,
          createdAt: new Date().toISOString(),
        };
        setMovies(prev => [fallbackMovie, ...prev]);
      }
    } catch {
      // Offline fallback
    }
  };

  // Handle update watchUrl for existing movie
  const handleUpdateWatchUrl = async (movieId: string, watchUrl: string) => {
    const cleaned = watchUrl ? watchUrl.trim() : undefined;
    setMovies(prev => prev.map(m => m.id === movieId ? { ...m, watchUrl: cleaned } : m));
    try {
      await fetch(`/api/movies/${movieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchUrl: cleaned || '' }),
      });
    } catch (err) {
      console.error('Failed to update watchUrl:', err);
    }
  };

  // Handle delete movie
  const handleDeleteMovie = async (movieId: string) => {
    setMovies(prev => prev.filter(m => m.id !== movieId));
    try {
      await fetch(`/api/movies/${movieId}`, { method: 'DELETE' });
    } catch {
      // Silent error
    }
  };

  // Handle toggle vote
  const handleToggleVote = async (movieId: string) => {
    // Optimistic update
    setMovies(prev =>
      prev.map(m => {
        if (m.id !== movieId) return m;
        const hasVoted = m.votes?.includes(currentUser);
        const newVotes = hasVoted
          ? m.votes.filter(v => v !== currentUser)
          : [...(m.votes || []), currentUser];
        return { ...m, votes: newVotes };
      })
    );

    try {
      await fetch(`/api/movies/${movieId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: currentUser }),
      });
    } catch {
      // Revert if error
      fetchData();
    }
  };

  // Handle mark watched / review
  const handleMarkWatched = async (movie: Movie) => {
    const updatedWatched = !movie.watched;
    setMovies(prev =>
      prev.map(m =>
        m.id === movie.id
          ? {
              ...m,
              watched: updatedWatched,
              watchedDate: updatedWatched ? new Date().toISOString().split('T')[0] : undefined,
            }
          : m
      )
    );

    try {
      const res = await fetch(`/api/movies/${movie.id}/watched`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watched: updatedWatched }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMovies(prev => prev.map(m => (m.id === movie.id ? updated : m)));
      }
      fetchEggs();
    } catch {
      fetchData();
    }
  };

  // Submit review
  const handleSubmitReview = async (
    movieId: string,
    rating: number,
    comment: string,
    badge: string,
    author: string,
    markWatched?: boolean
  ) => {
    try {
      const res = await fetch(`/api/movies/${movieId}/watched`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, badge, author, markWatched }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMovies(prev => prev.map(m => (m.id === movieId ? updated : m)));
        fetchEggs();
      }
    } catch {
      fetchData();
    }
  };

  // Save judges' scores (Teng, Lộc, Thành)
  const handleUpdateJudgesScore = async (
    movieId: string,
    scoreTeng: number | null,
    scoreLoc: number | null,
    scoreThanh: number | null,
    adminNote: string
  ) => {
    try {
      const res = await fetch(`/api/movies/${movieId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreTeng, scoreLoc, scoreThanh, adminNote }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMovies(prev => prev.map(m => (m.id === movieId ? updated : m)));
        fetchEggs();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Không lưu được điểm, hãy thử lại.');
      }
    } catch {
      alert('Không kết nối được server, điểm chưa được lưu.');
    }
  };

  const assignToSession = async (movie: Movie) => {
    const firstSession = sessions[0];
    if (firstSession) {
      const updated = { ...firstSession, selectedMovieId: movie.id };
      setSessions(prev => [updated, ...prev.slice(1)]);
      try {
        await fetch(`/api/sessions/${firstSession.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedMovieId: movie.id }),
        });
      } catch {
        // Fallback
      }
    }
  };

  // Select movie for upcoming weekend
  const handleSelectForWeekend = async (movie: Movie) => {
    await assignToSession(movie);
    setActiveTab('sessions');
  };

  // The wheel is spun on the day, so locking a film in means it is being watched now:
  // it joins the ranking straight away and the scoring sheet opens there.
  const handleLockIn = (movie: Movie) => {
    assignToSession(movie);
    if (!movie.watched) handleMarkWatched(movie);
    setPendingScoreId(movie.id);
    setActiveTab('archive');
  };

  // Attendee Check-in
  const handleCheckin = async (
    sessionId: string,
    name: string,
    status: 'going' | 'late' | 'maybe' | 'busy',
    note?: string
  ) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s;
        const existing = s.attendees.find(a => a.name.toLowerCase() === name.toLowerCase());
        let updatedAttendees = [...s.attendees];
        if (existing) {
          updatedAttendees = updatedAttendees.map(a =>
            a.name.toLowerCase() === name.toLowerCase() ? { ...a, status, note } : a
          );
        } else {
          updatedAttendees.push({ name, status, note });
        }
        return { ...s, attendees: updatedAttendees };
      })
    );

    try {
      await fetch(`/api/sessions/${sessionId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, status, note }),
      });
    } catch {
      fetchData();
    }
  };

  // Add snack duty
  const handleAddSnack = async (sessionId: string, person: string, item: string) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          snackDuty: [...s.snackDuty, { person, item }],
        };
      })
    );

    try {
      await fetch(`/api/sessions/${sessionId}/snack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person, item }),
      });
    } catch {
      fetchData();
    }
  };

  // Create new session
  const handleCreateSession = async (newSession: Partial<WeekendSession>) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      if (res.ok) {
        const created = await res.json();
        setSessions(prev => [created, ...prev]);
      }
    } catch {
      fetchData();
    }
  };

  // Reset Demo Data
  const handleResetData = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        setMovies(INITIAL_MOVIES);
        setSessions(INITIAL_SESSIONS);
      }
    } catch {
      setMovies(INITIAL_MOVIES);
      setSessions(INITIAL_SESSIONS);
    }
  };

  const upcomingSession = sessions[0];
  const selectedWeekendMovie = movies.find(m => m.id === upcomingSession?.selectedMovieId && !m.watched);
  const featuredMovies = movies
    .filter(m => !m.watched)
    .sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={handleSetUser}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        themeId={themeId}
        setThemeId={setThemeId}
        mode={mode}
        setMode={setMode}
        houseNote={DEFAULT_HOUSE_NOTE}
        world={world}
        worldPref={worldPref}
        setWorldPref={setWorldPref}
      />

      {/* Main Container */}
      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <HiddenCameo key={activeTab} movies={movies} />
        <SymmetryTitle />

        {/* Hero: home tab only */}
        {activeTab === 'movies' && (
          <HeroBanner
            moviesCount={movies.filter(m => !m.watched).length}
            watchedCount={movies.filter(m => m.watched).length}
            upcomingSession={upcomingSession}
            selectedMovie={selectedWeekendMovie}
            featuredMovies={featuredMovies}
            onSpinClick={() => setActiveTab('wheel')}
            onAddMovieClick={() => setIsAddModalOpen(true)}
            onOpenSession={() => setActiveTab('sessions')}
            world={world}
          />
        )}

        {/* Tab 1: Kho Phim (Watchlist Vault) */}
        {activeTab === 'movies' && (
          <MovieList
            movies={movies}
            currentUser={currentUser}
            onToggleVote={handleToggleVote}
            onMarkWatched={handleMarkWatched}
            onSelectForWeekend={handleSelectForWeekend}
            onOpenTrailer={(m) => setCinemaModalMovie(m)}
            onDeleteMovie={handleDeleteMovie}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onResetData={handleResetData}
            onUpdateWatchUrl={handleUpdateWatchUrl}
            onSubmitReview={handleSubmitReview}
          />
        )}

        {/* Tab 2: Vòng Quay May Mắn (Interactive Canvas Wheel) */}
        {activeTab === 'wheel' && (
          <div>
            <RandomWheel
              movies={movies}
              currentUser={currentUser}
              onLockIn={handleLockIn}
              onOpenTrailer={(m) => setCinemaModalMovie(m)}
              onEggsChanged={fetchEggs}
            />
          </div>
        )}

        {/* Tab 3: Lịch Chiếu Cuối Tuần (Weekend Session & Snacks) */}
        {activeTab === 'sessions' && (
          <WeekendSessionSection
            sessions={sessions}
            movies={movies}
            currentUser={currentUser}
            onCheckin={handleCheckin}
            onAddSnack={handleAddSnack}
            onOpenCinemaRoom={(m) => setCinemaModalMovie(m)}
            onCreateSession={handleCreateSession}
          />
        )}

        {/* Tab 4: Phòng Truyền Thống / Nhật Ký Đã Xem (Watched Archive) */}
        {activeTab === 'archive' && (
          <WatchedArchive
            movies={movies}
            currentUser={currentUser}
            onOpenRules={() => setIsRulesOpen(true)}
            onSubmitReview={handleSubmitReview}
            onUpdateJudgesScore={handleUpdateJudgesScore}
            scoreMovieId={pendingScoreId}
            onScoreOpened={() => setPendingScoreId(null)}
            eggEvents={eggEvents}
            onEggsChanged={fetchEggs}
          />
        )}
        {activeTab === 'archive' && <ProjectorDust />}
        {activeTab === 'archive' && <IntermissionCard movies={movies} />}

        {/* Tab: Thành tích cá nhân (per-member badges) */}
        {activeTab === 'achievements' && (
          <MemberAchievements movies={movies} eggEvents={eggEvents} currentUser={currentUser} />
        )}

        {/* Tab 5: Thống Kê Điện Ảnh (MovieStats with Recharts) */}
        {activeTab === 'stats' && (
          <MovieStats
            movies={movies}
          />
        )}
      </main>

      {/* Footer: the wordmark as the closing title card */}
      <footer className="mt-16 border-t-[1.5px] border-ink overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-3">
              <ShibaUsher />
              <CinemaFactTrigger />
            </span>
            <span className="label">
              {creditShifted
                ? 'Continuity supervised by three people who disagree about everything.'
                : world?.signoff ?? 'Cùng xem · Cùng vote · Hết cãi nhau chọn phim'}
            </span>
          </div>
          <div className="display mt-6 text-[clamp(56px,15.5vw,210px)] leading-[0.82] select-none">
            Gay Gang <span className="text-accent">Cinema</span>
          </div>
        </div>
      </footer>

      {/* Add Movie Modal */}
      <AddMovieModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={currentUser}
        onAddMovie={handleAddMovie}
      />

      {/* Cinema Screening / Trailer Modal */}
      <CinemaScreenModal
        movie={cinemaModalMovie}
        onClose={() => setCinemaModalMovie(null)}
        currentUser={currentUser}
      />

      {curtainFor && worldById(curtainFor) && <WorldCurtain world={worldById(curtainFor)!} onDone={closeCurtain} />}

      {toastQueue.length > 0 && findBadge(toastQueue[0], movies, eggEvents) && (
        <BadgeToast key={toastQueue[0]} badge={findBadge(toastQueue[0], movies, eggEvents)!} copy={badgeCopy(toastQueue[0])} onDone={dismissToast} />
      )}
      <FxLayer />

      {/* Cinema Rules Modal */}
      <CinemaRulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
