import React, { useCallback, useEffect, useState } from 'react';
import { Movie } from '../types/cinema';
import { BookOpen, ExternalLink, MessageSquarePlus, Search, Star, X } from 'lucide-react';
import { BROTHERS_LIST } from './Header';
import { sounds } from '../utils/soundEffects';
import { Modal, ModalHeader, SectionHeader, Stat } from './ui';
import {
  EggEvent, movieStories, classifiedStories, recordScoredScreening, rankScore, judgeScores, houseEdge,
  missingFields, missingFrameRecords, isMissingFrameQuery, firstScreeningDate, a13Movie, creditsEvent,
  loadChainUnlocks, saveChainUnlock,
} from '../easterEggs';
import { ClassifiedArchive, AchievementHall, EndCard } from './EasterEggs';
import { parseScoreInput } from '../utils/judging';

// Short archive tags for per-movie stories (the full copy lives in the classified archive)
const STORY_TAGS: Record<string, string> = {
  'witness-protection': 'Bảo vệ nhân chứng',
  'divided-house': 'Hội đồng tan vỡ',
  'final-frame': 'Khung hình chốt sổ',
  'near-miss': 'Suýt trúng jackpot',
  'double-feature': 'Sold out · technically',
  prophecy: 'Đã phán là trúng',
};

interface WatchedArchiveProps {
  movies: Movie[];
  currentUser: string;
  onOpenRules?: () => void;
  onSubmitReview: (movieId: string, rating: number, comment: string, badge: string, author: string, markWatched?: boolean) => void;
  onDeleteReview?: (movieId: string, reviewId: string) => void;
  onUpdateJudgesScore?: (
    movieId: string,
    scoreTeng: number | null,
    scoreLoc: number | null,
    scoreThanh: number | null,
    adminNote: string
  ) => void;
  // Set when the wheel has just locked a film in: open its scoring sheet once
  scoreMovieId?: string | null;
  onScoreOpened?: () => void;
  eggEvents?: EggEvent[];
  onEggsChanged?: () => void;
}

