import React, { useEffect } from 'react';
import { Movie } from '../types/cinema';
import { X, Film, Volume2, Users } from 'lucide-react';

interface CinemaScreenModalProps {
  movie: Movie | null;
  onClose: () => void;
  currentUser: string;
}

export const CinemaScreenModal: React.FC<CinemaScreenModalProps> = ({
  movie,
  onClose,
  currentUser,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  // Convert standard youtube link to embed link
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

  const embedUrl = getEmbedUrl(movie.trailerUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Dimmed cinema ceiling ambient projector glow */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />

      {/* Main container */}
      <div className="relative w-full max-w-5xl rounded-3xl bg-neutral-950 border border-neutral-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800/80 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-cinema truncate max-w-md">
                {movie.title}
              </div>
              <div className="text-[11px] text-neutral-400">
                {movie.year} · {movie.durationMinutes} phút · Đề xuất bởi {movie.suggestedBy}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Đóng phòng chiếu (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Screen Area */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Film className="w-16 h-16 text-neutral-700" />
              <p className="text-sm text-neutral-300">
                Phim này chưa có link YouTube Trailer trong cơ sở dữ liệu.
              </p>
              <p className="text-xs text-neutral-500">
                Anh em có thể mở trực tiếp ứng dụng <strong>{movie.platform}</strong> để phát phim!
              </p>
            </div>
          )}
        </div>

        {/* Bottom Cinema Lounge Info */}
        <div className="p-4 sm:p-6 bg-neutral-900/90 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              Nền tảng xem: <span className="text-white">{movie.platform}</span>
            </div>
            <p className="text-xs text-neutral-300 italic">
              &quot;{movie.whyWatch}&quot;
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Đang duyệt: <strong className="text-white">{currentUser}</strong></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
