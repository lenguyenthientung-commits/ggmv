import React, { useState, useEffect, useRef } from 'react';
import { Film, Sparkles, X, Clapperboard, Search, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Movie } from '../types/cinema';
import { BROTHERS_LIST } from './Header';
import { sounds } from '../utils/soundEffects';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  onAddMovie: (movieData: Partial<Movie>) => void;
}

interface OmdbSearchResult {
  imdbID: string;
  title: string;
  year: string;
  poster: string | null;
}

const COMMON_GENRES = [
  'Hành động',
  'Khoa học viễn tưởng',
  'Kinh dị',
  'Hài hước',
  'Kịch tính',
  'Tâm lý',
  'Phiêu lưu',
  'Hoạt hình',
  'Tội phạm',
  'Võ thuật',
  'Gia đình',
];

export const AddMovieModal: React.FC<AddMovieModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddMovie,
}) => {
  // Smart Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<OmdbSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [director, setDirector] = useState('');
  const [suggestedBy, setSuggestedBy] = useState(currentUser);
  const [vibe, setVibe] = useState('Hành động đỉnh cao');
  const [platform, setPlatform] = useState<Movie['platform']>('Netflix');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Hành động']);
  const [posterUrl, setPosterUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [whyWatch, setWhyWatch] = useState('');

  // Handle live debounced search as user types in the Smart Search box
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/omdb/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          setSearchResults(data.results);
          setShowDropdown(data.results.length > 0);
        } else {
          setSearchResults([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  if (!isOpen) return null;

  // Select a movie from search results to autofill everything
  const handleSelectMovie = async (item: OmdbSearchResult) => {
    sounds.playVintageSwitch();
    setShowDropdown(false);
    setIsLoadingDetails(true);
    setAutofillSuccess(null);

    try {
      const res = await fetch(`/api/omdb/details?imdbID=${encodeURIComponent(item.imdbID)}`);
      const details = await res.json();

      if (details.title) {
        setTitle(details.title);
        setOriginalTitle(details.originalTitle || details.title);
        setYear(Number(details.year) || new Date().getFullYear());
        setDurationMinutes(Number(details.durationMinutes) || 120);
        setDirector(details.director || '');
        if (Array.isArray(details.genres) && details.genres.length > 0) {
          setSelectedGenres(details.genres);
        }
        if (details.posterUrl) {
          setPosterUrl(details.posterUrl);
        }
        if (details.synopsis) {
          setSynopsis(details.synopsis);
        }
        if (details.vibe) {
          setVibe(details.vibe);
        }
        // Auto-generate YouTube search trailer link
        setTrailerUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(details.title + ' ' + (details.year || '') + ' official trailer')}`);

        // Suggest a funny brotherly pitch
        if (!whyWatch) {
          setWhyWatch(`Phim đạt ${details.imdbRating ? details.imdbRating + '★ trên IMDb' : 'đánh giá cao'}, đạo diễn ${details.director || 'xịn'}, anh em cuối tuần không xem thì phí!`);
        }

        setAutofillSuccess(`Đã tự động điền thông tin phim "${details.title}" (${details.year}) từ IMDb!`);
        setTimeout(() => setAutofillSuccess(null), 6000);
      }
    } catch (err) {
      console.error('Failed to load movie details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const toggleGenre = (genre: string) => {
    sounds.playVintageSwitch();
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sounds.playVintageSwitch();
    onAddMovie({
      title: title.trim(),
      originalTitle: originalTitle.trim() || undefined,
      year: Number(year),
      durationMinutes: Number(durationMinutes),
      director: director.trim() || undefined,
      suggestedBy: suggestedBy.trim() || currentUser,
      vibe,
      platform,
      genres: selectedGenres,
      posterUrl:
        posterUrl.trim() ||
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      trailerUrl: trailerUrl.trim() || undefined,
      synopsis: synopsis.trim() || 'Một bộ phim xuất sắc do anh em đề xuất.',
      whyWatch: whyWatch.trim() || 'Phim hay anh em xem cuối tuần nhé!',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#140f0c] border brass-border shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden my-6 art-deco-frame">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/30 bg-[#0e0b09]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#faf5ee] font-cinema">
                Bỏ Cuộn Phim Mới Vào Kho
              </h2>
              <p className="text-[11px] text-stone-400 font-sans">
                Tự động điền qua IMDb/OMDB hoặc tùy chỉnh thủ công
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onClose();
            }}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SMART AUTOFILL SEARCH BAR */}
        <div className="px-6 py-4 bg-gradient-to-b from-[#1a130f] to-[#140f0c] border-b border-amber-900/40 relative">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-cinema">
              Tìm kiếm thông minh & Tự động điền (OMDB API):
            </span>
          </div>

          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Gõ tên phim bất kỳ... (VD: Inception, Dune, Oppenheimer, Shutter Island, Parasite...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                className="w-full bg-[#0b0806] border border-amber-600/50 rounded-xl pl-10 pr-24 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 shadow-inner"
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                {isSearching || isLoadingDetails ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <span className="text-[10px] font-mono text-stone-500 bg-[#1c1511] px-2 py-0.5 rounded border border-stone-800">
                    IMDb
                  </span>
                )}
              </div>
            </div>

            {/* Autofill Search Results Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-[#0e0b09] border border-amber-500/50 shadow-2xl z-30 max-h-64 overflow-y-auto divide-y divide-stone-800/60">
                {searchResults.map((item) => (
                  <button
                    key={item.imdbID}
                    type="button"
                    onClick={() => handleSelectMovie(item)}
                    className="w-full text-left p-2.5 flex items-center gap-3 hover:bg-amber-500/10 transition-colors group"
                  >
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-8 h-12 object-cover rounded shadow border border-stone-700 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-12 bg-stone-900 rounded flex items-center justify-center shrink-0 border border-stone-800">
                        <Film className="w-4 h-4 text-stone-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-stone-200 group-hover:text-amber-300 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>{item.year}</span>
                        <span>·</span>
                        <span className="text-amber-500/90 font-mono text-[10px]">{item.imdbID}</span>
                      </div>
                    </div>
                    <div className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-semibold pr-2">
                      <span>Điền ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Autofill Success Banner */}
          {autofillSuccess && (
            <div className="mt-2.5 p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/40 flex items-center gap-2 text-xs text-emerald-200 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{autofillSuccess}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[62vh] overflow-y-auto">
          {/* Row 1: Title & Original Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Tên phim tiếng Việt / Tên hiển thị *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Kỵ Sĩ Bóng Đêm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Tên gốc (Original Title)
              </label>
              <input
                type="text"
                placeholder="VD: The Dark Knight (2008)"
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
                className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Row 2: Year, Duration, Director */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Năm phát hành
              </label>
              <input
                type="number"
                min="1920"
                max="2035"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                min="15"
                max="400"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Đạo diễn
              </label>
              <input
                type="text"
                placeholder="VD: Christopher Nolan"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Row 3: Genres interactive buttons */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Thể loại (chọn ít nhất 1)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_GENRES.map((g) => {
                const isSelected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors border ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                        : 'bg-[#18120e] border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Suggested By & Platform & Vibe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Người đề xuất *
              </label>
              <select
                value={suggestedBy}
                onChange={(e) => setSuggestedBy(e.target.value)}
                className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {BROTHERS_LIST.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Xem trên nền tảng
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Movie['platform'])}
                className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Netflix">Netflix</option>
                <option value="HBO Max">HBO Max</option>
                <option value="VieON">VieON</option>
                <option value="FPT Play">FPT Play</option>
                <option value="Torrent/Stremio">Torrent / Stremio</option>
                <option value="Rạp">Chiếu rạp</option>
                <option value="Khác">Khác / Web lậu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Vibe / Cảm xúc
              </label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Hành động đỉnh cao">Hành động đỉnh cao</option>
                <option value="Hài bựa">Hài bựa giải trí</option>
                <option value="Căng não">Căng não hại não</option>
                <option value="Kinh dị thót tim">Kinh dị thót tim</option>
                <option value="Ấm áp hoài niệm">Ấm áp hoài niệm</option>
              </select>
            </div>
          </div>

          {/* Row 5: URLs (Poster & Trailer) with Live Poster Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Link ảnh Poster (URL hình ảnh)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Link YouTube Trailer (tùy chọn)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Poster Thumbnail Preview */}
            <div className="sm:col-span-4 flex justify-center">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt="Poster preview"
                  className="h-28 w-20 object-cover rounded-lg border border-amber-600/40 shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-28 w-20 rounded-lg border border-dashed border-stone-800 flex flex-col items-center justify-center text-stone-600 text-[10px] text-center p-1">
                  <Film className="w-5 h-5 mb-1" />
                  <span>Chưa có poster</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 6: Synopsis */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Tóm tắt nội dung ngắn
            </label>
            <textarea
              rows={2}
              placeholder="Vài câu giới thiệu cốt truyện..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full bg-[#0b0806] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
            />
          </div>

          {/* Row 7: Why Watch (Brotherly pitch) */}
          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              Lý do khuyên anh em nên xem (Pitch của bạn) *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Cảnh rượt đuổi đỉnh nóc kịch trần, xem uống bia cuối tuần thì hết nước chấm!"
              value={whyWatch}
              onChange={(e) => setWhyWatch(e.target.value)}
              className="w-full bg-[#0b0806] border border-amber-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-amber-900/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playVintageSwitch();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition-all uppercase tracking-wider font-cinema active:scale-95"
            >
              Thêm Vào Kho Phim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
