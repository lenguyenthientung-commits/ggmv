import React, { useState, useMemo } from 'react';
import { Movie } from '../types/cinema';
import { MovieCard } from './MovieCard';
import { Search, Film, Sparkles, Filter, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

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

  return (
    <div className="space-y-6">
      {/* Controls Bar: Filter tabs + Search + Reset */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#140f0c]/90 border border-amber-900/35 backdrop-blur-md shadow-lg art-deco-frame">
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-[#0b0806] rounded-xl overflow-x-auto border border-amber-900/30">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeFilterTab === 'all'
                ? 'bg-[#221a15] text-amber-300 shadow-xs border border-amber-600/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Tất cả ({movies.length})
          </button>

          <button
            onClick={() => handleTabChange('unwatched')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeFilterTab === 'unwatched'
                ? 'bg-[#221a15] text-amber-300 shadow-xs border border-amber-600/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Chưa xem ({movies.filter(m => !m.watched).length})
          </button>

          <button
            onClick={() => handleTabChange('top_voted')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeFilterTab === 'top_voted'
                ? 'bg-[#221a15] text-amber-300 shadow-xs border border-amber-600/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Top Vote 🔥
          </button>

          <button
            onClick={() => handleTabChange('watched')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeFilterTab === 'watched'
                ? 'bg-[#221a15] text-amber-300 shadow-xs border border-amber-600/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Đã chiếu ({movies.filter(m => m.watched).length})
          </button>
        </div>

        {/* Search & Genre Select */}
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Tìm phim, người đề xuất..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0b0806] border border-amber-900/40 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Genre Filter */}
          <select
            value={genreFilter}
            onChange={(e) => {
              sounds.playVintageSwitch();
              setGenreFilter(e.target.value);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-[#0b0806] border border-amber-900/40 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả thể loại</option>
            {allGenres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Reset Demo Data button */}
          <button
            onClick={() => {
              if (window.confirm('Khôi phục danh sách phim mẫu mặc định?')) {
                sounds.playVintageSwitch();
                onResetData();
              }
            }}
            className="p-2 rounded-lg bg-[#0b0806] border border-amber-900/40 hover:border-amber-700 text-stone-400 hover:text-amber-300 text-xs transition-colors"
            title="Khôi phục dữ liệu mẫu ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Movies */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
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
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-3xl border border-amber-900/40 bg-[#140f0c]/60 p-12 text-center max-w-lg mx-auto art-deco-frame">
          <Film className="w-12 h-12 text-amber-800 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white font-cinema">
            Không tìm thấy cuộn phim nào
          </h3>
          <p className="text-xs text-stone-400 mt-1.5 mb-6">
            Không có phim nào thỏa mãn điều kiện lọc hoặc từ khóa tìm kiếm.
          </p>
          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onOpenAddModal();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-colors inline-flex items-center gap-2 uppercase tracking-wider font-cinema"
          >
            <Sparkles className="w-4 h-4" />
            <span>Thêm Cuộn Phim Đầu Tiên</span>
          </button>
        </div>
      )}
    </div>
  );
};

