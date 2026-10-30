import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Movie } from '../types/cinema';
import { sounds } from '../utils/soundEffects';
import { EggEvent, EggId, Story, UNLOCK_COPY, isSensitiveFilm, latestLegendaryDate } from '../easterEggs';
import { isHaunted } from '../seasons/worlds';
import { BadgeDef, FxKind, SecretId, Tier, SECRET_BADGES, clubBadges, loadSecrets, memberBadges, playFx, unlockSecret } from '../badges';
import { BIRTHDAY_FACT, CAMEO_FACTS, CINEMA_FACTS, CinemaFact } from '../cinemaFacts';
import { NATIONAL_CINEMA, countriesOf, countryName } from '../data/filmCountries';
import { BROTHERS_LIST } from './Header';
import { Shiba } from './Shiba';

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
// Flat print look, same language as the rest of the UI: solid tones, ink outline, hard offset shadow.
// [face, rim, line]
const TIER_COLORS: Record<Tier | 'locked', [string, string, string]> = {
  gold: ['#F3D36B', '#D4A72C', '#3A2A00'],
  silver: ['#E6E9EC', '#AEB5BD', '#262E36'],
  bronze: ['#EDBC95', '#BC7C4F', '#3A1F0C'],
  secret: ['#D5CBF5', '#8E74DE', '#21104A'],
  member: ['#B3E4D8', '#46A88F', '#0C352C'],
  locked: ['#EEEDE9', '#D2D0C9', '#8C897F'],
};
const TIER_LABEL: Record<Tier, string> = { gold: 'Vàng', silver: 'Bạc', bronze: 'Đồng', secret: 'Bí mật', member: 'Danh hiệu' };

// A rosette with 16 scallops plus two ribbon tails
const ROSETTE = Array.from({ length: 32 }, (_, i) => {
  const a = (i / 32) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 === 0 ? 44 : 39.5;
  return `${(48 + r * Math.cos(a)).toFixed(2)},${(48 + r * Math.sin(a)).toFixed(2)}`;
}).join(' ');

export const BadgeMedal: React.FC<{ badge: BadgeDef; unlocked: boolean; size?: number }> = ({ badge, unlocked, size = 64 }) => {
  const [face, rim, line] = TIER_COLORS[unlocked ? badge.tier : 'locked'];
  const Icon = badge.icon;
  const hidden = !unlocked && badge.tier === 'secret';
  return (
    <svg
      viewBox="0 0 100 116"
      width={size}
      height={size * 1.16}
      className="shrink-0"
      role="img"
      aria-label={`${badge.name}${unlocked ? '' : ' (chưa mở)'}`}
    >
      <g stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round">
        <polygon points="28,74 20,112 34,104 42,114 48,80" fill={rim} />
        <polygon points="68,74 76,112 62,104 54,114 48,80" fill={rim} />
        {unlocked && <polygon points={ROSETTE} fill="var(--color-ink)" transform="translate(4 4)" />}
        <polygon points={ROSETTE} fill={rim} />
        <circle cx="48" cy="48" r="29" fill={face} />
      </g>
      {hidden ? (
        <text x="48" y="50" textAnchor="middle" dominantBaseline="central" className="display" fontSize="34" fill={line}>?</text>
      ) : (
        <Icon x={28} y={28} width={40} height={40} color={line} strokeWidth={2} opacity={unlocked ? 1 : 0.55} />
      )}
    </svg>
  );
};

// A new badge (ledger, archive milestone or secret): medal flips in, sparks burst out
const BURST = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const d = 64 + (i % 3) * 20;
  return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, glyph: i % 2 ? '✦' : '★' };
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
          <span className="badge-flip block"><BadgeMedal badge={badge} unlocked size={60} /></span>
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

// ---------- Cinema facts: the footer's シネマクラブ deals a trivia card ----------
const FACTS_SEEN_KEY = 'ggmv_facts_seen';
const BIRTHDAY_KEY = 'ggmv_cinema_birthday';

const readSeenFacts = (): number[] => {
  try {
    return JSON.parse(localStorage.getItem(FACTS_SEEN_KEY) || '[]');
  } catch {
    return [];
  }
};

