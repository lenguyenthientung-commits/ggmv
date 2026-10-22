import React, { useState } from 'react';
import { Movie, MovieReview } from '../types/cinema';
import {
  Star,
  Award,
  Calendar,
  Sparkles,
  Trophy,
  ShieldCheck,
  BookOpen,
  MessageSquarePlus,
  Flame,
  CheckCircle,
  Clock,
  Film,
  Quote,
  Sliders,
} from 'lucide-react';
import { BROTHERS_LIST } from './Header';
import { sounds } from '../utils/soundEffects';

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
  // Filter watched movies and sort by scoreAvg (or rank) descending (Hall of Fame Rule 3.4)
  const watchedMovies = movies
    .filter((m) => m.watched)
    .sort((a, b) => {
      const scoreA = a.scoreAvg ?? (a.reviews && a.reviews.length > 0 ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0);
      const scoreB = b.scoreAvg ?? (b.reviews && b.reviews.length > 0 ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0);
      return scoreB - scoreA;
    });

  // Active Judge Scoring Modal (Rule 3.1 & 3.2)
  const [scoringMovie, setScoringMovie] = useState<Movie | null>(null);
  const [tengScore, setTengScore] = useState<number>(8.5);
  const [locScore, setLocScore] = useState<number>(8.5);
  const [thanhScore, setThanhScore] = useState<number>(8.5);
  const [judgeNote, setJudgeNote] = useState<string>('');

  // Individual Quick Review Modal
  const [activeReviewMovie, setActiveReviewMovie] = useState<Movie | null>(null);
  const [rating, setRating] = useState(9);
  const [badge, setBadge] = useState('Vé Vàng VIP');
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
    : '8.02';

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

    if (onUpdateJudgesScore) {
      onUpdateJudgesScore(scoringMovie.id, tengScore, locScore, thanhScore, judgeNote);
    } else {
      // Local fallback
      scoringMovie.scoreTeng = tengScore;
      scoringMovie.scoreLoc = locScore;
      scoringMovie.scoreThanh = thanhScore;
      scoringMovie.scoreAvg = calculatedAvg;
      scoringMovie.adminNote = judgeNote;
      scoringMovie.statusBadge = '🎟️ Vé Vàng VIP';
    }

    setScoringMovie(null);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewMovie || !comment.trim()) return;
    sounds.playWinnerFanfare();
    onSubmitReview(activeReviewMovie.id, rating, comment.trim(), badge, author);
    setComment('');
    setActiveReviewMovie(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Stats Banner - Art Deco Palace Style */}
      <div className="rounded-3xl border-2 border-amber-800/40 bg-gradient-to-br from-[#1c140e] via-[#120d0a] to-[#0a0705] shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-amber-900/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1.5 font-cinema">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Gay Gang Cinema • Hall of Fame</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#fdf8f0] font-cinema tracking-wide">
              Bảng Vàng Điện Ảnh & Nhật Ký Đã Chiếu
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Những kiệt tác đã vượt qua thử thách thẩm định gắt gao của Ban Giám Khảo (Teng, Lộc, Thành),
              được cấp <strong className="text-amber-300">🎟️ Thẻ Vé Vàng VIP</strong> và vĩnh viễn lưu danh.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {onOpenRules && (
              <button
                onClick={() => {
                  sounds.playVintageSwitch();
                  onOpenRules();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>12 Điều Lệ Rạp</span>
              </button>
            )}

            {/* Metrics */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2.5 rounded-xl bg-[#18110d] border border-amber-900/50 text-center min-w-[85px]">
                <div className="text-lg sm:text-xl font-black text-amber-300 font-mono tabular-nums">
                  {totalWatchedCount}
                </div>
                <div className="text-[10px] text-stone-400 uppercase mt-0.5">Phim Đã Xem</div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-[#18110d] border border-amber-900/50 text-center min-w-[85px]">
                <div className="text-lg sm:text-xl font-black text-amber-300 font-mono tabular-nums">
                  {overallAvg}★
                </div>
                <div className="text-[10px] text-stone-400 uppercase mt-0.5">Điểm TB Rạp</div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-[#18110d] border border-amber-900/50 text-center min-w-[85px]">
                <div className="text-lg sm:text-xl font-black text-amber-300 font-mono tabular-nums">
                  {totalHours}h
                </div>
                <div className="text-[10px] text-stone-400 uppercase mt-0.5">Thời Lượng</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Judges Honor Badge Bar */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300 border-t border-amber-900/20">
          <div className="flex items-center gap-2 font-cinema text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Hội Đồng Giám Khảo Thẩm Định 6 Tiêu Chí:</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-[#1e1510] border border-amber-700/40 text-stone-200 font-semibold">
              👑 Lil Teng (3 Thẻ Veto)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#1e1510] border border-amber-700/40 text-stone-200 font-semibold">
              👑 Lộc (3 Thẻ Veto)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#1e1510] border border-amber-700/40 text-stone-200 font-semibold">
              👑 Thành (3 Thẻ Veto)
            </span>
          </div>
        </div>
      </div>

      {/* Watched Movies List / Hall of Fame Cards */}
      <div className="space-y-6">
        {watchedMovies.length > 0 ? (
          watchedMovies.map((movie, index) => {
            const rank = index + 1;
            const avgScore = movie.scoreAvg ?? (
              movie.reviews && movie.reviews.length > 0
                ? Number((movie.reviews.reduce((acc, r) => acc + r.rating, 0) / movie.reviews.length).toFixed(2))
                : 8.0
            );

            // Medal styling for Top 3
            const rankColors =
              rank === 1
                ? 'from-amber-400 via-amber-200 to-amber-500 text-neutral-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : rank === 2
                ? 'from-slate-200 via-stone-300 to-slate-400 text-neutral-950 border-stone-300 shadow-md'
                : rank === 3
                ? 'from-amber-700 via-amber-600 to-amber-800 text-stone-100 border-amber-700 shadow-md'
                : 'from-stone-800 to-stone-900 text-stone-300 border-stone-700';

            return (
              <div
                key={movie.id}
                className={`rounded-3xl bg-[#140e0a] border-2 transition-all duration-300 p-5 sm:p-7 relative overflow-hidden ${
                  rank === 1
                    ? 'border-amber-500/70 shadow-[0_15px_40px_rgba(217,119,6,0.2)]'
                    : 'border-amber-900/40 hover:border-amber-700/70'
                }`}
              >
                {/* Background Subtle Accent */}
                {rank === 1 && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                )}

                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                  {/* Poster Column with Rank Banner */}
                  <div className="relative shrink-0 w-full md:w-44 group">
                    {/* Rank Badge */}
                    <div
                      className={`absolute -top-2.5 -left-2.5 z-20 px-3 py-1 rounded-xl font-black text-xs font-cinema uppercase tracking-wider bg-gradient-to-br border flex items-center gap-1 ${rankColors}`}
                    >
                      {rank === 1 && <span>👑</span>}
                      <span>HẠNG #{rank}</span>
                    </div>

                    <div className="w-full h-64 md:h-64 rounded-2xl overflow-hidden border-2 border-amber-600/40 shadow-2xl bg-black relative">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[11px] font-mono text-stone-300 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <span>{movie.durationMinutes}p</span>
                        <span>{movie.year}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content & Scores Column */}
                  <div className="flex-1 space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                          <span>{movie.genres.join(', ')}</span>
                          <span aria-hidden="true">·</span>
                          <span>Đạo diễn: {movie.director || 'Chưa rõ'}</span>
                          {movie.watchedDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Đã chiếu: {movie.watchedDate}</span>
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-[#fdf8f0] font-cinema mt-1 flex items-center gap-2 flex-wrap">
                          <span>{movie.title}</span>
                          {movie.statusBadge && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-sans font-semibold">
                              {movie.statusBadge}
                            </span>
                          )}
                          {movie.legacySeason === 'legacy' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 border border-stone-700">
                              Mùa Khởi Đầu
                            </span>
                          )}
                        </h3>

                        {movie.originalTitle && (
                          <div className="text-xs text-stone-400 italic">
                            Tên gốc: {movie.originalTitle}
                          </div>
                        )}
                      </div>

                      {/* Average Score Stamp */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(217,119,6,0.25)]">
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                          <div className="text-right">
                            <div className="text-lg font-black font-mono leading-none">{avgScore}</div>
                            <div className="text-[9px] uppercase tracking-wider text-amber-400/80 mt-0.5">Điểm TB Nhóm</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenScoreModal(movie)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#221812] hover:bg-[#31231a] text-amber-300 border border-amber-600/40 text-xs font-semibold transition-colors shadow-sm"
                          title="Chỉnh sửa điểm 3 giám khảo theo điều lệ 3.1 & 3.2"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Hội Đồng Chấm Điểm</span>
                        </button>
                      </div>
                    </div>

                    {/* Synopsis & Sheet Note */}
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      {movie.synopsis}
                    </p>

                    {movie.adminNote && (
                      <div className="p-3 rounded-xl bg-[#1e1510] border border-amber-800/40 text-xs flex items-start gap-2.5">
                        <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-stone-400 font-semibold">Ghi chú chính thức từ bảng Gay Gang: </span>
                          <span className="text-amber-200 font-medium italic">&quot;{movie.adminNote}&quot;</span>
                        </div>
                      </div>
                    )}

                    {/* 3 JUDGES BREAKDOWN SCOREBOARD (Teng, Lộc, Thành) */}
                    <div className="p-3.5 rounded-2xl bg-[#0e0a08] border border-amber-900/40 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>Chi Tiết Điểm Ban Giám Khảo (Quy Chuẩn 3.1):</span>
                        </div>
                        <span className="text-stone-400 text-[11px] font-mono">Thang điểm 0.0 - 10.0</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Lil Teng */}
                        <div className="p-2.5 rounded-xl bg-[#1a120d] border border-stone-800 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-stone-300 font-semibold block">Lil Teng</span>
                            <span className="text-[10px] text-stone-400">Giám khảo #1</span>
                          </div>
                          <span className="text-base font-black text-amber-300 font-mono">
                            {movie.scoreTeng !== undefined ? movie.scoreTeng.toFixed(2) : '8.50'}★
                          </span>
                        </div>

                        {/* Lộc */}
                        <div className="p-2.5 rounded-xl bg-[#1a120d] border border-stone-800 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-stone-300 font-semibold block">Lộc</span>
                            <span className="text-[10px] text-stone-400">Giám khảo #2</span>
                          </div>
                          <span className="text-base font-black text-amber-300 font-mono">
                            {movie.scoreLoc !== undefined ? movie.scoreLoc.toFixed(2) : '8.50'}★
                          </span>
                        </div>

                        {/* Thành */}
                        <div className="p-2.5 rounded-xl bg-[#1a120d] border border-stone-800 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-stone-300 font-semibold block">Thành</span>
                            <span className="text-[10px] text-stone-400">Giám khảo #3</span>
                          </div>
                          <span className="text-base font-black text-amber-300 font-mono">
                            {movie.scoreThanh !== undefined ? movie.scoreThanh.toFixed(2) : '8.50'}★
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Member reviews stream */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                          Bình luận & Cảm nhận anh em ({movie.reviews?.length || 0}):
                        </span>

                        <button
                          onClick={() => {
                            sounds.playVintageSwitch();
                            setActiveReviewMovie(movie);
                            setAuthor(currentUser);
                          }}
                          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5" />
                          <span>+ Thêm cảm nhận</span>
                        </button>
                      </div>

                      {movie.reviews && movie.reviews.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {movie.reviews.map((rev) => (
                            <div
                              key={rev.id}
                              className="p-3 rounded-xl bg-[#18110d] border border-stone-800/80 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-stone-200">{rev.author}</span>
                                <span className="font-bold text-amber-400 font-mono">{rev.rating}★</span>
                              </div>
                              <p className="text-stone-300 italic">
                                &quot;{rev.comment}&quot;
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-400 italic">
                          Chưa có bình luận chi tiết. Hãy thêm cảm nhận của bạn!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 rounded-3xl border-2 border-dashed border-amber-900/40 bg-[#120d0a]">
            <Film className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white font-cinema">
              Chưa Có Bộ Phim Nào Trong Nhật Ký
            </h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Sau khi cày xong một bộ phim, đánh dấu &quot;Đã xem&quot; để chuyển sang Phòng Truyền Thống!
            </p>
          </div>
        )}
      </div>

      {/* MODAL 1: 3-JUDGES OFFICIAL SCORING (Rule 3.1 & 3.2) */}
      {scoringMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#140e0a] border-2 border-amber-500/60 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-bold text-white font-cinema">
                  Hội Đồng Thẩm Định: {scoringMovie.title}
                </h3>
              </div>
              <button
                onClick={() => setScoringMovie(null)}
                className="text-stone-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-300 my-3">
              Thang điểm 0.0 - 10.0 dựa trên 6 phương diện (Kịch bản, Diễn xuất, Visual/Đạo diễn, Âm thanh, Cảm xúc, Xem lại) theo Điều lệ 3.1.
            </p>

            <form onSubmit={handleSaveJudgesScore} className="space-y-4">
              {/* Teng Score */}
              <div className="p-3 rounded-xl bg-[#1c140f] border border-stone-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-stone-200">Điểm Giám Khảo Lil Teng:</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">{tengScore.toFixed(2)} / 10.0</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.05"
                  value={tengScore}
                  onChange={(e) => setTengScore(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Lộc Score */}
              <div className="p-3 rounded-xl bg-[#1c140f] border border-stone-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-stone-200">Điểm Giám Khảo Lộc:</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">{locScore.toFixed(2)} / 10.0</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.05"
                  value={locScore}
                  onChange={(e) => setLocScore(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Thành Score */}
              <div className="p-3 rounded-xl bg-[#1c140f] border border-stone-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-stone-200">Điểm Giám Khảo Thành:</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">{thanhScore.toFixed(2)} / 10.0</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.05"
                  value={thanhScore}
                  onChange={(e) => setThanhScore(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Calculated Realtime Average */}
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-300 font-semibold block">Điểm Trung Bình Realtime (Quy chuẩn 3.2):</span>
                  <span className="text-[11px] text-amber-200/80">Tự động gắn thẻ 🎟️ Vé Vàng VIP</span>
                </div>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  {calculatedAvg}★
                </div>
              </div>

              {/* Admin note */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Ghi chú đánh giá chính thức (Sheet Note):
                </label>
                <input
                  type="text"
                  placeholder="e.g. oke, tinh duc va quai di, bth..."
                  value={judgeNote}
                  onChange={(e) => setJudgeNote(e.target.value)}
                  className="w-full bg-[#0e0a08] border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setScoringMovie(null)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider font-cinema shadow-lg flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>💾 Lưu Điểm Vào Sheet Gay Gang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Member Quick Review */}
      {activeReviewMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#140e0a] border border-amber-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-cinema mb-1">
              Cảm Nhận: {activeReviewMovie.title}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Chia sẻ cảm xúc chân thật sau đêm chiếu cùng anh em
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1">
                  Thành viên:
                </label>
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-[#0e0a08] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {BROTHERS_LIST.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-400 mb-1">
                  <span>Điểm cá nhân:</span>
                  <span className="text-amber-400 font-bold font-mono text-sm">{rating} / 10 điểm</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1">
                  Nội dung nhận xét:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Cảnh nào ấn tượng nhất? Đoạn kết ra sao?..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[#0e0a08] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveReviewMovie(null)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  Gửi Nhận Xét
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
