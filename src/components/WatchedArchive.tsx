import React, { useState } from 'react';
import { Movie } from '../types/cinema';
import { BookOpen, MessageSquarePlus, SlidersHorizontal } from 'lucide-react';
import { BROTHERS_LIST } from './Header';
import { sounds } from '../utils/soundEffects';
import { Modal, ModalHeader, SectionHeader, Stat } from './ui';

interface WatchedArchiveProps {
  movies: Movie[];
  currentUser: string;
  onOpenRules?: () => void;
  onSubmitReview: (movieId: string, rating: number, comment: string, badge: string, author: string) => void;
  onUpdateJudgesScore?: (
    movieId: string,
    scoreTeng: number,
    scoreLoc: number,
    scoreThanh: number,
    adminNote: string
  ) => void;
}

export const WatchedArchive: React.FC<WatchedArchiveProps> = ({
  movies,
  currentUser,
  onOpenRules,
  onSubmitReview,
  onUpdateJudgesScore,
}) => {
  // Filter watched movies and sort by scoreAvg (or review average) descending (Hall of Fame Rule 3.4)
  const watchedMovies = movies
    .filter((m) => m.watched)
    .sort((a, b) => {
      const scoreA = a.scoreAvg ?? (a.reviews && a.reviews.length > 0 ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0);
      const scoreB = b.scoreAvg ?? (b.reviews && b.reviews.length > 0 ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0);
      return scoreB - scoreA;
    });

  // Judges scoring sheet (Rule 3.1 & 3.2)
  const [scoringMovie, setScoringMovie] = useState<Movie | null>(null);
  const [tengScore, setTengScore] = useState<number>(8.5);
  const [locScore, setLocScore] = useState<number>(8.5);
  const [thanhScore, setThanhScore] = useState<number>(8.5);
  const [judgeNote, setJudgeNote] = useState<string>('');

  // Member review sheet
  const [activeReviewMovie, setActiveReviewMovie] = useState<Movie | null>(null);
  const [rating, setRating] = useState(9);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState(currentUser);

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

  const handleOpenScoreModal = (movie: Movie) => {
    sounds.playVintageSwitch();
    setScoringMovie(movie);
    setTengScore(movie.scoreTeng ?? 8.0);
    setLocScore(movie.scoreLoc ?? 8.0);
    setThanhScore(movie.scoreThanh ?? 8.0);
    setJudgeNote(movie.adminNote ?? '');
  };

  const calculatedAvg = Number(((tengScore + locScore + thanhScore) / 3).toFixed(2));

  const handleSaveJudgesScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringMovie) return;
    sounds.playWinnerFanfare();
    onUpdateJudgesScore?.(scoringMovie.id, tengScore, locScore, thanhScore, judgeNote);
    setScoringMovie(null);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewMovie || !comment.trim()) return;
    sounds.playWinnerFanfare();
    onSubmitReview(activeReviewMovie.id, rating, comment.trim(), 'Vé Vàng VIP', author);
    setComment('');
    setActiveReviewMovie(null);
  };

  const judges: { name: string; key: 'scoreTeng' | 'scoreLoc' | 'scoreThanh'; value: number; set: (n: number) => void }[] = [
    { name: 'Lil Teng', key: 'scoreTeng', value: tengScore, set: setTengScore },
    { name: 'Lộc', key: 'scoreLoc', value: locScore, set: setLocScore },
    { name: 'Thành', key: 'scoreThanh', value: thanhScore, set: setThanhScore },
  ];

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

      {watchedMovies.length > 0 ? (
        <ol className="border-t-[1.5px] border-ink">
          {watchedMovies.map((movie, index) => {
            const rank = index + 1;
            const avgScore = movie.scoreAvg ?? (
              movie.reviews && movie.reviews.length > 0
                ? Number((movie.reviews.reduce((acc, r) => acc + r.rating, 0) / movie.reviews.length).toFixed(2))
                : null
            );

            return (
              <li key={movie.id} className="grid grid-cols-[auto_1fr] md:grid-cols-[120px_120px_1fr] gap-x-5 md:gap-x-8 gap-y-5 py-8 border-b-[1.5px] border-ink">
                {/* Rank numeral */}
                <div
                  className={`display leading-[0.8] text-[64px] md:text-[112px] col-start-1 row-start-1 ${
                    rank === 1 ? 'text-accent' : rank <= 3 ? 'text-ink' : 'text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)]'
                  }`}
                >
                  {String(rank).padStart(2, '0')}
                </div>

                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  referrerPolicy="no-referrer"
                  className="hidden md:block w-[120px] aspect-[2/3] object-cover rounded-md border-[1.5px] border-ink"
                />

                <div className="min-w-0 col-start-2 md:col-start-3 row-start-1">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="label">
                        {movie.watchedDate ? `Chiếu ${movie.watchedDate}` : 'Đã chiếu'} · {movie.genres.slice(0, 2).join(', ')}
                      </div>
                      <h3 className="mt-1.5 text-[22px] sm:text-[26px] font-bold leading-tight">{movie.title}</h3>
                      <div className="mt-1 text-[13px] text-ink-3">
                        {movie.year} · {movie.durationMinutes} phút{movie.director ? ` · ${movie.director}` : ''}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {movie.statusBadge && <span className="chip chip-accent">Vé vàng VIP</span>}
                        {movie.legacySeason === 'legacy' && <span className="chip">Mùa khởi đầu</span>}
                      </div>
                    </div>

                    {/* Average */}
                    <div className="shrink-0 text-right">
                      <div className={`display text-[56px] leading-[0.85] tabular-nums ${rank === 1 ? 'text-accent' : ''}`}>
                        {avgScore !== null ? avgScore.toFixed(2) : '—'}
                      </div>
                      <div className="label mt-1.5">Điểm TB</div>
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
                        <div className="label !text-[10px]">{j.name}</div>
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
                        <li key={rev.id} className="panel-soft px-4 py-3">
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="font-semibold">{rev.author}</span>
                            <span className="num font-bold">{rev.rating}</span>
                          </div>
                          <p className="mt-1 text-[14px] text-ink-2 leading-snug">“{rev.comment}”</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button onClick={() => handleOpenScoreModal(movie)} className="btn btn-sm">
                      <SlidersHorizontal className="w-4 h-4" />
                      Chấm điểm
                    </button>
                    <button
                      onClick={() => {
                        sounds.playVintageSwitch();
                        setActiveReviewMovie(movie);
                        setAuthor(currentUser);
                      }}
                      className="btn btn-quiet btn-sm"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      Thêm cảm nhận
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="panel screentone py-16 grid place-items-center">
          <div className="bg-card border-[1.5px] border-ink rounded-md px-6 py-5 text-center max-w-sm">
            <div className="font-bold">Bảng vàng còn trống</div>
            <p className="mt-1 text-[14px] text-ink-2">Xem xong phim nào, đánh dấu “Đã xem” để đưa lên đây.</p>
          </div>
        </div>
      )}

      {/* Judges scoring sheet (Rule 3.1 & 3.2) */}
      {scoringMovie && (
        <Modal onClose={() => setScoringMovie(null)} label={`Chấm điểm ${scoringMovie.title}`}>
          <ModalHeader jp="ランキング" kicker="Hội đồng chấm điểm" title={scoringMovie.title} onClose={() => setScoringMovie(null)} />
          <form onSubmit={handleSaveJudgesScore} className="px-5 sm:px-7 pb-6">
            <p className="text-[13px] text-ink-2 -mt-1 mb-5">
              Thang 0–10 trên 6 phương diện: kịch bản, diễn xuất, hình ảnh, âm thanh, cảm xúc, giá trị xem lại (Điều 3.1).
            </p>
            <div className="space-y-4">
              {judges.map((j) => (
                <div key={j.key}>
                  <div className="flex items-baseline justify-between">
                    <label className="field-label !mb-1" htmlFor={j.key}>{j.name}</label>
                    <span className="num font-bold text-[15px]">{j.value.toFixed(2)}</span>
                  </div>
                  <input
                    id={j.key}
                    type="range"
                    min="0"
                    max="10"
                    step="0.05"
                    value={j.value}
                    onChange={(e) => j.set(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-end justify-between gap-4 py-4 border-y-[1.5px] border-ink">
              <div>
                <div className="label">Điểm trung bình</div>
                <div className="text-[13px] text-ink-3 mt-1">Lưu xong tự gắn Vé vàng VIP</div>
              </div>
              <div className="display text-[56px] leading-[0.85] text-accent tabular-nums">{calculatedAvg.toFixed(2)}</div>
            </div>

            <div className="mt-5">
              <label className="field-label" htmlFor="judge-note">Ghi chú hội đồng</label>
              <input
                id="judge-note"
                type="text"
                placeholder="oke, bth, quá đỉnh…"
                value={judgeNote}
                onChange={(e) => setJudgeNote(e.target.value)}
                className="input"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-6">
              <button type="button" onClick={() => setScoringMovie(null)} className="btn btn-quiet">Hủy</button>
              <button type="submit" className="btn btn-primary">Lưu điểm</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Member review sheet */}
      {activeReviewMovie && (
        <Modal onClose={() => setActiveReviewMovie(null)} size="sm" label={`Cảm nhận ${activeReviewMovie.title}`}>
          <ModalHeader kicker="Cảm nhận" title={activeReviewMovie.title} onClose={() => setActiveReviewMovie(null)} />
          <form onSubmit={handleReviewSubmit} className="px-5 sm:px-7 pb-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="rev-author">Thành viên</label>
              <select id="rev-author" value={author} onChange={(e) => setAuthor(e.target.value)} className="input">
                {BROTHERS_LIST.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label className="field-label !mb-1" htmlFor="rev-rating">Điểm cá nhân</label>
                <span className="num font-bold text-[15px]">{rating} / 10</span>
              </div>
              <input
                id="rev-rating"
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="rev-comment">Nhận xét</label>
              <textarea
                id="rev-comment"
                rows={3}
                required
                placeholder="Cảnh nào ấn tượng nhất? Cái kết thế nào?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button type="button" onClick={() => setActiveReviewMovie(null)} className="btn btn-quiet">Hủy</button>
              <button type="submit" className="btn btn-primary">Gửi</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};
