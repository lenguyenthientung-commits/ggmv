import React, { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Movie } from '../types/cinema';
import { sounds } from '../utils/soundEffects';
import { EggEvent, EggId, Story, UNLOCK_COPY, latestLegendaryDate } from '../easterEggs';
import { BadgeDef, FxKind, Tier, SECRET_BADGES, clubBadges, loadSecrets, memberBadges, playFx, unlockSecret } from '../badges';
import { BROTHERS_LIST } from './Header';

// C3 Projector dust: when the pointer rests, a speck resolves under it. Never captures input.
export const ProjectorDust: React.FC = () => {
  const [pos, setPos] = useState<{ x: number; y: number; n: number } | null>(null);
  const lastShown = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        // a long cooldown keeps it a found detail, not a cursor effect
        if (Date.now() - lastShown.current < 20_000) return;
        lastShown.current = Date.now();
        setPos({
          x: Math.max(8, Math.min(window.innerWidth - 16, e.clientX)),
          y: Math.max(8, Math.min(window.innerHeight - 16, e.clientY)),
          n: Date.now(),
        });
      }, 850);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointermove', onMove);
    };
  }, []);

  if (!pos) return null;
  return (
    <span
      key={pos.n}
      className="egg-dust"
      style={{ left: pos.x, top: pos.y }}
      title="A frame escaped."
      aria-hidden="true"
    >
      ✧
    </span>
  );
};

// C2 Intermission clock: at 00:00 (club time) the archive shows a 5-second card
export const IntermissionCard: React.FC<{ movies: Movie[] }> = ({ movies }) => {
  const [text, setText] = useState<string | null>(null);
  const lastDate = useRef('');
  const moviesRef = useRef(movies);
  moviesRef.current = movies;

  useEffect(() => {
    const check = () => {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
        }).formatToParts(new Date()).map((p) => [p.type, p.value])
      );
      const today = `${parts.year}-${parts.month}-${parts.day}`;
      if (parts.hour !== '00' || parts.minute !== '00' || lastDate.current === today) return;
      lastDate.current = today;
      const legendary = latestLegendaryDate(moviesRef.current);
      const clue = legendary ? ` / ${new Date(`${legendary}T00:00:00`).toLocaleDateString('vi-VN')}` : '';
      setText(`INTERMISSION / The room has been here before.${clue}`);
      setTimeout(() => setText(null), 5000);
    };
    const interval = setInterval(check, 20_000);
    return () => clearInterval(interval);
  }, []);

  return text ? (
    <div className="enter fixed z-40 top-20 left-1/2 -translate-x-1/2 bg-night text-night-ink border-[1.5px] border-night-line rounded-md px-4 py-2.5 label !text-night-ink !text-[11px]" role="status">
      {text}
    </div>
  ) : null;
};

// ---------- Badges ----------
const TIER_COLORS: Record<Tier | 'locked', [string, string, string]> = {
  gold: ['#FFE27A', '#D9A106', '#7A5600'],
  silver: ['#F4F6F8', '#AEB6BF', '#56616C'],
  bronze: ['#F5B985', '#B8692E', '#6A3610'],
  secret: ['#D4C4FF', '#7C4DFF', '#35197F'],
  member: ['#A8F2E3', '#1FB89A', '#0D5A4C'],
  locked: ['#E6E6E6', '#B9B9B9', '#7D7D7D'],
};
const TIER_LABEL: Record<Tier, string> = { gold: 'Vàng', silver: 'Bạc', bronze: 'Đồng', secret: 'Bí mật', member: 'Danh hiệu' };

// A rosette with 18 scallops, tier-colored, plus two ribbon tails
const ROSETTE = Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 === 0 ? 46 : 41.5;
  return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
}).join(' ');

