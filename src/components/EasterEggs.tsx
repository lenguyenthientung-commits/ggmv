import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Movie } from '../types/cinema';
import { ACHIEVEMENTS, EggEvent, EggId, Story, UNLOCK_COPY, latestLegendaryDate } from '../easterEggs';

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

// First-ever unlock of an achievement (per viewer): dismissible, 4 s, no focus trap
export const UnlockToast: React.FC<{ eggId: EggId; onDone: () => void }> = ({ eggId, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [eggId, onDone]);
  const achievement = ACHIEVEMENTS.find((a) => a.id === eggId);
  if (!achievement) return null;
  return (
    <div role="status" aria-live="polite" className="egg-toast fixed z-50 bottom-4 right-4 left-4 sm:left-auto sm:w-[340px] bg-night text-night-ink border-[1.5px] border-night-line rounded-lg p-4 shadow-[4px_4px_0_var(--color-accent)]">
      <div className="flex items-start gap-3">
        <span className="stamp !text-[11px] text-accent shrink-0 mt-0.5">Mở khóa</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[15px] leading-snug">{achievement.name}</div>
          <p className="mt-1 text-[13px] text-night-ink/70 leading-snug">{UNLOCK_COPY[eggId]}</p>
        </div>
        <button onClick={onDone} className="text-night-ink/60 hover:text-night-ink -mr-1" aria-label="Đóng">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ARCHIVE // CLASSIFIED: the hidden chapter of the hall of fame
export const ClassifiedArchive: React.FC<{ stories: Story[] }> = ({ stories }) => {
  const [open, setOpen] = useState(false);
  if (stories.length === 0) return null;

  return (
    <section className="mt-16" aria-label="Hồ sơ mật">
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

// Hall of achievements (GGMV getAchievementHallOfFame)
export const AchievementHall: React.FC<{ events: EggEvent[] }> = ({ events }) => {
  const stats = new Map<EggId, { count: number; first: string }>();
  events.forEach((e) => {
    const s = stats.get(e.eggId);
    if (!s) stats.set(e.eggId, { count: 1, first: e.createdAt });
    else {
      s.count++;
      if (e.createdAt < s.first) s.first = e.createdAt;
    }
  });
  const unlocked = ACHIEVEMENTS.filter((a) => stats.has(a.id)).length;

  return (
    <section className="mt-16" aria-label="Thành tích của hội">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <div className="label">Thành tích của hội</div>
          <h3 className="display text-[clamp(32px,4vw,44px)] mt-1.5">
            {unlocked} / {ACHIEVEMENTS.length} <span className="text-ink-3">đã mở</span>
          </h3>
        </div>
        <span className="label">{events.length} lần ghi nhận</span>
      </div>
      <div className="h-2 rounded-full border-[1.5px] border-ink bg-card overflow-hidden mb-6">
        <div className="h-full bg-accent" style={{ width: `${(unlocked / ACHIEVEMENTS.length) * 100}%` }} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a) => {
          const s = stats.get(a.id);
          return (
            <article key={a.id} className={`p-4 rounded-lg border-[1.5px] ${s ? 'panel' : 'border-dashed border-line'}`}>
              <div className={`label !text-[10px] ${s ? '!text-accent' : ''}`}>
                {s ? `Đã mở · ${s.count} lần` : 'Chưa mở'}
              </div>
              <div className={`mt-1.5 font-bold leading-snug ${s ? '' : 'text-ink-3'}`}>{a.name}</div>
              <p className="mt-1 text-[13px] text-ink-2 leading-snug">{a.description}</p>
              <p className="mt-2 text-[12px] text-ink-3 leading-snug">Điều kiện: {a.rule}</p>
              {s && (
                <div className="label !text-[10px] mt-2">Lần đầu {new Date(s.first).toLocaleDateString('vi-VN')}</div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
