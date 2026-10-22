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
import { CinemaRulesModal } from './components/CinemaRulesModal';
import { SeasonalBanner } from './components/SeasonalBanner';
import { getActiveCampaign } from './data/seasonalCampaigns';
import { ThemeId, Mode, loadTheme, loadMode, saveAppearance, applyAppearance } from './theme';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('cinebro_user') || 'Shiba';
  });

  const [activeTab, setActiveTab] = useState<'movies' | 'wheel' | 'sessions' | 'archive' | 'stats'>('movies');
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [sessions, setSessions] = useState<WeekendSession[]>(INITIAL_SESSIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cinemaModalMovie, setCinemaModalMovie] = useState<Movie | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [campaign] = useState(() => getActiveCampaign());
  const [themeId, setThemeId] = useState<ThemeId>(() => loadTheme());
  const [mode, setMode] = useState<Mode>(() => loadMode());

  // Appearance: CSS keys off <html data-theme / data-mode / data-season>
  useEffect(() => {
    applyAppearance(themeId, mode, campaign?.id ?? null);
    saveAppearance(themeId, mode);
    if (mode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const follow = () => applyAppearance(themeId, mode, campaign?.id ?? null);
    media.addEventListener('change', follow);
    return () => media.removeEventListener('change', follow);
  }, [themeId, mode, campaign]);

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
        if (Array.isArray(moviesData)) setMovies(moviesData);
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
          suggestedBy: movieData.suggestedBy || currentUser,
          vibe: movieData.vibe || 'Hành động đỉnh cao',
          platform: movieData.platform || 'Netflix',
          posterUrl: movieData.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
          trailerUrl: movieData.trailerUrl,
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
      await fetch(`/api/movies/${movie.id}/watched`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watched: updatedWatched }),
      });
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
    author: string
  ) => {
    try {
      const res = await fetch(`/api/movies/${movieId}/watched`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, badge, author }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMovies(prev => prev.map(m => (m.id === movieId ? updated : m)));
      }
    } catch {
      fetchData();
    }
  };

  // Save judges' scores (Teng, Lộc, Thành)
  const handleUpdateJudgesScore = async (
    movieId: string,
    scoreTeng: number,
    scoreLoc: number,
    scoreThanh: number,
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
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Không lưu được điểm, hãy thử lại.');
      }
    } catch {
      alert('Không kết nối được server, điểm chưa được lưu.');
    }
  };

  // Select movie for upcoming weekend
  const handleSelectForWeekend = async (movie: Movie) => {
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
    setActiveTab('sessions');
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
  const selectedWeekendMovie = movies.find(m => m.id === upcomingSession?.selectedMovieId);
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
        seasonName={campaign?.title}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
          />
        )}

        {campaign && activeTab === 'movies' && <SeasonalBanner campaign={campaign} />}

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
          />
        )}

        {/* Tab 2: Vòng Quay May Mắn (Interactive Canvas Wheel) */}
        {activeTab === 'wheel' && (
          <div>
            <RandomWheel
              movies={movies}
              currentUser={currentUser}
              onSelectForWeekend={handleSelectForWeekend}
              onOpenTrailer={(m) => setCinemaModalMovie(m)}
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
          />
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
            <span className="jp text-[12px]">シネマクラブ</span>
            <span className="label">Cùng xem · Cùng vote · Hết cãi nhau chọn phim</span>
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

      {/* Cinema Rules Modal */}
      <CinemaRulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
