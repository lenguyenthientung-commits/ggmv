// Color theme + light/dark mode. Stored per viewer in localStorage; the inline
// script in index.html applies the same attributes before first paint.

export type ThemeId = 'auto' | 'gold' | 'redblue' | 'ocean' | 'matcha' | 'sakura' | 'neon' | 'mono';
export type Mode = 'light' | 'dark' | 'system';

// `accent` / `ink` only drive the swatch preview; the real values live in index.css
export const THEMES: { id: ThemeId; name: string; accent: string; ink: string }[] = [
  { id: 'auto', name: 'Mặc định', accent: '#ff4a1c', ink: '#16140f' },
  { id: 'gold', name: 'Vàng đen', accent: '#ffcc00', ink: '#111111' },
  { id: 'redblue', name: 'Đỏ xanh', accent: '#e63946', ink: '#1d3557' },
  { id: 'ocean', name: 'Xanh biển', accent: '#2f6bff', ink: '#0f1d3a' },
  { id: 'matcha', name: 'Matcha', accent: '#2f9e5b', ink: '#17261c' },
  { id: 'sakura', name: 'Sakura', accent: '#ff5c8a', ink: '#2a1420' },
  { id: 'neon', name: 'Tím neon', accent: '#8b5cf6', ink: '#1c1233' },
  { id: 'mono', name: 'Đen trắng', accent: '#f2eee6', ink: '#16140f' },
];

const THEME_KEY = 'ggmv_theme';
const MODE_KEY = 'ggmv_mode';

export function loadTheme(): ThemeId {
  try {
    const t = localStorage.getItem(THEME_KEY) as ThemeId | null;
    return t && THEMES.some((x) => x.id === t) ? t : 'auto';
  } catch {
    return 'auto';
  }
}

export function loadMode(): Mode {
  try {
    const m = localStorage.getItem(MODE_KEY);
    return m === 'light' || m === 'dark' ? m : 'system';
  } catch {
    return 'system';
  }
}

export function saveAppearance(theme: ThemeId, mode: Mode) {
  try {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // storage blocked: the choice still applies for this visit
  }
}

// Secret symmetry mode: its own switch, because it changes layout as well as colour
const SYMMETRY_KEY = 'ggmv_symmetry';

export function loadSymmetry(): boolean {
  try {
    return localStorage.getItem(SYMMETRY_KEY) === 'on';
  } catch {
    return false;
  }
}

export function setSymmetry(on: boolean) {
  if (on) document.documentElement.dataset.symmetry = 'on';
  else delete document.documentElement.dataset.symmetry;
  try {
    localStorage.setItem(SYMMETRY_KEY, on ? 'on' : 'off');
  } catch {
    // storage blocked: the choice still applies for this visit
  }
}

export const systemPrefersDark =() => window.matchMedia('(prefers-color-scheme: dark)').matches;

// A seasonal world (if any) sits on top: it carries its own full palette
export function applyAppearance(theme: ThemeId, mode: Mode, world: string | null = null) {
  const root = document.documentElement;
  if (world) root.dataset.world = world;
  else delete root.dataset.world;
  if (theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = theme;

  const dark = mode === 'dark' || (mode === 'system' && systemPrefersDark());
  root.dataset.mode = dark ? 'dark' : 'light';

  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', getComputedStyle(root).getPropertyValue('--color-paper').trim() || '#f2eee6');
}