export const BadgeMedal: React.FC<{ badge: BadgeDef; unlocked: boolean; size?: number; shine?: boolean }> = ({ badge, unlocked, size = 64, shine }) => {
  const uid = useId().replace(/:/g, '');
  const [hi, mid, lo] = TIER_COLORS[unlocked ? badge.tier : 'locked'];
  const glyph = !unlocked && badge.tier === 'secret' ? '?' : badge.glyph;
  return (
    <svg
      viewBox="0 0 100 116"
      width={size}
      height={size * 1.16}
      className={`badge-medal shrink-0 ${unlocked ? '' : 'is-locked'}`}
      role="img"
      aria-label={`${badge.name}${unlocked ? '' : ' (chưa mở)'}`}
    >
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <linearGradient id={`s${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`c${uid}`}>
          <polygon points={ROSETTE} />
        </clipPath>
      </defs>
      <polygon points="30,78 22,114 36,106 44,116 50,82" fill={lo} stroke="var(--color-ink)" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="70,78 78,114 64,106 56,116 50,82" fill={mid} stroke="var(--color-ink)" strokeWidth="2" strokeLinejoin="round" />
      <polygon points={ROSETTE} fill={`url(#g${uid})`} stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="31" fill={hi} fillOpacity="0.35" stroke={lo} strokeWidth="2" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="2 3" />
      <text x="50" y="51" textAnchor="middle" dominantBaseline="central" fontSize="30" opacity={unlocked ? 1 : 0.4}
        fontWeight={900} fill={lo} style={{ filter: unlocked ? undefined : 'grayscale(1)' }}>
        {glyph}
      </text>
      <g clipPath={`url(#c${uid})`}>
        <rect className={`medal-shine ${shine ? 'is-auto' : ''}`} x="-60" y="-10" width="40" height="120" fill={`url(#s${uid})`} transform="skewX(-20)" />
      </g>
    </svg>
  );
};

// A new badge (ledger, archive milestone or secret): medal flips in, popcorn bursts out
const BURST = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  const d = 70 + (i % 3) * 22;
  return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, glyph: i % 4 === 0 ? '🍿' : i % 2 ? '✦' : '★' };
});