const FactCard: React.FC<{ label: string; fact: CinemaFact; onClose: () => void; children: React.ReactNode }> = ({ label, fact, onClose, children }) => (
  <div role="status" className="egg-toast fixed z-50 bottom-4 left-4 right-4 sm:right-auto sm:w-[360px] bg-night text-night-ink border-[1.5px] border-night-line rounded-lg p-4 shadow-[4px_4px_0_var(--color-accent)]">
    <div className="flex items-start justify-between gap-3">
      <span className="label !text-accent !text-[10px]">{label}</span>
      <button onClick={onClose} className="text-night-ink/60 hover:text-night-ink -mr-1 -mt-0.5" aria-label="Đóng">
        <X className="w-4 h-4" />
      </button>
    </div>
    <div className="mt-2 font-bold text-[16px] leading-snug">{fact.title}</div>
    <p className="mt-1.5 text-[13.5px] text-night-ink/75 leading-relaxed">{fact.body}</p>
    <div className="mt-3 flex items-center justify-between">{children}</div>
  </div>
);

export const CinemaFactTrigger: React.FC = () => {
  const [card, setCard] = useState<{ fact: CinemaFact; birthday?: boolean } | null>(null);

  // 28 December: cinema's birthday card, once per day
  useEffect(() => {
    const now = new Date();
    if (now.getMonth() !== 11 || now.getDate() !== 28) return;
    const today = now.toDateString();
    try {
      if (localStorage.getItem(BIRTHDAY_KEY) === today) return;
      localStorage.setItem(BIRTHDAY_KEY, today);
    } catch {
      // storage blocked: show it anyway
    }
    setCard({ fact: BIRTHDAY_FACT, birthday: true });
  }, []);

  const deal = () => {
    sounds.playVintageSwitch();
    const seen = readSeenFacts();
    const unseen = CINEMA_FACTS.map((_, i) => i).filter((i) => !seen.includes(i));
    const pool = unseen.length ? unseen : CINEMA_FACTS.map((_, i) => i);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const next = [...new Set([...seen, pick])];
    try {
      localStorage.setItem(FACTS_SEEN_KEY, JSON.stringify(next));
    } catch {
      // storage blocked: facts still show
    }
    if (next.length >= 10) unlockSecret('CINEPHILE');
    setCard({ fact: CINEMA_FACTS[pick] });
  };

  return (
    <>
      <button onClick={deal} className="jp text-[12px] hover:text-accent transition-colors" title="Kiến thức điện ảnh">
        シネマクラブ
      </button>
      {card && (
        <FactCard
          label={card.birthday ? 'Hôm nay · Sinh nhật điện ảnh' : `Kiến thức điện ảnh · ${card.fact.tag}`}
          fact={card.fact}
          onClose={() => setCard(null)}
        >
          <span className="num text-[11px] text-night-ink/40">{readSeenFacts().length}/{CINEMA_FACTS.length} thẻ đã đọc</span>
          <button onClick={deal} className="label !text-night-ink hover:!text-accent">Thẻ khác →</button>
        </FactCard>
      )}
    </>
  );
};

// ---------- Hidden cameo: a silhouette stands in the page gutter, so it never covers a control ----------
const CAMEO_KEY = 'ggmv_cameos';
const CAMEO_GOAL = 5;

// Halloween: the silhouette becomes the world's ticketless viewer, and returns each year
const ghostKey = () => `ggmv_ghosts_${new Date().getFullYear()}`;
const GHOST_GOAL = 3;
const GHOST_LINES: CinemaFact[] = [
  { tag: 'Halloween', title: 'Ghế giữa đã có người.', body: 'Không ai thấy nó mua vé. Nó vẫn xem rất chăm.' },
  { tag: 'Halloween', title: 'Nó đã vote rồi.', body: 'Phiếu này không được tính. Nhưng nó có ý kiến.' },
];

const readCount = (key: string) => {
  try {
    return Number(localStorage.getItem(key) || 0);
  } catch {
    return 0;
  }
};
const bumpCount = (key: string) => {
  const count = readCount(key) + 1;
  try {
    localStorage.setItem(key, String(count));
  } catch {
    // storage blocked: the card still shows
  }
  return count;
};

