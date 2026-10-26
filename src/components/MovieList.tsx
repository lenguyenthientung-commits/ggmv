import React, { useState, useMemo } from 'react';
import { Movie } from '../types/cinema';
import { MovieCard } from './MovieCard';
import { Search, RotateCcw, Plus } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { SectionHeader } from './ui';

interface MovieListProps {
  movies: Movie[];
  currentUser: string;
  onToggleVote: (movieId: string) => void;
  onMarkWatched: (movie: Movie) => void;
  onSelectForWeekend: (movie: Movie) => void;
  onOpenTrailer: (movie: Movie) => void;
  onDeleteMovie: (movieId: string) => void;
  onOpenAddModal: () => void;
  onResetData: () => void;
  onUpdateWatchUrl?: (movieId: string, watchUrl: string) => void;
  onSubmitReview?: (movieId: string, rating: number, comment: string, badge: string, author: string, markWatched?: boolean) => void;
}

type FilterTab = 'all' | 'unwatched' | 'top_voted' | 'watched';

export const MovieList: React.FC<MovieListProps> = ({
  movies,
  currentUser,
  onToggleVote,
  onMarkWatched,
  onSelectForWeekend,
  onOpenTrailer,
  onDeleteMovie,
  onOpenAddModal,
  onResetData,
  onUpdateWatchUrl,
  onSubmitReview,
}) => {
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');

  const handleTabChange = (tab: FilterTab) => {
    sounds.playVintageSwitch();
    setActiveFilterTab(tab);
  };

  // Extract all genres
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach(m => m.genres.forEach(g => set.add(g)));
    return Array.from(set);
  }, [movies]);

  // Filtered & sorted movies
  const filteredMovies = useMemo(() => {
    let list = [...movies];

    // Status filter
    if (activeFilterTab === 'unwatched') {
      list = list.filter(m => !m.watched);
    } else if (activeFilterTab === 'watched') {
      list = list.filter(m => m.watched);
    } else if (activeFilterTab === 'top_voted') {
      list.sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0));
    }

    // Genre filter
    if (genreFilter !== 'all') {
      list = list.filter(m => m.genres.includes(genreFilter));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        m =>
          m.title.toLowerCase().includes(q) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(q)) ||
          m.suggestedBy.toLowerCase().includes(q) ||
          (m.director && m.director.toLowerCase().includes(q)) ||
          m.genres.some(g => g.toLowerCase().includes(q))
      );
    }

    return list;
  }, [movies, activeFilterTab, genreFilter, searchQuery]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: `Tất cả ${movies.length}` },
    { id: 'unwatched', label: `Chưa xem ${movies.filter(m => !m.watched).length}` },
    { id: 'top_voted', label: 'Top vote' },
    { id: 'watched', label: `Đã xem ${movies.filter(m => m.watched).length}` },
  ];

  return (
    <section>
      <SectionHeader
        jp="ライブラリ"
        kicker={`${movies.length} cuộn phim`}
        title="Kho phim"
        description="Mọi phim anh em muốn xem. Vote càng nhiều, cơ hội lên vòng quay càng lớn."
      />

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-8">
        <div className="seg self-start">
          {tabs.map(t => (
            <button key={t.id} aria-pressed={activeFilterTab === t.id} onClick={() => handleTabChange(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm phim, người đề xuất…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input !pl-9"
              aria-label="Tìm phim"
            />
          </div>

          <select
            value={genreFilter}
            onChange={(e) => {
              sounds.playVintageSwitch();
              setGenreFilter(e.target.value);
            }}
            className="input !w-auto max-w-[44vw] sm:max-w-none"
            aria-label="Lọc thể loại"
          >
            <option value="all">Mọi thể loại</option>
            {allGenres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button
            onClick={() => {
              if (window.confirm('Khôi phục danh sách phim mẫu mặc định?')) {
                sounds.playVintageSwitch();
                onResetData();
              }
            }}
            className="btn-icon shrink-0"
            title="Khôi phục dữ liệu mẫu"
            aria-label="Khôi phục dữ liệu mẫu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-10">
          {filteredMovies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              currentUser={currentUser}
              onToggleVote={onToggleVote}
              onMarkWatched={onMarkWatched}
              onSelectForWeekend={onSelectForWeekend}
              onOpenTrailer={onOpenTrailer}
              onDeleteMovie={onDeleteMovie}
              onUpdateWatchUrl={onUpdateWatchUrl}
              onSubmitReview={onSubmitReview}
            />
          ))}
        </div>
      ) : (
        <div className="panel screentone py-16 px-6 text-center">
          <div className="inline-block bg-card px-6 py-5 rounded-lg border-[1.5px] border-ink">
            <div className="display text-[40px]">Trống trơn</div>
            <p className="mt-2 text-[14px] text-ink-2 max-w-xs">Không phim nào khớp bộ lọc. Thử từ khóa khác hoặc thêm phim mới.</p>
            <button
              onClick={() => {
                sounds.playVintageSwitch();
                onOpenAddModal();
              }}
              className="btn btn-primary mt-5"
            >
              <Plus className="w-4 h-4" strokeWidth={2.75} />
              Thêm phim
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
