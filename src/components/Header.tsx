import React, { useEffect, useRef, useState } from 'react';
import { Plus, Volume2, VolumeX, BookOpen, Check, ChevronDown, Music } from 'lucide-react';
import { soundtrack } from '../utils/soundtrack';
import { sounds } from '../utils/soundEffects';
import { AppearanceMenu } from './AppearanceMenu';
import { ThemeId, Mode } from '../theme';
import { World, WorldPref } from '../seasons/worlds';
import { WorldMark } from '../seasons/art';

type Tab = 'movies' | 'wheel' | 'sessions' | 'archive' | 'stats';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;
  onOpenAddModal: () => void;
  onOpenRules: () => void;
  themeId: ThemeId;
  setThemeId: (t: ThemeId) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  houseNote: string;
  world: World | null;
  worldPref: WorldPref;
  setWorldPref: (p: WorldPref) => void;
}

export const BROTHERS_LIST = [
  'Lil Teng',
  'Lộc',
  'Thành',
  'Shiba',
  'Hoèn',
  'Nem',
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'movies', label: 'Kho phim' },
  { id: 'wheel', label: 'Vòng quay' },
  { id: 'sessions', label: 'Lịch chiếu' },
  { id: 'archive', label: 'Bảng vàng' },
  { id: 'stats', label: 'Thống kê' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  onOpenAddModal,
  onOpenRules,
  themeId,
  setThemeId,
  mode,
  setMode,
  houseNote,
  world,
  worldPref,
  setWorldPref,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sounds.getIsMuted());

  // GG Theme soundtrack (opt-in). Browsers only allow audio after a gesture, so a saved
  // "on" preference resumes the music on the first click or key press.
  const [musicOn, setMusicOn] = useState(false);
  useEffect(() => {
    if (!soundtrack.getPreference()) return;
    const resume = () => {
      setMusicOn(soundtrack.start());
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
  }, []);
  const toggleMusic = () => {
    if (soundtrack.playing) {
      soundtrack.stop();
      setMusicOn(false);
    } else {
      setMusicOn(soundtrack.start());
    }
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playVintageSwitch();
    }
  };

  // C1 "The House Is Listening": linger on the wordmark and the venue speaks, once per session
  const [slate, setSlate] = useState<string | null>(null);
  const slateTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scheduleHouseNote = () => {
    try {
      if (sessionStorage.getItem('ggmv_house_note')) return;
    } catch {
      return;
    }
    clearTimeout(slateTimer.current);
    slateTimer.current = setTimeout(() => {
      try {
        sessionStorage.setItem('ggmv_house_note', '1');
      } catch {
        // storage blocked
      }
      setSlate(`HOUSE NOTE / ${houseNote}  ⌁`);
      slateTimer.current = setTimeout(() => setSlate(null), 2650);
    }, 900);
  };
  const cancelHouseNote = () => {
    if (!slate) clearTimeout(slateTimer.current);
  };
  useEffect(() => () => clearTimeout(slateTimer.current), []);

  const goTo = (tab: Tab) => {
    sounds.playVintageSwitch();
    setActiveTab(tab);
  };

  const navButton = (tab: { id: Tab; label: string }, compact = false) => {
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => goTo(tab.id)}
        aria-current={active ? 'page' : undefined}
        className={`relative shrink-0 font-semibold transition-colors ${
          compact ? 'h-11 px-3 text-[13px]' : 'h-16 px-3.5 text-[14px]'
        } ${active ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}
      >
        {tab.label}
        {active && <span className="absolute inset-x-3 bottom-0 h-[3px] bg-accent" />}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-paper border-b-[1.5px] border-ink">
      {slate && (
        <div className="egg-slate absolute left-4 sm:left-6 top-full mt-2 max-w-[calc(100vw-32px)] bg-night text-night-ink border-[1.5px] border-night-line border-l-[3px] !border-l-accent rounded-md px-3 py-2 label !text-night-ink !text-[10.5px] !normal-case !tracking-[0.06em]" role="status">
          {slate}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Wordmark */}
        <button
          onClick={() => goTo('movies')}
          onMouseEnter={scheduleHouseNote}
          onMouseLeave={cancelHouseNote}
          onFocus={scheduleHouseNote}
          onBlur={cancelHouseNote}
          className="flex items-center gap-2.5 min-w-0"
          aria-label="Về Kho phim"
        >
          {world ? (
            <WorldMark id={world.id} />
          ) : (
            <span className="grid place-items-center w-9 h-9 shrink-0 rounded-md bg-accent text-on-accent border-[1.5px] border-ink display text-[17px] leading-none">
              GG
            </span>
          )}
          <span className="flex flex-col items-start min-w-0">
            <span className="display text-[22px] leading-none truncate">Gay Gang</span>
            {world ? (
              <span className="label !text-accent !text-[9px] !tracking-[0.12em] leading-none mt-1 hidden min-[380px]:block truncate max-w-[140px]">{world.name}</span>
            ) : (
              <span className="jp text-[9px] leading-none mt-1 hidden min-[380px]:block">シネマクラブ</span>
            )}
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center" aria-label="Điều hướng chính">
          {TABS.map((t) => navButton(t))}
          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onOpenRules();
            }}
            className="h-16 px-3.5 text-[14px] font-semibold text-ink-3 hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Điều lệ
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <AppearanceMenu themeId={themeId} setThemeId={setThemeId} mode={mode} setMode={setMode} world={world} worldPref={worldPref} setWorldPref={setWorldPref} />
          <button
            onClick={toggleMusic}
            className={`btn-icon ${musicOn ? '!text-accent' : ''}`}
            aria-pressed={musicOn}
            aria-label={musicOn ? 'Tắt nhạc nền' : 'Bật nhạc nền GG Theme'}
            title={musicOn ? 'Tắt nhạc nền' : 'Bật nhạc nền GG Theme'}
          >
            <Music className={`w-[18px] h-[18px] ${musicOn ? 'animate-pulse' : ''}`} />
          </button>
          <button
            onClick={handleToggleSound}
            className="btn-icon"
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-[18px] h-[18px]" /> : <Volume2 className="w-[18px] h-[18px]" />}
          </button>

          {/* Member switcher */}
          <div className="relative">
            <button
              onClick={() => {
                sounds.playVintageSwitch();
                setShowUserDropdown(!showUserDropdown);
              }}
              className="flex items-center gap-2 h-[34px] pl-1 pr-2 sm:pr-2.5 rounded-full border-[1.5px] border-ink bg-card hover:bg-sunk transition-colors"
              aria-haspopup="listbox"
              aria-expanded={showUserDropdown}
              title="Đổi thành viên"
            >
              <span className="grid place-items-center w-[24px] h-[24px] rounded-full bg-ink text-paper text-[11px] font-bold">
                {currentUser.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:block text-[13px] font-semibold max-w-[88px] truncate">{currentUser}</span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-3" />
            </button>

            {showUserDropdown && (
              <div className="enter absolute right-0 mt-2 w-56 panel p-2 z-50 shadow-[4px_4px_0_var(--color-shadow)]">
                <div className="label px-2 pt-1 pb-2">Bạn là ai?</div>
                <div role="listbox">
                  {BROTHERS_LIST.map((name) => (
                    <button
                      key={name}
                      role="option"
                      aria-selected={currentUser === name}
                      onClick={() => {
                        sounds.playVintageSwitch();
                        setCurrentUser(name);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between h-9 px-2.5 rounded-md text-[14px] transition-colors ${
                        currentUser === name ? 'bg-ink text-paper font-semibold' : 'hover:bg-sunk'
                      }`}
                    >
                      <span>{name}</span>
                      {currentUser === name && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-line">
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
                      className="flex gap-1.5"
                    >
                      <input
                        type="text"
                        placeholder="Tên của bạn"
                        value={customNameInput}
                        onChange={(e) => setCustomNameInput(e.target.value)}
                        className="input !h-9 text-[13px]"
                        autoFocus
                      />
                      <button type="submit" className="btn btn-ink btn-sm !h-9">
                        Lưu
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsAddingCustom(true)}
                      className="w-full text-left h-9 px-2.5 rounded-md text-[13px] text-ink-2 hover:bg-sunk transition-colors"
                    >
                      + Tên khác…
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              sounds.playVintageSwitch();
              onOpenAddModal();
            }}
            aria-label="Thêm phim vào kho"
            className="btn btn-primary btn-sm !px-2.5 sm:!px-3.5"
          >
            <Plus className="w-4 h-4" strokeWidth={2.75} />
            <span className="hidden sm:inline">Thêm phim</span>
          </button>
        </div>
      </div>

      {/* Mobile / tablet nav */}
      <nav className="lg:hidden scroll-x flex px-2 sm:px-4 border-t border-line" aria-label="Điều hướng chính">
        {TABS.map((t) => navButton(t, true))}
        <button
          onClick={() => {
            sounds.playVintageSwitch();
            onOpenRules();
          }}
          className="h-11 px-3 shrink-0 text-[13px] font-semibold text-ink-3 hover:text-ink transition-colors"
        >
          Điều lệ
        </button>
      </nav>
    </header>
  );
};