export const HiddenCameo: React.FC<{ movies: Movie[] }> = ({ movies }) => {
  const [haunted] = useState(() => isHaunted() && readCount(ghostKey()) < GHOST_GOAL);
  // Remounted per tab: about one tab visit in three has a cameo, one in two for the ghost
  const [spot, setSpot] = useState(() =>
    Math.random() < (haunted ? 1 / 2 : 1 / 3) ? { side: Math.random() < 0.5 ? 'left' : 'right', top: 12 + Math.random() * 76 } : null
  );
  const [found, setFound] = useState<{ fact: CinemaFact; count: number; goal: number } | null>(null);

  const catchGhost = () => {
    const count = bumpCount(ghostKey());
    if (count < GHOST_GOAL) return { fact: GHOST_LINES[count - 1], count, goal: GHOST_GOAL };
    unlockSecret('LAST_ONE');
    const horror = movies.filter((m) => m.genres.includes('Kinh dị') && !isSensitiveFilm(m)).slice(0, 5).map((m) => m.title);
    return {
      fact: {
        tag: 'Halloween',
        title: 'Last one in the theater.',
        body: horror.length ? `Mọi người về hết rồi. Nó để lại danh sách phim kinh dị trong kho: ${horror.join(', ')}.` : 'Mọi người về hết rồi. Kho chưa có phim kinh dị nào, nên nó tự đi tìm phim khác.',
      },
      count,
      goal: GHOST_GOAL,
    };
  };

  const catchCameo = () => {
    sounds.playVintageSwitch();
    setSpot(null);
    if (haunted) {
      setFound(catchGhost());
      return;
    }
    const count = bumpCount(CAMEO_KEY);
    if (count >= CAMEO_GOAL) unlockSecret('CAMEO_HUNTER');
    setFound({ fact: CAMEO_FACTS[(count - 1) % CAMEO_FACTS.length], count, goal: CAMEO_GOAL });
  };

  return (
    <>
      {spot && (
        <button onClick={catchCameo} className="egg-cameo" style={{ top: `${spot.top}%`, [spot.side]: 0 }} aria-label={haunted ? 'Một bóng ma' : 'Một bóng người'} title="?">
          <svg viewBox="0 0 22 36" width="22" height="36" aria-hidden="true" fill="currentColor">
            {haunted ? (
              <path fillRule="evenodd" d="M11 2C5 2 2 7 2 13v21l4-3 3 3 2-3 2 3 3-3 4 3V13c0-6-3-11-9-11zM7 11a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm8 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
            ) : (
              <>
                <path d="M5 8h12v2H5z" />
                <path d="M7 2h8v6H7z" />
                <circle cx="11" cy="13" r="5" />
                <path d="M3 36c-2-11 1-18 8-18s10 7 8 18z" />
              </>
            )}
          </svg>
        </button>
      )}
      {found && (
        <FactCard label={`${haunted ? 'Khán giả không vé' : 'Cameo'} · ${found.fact.tag}`} fact={found.fact} onClose={() => setFound(null)}>
          <span className="num text-[11px] text-night-ink/40">{Math.min(found.count, found.goal)}/{found.goal} lần bắt gặp</span>
        </FactCard>
      )}
    </>
  );
};

// ---------- Symmetry mode: the title card, shown only while the mode is on (CSS) ----------
export const SymmetryTitle: React.FC = () => (
  <div className="sym-only mb-12">
    <Shiba outfit="lobby" size={128} className="mx-auto" />
    <div className="display mt-4 text-[clamp(26px,4vw,40px)]">Chapter One: The Screening</div>
    <div className="label mt-3">A Gay Gang Cinema Picture · Perfectly Centered</div>
  </div>
);

// ---------- Shiba, the usher: appears after a long scroll, dodges the pointer, leaves popcorn ----------
const USHER_DAY_KEY = 'ggmv_usher_day';
const USHER_SPOTS: [number, number][] = [[0.84, 0.72], [0.08, 0.58], [0.8, 0.3], [0.12, 0.72]];
const USHER_LINES = ["Hey. You've been scrolling for a while. Need some popcorn?", 'Too slow.', 'The usher does not get caught.', 'Shiba left this behind. Printed on the box: The Last Popcorn, 1977.'];
const USHER_MISSES = 3;

