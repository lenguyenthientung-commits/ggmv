// Badge system: one medal per achievement. Three families:
//  - club:   the shared ledger achievements (easterEggs.ts) + milestones derived from the archive
//  - secret: hidden tricks found by this viewer (kept in this browser only)
//  - member: titles that move between members as the records change
// Like the eggs, badges decorate; they never change a pick, a score or a rank.

import type { LucideIcon } from 'lucide-react';
import {
  Armchair, Bomb, Church, Clapperboard, Compass, Crown, Dices, Eye, EyeOff, Film, Gamepad2, Gavel, Gem, Handshake, Heart, Hourglass,
  Megaphone, Package, Palette, PenLine, Popcorn, Projector, Scale, ScrollText, Sparkles, Star, Swords, Ticket, Tornado, Trophy, Vote, Wine,
} from 'lucide-react';
import { Movie } from './types/cinema';
import { ACHIEVEMENTS, EggEvent, judgeScores, rankScore } from './easterEggs';

export type Tier = 'bronze' | 'silver' | 'gold' | 'secret' | 'member';

export interface BadgeDef {
  id: string;
  name: string;
  icon: LucideIcon;
  tier: Tier;
  description: string;
  rule: string;
}

export interface EarnedBadge extends BadgeDef {
  unlocked: boolean;
  detail?: string;
}

// ---------- Club: ledger achievements get a medal ----------
const LEDGER_LOOK: Record<string, { icon: LucideIcon; tier: Tier }> = {
  NEAR_MISS: { icon: Dices, tier: 'bronze' },
  DOUBLE_FEATURE: { icon: Ticket, tier: 'silver' },
  DIVIDED_HOUSE: { icon: Swords, tier: 'silver' },
  WITNESS_PROTECTION: { icon: EyeOff, tier: 'bronze' },
  EMPTY_REEL: { icon: Film, tier: 'gold' },
  CENTURY_ROOM: { icon: Trophy, tier: 'gold' },
  PROPHECY: { icon: Sparkles, tier: 'gold' },
  END_CREDIT_SURVIVOR: { icon: ScrollText, tier: 'bronze' },
};

const byWatchDate = (movies: Movie[]) =>
  movies.filter((m) => m.watched && m.watchedDate).sort((a, b) => (a.watchedDate as string).localeCompare(b.watchedDate as string));

// ---------- Club: milestones read straight from the archive ----------
const ARCHIVE_BADGES: (BadgeDef & { check: (watched: Movie[]) => string | null })[] = [
  {
    id: 'IRON_BUTT', name: 'Mông Sắt', icon: Armchair, tier: 'silver',
    description: 'Cả hội ngồi lì qua một bộ phim dài lê thê.',
    rule: 'Xem xong một phim dài từ 180 phút trở lên.',
    check: (w) => w.find((m) => m.durationMinutes >= 180)?.title ?? null,
  },
  {
    id: 'TIME_MACHINE', name: 'Cỗ Máy Thời Gian', icon: Hourglass, tier: 'bronze',
    description: 'Lội ngược dòng về thời phim đen trắng và nhạc kèn.',
    rule: 'Xem một phim ra mắt trước năm 1970.',
    check: (w) => w.find((m) => m.year > 0 && m.year < 1970)?.title ?? null,
  },
  {
    id: 'UNANIMOUS', name: 'Đồng Lòng', icon: Handshake, tier: 'gold',
    description: 'Hiếm có khó tìm: ba giám khảo chấm y hệt nhau.',
    rule: 'Ba điểm giám khảo của một phim bằng nhau.',
    check: (w) => w.find((m) => { const s = judgeScores(m); return s.length === 3 && s[0] === s[1] && s[1] === s[2]; })?.title ?? null,
  },
  {
    id: 'PERFECT_TEN', name: 'Điểm Tuyệt Đối', icon: Star, tier: 'silver',
    description: 'Có giám khảo đã rút ra con 10 tròn trĩnh.',
    rule: 'Một giám khảo chấm 10 điểm.',
    check: (w) => w.find((m) => judgeScores(m).includes(10))?.title ?? null,
  },
  {
    id: 'EXPLORER', name: 'Nhà Thám Hiểm', icon: Compass, tier: 'silver',
    description: 'Gu của hội rộng hơn người ta tưởng.',
    rule: 'Các phim đã xem phủ ít nhất 8 thể loại khác nhau.',
    check: (w) => { const n = new Set(w.flatMap((m) => m.genres)).size; return n >= 8 ? `${n} thể loại` : null; },
  },
  {
    id: 'HOLY_SUNDAY', name: 'Chủ Nhật Thần Thánh', icon: Church, tier: 'gold',
    description: 'Bốn Chủ nhật liền nhau, Chủ nhật nào cũng có phim.',
    rule: 'Có phim xem vào 4 Chủ nhật liên tiếp.',
    check: (w) => {
      const sundays = [...new Set(w.map((m) => m.watchedDate as string).filter((d) => new Date(`${d}T00:00:00`).getDay() === 0))].sort();
      let run = 1;
      for (let i = 1; i < sundays.length; i++) {
        const gap = (new Date(`${sundays[i]}T00:00:00`).getTime() - new Date(`${sundays[i - 1]}T00:00:00`).getTime()) / 86_400_000;
        run = Math.round(gap) === 7 ? run + 1 : 1;
        if (run >= 4) return `đến ${sundays[i]}`;
      }
      return null;
    },
  },
];

