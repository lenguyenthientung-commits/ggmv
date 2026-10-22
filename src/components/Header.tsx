import React, { useState } from 'react';
import { Film, Plus, User, Sparkles, BarChart3, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  activeTab: 'movies' | 'wheel' | 'sessions' | 'archive' | 'stats';
  setActiveTab: (tab: 'movies' | 'wheel' | 'sessions' | 'archive' | 'stats') => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;
  onOpenAddModal: () => void;
  onOpenRules: () => void;
}

export const BROTHERS_LIST = [
  'Lil Teng',
  'Lộc',
  'Thành',
  'Shiba',
  'Hoèn',
  'Nem',
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  onOpenAddModal,
  onOpenRules,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sounds.getIsMuted());

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playVintageSwitch();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-900/30 bg-[#0e0b09]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark (Compact & Shrink-0 to prevent overflow) */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              sounds.playVintageSwitch();
              setActiveTab('movies');
            }}
            className="flex items-center gap-2 group text-white focus:outline-none shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-[0_0_12px_color-mix(in_srgb,var(--color-amber-600)_50%,transparent)] border border-amber-300/40 shrink-0">
              <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-950 stroke-[2.5]" />
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-black tracking-wider uppercase font-cinema text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 whitespace-nowrap">
              GAY GANG CINEMA
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links (Shown on lg: >= 1024px to prevent horizontal crowding) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink min-w-0">
          <button
            onClick={() => {
              sounds.playVintageSwitch();
              setActiveTab('movies');
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'movies'
                ? 'text-amber-300 bg-[#221a15] border border-amber-600/30 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Kho Phim
          </button>

          <button
            onClick={() => {
              sounds.playVintageSwitch();
              setActiveTab('wheel');
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'wheel'
                ? 'text-amber-300 bg-[#221a15] border border-amber-600/30 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vòng Quay</span>
          </button>

          <button
            onClick={() => {
              sounds.playVintageSwitch();
              setActiveTab('sessions');
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'text-amber-300 bg-[#221a15] border border-amber-600/30 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Lịch Chiếu
          </button>

          <button
            onClick={() => {
              sounds.playVintageSwitch();
              setActiveTab('archive');
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'archive'
                ? 'text-amber-300 bg-[#221a15] border border-amber-600/30 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Đã Xem
          </button>

          <button
            onClick={() => {
              sounds.playVintageSwitch();
              setActiveTab('stats');
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'text-amber-300 bg-[#221a15] border border-amber-600/30 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Thống Kê</span>
          </button>

          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onOpenRules();
            }}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-[#221a15] border border-amber-800/40"
            title="12 Điều Lệ Hoạt Động & Quy Chuẩn Rạp Gay Gang"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>12 Điều Lệ</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Sound toggle, User switcher, Add Movie button) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Cafe Acoustic Mute/Unmute Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-1.5 sm:p-2 rounded-lg border transition-colors shrink-0 ${
              isMuted
                ? 'bg-[#1a1411] border-stone-800 text-stone-500 hover:text-stone-300'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_color-mix(in_srgb,var(--color-amber-600)_25%,transparent)]'
            }`}
            title={isMuted ? 'Bật âm thanh cơ học (Chế độ tai nghe)' : 'Tắt âm thanh (Chế độ quán cafe yên tĩnh)'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* User selector dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                sounds.playVintageSwitch();
                setShowUserDropdown(!showUserDropdown);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#18120e] border border-amber-900/40 hover:border-amber-700 text-stone-300 text-xs transition-colors shrink-0"
              title="Đổi tên thành viên Gay Gang"
            >
              <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold max-w-[65px] sm:max-w-[90px] truncate">{currentUser}</span>
              <span className="text-[10px] text-stone-500">▾</span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#120d0a] border border-amber-600/40 shadow-2xl p-2 z-50 text-xs art-deco-frame">
                <div className="px-2 py-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider font-cinema">
                  Thành viên Gay Gang
                </div>
                <div className="space-y-0.5 mt-1">
                  {BROTHERS_LIST.map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        sounds.playVintageSwitch();
                        setCurrentUser(name);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                        currentUser === name
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : 'text-stone-300 hover:bg-[#1f1712]'
                      }`}
                    >
                      <span>{name}</span>
                      {currentUser === name && <span className="text-amber-400">✓</span>}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-amber-900/30">
                  {isAddingCustom ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (customNameInput.trim()) {
                          sounds.playVintageSwitch();
                          setCurrentUser(customNameInput.trim());
                          setCustomNameInput('');
                          setIsAddingCustom(false);
                          setShowUserDropdown(false);
                        }
                      }}
                      className="flex gap-1"
                    >
                      <input
                        type="text"
                        placeholder="Nhập tên..."
                        value={customNameInput}
                        onChange={(e) => setCustomNameInput(e.target.value)}
                        className="w-full bg-[#0b0806] border border-stone-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 bg-amber-500 text-neutral-950 font-bold rounded text-xs"
                      >
                        Lưu
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsAddingCustom(true)}
                      className="w-full text-left px-2 py-1 text-stone-400 hover:text-amber-400 text-[11px]"
                    >
                      + Nhập tên khác...
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Add movie button */}
          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onOpenAddModal();
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs shadow-[0_0_15px_color-mix(in_srgb,var(--color-amber-600)_40%,transparent)] transition-all whitespace-nowrap uppercase tracking-wider font-cinema active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Bỏ Phim</span>
            <span className="sm:hidden">Phim</span>
          </button>
        </div>
      </div>

      {/* Responsive Secondary Nav Bar (for Tablet & Mobile: < 1024px) */}
      <div className="flex lg:hidden border-t border-amber-900/30 px-3 py-1.5 gap-1 overflow-x-auto bg-[#0a0806]">
        <button
          onClick={() => {
            sounds.playVintageSwitch();
            setActiveTab('movies');
          }}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md shrink-0 transition-colors ${
            activeTab === 'movies'
              ? 'text-amber-300 bg-[#221a15] border border-amber-600/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Kho Phim
        </button>
        <button
          onClick={() => {
            sounds.playVintageSwitch();
            setActiveTab('wheel');
          }}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md shrink-0 transition-colors ${
            activeTab === 'wheel'
              ? 'text-amber-300 bg-[#221a15] border border-amber-600/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Vòng Quay
        </button>
        <button
          onClick={() => {
            sounds.playVintageSwitch();
            setActiveTab('sessions');
          }}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md shrink-0 transition-colors ${
            activeTab === 'sessions'
              ? 'text-amber-300 bg-[#221a15] border border-amber-600/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Lịch Chiếu
        </button>
        <button
          onClick={() => {
            sounds.playVintageSwitch();
            setActiveTab('archive');
          }}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md shrink-0 transition-colors ${
            activeTab === 'archive'
              ? 'text-amber-300 bg-[#221a15] border border-amber-600/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Đã Xem
        </button>
        <button
          onClick={() => {
            sounds.playVintageSwitch();
            setActiveTab('stats');
          }}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md shrink-0 transition-colors ${
            activeTab === 'stats'
              ? 'text-amber-300 bg-[#221a15] border border-amber-600/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Thống Kê
        </button>
        <button
          onClick={() => {
            sounds.playVintageSwitch();
            onOpenRules();
          }}
          className="px-2.5 py-1 text-xs font-semibold rounded-md shrink-0 transition-colors text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-[#1a130f] border border-amber-800/40"
        >
          <BookOpen className="w-3 h-3 text-amber-400" />
          <span>12 Điều Lệ</span>
        </button>
      </div>
    </header>
  );
};
