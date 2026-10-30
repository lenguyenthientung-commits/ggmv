import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Movie } from '../types/cinema';
import { BROTHERS_LIST } from './Header';
import { sounds } from '../utils/soundEffects';
import { Modal, ModalHeader } from './ui';

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
  const [country, setCountry] = useState(''); // only from OMDb; no field of its own
  const [suggestedBy, setSuggestedBy] = useState(currentUser);
  const [vibe, setVibe] = useState('Hành động đỉnh cao');
  const [platform, setPlatform] = useState<Movie['platform']>('Netflix');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Hành động']);
  const [posterUrl, setPosterUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [watchUrl, setWatchUrl] = useState('');
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
        setCountry(details.country || '');
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
      country: country || undefined,
      suggestedBy: suggestedBy.trim() || currentUser,
      vibe,
      platform,
      genres: selectedGenres,
      posterUrl:
        posterUrl.trim() ||
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      trailerUrl: trailerUrl.trim() || undefined,
      watchUrl: watchUrl.trim() || undefined,
      synopsis: synopsis.trim() || 'Một bộ phim xuất sắc do anh em đề xuất.',
      whyWatch: whyWatch.trim() || 'Phim hay anh em xem cuối tuần nhé!',
    });

    onClose();
  };

  return (
    <Modal onClose={onClose} size="lg" label="Thêm phim vào kho">
      <ModalHeader jp="ライブラリ" kicker="Phim mới" title="Thêm vào kho" onClose={() => { sounds.playVintageSwitch(); onClose(); }} />

      {/* Smart autofill search */}
      <div className="px-5 sm:px-7 pb-5 border-b-[1.5px] border-ink">
        <label className="field-label" htmlFor="omdb-search">Tìm trên IMDb để tự điền</label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" />
          <input
            id="omdb-search"
            type="text"
            placeholder="Inception, Dune, Parasite…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            className="input !h-12 !pl-10 !pr-12 !border-ink text-[15px]"
            autoComplete="off"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {isSearching || isLoadingDetails ? (
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
            ) : (
              <span className="label !text-[10px]">IMDb</span>
            )}
          </span>

          {showDropdown && searchResults.length > 0 && (
            <ul className="enter absolute top-full left-0 right-0 mt-2 panel shadow-[4px_4px_0_var(--color-shadow)] z-30 max-h-72 overflow-y-auto p-1.5">
              {searchResults.map((item) => (
                <li key={item.imdbID}>
                  <button
                    type="button"
                    onClick={() => handleSelectMovie(item)}
                    className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-sunk transition-colors group"
                  >
                    {item.poster ? (
                      <img src={item.poster} alt="" className="w-9 h-[54px] object-cover rounded border border-ink shrink-0" />
                    ) : (
                      <span className="w-9 h-[54px] rounded border border-line screentone shrink-0" />
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14px] font-semibold truncate">{item.title}</span>
                      <span className="block label !text-[10px] mt-0.5">{item.year} · {item.imdbID}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-ink-3 group-hover:text-accent transition-colors shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {autofillSuccess && (
          <div className="enter mt-3 flex items-center gap-2 text-[13px] font-medium text-go">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{autofillSuccess}</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-5 sm:px-7 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
        <div className="grid sm:grid-cols-[1fr_96px] gap-5">
          <div className="space-y-4 min-w-0">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="m-title">Tên phim *</label>
                <input id="m-title" type="text" required placeholder="Kỵ Sĩ Bóng Đêm" value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
              </div>
              <div>
                <label className="field-label" htmlFor="m-orig">Tên gốc</label>
                <input id="m-orig" type="text" placeholder="The Dark Knight" value={originalTitle} onChange={(e) => setOriginalTitle(e.target.value)} className="input" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="field-label" htmlFor="m-year">Năm</label>
                <input id="m-year" type="number" min="1920" max="2035" value={year} onChange={(e) => setYear(Number(e.target.value))} className="input num" />
              </div>
              <div>
                <label className="field-label" htmlFor="m-dur">Phút</label>
                <input id="m-dur" type="number" min="15" max="400" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="input num" />
              </div>
              <div>
                <label className="field-label" htmlFor="m-dir">Đạo diễn</label>
                <input id="m-dir" type="text" placeholder="Nolan" value={director} onChange={(e) => setDirector(e.target.value)} className="input" />
              </div>
            </div>
          </div>

          {/* Poster preview */}
          <div className="hidden sm:block">
            <div className="field-label">Poster</div>
            {posterUrl ? (
              <img
                src={posterUrl}
                alt="Xem trước poster"
                className="w-24 aspect-[2/3] object-cover rounded-md border-[1.5px] border-ink"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.visibility = 'hidden';
                }}
              />
            ) : (
              <div className="w-24 aspect-[2/3] rounded-md border-[1.5px] border-dashed border-line screentone" />
            )}
          </div>
        </div>

        <div>
          <div className="field-label">Thể loại</div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_GENRES.map((g) => {
              const isSelected = selectedGenres.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleGenre(g)}
                  className={`h-8 px-3 rounded-full border-[1.5px] text-[13px] font-semibold transition-colors ${
                    isSelected ? 'bg-ink text-paper border-ink' : 'border-line text-ink-2 hover:border-ink hover:text-ink'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="field-label" htmlFor="m-by">Người đề xuất *</label>
            <select id="m-by" value={suggestedBy} onChange={(e) => setSuggestedBy(e.target.value)} className="input">
              {BROTHERS_LIST.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="m-platform">Xem trên</label>
            <select id="m-platform" value={platform} onChange={(e) => setPlatform(e.target.value as Movie['platform'])} className="input">
              <option value="Netflix">Netflix</option>
              <option value="HBO Max">HBO Max</option>
              <option value="VieON">VieON</option>
              <option value="FPT Play">FPT Play</option>
              <option value="Torrent/Stremio">Torrent / Stremio</option>
              <option value="Rạp">Chiếu rạp</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="m-vibe">Vibe</label>
            <select id="m-vibe" value={vibe} onChange={(e) => setVibe(e.target.value)} className="input">
              <option value="Hành động đỉnh cao">Hành động đỉnh cao</option>
              <option value="Hài bựa">Hài bựa</option>
              <option value="Căng não">Căng não</option>
              <option value="Kinh dị thót tim">Kinh dị thót tim</option>
              <option value="Ấm áp hoài niệm">Ấm áp hoài niệm</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="field-label" htmlFor="m-poster">Link poster</label>
            <input id="m-poster" type="url" placeholder="https://…" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} className="input" />
          </div>
          <div>
            <label className="field-label" htmlFor="m-trailer">Link trailer YouTube</label>
            <input id="m-trailer" type="url" placeholder="https://youtube.com/watch?v=…" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} className="input" />
          </div>
          <div>
            <label className="field-label" htmlFor="m-watch">Link xem phim (watchUrl)</label>
            <input id="m-watch" type="url" placeholder="https://… (Netflix, Drive, Web)" value={watchUrl} onChange={(e) => setWatchUrl(e.target.value)} className="input" />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="m-syn">Tóm tắt</label>
          <textarea id="m-syn" rows={2} placeholder="Vài câu về cốt truyện…" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} className="input" />
        </div>

        <div>
          <label className="field-label !text-ink" htmlFor="m-why">Vì sao cả hội nên xem? *</label>
          <input
            id="m-why"
            type="text"
            required
            placeholder="Rượt đuổi đỉnh nóc, xem với bia cuối tuần là hết nước chấm!"
            value={whyWatch}
            onChange={(e) => setWhyWatch(e.target.value)}
            className="input !border-ink"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button type="button" onClick={() => { sounds.playVintageSwitch(); onClose(); }} className="btn btn-quiet">
            Hủy
          </button>
          <button type="submit" className="btn btn-primary">
            Thêm vào kho
          </button>
        </div>
      </form>
    </Modal>
  );
};
