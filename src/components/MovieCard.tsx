import React, { useState } from 'react';
import { Movie } from '../types/cinema';
import { ThumbsUp, Play, CheckCircle, Trash2, Calendar, Star, Film, Maximize2, X, Clapperboard } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface MovieCardProps {
  movie: Movie;
  currentUser: string;
  onToggleVote: (movieId: string) => void;
  onMarkWatched: (movie: Movie) => void;
  onSelectForWeekend: (movie: Movie) => void;
  onOpenTrailer: (movie: Movie) => void;
  onDeleteMovie: (movieId: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  currentUser,
  onToggleVote,
  onMarkWatched,
  onSelectForWeekend,
  onOpenTrailer,
  onDeleteMovie,
}) => {
  const [imageError, setImageError] = useState(false);
  const [showVoters, setShowVoters] = useState(false);
  const [isPosterLightboxOpen, setIsPosterLightboxOpen] = useState(false);
  const hasVoted = movie.votes?.includes(currentUser);

  // Average review rating if watched
  const avgRating =
    movie.reviews && movie.reviews.length > 0
      ? (movie.reviews.reduce((acc, r) => acc + r.rating, 0) / movie.reviews.length).toFixed(1)
      : null;

  const handleVoteClick = () => {
    sounds.playVintageSwitch();
    onToggleVote(movie.id);
  };

  return (
    <>
      <div className="group relative rounded-2xl bg-[#140f0c]/95 border border-amber-900/35 hover:border-amber-500/60 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.85)] art-deco-frame">
        {/* Top Theatrical Poster Container (Vertical Standard 2:3 Ratio for Full Poster Display) */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#080504]">
          {!imageError ? (
            <>
              {/* Layer 1: Ambient blurred background of the poster to prevent empty bars */}
              <img
                src={movie.posterUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110 opacity-30 pointer-events-none"
                aria-hidden="true"
              />

              {/* Layer 2: Main Full Poster Artwork */}
              <img
                src={movie.posterUrl}
                alt={movie.title}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="relative w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500 filter brightness-95 group-hover:brightness-100"
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1511] via-[#0f0b09] to-[#1c1511] p-6 text-center">
              <Film className="w-10 h-10 text-amber-700/60 mb-2" />
              <span className="text-xs text-stone-400 font-semibold">{movie.title}</span>
            </div>
          )}

          {/* Dark contrast scrim at bottom of poster to blend with info section */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#140f0c] via-transparent to-black/30 pointer-events-none" />

          {/* Quick Action Overlay (Play Trailer & Zoom Poster Full) */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/45 backdrop-blur-xs">
            {movie.trailerUrl && (
              <button
                onClick={() => {
                  sounds.playVintageSwitch();
                  onOpenTrailer(movie);
                }}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 flex items-center justify-center shadow-[0_0_20px_color-mix(in_srgb,var(--color-amber-600)_60%,transparent)] hover:scale-110 transition-transform"
                title="Xem Trailer Trong Rạp"
              >
                <Play className="w-4 h-4 fill-neutral-950 ml-0.5" />
              </button>
            )}

            {/* View Full Poster Button */}
            {!imageError && (
              <button
                onClick={() => {
                  sounds.playVintageSwitch();
                  setIsPosterLightboxOpen(true);
                }}
                className="w-11 h-11 rounded-full bg-[#1c1511]/90 border border-amber-500/50 text-amber-300 flex items-center justify-center shadow-lg hover:scale-110 hover:bg-amber-500/20 transition-all"
                title="Phóng to xem trọn vẹn poster"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Top-corner Badges (Platform & Watched status) */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-stone-200 pointer-events-none">
            <span className="bg-[#0b0806]/85 backdrop-blur-xs px-2 py-0.5 rounded-md border border-amber-900/40 text-amber-300 font-mono text-[10px] shadow">
              {movie.platform}
            </span>

            {movie.watched && (
              <span className="bg-[#062419]/90 backdrop-blur-xs text-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-500/40 text-[10px] shadow">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="font-mono">Đã chiếu {avgRating && `(${avgRating}★)`}</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Metadata (Year · Duration · Genres) */}
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium font-mono">
              <span className="text-amber-400/90 font-bold">{movie.year}</span>
              <span aria-hidden="true" className="text-amber-800">·</span>
              <span>{movie.durationMinutes} phút</span>
              <span aria-hidden="true" className="text-amber-800">·</span>
              <span className="text-stone-300 font-sans truncate">{movie.genres.slice(0, 2).join(', ')}</span>
            </div>

            {/* Title */}
            <h3 className="mt-1 text-base font-bold text-[#faf5ee] tracking-tight group-hover:text-amber-300 transition-colors font-cinema line-clamp-1">
              {movie.title}
            </h3>

            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-xs text-stone-500 italic line-clamp-1">
                {movie.originalTitle}
              </p>
            )}

            {/* Submitter Note / Why Watch */}
            <div className="mt-2.5 text-xs border-l-2 border-amber-600/70 pl-2.5 py-0.5 text-stone-300 bg-[#19120e]/40 rounded-r-lg">
              <span className="text-amber-400 font-semibold">{movie.suggestedBy}:</span>{' '}
              <span className="italic text-stone-400 line-clamp-2">&quot;{movie.whyWatch}&quot;</span>
            </div>
          </div>

          {/* Card Footer: Vote button & Action Icons */}
          <div className="pt-2.5 border-t border-amber-900/30 flex items-center justify-between gap-2">
            {/* Vote button */}
            <div className="relative">
              <button
                onClick={handleVoteClick}
                onMouseEnter={() => setShowVoters(true)}
                onMouseLeave={() => setShowVoters(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  hasVoted
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-[0_0_15px_color-mix(in_srgb,var(--color-amber-600)_50%,transparent)] font-bold'
                    : 'bg-[#1e1713] hover:bg-[#281f1a] text-stone-300 hover:text-white border border-amber-900/40'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-neutral-950' : ''}`} />
                <span className="font-mono tabular-nums font-bold">
                  {movie.votes?.length || 0}
                </span>
                <span className="hidden sm:inline">Vote</span>
              </button>

              {/* Tooltip listing who voted */}
              {showVoters && movie.votes && movie.votes.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-44 p-2.5 rounded-xl bg-[#0e0b09] border border-amber-800/60 text-[11px] text-stone-300 shadow-2xl z-30 pointer-events-none">
                  <div className="font-bold text-amber-400 mb-1 font-cinema">Anh em đã vote:</div>
                  <div className="space-y-0.5">
                    {movie.votes.map((v) => (
                      <div key={v}>• {v}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center gap-1">
              {/* Pick for weekend */}
              <button
                onClick={() => {
                  sounds.playVintageSwitch();
                  onSelectForWeekend(movie);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-[#221a15] transition-colors"
                title="Chọn cho buổi chiếu tuần này"
              >
                <Calendar className="w-4 h-4" />
              </button>

              {/* Mark as watched / Review */}
              <button
                onClick={() => {
                  sounds.playVintageSwitch();
                  onMarkWatched(movie);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  movie.watched
                    ? 'text-emerald-400 hover:bg-emerald-950/40'
                    : 'text-stone-400 hover:text-emerald-400 hover:bg-[#221a15]'
                }`}
                title={movie.watched ? 'Xem / Viết đánh giá' : 'Đánh dấu đã xem'}
              >
                {movie.watched ? <Star className="w-4 h-4 fill-emerald-400/40" /> : <CheckCircle className="w-4 h-4" />}
              </button>

              {/* Delete button */}
              <button
                onClick={() => {
                  if (window.confirm(`Bạn có chắc muốn xóa phim "${movie.title}" khỏi kho không?`)) {
                    sounds.playVintageSwitch();
                    onDeleteMovie(movie.id);
                  }
                }}
                className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-[#221a15] transition-colors"
                title="Xóa phim"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL POSTER LIGHTBOX MODAL */}
      {isPosterLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsPosterLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full rounded-3xl bg-[#140f0c] border brass-border p-4 sm:p-6 shadow-[0_0_90px_rgba(0,0,0,0.95)] overflow-hidden art-deco-frame"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                sounds.playVintageSwitch();
                setIsPosterLightboxOpen(false);
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-stone-400 hover:text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Full Uncropped HD Poster */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative rounded-2xl overflow-hidden border border-amber-600/50 shadow-2xl max-h-[75vh]">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
                  />
                </div>
              </div>

              {/* Movie Theatrical Spread Details */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Clapperboard className="w-4 h-4" />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold font-cinema">
                    Poster Gốc Rạp Chiếu Gay Gang
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#faf5ee] font-cinema leading-tight">
                    {movie.title}
                  </h2>
                  {movie.originalTitle && (
                    <p className="text-sm text-stone-400 italic mt-0.5">
                      {movie.originalTitle}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-300">
                  <span className="px-2.5 py-1 rounded bg-[#221a15] border border-amber-900/40 text-amber-300 font-bold">
                    {movie.year}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#221a15] border border-amber-900/40">
                    {movie.durationMinutes} phút
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#221a15] border border-amber-900/40 text-stone-200">
                    {movie.genres.join(', ')}
                  </span>
                  {movie.director && (
                    <span className="px-2.5 py-1 rounded bg-[#221a15] border border-amber-900/40 text-amber-400 font-sans">
                      ĐD: {movie.director}
                    </span>
                  )}
                </div>

                {/* Synopsis */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-cinema">
                    Tóm tắt nội dung
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-h-48 overflow-y-auto pr-2">
                    {movie.synopsis}
                  </p>
                </div>

                {/* Pitch */}
                <div className="p-3 rounded-xl bg-[#1b1410] border-l-4 border-amber-500 text-xs text-stone-300">
                  <div className="text-amber-400 font-bold mb-0.5">
                    Đề xuất bởi {movie.suggestedBy}:
                  </div>
                  <div className="italic">&quot;{movie.whyWatch}&quot;</div>
                </div>

                {/* Actions inside Lightbox */}
                <div className="pt-2 flex items-center gap-3">
                  {movie.trailerUrl && (
                    <button
                      onClick={() => {
                        sounds.playVintageSwitch();
                        setIsPosterLightboxOpen(false);
                        onOpenTrailer(movie);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider font-cinema transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>Xem Trailer</span>
                    </button>
                  )}

                  <button
                    onClick={handleVoteClick}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      hasVoted
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-[#221a15] text-stone-300 hover:text-white border border-stone-800'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{hasVoted ? 'Đã Vote' : 'Bình chọn'} ({movie.votes?.length || 0})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
