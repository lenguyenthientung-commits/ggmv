import React, { useState } from 'react';
import vintageCinemaImg from '../assets/images/vintage_art_deco_cinema_1790903079535.jpg';
import { Sparkles, Plus, Calendar, Lamp, Film } from 'lucide-react';
import { Movie, WeekendSession } from '../types/cinema';
import { sounds } from '../utils/soundEffects';

interface HeroBannerProps {
  moviesCount: number;
  upcomingSession?: WeekendSession;
  selectedMovie?: Movie;
  onSpinClick: () => void;
  onAddMovieClick: () => void;
  onOpenSession: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  moviesCount,
  upcomingSession,
  selectedMovie,
  onSpinClick,
  onAddMovieClick,
  onOpenSession,
}) => {
  const [isLightsDimmed, setIsLightsDimmed] = useState(false);

  const toggleLights = () => {
    sounds.playVintageSwitch();
    setIsLightsDimmed(!isLightsDimmed);
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border brass-border bg-[#120d0a] shadow-2xl mb-8 art-deco-frame transition-all duration-700 ${isLightsDimmed ? 'shadow-[0_0_90px_rgba(0,0,0,0.95)]' : ''}`}>
      {/* 35mm Film Grain Overlay */}
      <div className="absolute inset-0 rounded-3xl film-grain pointer-events-none z-10" />

      {/* Dimmed Lights Overlay */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-700 pointer-events-none z-10 ${isLightsDimmed ? 'opacity-50' : 'opacity-0'}`} />

      {/* Background Vintage Art Deco Cinema Image with Directional Tungsten Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={vintageCinemaImg}
          alt="Vintage Art Deco private screening room"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
        />
        {/* Optical Projector Beam Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b09] via-[#0e0b09]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e0b09] via-[#0e0b09]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-20 p-6 sm:p-10 lg:p-12 max-w-3xl flex flex-col justify-end min-h-[360px] sm:min-h-[420px]">
        {/* Top Controls: Kicker & Dim The Lights Toggle */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-widest uppercase">
            <span>Rạp Chiếu Riêng Tư</span>
            <span aria-hidden="true" className="text-amber-800">·</span>
            <span>{moviesCount} cuộn phim chờ tời</span>
            {upcomingSession && (
              <>
                <span aria-hidden="true" className="text-amber-800">·</span>
                <span className="text-emerald-400">Kèo {upcomingSession.date}</span>
              </>
            )}
          </div>

          {/* Tactical Cafe Dim-Lights Switch */}
          <button
            onClick={toggleLights}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
              isLightsDimmed
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                : 'bg-[#18120e]/80 border-amber-900/40 text-stone-300 hover:text-white'
            }`}
            title="Hạ độ sáng không gian (Mô phỏng tắt đèn rạp)"
          >
            <Lamp className="w-3.5 h-3.5 text-amber-400" />
            <span>{isLightsDimmed ? 'Bật lại đèn rạp' : 'Hạ đèn rạp chiếu'}</span>
          </button>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#fdf8f0] tracking-tight leading-tight font-cinema text-balance drop-shadow-md">
          Thánh Đường Điện Ảnh Của Hội Anh Em
        </h1>

        {/* Description */}
        <p className="mt-3 text-xs sm:text-sm text-[#d4c6b8] max-w-xl leading-relaxed">
          Gác lại ồn ào quán xá. Bỏ vào những thước phim kinh điển, xoay trục tời cơ khí 35mm để số phận quyết định buổi chiếu cuối tuần cùng anh em!
        </p>

        {/* Up Next Preview if session exists */}
        {upcomingSession && selectedMovie && (
          <div
            onClick={onOpenSession}
            className="mt-4 p-3.5 rounded-2xl bg-[#16110e]/90 border border-amber-600/35 backdrop-blur-md flex items-center justify-between gap-4 max-w-lg cursor-pointer hover:border-amber-400/70 transition-colors group shadow-lg"
          >
            <div className="flex items-center gap-3.5 truncate">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-cinema">
                  Tác phẩm đã chốt tuần này
                </div>
                <div className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors font-cinema">
                  {selectedMovie.title}
                </div>
              </div>
            </div>
            <div className="text-xs text-stone-400 shrink-0 flex items-center gap-1 font-mono">
              <span>{upcomingSession.time}</span>
              <span className="text-amber-400">→</span>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onSpinClick();
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(217,119,6,0.5)] active:scale-95 transition-all uppercase tracking-wider font-cinema"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tời Phim Bốc Thăm Ngay</span>
          </button>

          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onAddMovieClick();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1c1511]/90 hover:bg-[#281f19] text-[#ede4da] border border-amber-800/50 hover:border-amber-600/60 font-bold text-xs sm:text-sm transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Bỏ Cuộn Phim Mới Vào Kho</span>
          </button>
        </div>
      </div>
    </div>
  );
};
