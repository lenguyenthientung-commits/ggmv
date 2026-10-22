import React, { useState } from 'react';
import { Movie } from '../types/cinema';
import { ThumbsUp, Play, CalendarPlus, Check, Star, Trash2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { Modal, ModalHeader } from './ui';

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
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const hasVoted = movie.votes?.includes(currentUser);
  const voteCount = movie.votes?.length || 0;

  // Average review rating if watched
  const avgRating =
    movie.reviews && movie.reviews.length > 0
      ? (movie.reviews.reduce((acc, r) => acc + r.rating, 0) / movie.reviews.length).toFixed(1)
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
                className="w-40 sm:w-full rounded-md border-[1.5px] border-ink shadow-[4px_4px_0_var(--color-ink)]"
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
                </div>
                <p className="text-[14.5px] leading-relaxed text-ink-2 max-h-40 overflow-y-auto">{movie.synopsis}</p>
                <blockquote className="border-l-[3px] border-accent pl-4">
                  <div className="label">{movie.suggestedBy} đề xuất</div>
                  <p className="mt-1 text-[15px] font-medium">“{movie.whyWatch}”</p>
                </blockquote>
                {avgRating && (
                  <div className="flex items-center gap-2 text-[14px]">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="num font-bold">{avgRating}</span>
                    <span className="text-ink-3">từ {movie.reviews?.length} cảm nhận</span>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  {movie.trailerUrl && (
                    <button
                      onClick={() => {
                        sounds.playVintageSwitch();
                        setIsDetailOpen(false);
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
    </>
  );
};