export const ShibaUsher: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [misses, setMisses] = useState(0);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const lastDodge = useRef(0);
  const caught = misses >= USHER_MISSES;

  const summon = () => {
    setMisses(0);
    setOpen(true);
  };

  // A long scroll brings Shiba out, at most once a day
  useEffect(() => {
    let last = window.scrollY;
    let total = 0;
    const onScroll = () => {
      total += Math.abs(window.scrollY - last);
      last = window.scrollY;
      if (total < window.innerHeight * 8) return;
      window.removeEventListener('scroll', onScroll);
      const today = new Date().toDateString();
      try {
        if (localStorage.getItem(USHER_DAY_KEY) === today) return;
        localStorage.setItem(USHER_DAY_KEY, today);
      } catch {
        // storage blocked: show it anyway
      }
      summon();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const spot = USHER_SPOTS[misses % USHER_SPOTS.length];
  const left = Math.min(spot[0] * window.innerWidth, window.innerWidth - 96);
  const top = Math.min(spot[1] * window.innerHeight, window.innerHeight - 124);

  // Eyes follow the mouse; getting close makes Shiba jump. Touch and keyboard go through onClick.
  useEffect(() => {
    if (!open || caught) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const dx = e.clientX - (left + 44);
      const dy = e.clientY - (top + 53);
      setLook({ x: Math.max(-1, Math.min(1, dx / 200)), y: Math.max(-1, Math.min(1, dy / 200)) });
      if (Math.hypot(dx, dy) < 75 && Date.now() - lastDodge.current > 450) {
        lastDodge.current = Date.now();
        setMisses((m) => m + 1);
      }
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, [open, caught, left, top]);

  // Nobody played: leave quietly
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 45_000);
    return () => clearTimeout(t);
  }, [open, misses]);

  const takePopcorn = () => {
    playFx('popcorn');
    unlockSecret('CAUGHT');
    setOpen(false);
  };
  const onRight = left > window.innerWidth / 2;

  return (
    <>
      <button onClick={summon} className="shrink-0 hover:-translate-y-0.5 transition-transform" aria-label="Gọi Shiba" title="Shiba">
        <Shiba size={36} />
      </button>
      {open && (
        <div className="egg-usher" style={{ left, top }}>
          <div
            role="status"
            className={`absolute bottom-full mb-2 w-[210px] bg-night text-night-ink border-[1.5px] border-night-line rounded-lg p-2.5 text-[13px] leading-snug flex items-start gap-2 ${onRight ? 'right-0 flex-row-reverse' : 'left-0'}`}
          >
            <span className="flex-1">{USHER_LINES[Math.min(misses, USHER_LINES.length - 1)]}</span>
            <button onClick={() => setOpen(false)} className="text-night-ink/60 hover:text-night-ink shrink-0" aria-label="Đóng">
              <X className="w-4 h-4" />
            </button>
          </div>
          {caught ? (
            <button onClick={takePopcorn} className="block mx-auto" aria-label="Nhặt gói bắp rang">
              <img src="/assets/shiba/popcorn-bag.png" alt="" width={66} height={79} draggable={false} />
            </button>
          ) : (
            <button onClick={() => setMisses((m) => m + 1)} className="block" aria-label="Bắt Shiba">
              <Shiba outfit="usher" look={look} />
            </button>
          )}
        </div>
      )}
    </>
  );
};

// ---------- Search keywords: the Kho phim search box hides a few film references ----------
export type SearchEggId = 'matrix' | 'burger' | 'wilhelm' | 'lostfilm';

const SEARCH_WORDS = new Map<string, SearchEggId>([
  ['wake up', 'matrix'],
  ['royal with cheese', 'burger'],
  ['wilhelm', 'wilhelm'],
  ['wilhelm scream', 'wilhelm'],
  ['the last popcorn', 'lostfilm'],
  ['last popcorn', 'lostfilm'],
]);
export const searchEggFor = (query: string) => SEARCH_WORDS.get(query.trim().toLowerCase().replace(/\s+/g, ' ')) ?? null;

const SIMULATION_FILES = [
  { title: 'The Matrix', year: 1999, note: 'Thế giới quanh bạn là một chương trình, và có người đang tìm cách thoát ra.' },
  { title: 'Dark City', year: 1998, note: 'Mỗi đêm cả thành phố bị sắp đặt lại, ký ức của cư dân cũng vậy.' },
  { title: 'The Truman Show', year: 1998, note: 'Một người đàn ông phát hiện cả cuộc đời mình là một trường quay.' },
  { title: 'Ex Machina', year: 2014, note: 'Một bài kiểm tra xem máy có ý thức không, nhưng ai đang kiểm tra ai?' },
];