export const BadgeToast: React.FC<{ badge: BadgeDef; copy?: string; onDone: () => void }> = ({ badge, copy, onDone }) => {
  useEffect(() => {
    sounds.playUnlockSting();
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [badge.id, onDone]);
  return (
    <div role="status" aria-live="polite" className="egg-toast fixed z-50 bottom-4 right-4 left-4 sm:left-auto sm:w-[360px] bg-night text-night-ink border-[1.5px] border-night-line rounded-lg p-4 shadow-[4px_4px_0_var(--color-accent)]">
      <div className="flex items-center gap-4">
        <span className="relative shrink-0">
          <span className="badge-flip block"><BadgeMedal badge={badge} unlocked size={60} shine /></span>
          <span className="absolute left-1/2 top-[40%]" aria-hidden="true">
            {BURST.map((p, i) => (
              <span key={i} className="badge-burst" style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, animationDelay: `${250 + (i % 4) * 30}ms` } as React.CSSProperties}>
                {p.glyph}
              </span>
            ))}
          </span>
        </span>
        <div className="flex-1 min-w-0">
          <span className="stamp !text-[10px] text-accent">Mở khóa · {TIER_LABEL[badge.tier]}</span>
          <div className="mt-1.5 font-bold text-[16px] leading-snug">{badge.name}</div>
          <p className="mt-1 text-[13px] text-night-ink/70 leading-snug">{copy ?? badge.description}</p>
        </div>
        <button onClick={onDone} className="self-start text-night-ink/60 hover:text-night-ink -mr-1" aria-label="Đóng">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const badgeCopy = (id: string): string | undefined => UNLOCK_COPY[id as EggId];

// ---------- Hidden effects ----------
// Konami code -> old film, typing "popcorn" -> popcorn rain. Other parts of the app call playFx().
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const FX_MS: Record<FxKind, number> = { popcorn: 4500, oldfilm: 8000, projector: 2600, dizzy: 2400 };

export const FxLayer: React.FC = () => {
  const [active, setActive] = useState<Partial<Record<FxKind, number>>>({});

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const onFx = (e: Event) => {
      const kind = (e as CustomEvent<FxKind>).detail;
      const stamp = Date.now();
      setActive((a) => ({ ...a, [kind]: stamp }));
      document.documentElement.classList.add(`fx-${kind}`);
      timers.push(setTimeout(() => {
        setActive((a) => (a[kind] === stamp ? { ...a, [kind]: undefined } : a));
        document.documentElement.classList.remove(`fx-${kind}`);
      }, FX_MS[kind]));
    };

    let keys: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      keys = [...keys, e.key.toLowerCase()].slice(-10);
      if (keys.join() === KONAMI.join()) {
        keys = [];
        playFx('oldfilm');
        unlockSecret('KONAMI');
      } else if (keys.slice(-7).join('') === 'popcorn') {
        keys = [];
        playFx('popcorn');
        unlockSecret('POPCORN');
      }
    };

    window.addEventListener('ggmv:fx', onFx);
    window.addEventListener('keydown', onKey);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('ggmv:fx', onFx);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      {active.popcorn && (
        <div key={active.popcorn} className="fx-rain" aria-hidden="true">
          {Array.from({ length: 36 }, (_, i) => (
            <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.137) % 1.4}s`, animationDuration: `${2.1 + ((i * 0.31) % 1.3)}s`, fontSize: `${18 + ((i * 7) % 16)}px` }}>
              🍿
            </span>
          ))}
        </div>
      )}
      {active.oldfilm && <div key={active.oldfilm} className="fx-oldfilm-layer" aria-hidden="true"><span className="fx-scratch" /><span className="fx-scratch fx-scratch-2" /></div>}
      {active.projector && <div key={active.projector} className="fx-projector-layer" aria-hidden="true" />}
    </>
  );
};

// ARCHIVE // CLASSIFIED: the hidden chapter of the hall of fame
export const ClassifiedArchive: React.FC<{ stories: Story[]; openSignal?: number }> = ({ stories, openSignal = 0 }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // A solved chain opens the archive and brings it into view
  useEffect(() => {
    if (!openSignal) return;
    setOpen(true);
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [openSignal]);

  if (stories.length === 0) return null;

  return (
    <section ref={ref} className="mt-16 scroll-mt-24" aria-label="Hồ sơ mật">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 bg-night text-night-ink rounded-lg border-[1.5px] border-ink px-5 py-4 text-left"
      >
        <span className="min-w-0">
          <span className="label !text-night-ink/60 block">Archive // Classified</span>
          <span className="display text-[28px] sm:text-[34px] block mt-1">Hồ sơ mật · {stories.length}</span>
        </span>
        <span className="label !text-night-ink shrink-0">{open ? 'Đóng hồ sơ' : 'Mở hồ sơ'}</span>
      </button>

      {open && (
        <div className="enter mt-4">
          <p className="text-[14px] text-ink-2 mb-5">The following screenings remain admissible evidence.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((s, i) => (
              <article key={`${s.id}-${s.movieId ?? i}`} className="panel p-4 border-l-[4px] !border-l-accent">
                <div className="label !text-[10px] !text-accent">{s.label}</div>
                <div className="mt-1.5 font-bold leading-snug">{s.title}</div>
                <p className="mt-1 text-[13px] text-ink-2 leading-snug">{s.detail}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

// Hall of badges (GGMV getAchievementHallOfFame + medals, member titles, secrets)
export const AchievementHall: React.FC<{ events: EggEvent[]; movies: Movie[] }> = ({ events, movies }) => {
  const stats = new Map<string, { count: number; first: string }>();
  events.forEach((e) => {
    const s = stats.get(e.eggId);
    if (!s) stats.set(e.eggId, { count: 1, first: e.createdAt });
    else {
      s.count++;
      if (e.createdAt < s.first) s.first = e.createdAt;
    }
  });
  const club = clubBadges(movies, events);
  const unlocked = club.filter((b) => b.unlocked).length;
  const members = memberBadges(movies);
  const secrets = loadSecrets();

  return (
    <section className="mt-16" aria-label="Huy hiệu của hội">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <div className="label">Huy hiệu của hội</div>
          <h3 className="display text-[clamp(32px,4vw,44px)] mt-1.5">
            {unlocked} / {club.length} <span className="text-ink-3">đã mở</span>
          </h3>
        </div>
        <span className="label">{events.length} lần ghi nhận</span>
      </div>
      <div className="h-2 rounded-full border-[1.5px] border-ink bg-card overflow-hidden mb-6">
        <div className="h-full bg-accent" style={{ width: `${(unlocked / club.length) * 100}%` }} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {club.map((b) => {
          const s = stats.get(b.id);
          return (
            <article key={b.id} className={`flex gap-4 p-4 rounded-lg border-[1.5px] ${b.unlocked ? 'panel' : 'border-dashed border-line'}`}>
              <BadgeMedal badge={b} unlocked={b.unlocked} size={56} />
              <div className="min-w-0">
                <div className={`label !text-[10px] ${b.unlocked ? '!text-accent' : ''}`}>
                  {TIER_LABEL[b.tier]} · {b.unlocked ? (s ? `Đã mở · ${s.count} lần` : 'Đã mở') : 'Chưa mở'}
                </div>
                <div className={`mt-1 font-bold leading-snug ${b.unlocked ? '' : 'text-ink-3'}`}>{b.name}</div>
                <p className="mt-1 text-[13px] text-ink-2 leading-snug">{b.description}</p>
                <p className="mt-2 text-[12px] text-ink-3 leading-snug">Điều kiện: {b.rule}</p>
                {b.unlocked && (s || b.detail) && (
                  <div className="label !text-[10px] mt-2">{s ? `Lần đầu ${new Date(s.first).toLocaleDateString('vi-VN')}` : b.detail}</div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12 mb-5">
        <div className="label">Danh hiệu thành viên</div>
        <p className="mt-1.5 text-[14px] text-ink-2">Danh hiệu đổi chủ theo dữ liệu. Ai giữ được lâu thì giữ.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BROTHERS_LIST.map((name) => {
          const owned = members.get(name) ?? [];
          return (
            <article key={name} className="panel p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center w-8 h-8 rounded-full bg-ink text-paper text-[13px] font-bold">{name.charAt(0).toUpperCase()}</span>
                <span className="font-bold">{name}</span>
                <span className="label !text-[10px] ml-auto">{owned.length} danh hiệu</span>
              </div>
              {owned.length ? (
                <ul className="mt-3 space-y-2">
                  {owned.map((b) => (
                    <li key={b.id} className="flex items-center gap-3" title={b.rule}>
                      <BadgeMedal badge={b} unlocked size={34} />
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold leading-tight">{b.name}</span>
                        <span className="block text-[12px] text-ink-3">{b.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[13px] text-ink-3">Chưa có danh hiệu nào. Còn thời gian.</p>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-12 mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label">Huy hiệu bí mật</div>
          <p className="mt-1.5 text-[14px] text-ink-2">Chỉ tính trên trình duyệt này. Gợi ý thì có, đáp án thì không.</p>
        </div>
        <span className="label">{secrets.length} / {SECRET_BADGES.length}</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SECRET_BADGES.map((b) => {
          const found = secrets.includes(b.id);
          return (
            <article key={b.id} className={`flex flex-col items-center text-center p-4 rounded-lg border-[1.5px] ${found ? 'panel' : 'border-dashed border-line'}`}>
              <BadgeMedal badge={b} unlocked={found} size={60} />
              <div className={`mt-2 font-bold leading-snug ${found ? '' : 'text-ink-3'}`}>{found ? b.name : '???'}</div>
              <p className="mt-1 text-[12px] text-ink-2 leading-snug">{found ? b.description : b.hint}</p>
              {found && <p className="mt-1.5 text-[11px] text-ink-3">{b.rule}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
};

// Chain C ending: a silent 13-frame end card, then THE ROOM STAYED. Click or Esc skips it.
export const EndCard: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [lit, setLit] = useState(reduced ? 13 : 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDone();
    window.addEventListener('keydown', onKey);
    let timer: ReturnType<typeof setTimeout>;
    if (!reduced) {
      let n = 0;
      const step = () => {
        n += 1;
        setLit(n);
        timer = setTimeout(n < 13 ? step : onDone, n < 13 ? 130 : 2600);
      };
      timer = setTimeout(step, 300);
    } else {
      timer = setTimeout(onDone, 3200);
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [onDone, reduced]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-night text-night-ink grid place-items-center overlay-enter cursor-pointer"
      onClick={onDone}
      role="dialog"
      aria-label="The room stayed"
    >
      <div className="text-center px-6">
        <div className="flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: 13 }, (_, i) => (
            <span
              key={i}
              className="w-4 h-6 sm:w-6 sm:h-9 rounded-[2px] border border-night-line transition-colors duration-100"
              style={{ background: i < lit ? 'var(--color-night-ink)' : 'transparent' }}
            />
          ))}
        </div>
        <div className={`display mt-8 text-[clamp(44px,8vw,96px)] transition-opacity duration-500 ${lit >= 13 ? 'opacity-100' : 'opacity-0'}`}>
          The room stayed
        </div>
        <div className={`label !text-night-ink/50 mt-4 transition-opacity duration-500 ${lit >= 13 ? 'opacity-100' : 'opacity-0'}`}>
          A-13 · 13 frames · no sound
        </div>
      </div>
    </div>
  );
};