export const WatchedArchive: React.FC<WatchedArchiveProps> = ({
  movies,
  currentUser,
  onOpenRules,
  onSubmitReview,
  onDeleteReview,
  onUpdateJudgesScore,
  scoreMovieId,
  onScoreOpened,
  eggEvents = [],
  onEggsChanged,
}) => {
  // Filter watched movies and sort by scoreAvg (or review average) descending (Hall of Fame Rule 3.4)
  const watchedMovies = movies
    .filter((m) => m.watched)
    .sort((a, b) => rankScore(b) - rankScore(a));

  // Chain B "The House Edge": which clues are currently visible
  const edge = houseEdge(movies, eggEvents);

  // Archive search (+ chain A / C clues). Ranks always come from the full list.
  const [query, setQuery] = useState('');
  const [chains, setChains] = useState(() => loadChainUnlocks());
  const [openSignal, setOpenSignal] = useState(0);
  const [frameOpenId, setFrameOpenId] = useState<string | null>(null);
  const [a13Open, setA13Open] = useState(false);
  const [showEndCard, setShowEndCard] = useState(false);

  const rankById = new Map(watchedMovies.map((m, i) => [m.id, i + 1]));
  const frameMode = isMissingFrameQuery(query);
  const q = query.trim().toLowerCase();
  const visibleMovies = frameMode
    ? missingFrameRecords(watchedMovies)
    : q
      ? watchedMovies.filter((m) =>
          [m.title, m.originalTitle, m.suggestedBy, m.director, ...m.genres]
            .some((v) => v && v.toLowerCase().includes(q)))
      : watchedMovies;
  const witnessHint = q.includes('witness') &&
    watchedMovies.some((m) => movieStories(m, []).some((st) => st.id === 'witness-protection'));
  const firstDate = firstScreeningDate(movies);
  const credits = creditsEvent(eggEvents);
  const a13 = credits ? a13Movie(movies) : null;

  const unlockChain = (chain: 'missingFrame' | 'roomStayed') => {
    setChains(saveChainUnlock(chain));
    setOpenSignal((n) => n + 1);
  };
  const finishEndCard = useCallback(() => {
    setShowEndCard(false);
    setA13Open(false);
    setChains(saveChainUnlock('roomStayed'));
    setOpenSignal((n) => n + 1);
  }, []);

  // Member review & scoring sheet
  const [activeReviewMovie, setActiveReviewMovie] = useState<Movie | null>(null);
  const [rating, setRating] = useState(8);
  const [ratingInputStr, setRatingInputStr] = useState('8');
  const [comment, setComment] = useState('');
  const [reviewBadge, setReviewBadge] = useState('Siêu phẩm');
  const [author, setAuthor] = useState(currentUser);

  const handleOpenReviewModal = (movie: Movie, chosenAuthor?: string) => {
    sounds.playVintageSwitch();
    setActiveReviewMovie(movie);
    const targetAuthor = chosenAuthor || currentUser;
    setAuthor(targetAuthor);
    const cur = movie.reviews?.find(r => r.author.trim().toLowerCase() === targetAuthor.trim().toLowerCase());
    const initialScore = cur ? cur.rating : (typeof movie.scoreAvg === 'number' ? movie.scoreAvg : 8);
    setRating(initialScore);
    setRatingInputStr(String(initialScore));
    setComment(cur?.comment || '');
    setReviewBadge(cur?.badge || 'Siêu phẩm');
  };

  const handleAuthorChange = (nextAuthor: string) => {
    setAuthor(nextAuthor);
    const cur = activeReviewMovie?.reviews?.find(r => r.author.trim().toLowerCase() === nextAuthor.trim().toLowerCase());
    if (cur) {
      handleRatingChange(cur.rating);
      setComment(cur.comment || '');
      setReviewBadge(cur.badge || 'Siêu phẩm');
    } else {
      setComment('');
      setReviewBadge('Siêu phẩm');
    }
  };

  const handleRatingChange = (newRating: number) => {
    const clamped = Math.min(10, Math.max(0, Number(newRating.toFixed(2))));
    setRating(clamped);
    setRatingInputStr(String(clamped));
  };

  const handleRatingInput = (raw: string) => {
    if (raw === '' || raw === '.' || raw === ',') {
      setRatingInputStr(raw);
      return;
    }

    if (!/^\d*[.,]?\d*$/.test(raw)) {
      return;
    }

    const normalized = raw.replace(',', '.').trim();
    const parts = normalized.split('.');
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    const num = parseFloat(normalized);
    if (isNaN(num)) {
      return;
    }

    if (num > 10) {
      setRatingInputStr('10');
      setRating(10);
      return;
    }

    if (num < 0) {
      setRatingInputStr('0');
      setRating(0);
      return;
    }

    setRatingInputStr(raw);
    setRating(Number(num.toFixed(2)));
  };

  const handleRatingBlur = () => {
    if (ratingInputStr === '' || ratingInputStr === '.' || ratingInputStr === ',') {
      handleRatingChange(rating);
      return;
    }
    const normalized = ratingInputStr.replace(',', '.').trim();
    const num = parseFloat(normalized);
    if (isNaN(num)) {
      handleRatingChange(rating);
    } else {
      handleRatingChange(Math.min(10, Math.max(0, num)));
    }
  };

  // Stats
  const totalWatchedCount = watchedMovies.length;
  const totalMinutes = watchedMovies.reduce((acc, m) => acc + m.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const allScores = watchedMovies
    .map((m) => m.scoreAvg)
    .filter((s): s is number => typeof s === 'number');
  const overallAvg = allScores.length > 0
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
    : '—';

  useEffect(() => {
    if (!scoreMovieId) return;
    const movie = movies.find((m) => m.id === scoreMovieId);
    if (movie) handleOpenReviewModal(movie);
    onScoreOpened?.();
  }, [scoreMovieId]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewMovie) return;
    sounds.playWinnerFanfare();
    const normalized = ratingInputStr.replace(',', '.').trim();
    const parsed = parseFloat(normalized);
    const finalRating = !isNaN(parsed)
      ? Math.min(10, Math.max(0, Number(parsed.toFixed(2))))
      : rating;
    onSubmitReview(activeReviewMovie.id, finalRating, comment.trim(), reviewBadge, author);

    // R7 End-credit survivor: the third distinct screening scored in this browser
    const award = recordScoredScreening(activeReviewMovie.id);
    if (award) {
      fetch('/api/eggs/end-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId: `${Date.now().toString(36)}-credits`, movieIds: award }),
      })
        .then(() => onEggsChanged?.())
        .catch(() => {});
    }

    setComment('');
    setActiveReviewMovie(null);
  };

  return (
    <section>
      <SectionHeader
        jp="ランキング"
        kicker="Hall of Fame"
        title="Bảng vàng"
        description="Mọi phim đã chiếu, xếp theo điểm trung bình của ba giám khảo Teng, Lộc và Thành."
      >
        {onOpenRules && (
          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onOpenRules();
            }}
            className="btn btn-quiet btn-sm"
          >
            <BookOpen className="w-4 h-4" />
            Điều lệ chấm điểm
          </button>
        )}
      </SectionHeader>

      <dl className="grid grid-cols-3 gap-6 max-w-xl mb-12">
        <Stat value={totalWatchedCount} label="Phim đã xem" />
        <Stat value={overallAvg} label="Điểm TB rạp" accent />
        <Stat value={`${totalHours}h`} label="Thời lượng" />
      </dl>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm trong bảng vàng…"
            className="input !pl-9"
            aria-label="Tìm trong bảng vàng"
          />
        </div>
        {/* Chain C, step 1: a barely visible frame counter left by the end-credit survivors */}
        {credits && <span className="label !text-[10px] opacity-30 select-none" title="A frame counter">A-13</span>}
      </div>

      {witnessHint && (
        <p className="mb-4 label !text-accent">A clerk heard that. Classified results may now be available.</p>
      )}
      {frameMode && visibleMovies.length > 0 && (
        <p className="mb-4 label !text-accent">⌁ {visibleMovies.length} frame(s) escaped the archive.</p>
      )}

      {visibleMovies.length > 0 ? (
        <ol className="border-t-[1.5px] border-ink">
          {visibleMovies.map((movie) => {
            const rank = rankById.get(movie.id) ?? 0;
            const stories = movieStories(movie, eggEvents);
            const judged = judgeScores(movie).length;
            const partlyJudged = judged > 0 && judged < 3;
            const avgScore = partlyJudged ? null : movie.scoreAvg ?? (
              movie.reviews && movie.reviews.length > 0
                ? Number((movie.reviews.reduce((acc, r) => acc + r.rating, 0) / movie.reviews.length).toFixed(2))
                : null
            );

            return (
              <li key={movie.id} className="grid grid-cols-[auto_1fr] md:grid-cols-[120px_120px_1fr] gap-x-5 md:gap-x-8 gap-y-5 py-8 border-b-[1.5px] border-ink">
                {/* Rank numeral */}
                <div
                  className={`display leading-[0.8] text-[64px] md:text-[112px] col-start-1 row-start-1 ${
                    rank === 1 ? 'text-accent' : rank <= 3 ? 'text-ink' : 'text-transparent [-webkit-text-stroke:1.5px_var(--color-shadow)]'
                  }`}
                >
                  {String(rank).padStart(2, '0')}
                </div>

                <div className="hidden md:block relative w-[120px] aspect-[2/3] rounded-md border-[1.5px] border-ink overflow-hidden">
                  <img src={movie.posterUrl} alt={movie.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  {/* L2 Witness protection: a sleeve over the art; title and scores stay readable */}
                  {stories.some(st => st.id === 'witness-protection') && (
                    <div className="witness-sleeve absolute inset-0 grid place-items-center p-2" title="Identity retained for legal and comedic reasons.">
                      <span className="bg-ink text-paper label !text-paper !text-[9px] text-center px-1.5 py-1 rounded-sm">Witness protection</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 col-start-2 md:col-start-3 row-start-1">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="label">
                        {movie.watchedDate ? `Chiếu ${movie.watchedDate}` : 'Đã chiếu'} · {movie.genres.slice(0, 2).join(', ')}
                        {/* Chain C, step 2: the same counter on a film released in a year ending in 13 */}
                        {a13?.id === movie.id && (
                          <button onClick={() => setA13Open(!a13Open)} className="ml-1 text-accent hover:underline" aria-expanded={a13Open}>
                            · A-13
                          </button>
                        )}
                      </div>
                      {a13?.id === movie.id && a13Open && credits && (
                        <div className="enter mt-2 text-[13px] text-ink-2 border-l-[3px] border-accent pl-3">
                          Chiếu ngày {movie.watchedDate}. Sổ rạp ghi: “the credits noticed” lúc {new Date(credits.createdAt).toLocaleString('vi-VN')}.
                          <button onClick={() => setShowEndCard(true)} className="ml-2 font-semibold text-ink hover:text-accent">
                            Ở lại xem hết credit →
                          </button>
                        </div>
                      )}
                      {/* Chain A, steps 2-3: FRAME 02 on every incomplete record */}
                      {frameMode && (
                        <div className="mt-2">
                          <button onClick={() => setFrameOpenId(frameOpenId === movie.id ? null : movie.id)} className="chip !border-accent !text-accent" aria-expanded={frameOpenId === movie.id}>
                            Frame 02 · thiếu {missingFields(movie).join(', ')}
                          </button>
                          {frameOpenId === movie.id && (
                            <div className="enter mt-2 text-[13px] text-ink-2 border-l-[3px] border-accent pl-3">
                              FRAME 03 · {movie.suggestedBy.charAt(0).toUpperCase()} / {firstDate ?? '—'}: người đề xuất và buổi chiếu đầu tiên của hội.
                              <button onClick={() => unlockChain('missingFrame')} className="ml-2 font-semibold text-ink hover:text-accent">
                                Mở hồ sơ mật →
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <h3 className="mt-1.5 text-[22px] sm:text-[26px] font-bold leading-tight">{movie.title}</h3>
                      {/* A real tie for #1: the ranking order is untouched, the jury just declines */}
                      {edge.tieIds.includes(movie.id) && (
                        <div className="mt-1.5 label !text-accent">
                          The jury refused to separate them{edge.step >= 2 ? ' · ♧' : ''}
                        </div>
                      )}
                      <div className="mt-1 text-[13px] text-ink-3">
                        {movie.year} · {movie.durationMinutes} phút{movie.director ? ` · ${movie.director}` : ''}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {movie.statusBadge && <span className="chip chip-accent">Vé vàng VIP</span>}
                        {movie.legacySeason === 'legacy' && <span className="chip">Mùa khởi đầu</span>}
                        {stories.filter(st => STORY_TAGS[st.id]).map(st => (
                          <span key={st.id} className="chip !border-accent !text-accent" title={st.detail}>{STORY_TAGS[st.id]}</span>
                        ))}
                      </div>
                    </div>

                    {/* Average */}
                    <div className="shrink-0 text-right">
                      <div className={`display text-[56px] leading-[0.85] tabular-nums ${rank === 1 ? 'text-accent' : ''}`}>
                        {avgScore !== null ? avgScore.toFixed(2) : '—'}
                      </div>
                      <div className="label mt-1.5">{partlyJudged ? `${judged}/3 đã chấm` : 'Điểm TB'}</div>
                      {/* C6 The exact average: the score is untouched, the committee just declines comment */}
                      {stories.some(st => st.id === 'exact-average') && (
                        <span className="stamp stamp-land text-accent mt-2" title="The committee has declined to interpret this.">Under review</span>
                      )}
                    </div>
                  </div>

                  {/* Judges */}
                  <div className="mt-5 grid grid-cols-3 max-w-md border-[1.5px] border-ink rounded-md overflow-hidden bg-card">
                    {[
                      { name: 'Teng', v: movie.scoreTeng },
                      { name: 'Lộc', v: movie.scoreLoc },
                      { name: 'Thành', v: movie.scoreThanh },
                    ].map((j, i) => (
                      <div key={j.name} className={`px-3 py-2 ${i > 0 ? 'border-l-[1.5px] border-ink' : ''}`}>
                        <div className="label !text-[10px]">
                          {j.name}
                          {edge.step >= 2 && edge.dividedMovieIds.includes(movie.id) && <span className="text-accent"> ♧</span>}
                        </div>
                        <div className="num text-[17px] font-bold mt-0.5">{j.v !== undefined ? j.v.toFixed(2) : '—'}</div>
                      </div>
                    ))}
                  </div>

                  {movie.adminNote && (
                    <p className="mt-4 border-l-[3px] border-accent pl-3 text-[14px]">
                      <span className="text-ink-3">Ghi chú hội đồng: </span>
                      <span className="font-medium">“{movie.adminNote}”</span>
                    </p>
                  )}

                  {movie.reviews && movie.reviews.length > 0 && (
                    <ul className="mt-5 grid sm:grid-cols-2 gap-3">
                      {movie.reviews.map((rev) => (
                        <li key={rev.id} className="panel-soft px-4 py-3 relative group/rev">
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="font-semibold">{rev.author}</span>
                            <div className="flex items-center gap-2">
                              <span className="num font-bold text-accent">{rev.rating}★</span>
                              {onDeleteReview && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Xóa đánh giá của ${rev.author}?`)) {
                                      sounds.playVintageSwitch();
                                      onDeleteReview(movie.id, rev.id);
                                    }
                                  }}
                                  className="w-5 h-5 rounded hover:bg-stop/15 text-ink-3 hover:text-stop grid place-items-center transition-colors"
                                  title={`Xóa đánh giá của ${rev.author}`}
                                  aria-label={`Xóa đánh giá của ${rev.author}`}
                                >
                                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-[14px] text-ink-2 leading-snug">“{rev.comment}”</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {(() => {
                    const myReview = movie.reviews?.find(r => r.author.trim().toLowerCase() === currentUser.trim().toLowerCase());
                    return (
                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleOpenReviewModal(movie)}
                          className={`btn btn-sm ${myReview ? 'bg-accent/15 border-accent text-accent font-bold' : ''}`}
                        >
                          <MessageSquarePlus className="w-4 h-4" />
                          {myReview ? 'Sửa cảm nhận' : 'Thêm cảm nhận'}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="panel screentone py-16 grid place-items-center">
          <div className="bg-card border-[1.5px] border-ink rounded-md px-6 py-5 text-center max-w-sm">
            <div className="font-bold">
              {frameMode ? 'No frame is missing.' : query ? 'Nothing found.' : 'Bảng vàng còn trống'}
            </div>
            <p className="mt-1 text-[14px] text-ink-2">
              {frameMode
                ? 'The archive is complete, for now.'
                : query
                  ? 'The archive is being deliberately unhelpful.'
                  : 'Xem xong phim nào, đánh dấu “Đã xem” để đưa lên đây.'}
            </p>
          </div>
        </div>
      )}

      <ClassifiedArchive stories={classifiedStories(movies, eggEvents, chains)} openSignal={openSignal} />
      {showEndCard && (
        <EndCard onDone={finishEndCard} />
      )}
      <AchievementHall events={eggEvents} movies={movies} />

      {/* Member review & scoring sheet */}
      {activeReviewMovie && (() => {
        const curReview = activeReviewMovie.reviews?.find(r => r.author.trim().toLowerCase() === author.trim().toLowerCase());
        return (
          <Modal onClose={() => setActiveReviewMovie(null)} size="md" label={`Cảm nhận ${activeReviewMovie.title}`}>
            <ModalHeader kicker="Cảm nhận" title={activeReviewMovie.title} onClose={() => setActiveReviewMovie(null)} />
            <form onSubmit={handleReviewSubmit} className="px-5 sm:px-7 pb-6 space-y-4">
              <div>
                <label className="field-label" htmlFor="rev-author">Thành viên</label>
                <select
                  id="rev-author"
                  value={author}
                  onChange={(e) => handleAuthorChange(e.target.value)}
                  className="input"
                >
                  {BROTHERS_LIST.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="field-label !mb-0" htmlFor="rev-rating-input">Điểm số (Thang 0 – 10)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-sunk/90 border border-line focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 rounded-lg px-2.5 py-0.5 transition-all shadow-inner">
                      <input
                        id="rev-rating-input"
                        type="text"
                        inputMode="decimal"
                        maxLength={5}
                        autoComplete="off"
                        value={ratingInputStr}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleRatingInput(e.target.value)}
                        onBlur={handleRatingBlur}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-16 bg-transparent text-right font-display text-[24px] font-bold text-accent tabular-nums focus:outline-none"
                        placeholder="0.0"
                        title="Gõ điểm trực tiếp (vd: 8.67, 8.25)"
                      />
                      <span className="text-accent text-[20px] font-bold select-none">★</span>
                    </div>
                    <span className="text-[12px] text-ink-3 font-semibold">
                      {rating === 0
                        ? '💀 0 điểm (Rác phẩm)'
                        : rating <= 2
                        ? '⚠️ Quá tệ'
                        : rating <= 4
                        ? '👎 Dưới trung bình'
                        : rating <= 6
                        ? '👌 Xem được'
                        : rating <= 8
                        ? '👍 Khá hay'
                        : rating < 10
                        ? '🔥 Cực đỉnh'
                        : '👑 Kiệt tác'}
                    </span>
                  </div>
                </div>
                <input
                  id="rev-rating"
                  type="range"
                  min="0"
                  max="10"
                  step="0.01"
                  value={rating}
                  onChange={(e) => handleRatingChange(Number(e.target.value))}
                  className="w-full h-2 rounded-lg cursor-pointer accent-accent"
                />
                <div className="grid grid-cols-6 gap-1.5 mt-2.5">
                  {[0, 2, 4, 6, 8, 10].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleRatingChange(s)}
                      className="btn btn-quiet btn-sm !py-1 text-[12px]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[11.5px] text-ink-3 mt-1.5 italic">
                  💡 Có thể kéo mượt thanh trượt (bước 0.01) hoặc gõ trực tiếp điểm số lẻ như 8.67, 8.25 vào ô trên.
                </p>
              </div>

              <div>
                <div className="field-label">Huy hiệu cảm nhận</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Siêu phẩm',
                    'Căng não',
                    'Hài vãi',
                    'Gây lú',
                    'Bình thường',
                    'Buồn ngủ',
                    'Phí thời gian',
                    'Xem xong trầm cảm',
                    'Xem lại vẫn hay',
                  ].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setReviewBadge(b)}
                      className={`h-7 px-2.5 rounded-full border text-[12px] font-semibold transition-colors ${
                        reviewBadge === b ? 'bg-ink text-paper border-ink' : 'border-line text-ink-2 hover:border-ink hover:text-ink'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="rev-comment">Cảm nhận (tùy chọn)</label>
                <textarea
                  id="rev-comment"
                  rows={2}
                  placeholder="Cảnh nào ấn tượng nhất? Cảm nhận về bộ phim..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex items-center justify-between gap-2.5 pt-2">
                {curReview && onDeleteReview ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Xóa đánh giá của ${author}?`)) {
                        sounds.playVintageSwitch();
                        onDeleteReview(activeReviewMovie.id, curReview.id);
                        setActiveReviewMovie(null);
                      }
                    }}
                    className="btn btn-quiet !text-stop btn-sm"
                  >
                    Xóa đánh giá
                  </button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setActiveReviewMovie(null)} className="btn btn-quiet">Hủy</button>
                  <button type="submit" className="btn btn-primary">Lưu đánh giá</button>
                </div>
              </div>
            </form>
          </Modal>
        );
      })()}
    </section>
  );
};