export function clubBadges(movies: Movie[], events: EggEvent[]): EarnedBadge[] {
  const watched = byWatchDate(movies);
  const ledger = ACHIEVEMENTS.map((a) => ({
    id: a.id, name: a.name, description: a.description, rule: a.rule, ...LEDGER_LOOK[a.id],
    unlocked: events.some((e) => e.eggId === a.id),
  }));
  const archive = ARCHIVE_BADGES.map(({ check, ...def }) => {
    const detail = check(watched);
    return { ...def, unlocked: detail !== null, detail: detail ?? undefined };
  });
  return [...ledger, ...archive];
}

// Archive milestones only: these are the ones the client announces itself
export const archiveBadgeIds = ARCHIVE_BADGES.map((b) => b.id);

// ---------- Secret: found by poking at the app ----------
export type SecretId = 'KONAMI' | 'POPCORN' | 'PROJECTIONIST' | 'INDECISIVE';

export const SECRET_BADGES: (BadgeDef & { id: SecretId; hint: string })[] = [
  { id: 'KONAMI', name: 'Mã Gian Lận', icon: Gamepad2, tier: 'secret', description: 'Bạn biết mã của thời băng VHS. Phim tua về năm xưa.', rule: '↑ ↑ ↓ ↓ ← → ← → B A', hint: 'Những người chơi game thùng còn nhớ.' },
  { id: 'POPCORN', name: 'Nghiện Bỏng Ngô', icon: Popcorn, tier: 'secret', description: 'Gõ đúng món ăn vặt của rạp, trời đổ mưa bỏng ngô.', rule: 'Gõ chữ "popcorn" ở bất kỳ đâu.', hint: 'Món ăn vặt của rạp, đánh vần bằng tiếng Anh.' },
  { id: 'PROJECTIONIST', name: 'Thợ Chiếu Phim', icon: Projector, tier: 'secret', description: 'Bạn nghịch máy chiếu đến mức nó chập chờn.', rule: 'Bấm logo GG 7 lần liên tiếp.', hint: 'Cái logo trông có vẻ bấm được nhiều lần.' },
  { id: 'INDECISIVE', name: 'Kẻ Do Dự', icon: Tornado, tier: 'secret', description: 'Quay mãi không chốt, đến vòng quay cũng chóng mặt.', rule: 'Quay 10 lần liền mà chưa chốt phim nào.', hint: 'Vòng quay không thích bị bắt quay mãi.' },
];

