import React, { useEffect, useRef, useState } from 'react';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { THEMES, ThemeId, Mode } from '../theme';
import { sounds } from '../utils/soundEffects';
import { WORLDS, World, WorldPref, scheduledWorld, worldById } from '../seasons/worlds';

interface AppearanceMenuProps {
  themeId: ThemeId;
  setThemeId: (t: ThemeId) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  world: World | null;
  worldPref: WorldPref;
  setWorldPref: (p: WorldPref) => void;
}

const MODES: { id: Mode; label: string; icon: React.ReactNode }[] = [
  { id: 'light', label: 'Sáng', icon: <Sun className="w-3.5 h-3.5" /> },
  { id: 'dark', label: 'Tối', icon: <Moon className="w-3.5 h-3.5" /> },
  { id: 'system', label: 'Hệ thống', icon: <Monitor className="w-3.5 h-3.5" /> },
];

export const AppearanceMenu: React.FC<AppearanceMenuProps> = ({ themeId, setThemeId, mode, setMode, world, worldPref, setWorldPref }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          sounds.playVintageSwitch();
          setOpen(!open);
        }}
        className="btn-icon"
        aria-label="Giao diện"
        aria-expanded={open}
        title="Giao diện"
      >
        <Palette className="w-[18px] h-[18px]" />
      </button>

      {open && (
        <div className="enter fixed left-3 right-3 top-[68px] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[330px] max-h-[calc(100vh-84px)] overflow-y-auto panel p-4 z-50 shadow-[4px_4px_0_var(--color-shadow)]">
          {/* Seasonal worlds: opt-in, a whole visual universe per occasion */}
          <div className="label mb-2">Thế giới mùa</div>
          <div className="seg w-full mb-2">
            <button aria-pressed={worldPref === 'off'} onClick={() => setWorldPref('off')} className="flex-1">Tắt</button>
            <button aria-pressed={worldPref === 'auto'} onClick={() => setWorldPref('auto')} className="flex-1">
              Theo lịch
            </button>
          </div>
          {worldPref === 'auto' && (
            <p className="text-[12px] text-ink-3 mb-2 leading-snug">
              {scheduledWorld() ? `Hôm nay đang trong mùa “${worldById(scheduledWorld())?.name}”.` : 'Hôm nay không có mùa nào, giao diện giữ nguyên.'}
            </p>
          )}
          <div className="space-y-1" role="radiogroup" aria-label="Thế giới mùa">
            {WORLDS.map((w) => {
              const active = worldPref === w.id;
              return (
                <button
                  key={w.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    sounds.playVintageSwitch();
                    setWorldPref(w.id);
                  }}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md border-[1.5px] text-left transition-colors ${
                    active ? 'border-ink bg-sunk' : 'border-transparent hover:bg-sunk'
                  }`}
                >
                  <span className="relative w-8 h-8 shrink-0 rounded-md border border-line overflow-hidden" style={{ background: w.swatch[0] }} aria-hidden="true">
                    <span className="absolute right-1 bottom-1 w-3.5 h-3.5 rounded-full" style={{ background: w.swatch[1] }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold leading-tight">{w.name}</span>
                    <span className="block text-[11.5px] text-ink-3 leading-snug truncate">{w.kicker}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="label mt-5 mb-2">Chế độ</div>
          <div className="seg w-full">
            {MODES.map((m) => (
              <button
                key={m.id}
                aria-pressed={mode === m.id}
                onClick={() => setMode(m.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5"
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          <div className="label mt-5 mb-2">Bảng màu</div>
          {world && (
            <p className="text-[12px] text-ink-3 mb-2 leading-snug">
              Đang ở thế giới “{world.name}”: chế độ và bảng màu tạm nhường chỗ cho màu của mùa.
            </p>
          )}
          <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Bảng màu">
            {THEMES.map((t) => {
              const active = themeId === t.id;
              return (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    sounds.playVintageSwitch();
                    setThemeId(t.id);
                  }}
                  className={`flex items-center gap-2.5 h-11 px-2.5 rounded-md border-[1.5px] text-left transition-colors ${
                    active ? 'border-ink bg-sunk' : 'border-transparent hover:bg-sunk'
                  }`}
                >
                  {/* Swatch: ink disc with the accent disc overlapping */}
                  <span className="relative w-7 h-5 shrink-0" aria-hidden="true">
                    <span className="absolute left-0 top-0 w-5 h-5 rounded-full border border-line" style={{ background: t.ink }} />
                    <span className="absolute right-0 top-0 w-5 h-5 rounded-full border border-line" style={{ background: t.accent }} />
                  </span>
                  <span className="flex-1 min-w-0 text-[13px] font-semibold leading-tight">{t.name}</span>
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};
