import React, { useEffect, useState } from 'react';
import { Movie } from '../types/cinema';
import { ThumbsUp, Play, CalendarPlus, Check, Star, Trash2, ExternalLink, Tv, Edit3, MessageSquarePlus, X } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { Modal, ModalHeader } from './ui';
import { BROTHERS_LIST } from './Header';
import { genreReel } from '../easterEggs';
import { markReelRead } from '../badges';
import { countriesOf, countryName } from '../data/filmCountries';

interface MovieCardProps {
  movie: Movie;
  currentUser: string;
  onToggleVote: (movieId: string) => void;
  onMarkWatched: (movie: Movie) => void;
  onSelectForWeekend: (movie: Movie) => void;
  onOpenTrailer: (movie: Movie) => void;
  onDeleteMovie: (movieId: string) => void;
  onUpdateWatchUrl?: (movieId: string, watchUrl: string) => void;
  onSubmitReview?: (movieId: string, rating: number, comment: string, badge: string, author: string, markWatched?: boolean) => void;
  onDeleteReview?: (movieId: string, reviewId: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  currentUser,
  onToggleVote,
  onMarkWatched,
  onSelectForWeekend,
  onOpenTrailer,
  onDeleteMovie,
  onUpdateWatchUrl,
  onSubmitReview,
  onDeleteReview,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditingWatchUrl, setIsEditingWatchUrl] = useState(false);
  const [watchUrlInput, setWatchUrlInput] = useState(movie.watchUrl || '');
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [markWatchedImmediately, setMarkWatchedImmediately] = useState(false);

  const reel = genreReel(movie);
  const wokenGenre = isDetailOpen && reel?.state === 'awake' ? reel.genre : null;
  useEffect(() => {
    if (wokenGenre) markReelRead(wokenGenre);
  }, [wokenGenre]);

  const myReview = movie.reviews?.find(r => r.author.toLowerCase() === currentUser.toLowerCase());
  const [reviewScore, setReviewScore] = useState<number>(myReview ? myReview.rating : 7.5);
  const [scoreInputStr, setScoreInputStr] = useState<string>(String(myReview ? myReview.rating : 7.5));
  const [reviewAuthor, setReviewAuthor] = useState<string>(currentUser);
  const [reviewBadge, setReviewBadge] = useState<string>(myReview?.badge || 'Siêu phẩm');
  const [reviewComment, setReviewComment] = useState<string>(myReview?.comment || '');

  const handleScoreChange = (newScore: number) => {
    const clamped = Math.min(10, Math.max(0, Number(newScore.toFixed(2))));
    setReviewScore(clamped);
    setScoreInputStr(String(clamped));
  };

  const handleScoreInput = (raw: string) => {
    if (raw === '' || raw === '.' || raw === ',') {
      setScoreInputStr(raw);
      return;
    }

    // Only allow digits and at most one decimal separator
    if (!/^\d*[.,]?\d*$/.test(raw)) {
      return;
    }

    const normalized = raw.replace(',', '.').trim();

    // Limit to at most 2 decimal places (e.g. 8.67, 8.25)
    const parts = normalized.split('.');
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    const num = parseFloat(normalized);
    if (isNaN(num)) {
      return;
    }

    // Prevent number larger than 10 (immediately clamp to 10)
    if (num > 10) {
      setScoreInputStr('10');
      setReviewScore(10);
      return;
    }

    if (num < 0) {
      setScoreInputStr('0');
      setReviewScore(0);
      return;
    }

    setScoreInputStr(raw);
    setReviewScore(Number(num.toFixed(2)));
  };

  const handleScoreBlur = () => {
    if (scoreInputStr === '' || scoreInputStr === '.' || scoreInputStr === ',') {
      handleScoreChange(reviewScore);
      return;
    }
    const normalized = scoreInputStr.replace(',', '.').trim();
    const num = parseFloat(normalized);
    if (isNaN(num)) {
      handleScoreChange(reviewScore);
    } else {
      handleScoreChange(Math.min(10, Math.max(0, num)));
    }
  };

  const hasVoted = movie.votes?.includes(currentUser);
  const voteCount = movie.votes?.length || 0;

