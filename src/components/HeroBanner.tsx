import React from 'react';
import { Shuffle, Plus, ArrowUpRight } from 'lucide-react';
import { Movie, WeekendSession } from '../types/cinema';
import { sounds } from '../utils/soundEffects';
import { Stat, formatSessionDate } from './ui';

interface HeroBannerProps {
  moviesCount: number;
  watchedCount: number;
  upcomingSession?: WeekendSession;
  selectedMovie?: Movie;
  featuredMovies: Movie[]; // top-voted queue, shown when nothing is booked yet
  onSpinClick: () => void;
  onAddMovieClick: () => void;
  onOpenSession: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  moviesCount,
  watchedCount,
  upcomingSession,
  selectedMovie,
  featuredMovies,
  onSpinClick,
  onAddMovieClick,
  onOpenSession,
}) => {
  const when = upcomingSession ? formatSessionDate(upcomingSession.date) : null;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-14 sm:mb-20 pt-2 sm:pt-6">
      {/* Headline */}
      <div className="lg:col-span-7">
        <div className="flex items-center gap-3">
          <span className="jp text-[13px]">シネマクラブ</span>
          <span className="label">Câu lạc bộ chiếu phim của hội</span>
        </div>

        <h1 className="display mt-8 sm:mt-10 text-[clamp(64px,12.5vw,168px)] leading-[0.98]">
          <span className="reveal">Tối nay</span>
          <span className="reveal text-accent" style={{ animationDelay: '90ms' }}>xem gì?</span>
        </h1>

        <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-2">
          Bỏ phim vào kho, cả hội vote, vòng quay chốt hạ. Không còn 45 phút cãi nhau chọn phim nữa.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onSpinClick();
            }}
            className="btn btn-primary btn-lg"
          >
            <Shuffle className="w-[18px] h-[18px]" strokeWidth={2.5} />
            Quay chọn phim
          </button>
          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onAddMovieClick();
            }}
            className="btn btn-lg btn-quiet"
          >
            <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
            Thêm phim
          </button>
        </div>

        <dl className="mt-12 grid grid-cols-3 gap-6 max-w-lg pt-5 border-t-[1.5px] border-ink">
          <Stat value={moviesCount} label="Chờ chiếu" />
          <Stat value={watchedCount} label="Đã xem" />
          <Stat value={when ? when.dayMonth : '—'} label={when ? `Kèo ${when.weekday}` : 'Chưa có kèo'} accent />
        </dl>
      </div>

      {/* Next screening */}
      <div className="lg:col-span-5">
        <div className="panel relative overflow-hidden shadow-[6px_6px_0_var(--color-shadow)]">
          <div className="flex items-center justify-between px-5 h-12 border-b-[1.5px] border-ink">
            <span className="label !text-ink">Suất chiếu kế tiếp</span>
            <span className="jp text-[11px]">ネクスト</span>
          </div>

          {selectedMovie && upcomingSession ? (
            <button onClick={onOpenSession} className="group block w-full text-left">
              <div className="relative screentone">
                <img
                  src={selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  referrerPolicy="no-referrer"
                  className="relative mx-auto h-[300px] sm:h-[340px] w-auto object-cover border-x-[1.5px] border-ink"
                />
              </div>
              <div className="flex items-end justify-between gap-4 p-5 border-t-[1.5px] border-ink">
                <div className="min-w-0">
                  <div className="label">
                    {when?.weekday} {when?.dayMonth} · {upcomingSession.time} · {selectedMovie.platform}
                  </div>
                  <div className="mt-1.5 text-[19px] font-bold leading-snug line-clamp-2">{selectedMovie.title}</div>
                </div>
                <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full border-[1.5px] border-ink group-hover:bg-accent group-hover:text-on-accent transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </span>
              </div>
            </button>
          ) : (
            <div>
              <div className="relative h-[300px] sm:h-[340px] screentone flex items-center justify-center">
                {featuredMovies.slice(0, 3).map((m, i) => (
                  <img
                    key={m.id}
                    src={m.posterUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="absolute h-[220px] sm:h-[250px] w-auto rounded-md border-[1.5px] border-ink shadow-[4px_4px_0_var(--color-shadow)]"
                    style={{ transform: `translateX(${(i - 1) * 78}px) rotate(${(i - 1) * 7}deg)`, zIndex: i === 1 ? 2 : 1 }}
                  />
                ))}
              </div>
              <div className="p-5 border-t-[1.5px] border-ink">
                <div className="label">Chưa chốt phim</div>
                <div className="mt-1.5 text-[19px] font-bold leading-snug">Top vote đang chờ vòng quay.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