const BURGER_TALKS = [
  [
    'Hai tiếng rưỡi phim, mà hai ông ngồi trong xe nói về bánh mì kẹp thịt.',
    'Đoạn đó mới là phim. Phần còn lại chỉ để hai ông có chỗ mà đi tới.',
    'Bánh mì thì liên quan gì tới cốt truyện?',
    'Không liên quan. Nên mới nhớ tới giờ.',
  ],
  [
    'Để ý không, phim nào có bữa ăn ngon thì nửa sau có người chết.',
    'Cái đó gọi là điềm báo.',
    'Hay tại nhà bếp dở.',
    'Trường hợp nào cũng đừng gọi tráng miệng.',
  ],
];

// The club's own invented film. Its dossier ends by admitting it; it never enters the real archive.
const LOST_FILM_FILES = [
  { tab: 'Hồ sơ', lines: ['Năm sản xuất: 1977, theo nhãn trên hộp bắp rang.', 'Thời lượng: 94 phút. Bản đạo diễn: 412 phút, gồm 318 phút nhai.', 'Xếp loại: không phù hợp với người đang đói.'] },
  { tab: 'Nhân sự', lines: ['Đạo diễn: không ký tên, và không trả lời thư.', 'Vai chính: một hạt bắp, vai diễn đầu tay. Không có phim thứ hai.', 'Người chiếu phim: tên bị gạch khỏi mọi tài liệu, kể cả tài liệu này.'] },
  { tab: 'Biên bản', lines: ['Bản phim duy nhất được cất trong một hộp bắp rang.', 'Hộp đã được một nhân viên rạp mở ra, trong giờ nghỉ.', 'Kết quả kiểm kê: không còn gì để chiếu.'] },
];

const LostFilmDossier: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [read, setRead] = useState([0]);
  const allRead = read.length === LOST_FILM_FILES.length;

  useEffect(() => {
    if (allRead) unlockSecret('LOST_FILM');
  }, [allRead]);

  const open = (i: number) => {
    sounds.playVintageSwitch();
    setTab(i);
    setRead((r) => (r.includes(i) ? r : [...r, i]));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-5">
      <div className="shrink-0 w-[150px] mx-auto sm:mx-0 rounded-md border-[1.5px] border-night-line bg-night-2 p-4 text-center" aria-hidden="true">
        <img src="/assets/shiba/popcorn-bag.png" alt="" width={80} height={96} draggable={false} className="mx-auto" />
        <div className="display mt-3 text-[20px]">The Last Popcorn</div>
        <div className="label !text-night-ink/50 !text-[10px] mt-1.5">1977</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="label !text-accent">Kho lưu trữ · Phim thất lạc</div>
        <p className="mt-2 font-bold text-[16px] leading-snug">In a world where every cinema has run out of popcorn, one projectionist must protect the last surviving kernel.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {LOST_FILM_FILES.map((f, i) => (
            <button key={f.tab} onClick={() => open(i)} aria-pressed={tab === i} className={`btn btn-sm ${tab === i ? 'btn-primary' : ''}`}>{f.tab}</button>
          ))}
        </div>
        <ul className="mt-3 space-y-1.5 text-[13.5px] text-night-ink/75 leading-snug">
          {LOST_FILM_FILES[tab].lines.map((line) => <li key={line}>{line}</li>)}
        </ul>
        {allRead && (
          <p className="mt-4 pt-3 border-t border-night-line text-[13.5px] font-bold">
            Kết luận: bộ phim này không tồn tại. Rạp dựng nó lên để có người đi tìm, và bạn vừa tìm xong.
          </p>
        )}
      </div>
    </div>
  );
};