  const voters = movie.votes || [];
  const ratedVoters = voters.filter(v =>
    movie.reviews?.some(r => r.author.trim().toLowerCase() === v.trim().toLowerCase())
  );
  const unratedVoters = voters.filter(v =>
    !movie.reviews?.some(r => r.author.trim().toLowerCase() === v.trim().toLowerCase())
  );
  const allVotersDone = voters.length > 0 && unratedVoters.length === 0;

  // Average review rating if watched
  const avgRating =
    typeof movie.scoreAvg === 'number'
      ? (Number.isInteger(movie.scoreAvg) ? movie.scoreAvg.toString() : movie.scoreAvg.toFixed(2).replace(/0$/, ''))
      : movie.reviews && movie.reviews.length > 0
      ? Number((movie.reviews.reduce((acc, r) => acc + r.rating, 0) / movie.reviews.length).toFixed(2)).toString()
      : null;

  const handleVoteClick = () => {
    sounds.playVintageSwitch();
    onToggleVote(movie.id);
  };

  const voteButton = (large = false) => (
    <button
      onClick={handleVoteClick}
      aria-pressed={hasVoted}
      title={voteCount > 0 ? `Đã vote: ${movie.votes.join(', ')}` : 'Vote cho phim này'}
      className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink font-bold transition-colors ${
        large ? 'h-10 px-4 text-[14px]' : 'h-8 px-3 text-[13px]'
      } ${hasVoted ? 'bg-accent text-on-accent' : 'bg-card hover:bg-sunk'}`}
    >
      <ThumbsUp className={large ? 'w-4 h-4' : 'w-3.5 h-3.5'} strokeWidth={2.5} />
      <span className="num">{voteCount}</span>
      {large && <span>{hasVoted ? 'Đã vote' : 'Vote'}</span>}
    </button>
  );

  return (
    <>
      <article className="group flex flex-col min-w-0">
        {/* Poster */}
        <button
          onClick={() => {
            sounds.playVintageSwitch();
            setIsDetailOpen(true);
          }}
          className="poster-lift relative block aspect-[2/3] w-full overflow-hidden rounded-lg border-[1.5px] border-ink bg-sunk text-left"
          aria-label={`Xem chi tiết ${movie.title}`}
        >
          {!imageError ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover object-top ${movie.watched ? 'grayscale-[35%]' : ''}`}
            />
          ) : (
            <div className="w-full h-full screentone flex items-end p-3">
              <span className="bg-card px-2 py-1 rounded border border-ink text-[13px] font-bold leading-snug">{movie.title}</span>
            </div>
          )}

          <span className="chip absolute top-2 left-2">{movie.platform}</span>

          {movie.watched && (
            <span className="absolute top-3 right-2 stamp bg-card text-ink">
              Đã xem{avgRating ? ` ${avgRating}` : ''}
            </span>
          )}
        </button>

        {/* Info */}
        <div className="pt-3 flex-1 flex flex-col">
          <div className="label !text-[10.5px] !tracking-[0.1em] truncate">
            {movie.year} · {movie.durationMinutes}′ · {movie.genres.slice(0, 2).join(', ')}
          </div>
          <h3 className="mt-1 text-[15px] sm:text-[16px] font-bold leading-snug line-clamp-2">{movie.title}</h3>
          <p className="mt-1.5 text-[13px] leading-snug text-ink-2 line-clamp-2">
            <span className="font-semibold text-ink">{movie.suggestedBy}</span> “{movie.whyWatch}”
          </p>

          <div className="mt-auto pt-3 flex items-center justify-between gap-1">
            {voteButton()}
            <div className="flex items-center -mr-1.5">
              {movie.watchUrl && (
                <a
                  href={movie.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon !w-8 !h-8 !text-accent hover:bg-sunk"
                  title="Mở link xem phim trực tiếp"
                  aria-label="Mở link xem phim trực tiếp"
                >
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} />
                </a>
              )}
              <button
                onClick={() => {
                  sounds.playVintageSwitch();
                  onSelectForWeekend(movie);
                }}
                className="btn-icon !w-8 !h-8"
                title="Chốt cho buổi chiếu tuần này"
                aria-label="Chốt cho buổi chiếu tuần này"
              >
                <CalendarPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  sounds.playVintageSwitch();
                  onMarkWatched(movie);
                }}
                className={`btn-icon !w-8 !h-8 ${movie.watched ? '!text-go' : ''}`}
                title={movie.watched ? 'Bỏ đánh dấu đã xem' : 'Đánh dấu đã xem'}
                aria-label={movie.watched ? 'Bỏ đánh dấu đã xem' : 'Đánh dấu đã xem'}
              >
                <Check className="w-4 h-4" strokeWidth={2.75} />
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Detail sheet */}
      {isDetailOpen && (
        <Modal onClose={() => setIsDetailOpen(false)} size="lg" label={movie.title}>
          <div className="grid sm:grid-cols-[minmax(0,240px)_1fr]">
            <div className="screentone border-b-[1.5px] sm:border-b-0 sm:border-r-[1.5px] border-ink flex items-center justify-center p-5">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                referrerPolicy="no-referrer"
                className="w-40 sm:w-full rounded-md border-[1.5px] border-ink shadow-[4px_4px_0_var(--color-shadow)]"
              />
            </div>
            <div className="min-w-0">
              <ModalHeader
                kicker={`${movie.year} · ${movie.durationMinutes} phút · ${movie.platform}`}
                title={movie.title}
                onClose={() => setIsDetailOpen(false)}
              />
              <div className="px-5 sm:px-7 pb-6 space-y-5">
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="-mt-3 text-[14px] text-ink-3 italic">{movie.originalTitle}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.map(g => <span key={g} className="chip">{g}</span>)}
                  {movie.director && <span className="chip !border-line !text-ink-2">ĐD {movie.director}</span>}
                  {countriesOf(movie).map(c => <span key={c} className="chip !border-line !text-ink-2">{countryName(c)}</span>)}
                </div>
                <p className="text-[14.5px] leading-relaxed text-ink-2 max-h-40 overflow-y-auto">{movie.synopsis}</p>
                <blockquote className="border-l-[3px] border-accent pl-4">
                  <div className="label">{movie.suggestedBy} đề xuất</div>
                  <p className="mt-1 text-[15px] font-medium">“{movie.whyWatch}”</p>
                </blockquote>
                {reel && (
                  <p className="text-[13px] text-ink-3 leading-snug">
                    <span className="label !text-[10px] mr-2">{reel.state === 'awake' ? `Cuộn phim · ${reel.genre}` : 'Cuộn phim'}</span>
                    {reel.state === 'awake' ? reel.line : 'Cuộn phim này đang ngủ. Chiếu xong mới dậy.'}
                  </p>
                )}
                {/* Rating & Review Section */}
                <div className="pt-3 border-t-[1.5px] border-line">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {onSubmitReview && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playVintageSwitch();
                            const cur = movie.reviews?.find(r => r.author.toLowerCase() === currentUser.toLowerCase());
                            const initialScore = cur ? cur.rating : (typeof movie.scoreAvg === 'number' ? movie.scoreAvg : 8);
                            setReviewScore(initialScore);
                            setScoreInputStr(String(initialScore));
                            setReviewAuthor(currentUser);
                            setReviewBadge(cur?.badge || 'Siêu phẩm');
                            setReviewComment(cur?.comment || '');
                            setMarkWatchedImmediately(false);
                            setIsRatingOpen(true);
                          }}
                          className={`btn btn-sm ${myReview ? 'bg-accent/15 border-accent text-accent font-bold' : ''}`}
                        >
                          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                          {myReview ? `Đánh giá thêm / Đổi điểm (${myReview.rating}★)` : 'Chấm điểm & Đánh giá'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playWinnerFanfare();
                          onMarkWatched(movie);
                        }}
                        className={`btn btn-sm ${
                          movie.watched
                            ? 'btn-quiet !text-go border border-go/40 font-bold'
                            : 'btn-primary font-bold'
                        }`}
                        title={movie.watched ? 'Bỏ đánh dấu đã xem' : 'Chốt đã xem và đưa phim lên Bảng Vàng'}
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {movie.watched ? 'Đã xem ✓' : 'Chốt đã xem'}
                      </button>
                    </div>

                    {avgRating && (
                      <div className="flex items-center gap-2 text-[14px]">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="num font-bold">{avgRating}/10</span>
                        {movie.reviews && movie.reviews.length > 0 && (
                          <span className="text-ink-3">từ {movie.reviews.length} đánh giá</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Voters rating progress banner */}
                  {voters.length > 0 && (
                    <div className="mt-2.5 p-2.5 rounded-md bg-sunk/60 border border-line text-[12.5px] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-ink">
                          Tiến độ chấm: <span className="text-accent font-bold font-mono">{ratedVoters.length}/{voters.length}</span> người vote
                        </span>
                        {allVotersDone ? (
                          <span className="chip !text-[10px] !py-0 !px-1.5 bg-go/15 border-go text-go font-bold">
                            ✓ Đủ người chấm
                          </span>
                        ) : (
                          <span className="text-ink-3 text-[12px]">
                            (Chờ: <strong className="text-ink-2">{unratedVoters.join(', ')}</strong>)
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] text-ink-3 font-medium">
                        {movie.watched
                          ? '🏆 Đã chốt lên Bảng Vàng'
                          : allVotersDone
                          ? 'Đủ người vote đã chấm · Bấm "Chốt đã xem" để chuyển'
                          : 'Mỗi anh em vote có thể vào chấm điểm'}
                      </div>
                    </div>
                  )}

                  {/* Reviews list */}
                  {movie.reviews && movie.reviews.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-36 overflow-y-auto pr-1">
                      {movie.reviews.map((rev) => (
                        <div key={rev.id} className="p-2.5 rounded-md bg-card border border-line text-[13px] relative group/rev">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-ink">{rev.author}</span>
                              {rev.badge && <span className="chip !text-[10px] !py-0 !px-1.5">{rev.badge}</span>}
                            </div>
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
                          {rev.comment && <p className="mt-1 text-ink-2 italic">“{rev.comment}”</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Watch URL Section */}
                <div className="pt-3 border-t-[1.5px] border-line">
                  <div className="flex items-center justify-between">
                    <span className="field-label !mb-0 flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-ink-2" /> Link xem phim:
                    </span>
                    {onUpdateWatchUrl && !isEditingWatchUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setWatchUrlInput(movie.watchUrl || '');
                          setIsEditingWatchUrl(true);
                        }}
                        className="text-[12px] font-semibold text-accent hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        {movie.watchUrl ? 'Đổi link' : '+ Thêm link xem'}
                      </button>
                    )}
                  </div>

                  {isEditingWatchUrl ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="url"
                        value={watchUrlInput}
                        onChange={(e) => setWatchUrlInput(e.target.value)}
                        placeholder="https://… (Netflix, Drive, Web phim)"
                        className="input !h-9 text-[13px] flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateWatchUrl?.(movie.id, watchUrlInput);
                          setIsEditingWatchUrl(false);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingWatchUrl(false)}
                        className="btn btn-quiet btn-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : movie.watchUrl ? (
                    <p className="mt-1 text-[12.5px] truncate font-mono">
                      <a href={movie.watchUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1 font-semibold">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {movie.watchUrl}
                      </a>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[12px] text-ink-3 italic">Chưa gắn link xem phim trực tiếp.</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  {movie.watchUrl && (
                    <a
                      href={movie.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Xem phim
                    </a>
                  )}
                  {movie.trailerUrl && (
                    <button
                      onClick={() => {
                        sounds.playVintageSwitch();
                        onOpenTrailer(movie);
                      }}
                      className="btn btn-primary"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Xem trailer
                    </button>
                  )}
                  {voteButton(true)}
                  <button
                    onClick={() => {
                      if (window.confirm(`Xóa "${movie.title}" khỏi kho?`)) {
                        sounds.playVintageSwitch();
                        setIsDetailOpen(false);
                        onDeleteMovie(movie.id);
                      }
                    }}
                    className="btn btn-quiet btn-sm !text-stop ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Rating & Review Modal */}
      {isRatingOpen && (
        <Modal onClose={() => setIsRatingOpen(false)} size="md" label={`Chấm điểm ${movie.title}`}>
          <ModalHeader
            kicker="Đánh giá & Xếp hạng"
            title={`Chấm điểm: ${movie.title}`}
            onClose={() => setIsRatingOpen(false)}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sounds.playWinnerFanfare();
              const normalized = scoreInputStr.replace(',', '.').trim();
              const parsed = parseFloat(normalized);
              const finalScore = !isNaN(parsed)
                ? Math.min(10, Math.max(0, Number(parsed.toFixed(2))))
                : reviewScore;

              onSubmitReview?.(
                movie.id,
                finalScore,
                reviewComment.trim(),
                reviewBadge,
                reviewAuthor,
                markWatchedImmediately
              );
              setIsRatingOpen(false);
            }}
            className="p-5 sm:p-6 space-y-4"
          >
            <div>
              <label className="field-label" htmlFor="r-author">Người chấm điểm</label>
              <select
                id="r-author"
                value={reviewAuthor}
                onChange={(e) => {
                  const nextAuthor = e.target.value;
                  setReviewAuthor(nextAuthor);
                  const existing = movie.reviews?.find(r => r.author.trim().toLowerCase() === nextAuthor.trim().toLowerCase());
                  if (existing) {
                    setReviewScore(existing.rating);
                    setScoreInputStr(String(existing.rating));
                    setReviewBadge(existing.badge || 'Siêu phẩm');
                    setReviewComment(existing.comment || '');
                  }
                }}
                className="input"
              >
                {BROTHERS_LIST.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="field-label !mb-0" htmlFor="r-score-input">Điểm số (Thang 0 – 10)</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-sunk/90 border border-line focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 rounded-lg px-2.5 py-0.5 transition-all shadow-inner">
                    <input
                      id="r-score-input"
                      type="text"
                      inputMode="decimal"
                      maxLength={5}
                      autoComplete="off"
                      value={scoreInputStr}
                      onChange={(e) => handleScoreInput(e.target.value)}
                      onBlur={handleScoreBlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleScoreBlur();
                        }
                      }}
                      className="w-16 bg-transparent text-right font-display text-[24px] font-bold text-accent tabular-nums focus:outline-none"
                      placeholder="0.0"
                      title="Gõ điểm trực tiếp (vd: 8.67, 8.25)"
                    />
                    <span className="text-accent text-[20px] font-bold select-none">★</span>
                  </div>
                  <span className="text-[12px] text-ink-3 font-semibold">
                    {reviewScore === 0
                      ? '💀 0 điểm (Rác phẩm)'
                      : reviewScore <= 2
                      ? '⚠️ Quá tệ'
                      : reviewScore <= 4
                      ? '👎 Dưới trung bình'
                      : reviewScore <= 6
                      ? '👌 Xem được'
                      : reviewScore <= 8
                      ? '👍 Khá hay'
                      : reviewScore < 10
                      ? '🔥 Cực đỉnh'
                      : '👑 Kiệt tác'}
                  </span>
                </div>
              </div>
              <input
                id="r-score"
                type="range"
                min="0"
                max="10"
                step="0.01"
                value={reviewScore}
                onChange={(e) => handleScoreChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer accent-accent"
              />
              <div className="grid grid-cols-6 gap-1.5 mt-2.5">
                {[0, 2, 4, 6, 8, 10].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleScoreChange(s)}
                    className={`btn btn-sm !h-8 text-[13px] font-mono font-bold transition-all ${
                      reviewScore === s ? 'btn-primary shadow-none' : ''
                    }`}
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
              <label className="field-label" htmlFor="r-comment">Cảm nhận (tùy chọn)</label>
              <textarea
                id="r-comment"
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Vài dòng cảm nhận nhanh về bộ phim cùng anh em..."
                className="input"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-sunk/60 rounded-md border border-line text-[12.5px] text-ink select-none hover:bg-sunk transition-colors">
              <input
                type="checkbox"
                checked={markWatchedImmediately}
                onChange={(e) => setMarkWatchedImmediately(e.target.checked)}
                className="mt-0.5 rounded border-line accent-accent w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="font-bold text-ink">Chốt phim là ĐÃ XEM luôn</span>
                <p className="mt-0.5 text-ink-3 text-[11.5px] leading-relaxed">
                  {voters.length > 0
                    ? `Nếu không tích, phim vẫn ở Kho Phim và sẽ tự động chốt khi tất cả ${voters.length} người vote chấm điểm xong.`
                    : 'Nếu không tích, phim vẫn ở Kho Phim để các anh em khác có thể vào xem và chấm điểm.'}
                </p>
              </div>
            </label>

            <div className="flex items-center justify-between gap-2.5 pt-2">
              {myReview && onDeleteReview ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Xóa đánh giá của ${reviewAuthor}?`)) {
                      sounds.playVintageSwitch();
                      onDeleteReview(movie.id, myReview.id);
                      setIsRatingOpen(false);
                    }
                  }}
                  className="btn btn-quiet !text-stop"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa đánh giá
                </button>
              ) : <div />}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRatingOpen(false)}
                  className="btn btn-quiet"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Lưu đánh giá
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