const SECRETS_KEY = 'ggmv_secret_badges';
const BADGES_SEEN_KEY = 'ggmv_badges_seen';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked: the badge still shows for this visit
  }
}

export const loadSecrets = (): SecretId[] => readJson<SecretId[]>(SECRETS_KEY, []);

// Fire-and-forget hooks for any component: effects and badge unlocks travel as window events
export type FxKind = 'popcorn' | 'oldfilm' | 'projector' | 'dizzy';
export const playFx = (kind: FxKind) => window.dispatchEvent(new CustomEvent('ggmv:fx', { detail: kind }));
export const announceBadge = (id: string) => window.dispatchEvent(new CustomEvent('ggmv:badge', { detail: id }));

export function unlockSecret(id: SecretId) {
  const owned = loadSecrets();
  if (owned.includes(id)) return;
  writeJson(SECRETS_KEY, [...owned, id]);
  announceBadge(id);
}

// Archive milestones this viewer has not been told about yet. A first-time viewer adopts
// the current state silently, the same way the egg ledger does.
export function takeNewArchiveBadges(unlockedIds: string[]): string[] {
  const stored = readJson<string[] | null>(BADGES_SEEN_KEY, null);
  writeJson(BADGES_SEEN_KEY, [...new Set([...(stored ?? []), ...unlockedIds])]);
  if (stored === null) return [];
  return unlockedIds.filter((id) => !stored.includes(id));
}

// ---------- Member titles ----------
const MEMBER_TITLES: Record<string, BadgeDef> = {
  KING: { id: 'KING', name: 'Vua Đề Xuất', icon: Crown, tier: 'member', description: 'Có nhiều phim được hội xem nhất.', rule: 'Nhiều phim đã xem nhất do mình đề xuất.' },
  TASTE: { id: 'TASTE', name: 'Gu Thượng Hạng', icon: Wine, tier: 'member', description: 'Phim mình đề xuất được chấm cao nhất.', rule: 'Điểm trung bình phim đề xuất cao nhất (từ 2 phim).' },
  HARSH: { id: 'HARSH', name: 'Giám Khảo Khó Tính', icon: Gavel, tier: 'member', description: 'Tay chấm điểm keo kiệt nhất hội đồng.', rule: 'Điểm trung bình cho ra thấp nhất trong 3 giám khảo.' },
  SOFT: { id: 'SOFT', name: 'Giám Khảo Dễ Dãi', icon: Heart, tier: 'member', description: 'Phim nào cũng thấy hay.', rule: 'Điểm trung bình cho ra cao nhất trong 3 giám khảo.' },
  VOTER: { id: 'VOTER', name: 'Cử Tri Gương Mẫu', icon: Megaphone, tier: 'member', description: 'Vote nhiệt tình nhất kho phim.', rule: 'Nhiều lượt vote nhất trên các phim chưa xem.' },
};

export const MEMBER_TITLE_LIST = Object.values(MEMBER_TITLES);

const JUDGES: [keyof Movie, string][] = [['scoreTeng', 'Lil Teng'], ['scoreLoc', 'Lộc'], ['scoreThanh', 'Thành']];

// Everyone tied on the best value wins; nobody wins with no data.
function winners(values: Map<string, number>, pick: 'max' | 'min'): string[] {
  if (values.size === 0) return [];
  const best = pick === 'max' ? Math.max(...values.values()) : Math.min(...values.values());
  return [...values].filter(([, v]) => Math.abs(v - best) < 1e-9).map(([name]) => name);
}