export const SearchEgg: React.FC<{ egg: SearchEggId; movies: Movie[]; onClear: () => void }> = ({ egg, movies, onClear }) => {
  const [redPill, setRedPill] = useState(false);
  const [talk] = useState(() => BURGER_TALKS[Math.floor(Math.random() * BURGER_TALKS.length)]);
  const [crimePick] = useState(() => {
    const crime = movies.filter((m) => !m.watched && m.genres.includes('Tội phạm'));
    return crime.length ? crime[Math.floor(Math.random() * crime.length)] : null;
  });

  useEffect(() => {
    if (egg === 'burger') unlockSecret('BURGER_TALK');
    if (egg === 'wilhelm') unlockSecret('WILHELM');
  }, [egg]);

  const takeRedPill = () => {
    sounds.playVintageSwitch();
    setRedPill(true);
    unlockSecret('WHITE_RABBIT');
  };
  const inStock = (title: string) =>
    movies.some((m) => [m.title, m.originalTitle].some((t) => t?.toLowerCase() === title.toLowerCase()));

  return (
    <div className="enter bg-night text-night-ink rounded-lg border-[1.5px] border-ink p-5 sm:p-6 mb-8" role="status">
      {egg === 'matrix' && (
        <>
          <div className="label !text-[#7CFC9A]">Wake up</div>
          {!redPill ? (
            <>
              <p className="mt-2 font-bold text-[18px] leading-snug">The archive has you.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={onClear} className="btn">Viên xanh: về kho phim</button>
                <button onClick={takeRedPill} className="btn btn-primary">Viên đỏ: mở hồ sơ</button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 font-bold text-[18px] leading-snug">Hồ sơ: những thế giới không có thật.</p>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {SIMULATION_FILES.map((f) => (
                  <li key={f.title} className="border border-night-line rounded-md p-3">
                    <div className="font-bold">{f.title} <span className="num text-[12px] text-night-ink/50">{f.year}</span></div>
                    <p className="mt-1 text-[13px] text-night-ink/70 leading-snug">{f.note}</p>
                    {inStock(f.title) && <div className="label !text-[10px] !text-[#7CFC9A] mt-2">Có trong kho</div>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {egg === 'burger' && (
        <>
          <div className="label !text-accent">Quán ăn · 45 phút sau</div>
          <dl className="mt-3 space-y-2 text-[14px] leading-snug">
            {talk.map((line, i) => (
              <div key={i} className="flex gap-3">
                <dt className="label !text-night-ink/50 w-4 shrink-0">{i % 2 ? 'B' : 'A'}</dt>
                <dd>{line}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 pt-3 border-t border-night-line text-[13.5px] text-night-ink/75">
            {crimePick
              ? <>Hết chuyện rồi thì xem phim đi: <span className="font-bold text-night-ink">{crimePick.title}</span>, phim tội phạm chưa xem trong kho.</>
              : 'Kho không còn phim tội phạm nào chưa xem. Đó cũng là một tội.'}
          </p>
        </>
      )}

      {egg === 'lostfilm' && <LostFilmDossier />}

      {egg === 'wilhelm' && (
        <>
          <div className="egg-wave flex items-center gap-1 h-10" aria-hidden="true">
            {Array.from({ length: 28 }, (_, i) => (
              <span key={i} style={{ height: `${20 + ((i * 37) % 80)}%`, animationDelay: `${(i * 0.07) % 0.6}s` }} />
            ))}
          </div>
          <p className="mt-3 font-bold text-[18px] leading-snug">Congratulations. You have discovered one of cinema's most recognizable sound effects.</p>
          <p className="mt-2 text-[13.5px] text-night-ink/75 leading-relaxed">
            Tiếng hét được thu cho "Distant Drums" (1951), rồi mang tên Wilhelm, một nhân vật trong "The Charge at Feather River" (1953).
            Nhà thiết kế âm thanh Ben Burtt tìm lại nó trong kho lưu trữ và cài vào "Star Wars" (1977). Từ đó, cài tiếng hét này vào phim thành một trò đùa nội bộ của dân làm âm thanh.
          </p>
        </>
      )}
    </div>
  );
};

// ---------- Hidden effects ----------
// One popped kernel in the medal style: puffs drawn twice (ink outline, then fill) so only the silhouette is outlined
const PUFFS: [number, number, number][] = [[12, 12, 7], [21, 11, 6.5], [16, 19, 8], [9, 20, 5.5], [23, 20, 6]];
const PopcornKernel: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className="block">
    {PUFFS.map(([cx, cy, r], i) => <circle key={`o${i}`} cx={cx} cy={cy} r={r + 1.5} fill="var(--color-ink)" />)}
    {PUFFS.map(([cx, cy, r], i) => <circle key={`f${i}`} cx={cx} cy={cy} r={r} fill="#FFF6DE" />)}
    <circle cx="17" cy="20" r="3" fill="#E9B949" />
    <circle cx="11" cy="12" r="1.8" fill="#E9B949" />
  </svg>
);
// Konami code -> old film, typing "popcorn" -> popcorn rain. Other parts of the app call playFx().
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const FX_MS: Record<FxKind, number> = { popcorn: 4500, oldfilm: 8000, projector: 2600, dizzy: 2400, snow: 7000, mirror: 4000, vertigo: 2800 };

// Typed words (outside text fields): film references, each with its own effect
const WORDS: [string, FxKind | null, SecretId][] = [
  ['popcorn', 'popcorn', 'POPCORN'],
  ['rosebud', 'snow', 'ROSEBUD'],
  ['redrum', 'mirror', 'REDRUM'],
  ['vertigo', 'vertigo', 'VERTIGO'],
  ['mcguffin', null, 'MCGUFFIN'],
];
const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

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
      if (isTyping(e.target)) return;
      keys = [...keys, e.key.toLowerCase()].slice(-10);
      if (keys.join() === KONAMI.join()) {
        keys = [];
        playFx('oldfilm');
        unlockSecret('KONAMI');
        return;
      }
      const typed = keys.join('');
      const hit = WORDS.find(([word]) => typed.endsWith(word));
      if (hit) {
        keys = [];
        if (hit[1]) playFx(hit[1]);
        unlockSecret(hit[2]);
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
            <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.137) % 1.4}s`, animationDuration: `${2.1 + ((i * 0.31) % 1.3)}s` }}>
              <PopcornKernel size={20 + ((i * 7) % 18)} />
            </span>
          ))}
        </div>
      )}
      {active.snow && (
        <div key={active.snow} className="fx-rain fx-snowfall" aria-hidden="true">
          {Array.from({ length: 60 }, (_, i) => (
            <span key={i} style={{ left: `${(i * 41) % 100}%`, animationDelay: `${(i * 0.173) % 3}s`, animationDuration: `${3.6 + ((i * 0.29) % 2.4)}s`, width: 4 + (i % 4) * 2, height: 4 + (i % 4) * 2 }} />
          ))}
        </div>
      )}
      {active.oldfilm &&<div key={active.oldfilm} className="fx-oldfilm-layer" aria-hidden="true"><span className="fx-scratch" /><span className="fx-scratch fx-scratch-2" /></div>}
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

// Cinema passport: one stamp per country the club has actually watched, read from the archive
const CinemaPassport: React.FC<{ movies: Movie[] }> = ({ movies }) => {
  const [open, setOpen] = useState<string | null>(null);
  const visits = new Map<string, Movie[]>();
  movies.filter((m) => m.watched).forEach((m) =>
    countriesOf(m).forEach((c) => visits.set(c, [...(visits.get(c) ?? []), m]))
  );
  const stamps = [...visits].sort((a, b) => b[1].length - a[1].length);
  const films = open ? visits.get(open) ?? [] : [];

  return (
    <>
      <div className="mt-12 mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label">Hộ chiếu điện ảnh</div>
          <p className="mt-1.5 text-[14px] text-ink-2">Mỗi quốc gia một con dấu, tính theo phim cả hội đã xem. Bấm vào dấu để đọc.</p>
        </div>
        <span className="label">{stamps.length} quốc gia</span>
      </div>
      {stamps.length ? (
        <div className="panel screentone p-5 flex flex-wrap items-center justify-center gap-3">
          {stamps.map(([country, list], i) => (
            <button
              key={country}
              onClick={() => { sounds.playVintageSwitch(); setOpen(country); }}
              className="stamp bg-card text-accent hover:bg-sunk transition-colors"
              style={{ rotate: `${[-5, 3, -2, 6, -4, 2][i % 6]}deg` }}
            >
              {countryName(country)} · {list.length}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-ink-3">Hộ chiếu còn trắng. Chưa phim nào có thông tin quốc gia.</p>
      )}
      {stamps.length > 0 && !visits.has('Vietnam') && (
        <p className="mt-3 text-[13px] text-ink-3">Hộ chiếu đi khắp nơi mà chưa có dấu Việt Nam. Hơi kỳ.</p>
      )}
      {open && (
        <FactCard
          label={`Hộ chiếu · ${countryName(open)}${NATIONAL_CINEMA[open]?.fact ? ` · ${NATIONAL_CINEMA[open].fact!.tag}` : ''}`}
          fact={NATIONAL_CINEMA[open]?.fact ?? { tag: '', title: countryName(open), body: 'Rạp chưa có ghi chép nào về nền điện ảnh này.' }}
          onClose={() => setOpen(null)}
        >
          <span className="text-[12px] text-night-ink/50 leading-snug">Đã xem: {films.map((m) => m.title).join(', ')}</span>
        </FactCard>
      )}
    </>
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

      <CinemaPassport movies={movies} />

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
