import React from 'react';
import { Movie } from '../types/cinema';
import { X } from 'lucide-react';
import { Modal } from './ui';

interface CinemaScreenModalProps {
  movie: Movie | null;
  onClose: () => void;
  currentUser: string;
}

// Convert a YouTube watch / share link to an embed link
const getEmbedUrl = (url?: string) => {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
  } catch {
    return url;
  }
  return url;
};

export const CinemaScreenModal: React.FC<CinemaScreenModalProps> = ({ movie, onClose, currentUser }) => {
  if (!movie) return null;

  const embedUrl = getEmbedUrl(movie.trailerUrl);

  return (
    <Modal onClose={onClose} tone="night" size="xl" label={`Trailer ${movie.title}`}>
      <div className="flex items-center justify-between gap-4 px-5 sm:px-6 h-16 border-b-[1.5px] border-night-line">
        <div className="min-w-0">
          <div className="label !text-night-ink/50 !text-[10px]">Phòng chiếu · {movie.platform}</div>
          <div className="text-[16px] font-bold truncate">{movie.title}</div>
        </div>
        <button
          onClick={onClose}
          className="grid place-items-center w-9 h-9 shrink-0 rounded-md text-night-ink/70 hover:text-night-ink hover:bg-night-2 transition-colors"
          title="Đóng (Esc)"
          aria-label="Đóng phòng chiếu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-full aspect-video bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${movie.title} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div>
              <div className="display text-[44px] text-night-ink/90">Chưa có trailer</div>
              <p className="mt-2 text-[14px] text-night-ink/60">Mở thẳng {movie.platform} để xem phim nhé.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4">
        <p className="text-[14px] text-night-ink/75">
          <span className="font-semibold text-night-ink">{movie.suggestedBy}:</span> “{movie.whyWatch}”
        </p>
        <span className="label !text-night-ink/50 shrink-0">
          {movie.year} · {movie.durationMinutes} phút · đang xem: {currentUser}
        </span>
      </div>
    </Modal>
  );
};