export function memberBadges(movies: Movie[]): Map<string, EarnedBadge[]> {
  const watched = movies.filter((m) => m.watched);
  const out = new Map<string, EarnedBadge[]>();
  const give = (names: string[], def: BadgeDef, detail: (name: string) => string) =>
    names.forEach((n) => out.set(n, [...(out.get(n) ?? []), { ...def, unlocked: true, detail: detail(n) }]));

  const proposed = new Map<string, Movie[]>();
  watched.forEach((m) => {
    const p = m.suggestedBy?.trim();
    if (p && p !== 'Hệ thống') proposed.set(p, [...(proposed.get(p) ?? []), m]);
  });
  const counts = new Map([...proposed].map(([p, ms]) => [p, ms.length]));
  give(winners(counts, 'max'), MEMBER_TITLES.KING, (n) => `${counts.get(n)} phim đã xem`);

  const taste = new Map(
    [...proposed].filter(([, ms]) => ms.filter((m) => rankScore(m) > 0).length >= 2).map(([p, ms]) => {
      const scored = ms.filter((m) => rankScore(m) > 0);
      return [p, scored.reduce((a, m) => a + rankScore(m), 0) / scored.length];
    })
  );
  give(winners(taste, 'max'), MEMBER_TITLES.TASTE, (n) => `TB ${taste.get(n)!.toFixed(2)}`);

  const given = new Map<string, number>();
  JUDGES.forEach(([field, name]) => {
    const scores = watched.map((m) => m[field]).filter((s): s is number => typeof s === 'number' && Number.isFinite(s));
    if (scores.length >= 3) given.set(name, scores.reduce((a, b) => a + b, 0) / scores.length);
  });
  if (given.size >= 2) {
    give(winners(given, 'min'), MEMBER_TITLES.HARSH, (n) => `TB ${given.get(n)!.toFixed(2)}`);
    give(winners(given, 'max'), MEMBER_TITLES.SOFT, (n) => `TB ${given.get(n)!.toFixed(2)}`);
  }

  const votes = new Map<string, number>();
  movies.filter((m) => !m.watched).forEach((m) => (m.votes ?? []).forEach((v) => votes.set(v, (votes.get(v) ?? 0) + 1)));
  give(winners(votes, 'max'), MEMBER_TITLES.VOTER, (n) => `${votes.get(n)} vote`);

  return out;
}

// ---------- Personal achievements: tiered, with progress to the next tier ----------
interface PersonalDef extends Omit<BadgeDef, 'tier'> {
  unit: string;
  thresholds: number[];
  tiers?: Tier[];
  judgesOnly?: boolean;
  value: (name: string, movies: Movie[], events: EggEvent[]) => number;
}

export interface PersonalAchievement extends BadgeDef {
  level: number; // 0 = not yet, 1..thresholds.length
  maxLevel: number;
  value: number;
  next: number | null;
  unit: string;
}

const proposedBy = (name: string, movies: Movie[]) => movies.filter((m) => m.suggestedBy?.trim() === name);
const proposedWatched = (name: string, movies: Movie[]) => proposedBy(name, movies).filter((m) => m.watched);

