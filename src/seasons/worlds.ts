// Seasonal worlds: "Linh hồn & Thể xác" (Soul & Body).
// Each world is a separate visual universe (palette, shape, type, key visual, motion, copy)
// built on the same two characters: Hồn (a soul made of projector light) and Xác (a faceless
// body). Visual tokens live in worlds.css under html[data-world="<id>"]; art in art.tsx.
//
// Worlds are opt-in: the default preference is "off". "auto" follows the calendar below.

export type WorldId = 'halloween' | 'tet' | 'valentine' | 'christmas' | 'mid-autumn';
export type WorldPref = 'off' | 'auto' | WorldId;

export interface World {
  id: WorldId;
  name: string;      // menu label
  concept: string;   // one-line story of the soul/body collision
  kicker: string;    // hero kicker
  headline: [string, string]; // hero headline, two lines (second line takes the accent)
  tagline: string;   // hero paragraph
  signoff: string;   // footer line
  dark: boolean;     // world palette is dark (browser chrome, scrollbars)
  swatch: [string, string]; // menu preview: base, accent
}

export const WORLDS: World[] = [
  {
    id: 'halloween',
    name: 'Bị Ám',
    concept: 'Hồn chui vào cổ một cái Xác vừa mất đầu.',
    kicker: 'Halloween · Possession',
    headline: ['Ai đang', 'xem phim?'],
    tagline: 'Đêm nay có một khán giả không mua vé. Nó ngồi ghế giữa, và nó vote rồi.',
    signoff: 'Không ai rời rạp lúc tắt đèn. Có thứ gì đó vừa vào.',
    dark: true,
    swatch: ['#16101c', '#b8ff3b'],
  },
  {
    id: 'tet',
    name: 'Hồn Về',
    concept: 'Cái Xác gói lá dong mở nắp, các hồn nhỏ bay về đủ mặt.',
    kicker: 'Tết · Đoàn viên & Tái sinh',
    headline: ['Hồn về', 'đủ mặt'],
    tagline: 'Năm mới, kho phim mới, ghế cũ. Ai đi xa cũng về kịp suất đầu năm.',
    signoff: 'Một năm, một nhà, một máy chiếu. Chúc cả hội phim hay vạn sự.',
    dark: false,
    swatch: ['#f3ecdc', '#d6336c'],
  },
  {
    id: 'valentine',
    name: 'Hai Hồn',
    concept: 'Hai hồn rời ngực hai cái Xác và xoắn thành một trái tim.',
    kicker: 'Valentine · Heart, Soul & Desire',
    headline: ['Hai hồn', 'một vé'],
    tagline: 'Không cần người yêu. Chỉ cần một người chịu ngồi xem hết credit cùng bạn.',
    signoff: 'Tim đập theo nhịp 24 khung hình mỗi giây.',
    dark: false,
    swatch: ['#fbe9e4', '#ff2e63'],
  },
  {
    id: 'christmas',
    name: 'Tuyết Ngược',
    concept: 'Người tuyết thở ra linh hồn, và linh hồn mang luôn củ cà rốt đi.',
    kicker: 'Giáng sinh · Surreal Wonderland',
    headline: ['Tuyết rơi', 'ngược lên'],
    tagline: 'Ở rạp này tuyết bay lên trời, người tuyết bị cướp mũi, và phim vẫn chiếu đúng giờ.',
    signoff: 'Quà lớn nhất năm: không ai spoil cái kết.',
    dark: false,
    swatch: ['#eaf2f4', '#ff7a1a'],
  },
  {
    id: 'mid-autumn',
    name: 'Lên Cung Trăng',
    concept: 'Xác níu rễ đa ở lại mặt đất, Hồn leo rễ lên trăng.',
    kicker: 'Trung thu · Lunar Spirits',
    headline: ['Hồn lên', 'cung trăng'],
    tagline: 'Chú Cuội bám rễ đa mà bay. Cả hội bám vòng quay mà chọn phim.',
    signoff: 'Trăng tròn rồi. Đồng thuận của hội vẫn còn khuyết.',
    dark: true,
    swatch: ['#0d1330', '#ffc857'],
  },
];

export const worldById = (id: string | null | undefined) => WORLDS.find((w) => w.id === id) ?? null;

// ---------- Calendar ("auto") ----------
// Lunar holidays have no simple rule; dates are listed per year (Asia/Ho_Chi_Minh).
const TET: Record<number, string> = { 2026: '02-17', 2027: '02-06', 2028: '01-26', 2029: '02-13', 2030: '02-03' };
const MID_AUTUMN: Record<number, string> = { 2026: '09-25', 2027: '09-15', 2028: '10-03', 2029: '09-22', 2030: '09-12' };

const DAY = 86_400_000;
const at = (year: number, md: string) => new Date(`${year}-${md}T00:00:00+07:00`).getTime();

function vnToday(): number {
  const d = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
  return new Date(`${d}T00:00:00+07:00`).getTime();
}

export function scheduledWorld(now = vnToday()): WorldId | null {
  const y = new Date(now + 7 * 3600_000).getUTCFullYear();
  const within = (start: number, end: number) => now >= start && now <= end;
  // Valentine wins its three days even inside the Tết window
  if (within(at(y, '02-12'), at(y, '02-14'))) return 'valentine';
  if (TET[y] && within(at(y, TET[y]) - 10 * DAY, at(y, TET[y]) + 10 * DAY)) return 'tet';
  if (MID_AUTUMN[y] && within(at(y, MID_AUTUMN[y]) - 14 * DAY, at(y, MID_AUTUMN[y]) + 2 * DAY)) return 'mid-autumn';
  if (within(at(y, '10-15'), at(y, '11-01'))) return 'halloween';
  if (within(at(y, '12-15'), at(y, '12-26'))) return 'christmas';
  return null;
}

// ---------- Preference (per viewer) ----------
const KEY = 'ggmv_world';

export function loadWorldPref(): WorldPref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'auto' || worldById(v) ? (v as WorldPref) : 'off';
  } catch {
    return 'off';
  }
}

export function saveWorldPref(pref: WorldPref) {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    // storage blocked
  }
}

// `?world=<id>` previews a world without changing the saved preference (handy for sharing)
export function resolveWorld(pref: WorldPref): WorldId | null {
  const preview = new URLSearchParams(window.location.search).get('world');
  if (preview === 'off') return null;
  if (worldById(preview)) return preview as WorldId;
  if (pref === 'off') return null;
  if (pref === 'auto') return scheduledWorld();
  return pref;
}