const PERSONAL: PersonalDef[] = [
  {
    id: 'P_PROPOSER', name: 'Người Đề Xuất', icon: Clapperboard, unit: 'phim được xem', thresholds: [1, 3, 5],
    description: 'Phim mình đề xuất được cả hội ngồi xem.', rule: 'Phim do mình đề xuất đã được xem: 1 / 3 / 5.',
    value: (n, ms) => proposedWatched(n, ms).length,
  },
  {
    id: 'P_STOCK', name: 'Thủ Kho', icon: Package, unit: 'phim đã thêm', thresholds: [3, 10, 20],
    description: 'Chăm chỉ nhồi phim vào kho.', rule: 'Số phim mình đề xuất vào kho: 3 / 10 / 20.',
    value: (n, ms) => proposedBy(n, ms).length,
  },
  {
    id: 'P_VOTER', name: 'Lá Phiếu Vàng', icon: Vote, unit: 'vote', thresholds: [5, 15, 30],
    description: 'Không bỏ lỡ lần bầu chọn nào.', rule: 'Tổng số vote đã bỏ: 5 / 15 / 30.',
    value: (n, ms) => ms.filter((m) => m.votes?.includes(n)).length,
  },
  {
    id: 'P_CRITIC', name: 'Nhà Phê Bình', icon: PenLine, unit: 'review', thresholds: [1, 5, 10],
    description: 'Xem xong là phải có ý kiến.', rule: 'Số review đã viết: 1 / 5 / 10.',
    value: (n, ms) => ms.reduce((acc, m) => acc + (m.reviews ?? []).filter((r) => r.author === n).length, 0),
  },
  {
    id: 'P_JUDGE', name: 'Cầm Cân Nảy Mực', icon: Scale, unit: 'phim đã chấm', thresholds: [5, 10, 20], judgesOnly: true,
    description: 'Giám khảo chấm điểm đều tay.', rule: 'Số phim đã chấm điểm giám khảo: 5 / 10 / 20.',
    value: (n, ms) => {
      const field = JUDGES.find(([, j]) => j === n)?.[0];
      return field ? ms.filter((m) => m.watched && typeof m[field] === 'number').length : 0;
    },
  },
  {
    id: 'P_ORACLE', name: 'Nhà Tiên Tri', icon: Eye, unit: 'lần phán trúng', thresholds: [1, 3, 5],
    description: 'Phán trước khi quay, và vòng quay nghe lời.', rule: 'Số lần tiên tri trúng: 1 / 3 / 5.',
    value: (n, _ms, evs) => evs.filter((e) => e.eggId === 'PROPHECY' && String(e.evidence.member ?? '').trim() === n).length,
  },
  {
    id: 'P_GEM', name: 'Viên Ngọc Ẩn', icon: Gem, unit: 'phim từ 8.5 điểm', thresholds: [1, 3], tiers: ['silver', 'gold'],
    description: 'Đề xuất phim được chấm rất cao.', rule: 'Phim mình đề xuất đạt điểm trung bình từ 8.5: 1 / 3.',
    value: (n, ms) => proposedWatched(n, ms).filter((m) => rankScore(m) >= 8.5).length,
  },
  {
    id: 'P_DISASTER', name: 'Thảm Họa Có Chủ Đích', icon: Bomb, unit: 'phim dưới 5 điểm', thresholds: [1], tiers: ['bronze'],
    description: 'Có người phải chịu trách nhiệm cho buổi chiếu đó.', rule: 'Phim mình đề xuất bị chấm trung bình dưới 5.',
    value: (n, ms) => proposedWatched(n, ms).filter((m) => rankScore(m) > 0 && rankScore(m) < 5).length,
  },
  {
    id: 'P_PALETTE', name: 'Bảng Màu Đa Sắc', icon: Palette, unit: 'thể loại', thresholds: [5, 8], tiers: ['silver', 'gold'],
    description: 'Gu đề xuất không đóng khung một thể loại.', rule: 'Phim mình đề xuất (đã xem) phủ 5 / 8 thể loại.',
    value: (n, ms) => new Set(proposedWatched(n, ms).flatMap((m) => m.genres)).size,
  },
];

const DEFAULT_TIERS: Tier[] = ['bronze', 'silver', 'gold'];

export function personalAchievements(name: string, movies: Movie[], events: EggEvent[]): PersonalAchievement[] {
  const isJudge = JUDGES.some(([, j]) => j === name);
  return PERSONAL.filter((p) => !p.judgesOnly || isJudge).map(({ value, thresholds, tiers = DEFAULT_TIERS, judgesOnly: _j, ...def }) => {
    const v = value(name, movies, events);
    const level = thresholds.filter((t) => v >= t).length;
    return {
      ...def,
      tier: tiers[Math.max(0, level - 1)],
      level,
      maxLevel: thresholds.length,
      value: v,
      next: level < thresholds.length ? thresholds[level] : null,
    };
  });
}

export function findBadge(id: string, movies: Movie[], events: EggEvent[]): BadgeDef | undefined {
  return clubBadges(movies, events).find((b) => b.id === id) ?? SECRET_BADGES.find((b) => b.id === id);
}
