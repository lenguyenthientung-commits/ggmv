import React from 'react';
import { WorldId } from './worlds';

// Original 2D art for the seasonal worlds. Two recurring characters:
//   Hồn: a soul made of projector light (teardrop body, wavy tail, two eyes)
//   Xác: a faceless body (mannequin), sometimes missing its head, sometimes its heart
// Every colour comes from --art-* tokens (worlds.css), so each world paints the same cast.

const INK = 'var(--art-ink)';
const BODY = 'var(--art-body)';
const SOUL = 'var(--art-soul)';
const ACCENT = 'var(--art-accent)';
const ALT = 'var(--art-alt)';
const BG = 'var(--art-bg)';
const HOLE = 'var(--art-hole)';

const line = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, vectorEffect: 'non-scaling-stroke' as const };

// ---------- Hồn ----------
const SOUL_PATH =
  'M0 -40 C22 -40 34 -22 34 -2 C34 18 24 28 16 38 C10 46 14 56 6 64 C0 70 -8 64 -4 56 C0 48 -12 42 -20 34 C-30 24 -34 10 -34 -4 C-34 -24 -22 -40 0 -40 Z';

type Eyes = 'open' | 'happy' | 'x' | 'heart' | 'closed';

const SoulEyes: React.FC<{ eyes: Eyes }> = ({ eyes }) => {
  switch (eyes) {
    case 'happy':
      return <path d="M-16 -4 q5 -7 10 0 M6 -4 q5 -7 10 0" fill="none" {...line} />;
    case 'closed':
      return <path d="M-16 -6 q5 6 10 0 M6 -6 q5 6 10 0" fill="none" {...line} />;
    case 'x':
      return <path d="M-16 -10 l9 9 M-7 -10 l-9 9 M7 -10 l9 9 M16 -10 l-9 9" fill="none" {...line} />;
    case 'heart':
      return (
        <path
          d="M-11 -2 c-6 -5 -6 -11 -1 -11 c3 0 4 2 5 4 c1 -2 2 -4 5 -4 c5 0 5 6 -1 11 l-4 4 z M11 -2 c-6 -5 -6 -11 -1 -11 c3 0 4 2 5 4 c1 -2 2 -4 5 -4 c5 0 5 6 -1 11 l-4 4 z"
          fill={ACCENT}
          {...line}
          strokeWidth={2}
        />
      );
    default:
      return (
        <>
          <ellipse cx={-10} cy={-6} rx={3.5} ry={5.5} fill={INK} />
          <ellipse cx={10} cy={-6} rx={3.5} ry={5.5} fill={INK} />
        </>
      );
  }
};

export const Hon: React.FC<{
  x: number; y: number; s?: number; r?: number; eyes?: Eyes; className?: string; children?: React.ReactNode;
}> = ({ x, y, s = 1, r = 0, eyes = 'open', className, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <g className={className}>
      <path d={SOUL_PATH} fill={SOUL} {...line} />
      <path d="M-20 -22 q7 -11 18 -12" fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <SoulEyes eyes={eyes} />
      {children}
    </g>
  </g>
);

// ---------- Xác ----------
const limb = (d: string, key: string) => (
  <g key={key}>
    <path d={d} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />
    <path d={d} fill="none" stroke={BODY} strokeWidth={6} strokeLinecap="round" />
  </g>
);

export const Xac: React.FC<{
  x: number; y: number; s?: number; flip?: boolean; headless?: boolean; hollowChest?: boolean;
  arms?: 'down' | 'up' | 'reach'; className?: string; children?: React.ReactNode;
}> = ({ x, y, s = 1, flip = false, headless = false, hollowChest = false, arms = 'down', className, children }) => {
  const armPaths = {
    down: ['M-32 -104 C-48 -80 -54 -52 -50 -28', 'M32 -104 C48 -80 54 -52 50 -28'],
    up: ['M-32 -104 C-52 -120 -58 -146 -54 -170', 'M32 -104 C48 -80 54 -52 50 -28'],
    reach: ['M-32 -104 C-48 -80 -54 -52 -50 -28', 'M32 -104 C56 -112 74 -118 92 -116'],
  }[arms];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} className={className}>
      {limb('M-16 -4 C-18 24 -20 48 -22 68', 'll')}
      {limb('M16 -4 C18 24 20 48 22 68', 'lr')}
      {limb(armPaths[0], 'al')}
      {limb(armPaths[1], 'ar')}
      <path d="M-34 -112 C-42 -64 -38 -24 -28 0 L28 0 C38 -24 42 -64 34 -112 Q0 -124 -34 -112 Z" fill={BODY} {...line} />
      <path d="M14 -92 h12 M16 -82 h12 M18 -72 h10" stroke={INK} strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" />
      {hollowChest && <ellipse cx={-6} cy={-80} rx={9} ry={11} fill={HOLE} {...line} />}
      {headless ? (
        <ellipse cx={0} cy={-117} rx={13} ry={5} fill={HOLE} {...line} />
      ) : (
        <>
          <rect x={-8} y={-130} width={16} height={18} fill={BODY} {...line} />
          <ellipse cx={0} cy={-154} rx={24} ry={28} fill={BODY} {...line} />
          <path d="M-12 -170 q6 -7 15 -5" fill="none" stroke={INK} strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      {children}
    </g>
  );
};

const Frame: React.FC<{ d?: string; tilt?: number }> = ({ d, tilt = 0 }) =>
  d ? <path d={d} fill={BG} {...line} /> : <rect x={34} y={34} width={332} height={332} rx={14} fill={BG} transform={`rotate(${tilt} 200 200)`} {...line} />;

// ---------- Halloween: Possession ----------
const HalloweenArt = () => (
  <>
    <Frame tilt={-4} />
    <ellipse cx={200} cy={366} rx={118} ry={12} fill={ACCENT} fillOpacity={0.35} />
    <Xac x={200} y={300} s={1.05} headless>
      {/* dark humour: the body advertises a vacancy */}
      <g transform="translate(-22 -78) rotate(-6)">
        <rect x={0} y={0} width={44} height={20} rx={2} fill={ACCENT} {...line} />
        <text x={22} y={14} textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight={900} fontSize={10} fill={INK}>CÒN CHỖ</text>
      </g>
    </Xac>
    <defs>
      <clipPath id="w-neck">
        <rect x={0} y={0} width={400} height={177} />
      </clipPath>
    </defs>
    {/* the soul dives head-first into the empty neck */}
    <g clipPath="url(#w-neck)">
      <Hon x={200} y={138} s={1.05} r={180} className="w-dive" />
    </g>
    <path d="M186 177 a14 5 0 0 0 28 0" fill="none" {...line} />
    {/* the evicted head floats off, stitched shut */}
    <g className="w-bob">
      <g transform="translate(276 92) rotate(20)">
        <ellipse cx={0} cy={0} rx={25} ry={29} fill={BODY} {...line} />
        <path d="M-15 -6 l8 8 M-7 -6 l-8 8 M7 -6 l8 8 M15 -6 l-8 8 M-10 14 h20 M-6 10 v8 M0 10 v8 M6 10 v8" fill="none" {...line} strokeWidth={2.5} />
        <path d="M-4 30 q-2 10 4 18 q4 -10 -4 -18" fill={ACCENT} {...line} strokeWidth={2} />
      </g>
    </g>
  </>
);

// ---------- Tết: Reunion & Rebirth ----------
const Spiral = ({ x, y, r = 0 }: { x: number; y: number; r?: number }) => (
  <path transform={`translate(${x} ${y}) rotate(${r})`} d="M0 0 m-9 0 a9 9 0 1 1 9 9 a6 6 0 1 1 -6 -6 a3 3 0 1 1 3 3" fill="none" {...line} strokeWidth={2} />
);
const Blossom = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={0} cy={-8} rx={5.5} ry={8} fill={ACCENT} transform={`rotate(${a})`} {...line} strokeWidth={2} />
    ))}
    <circle r={3.5} fill={BODY} {...line} strokeWidth={2} />
  </g>
);
const TetArt = () => (
  <>
    <rect x={30} y={30} width={340} height={340} fill={BG} {...line} />
    <rect x={42} y={42} width={316} height={316} fill="none" stroke={INK} strokeWidth={1.5} />
    <Spiral x={58} y={58} /><Spiral x={342} y={58} r={90} /><Spiral x={58} y={342} r={-90} /><Spiral x={342} y={342} r={180} />
    {/* family souls flying home */}
    {[
      [84, 118, 0.42, 24], [318, 104, 0.48, -26], [70, 246, 0.36, 38], [330, 236, 0.4, -32],
    ].map(([x, y, s, r], i) => (
      <g key={i}>
        <path d={`M${x} ${y} Q${(x + 200) / 2} ${y - 30} 200 168`} fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
        <Hon x={x} y={y} s={s} r={r} eyes="happy" />
      </g>
    ))}
    {/* the body: wrapped in dong leaves like bánh chưng, lid open */}
    <Xac x={200} y={318} s={0.55} />
    <g>
      <rect x={140} y={222} width={120} height={98} rx={6} fill={ALT} {...line} />
      <path d="M150 236 l26 26 M196 232 l30 30 M224 288 l26 -26 M156 300 l22 -20" stroke={BODY} strokeOpacity={0.35} strokeWidth={2} />
      <path d="M180 222 v98 M220 222 v98 M140 252 h120 M140 290 h120" stroke={BODY} strokeWidth={4} />
    </g>
    <g transform="rotate(-28 140 222)">
      <rect x={136} y={200} width={128} height={24} rx={4} fill={ALT} {...line} />
      <path d="M180 200 v24 M220 200 v24" stroke={BODY} strokeWidth={4} />
    </g>
    {/* rebirth: the big soul rises like steam out of the box */}
    <Hon x={206} y={160} s={1.1} eyes="happy" className="w-rise" />
    <Blossom x={292} y={300} s={0.9} /><Blossom x={110} y={312} s={0.7} /><Blossom x={318} y={170} s={0.55} />
  </>
);

// ---------- Valentine: Heart, Soul & Desire ----------
const TICKET = 'M40 70 h320 v100 a26 26 0 0 0 0 60 v100 h-320 v-100 a26 26 0 0 0 0 -60 z';
const ValentineArt = () => (
  <>
    <Frame d={TICKET} />
    <path d="M60 92 h280" stroke={INK} strokeDasharray="4 6" strokeWidth={1.5} />
    <Xac x={118} y={318} s={0.92} hollowChest />
    <Xac x={282} y={318} s={0.92} hollowChest flip />
    {/* both souls leave through the chest and cross on the way up */}
    {['M112 244 C150 236 236 222 200 186', 'M288 244 C250 236 164 222 200 186'].map((d) => (
      <g key={d}>
        <path d={d} fill="none" stroke={INK} strokeWidth={17} strokeLinecap="round" />
        <path d={d} fill="none" stroke={SOUL} strokeWidth={11} strokeLinecap="round" />
      </g>
    ))}
    {/* ...and knot into one heart that still has their eyes */}
    <g className="w-beat">
      <path d="M186 104 v-14 M214 104 v-18 M200 102 v-10" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M186 104 v-14 M214 104 v-18 M200 102 v-10" stroke={ACCENT} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M200 192 C150 160 146 112 172 104 C188 99 197 110 200 118 C203 110 212 99 228 104 C254 112 250 160 200 192 Z" fill={ACCENT} {...line} />
      <path d="M176 120 q6 -8 14 -8" fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={190} cy={142} rx={3.5} ry={5.5} fill={INK} />
      <ellipse cx={210} cy={142} rx={3.5} ry={5.5} fill={INK} />
    </g>
  </>
);

// ---------- Christmas: Surreal Wonderland ----------
const Flake = ({ x, y, i }: { x: number; y: number; i: number }) => (
  // position on the outer group, motion on the inner path (a CSS animation replaces the SVG transform)
  <g transform={`translate(${x} ${y})`}>
    <path className="w-snow" style={{ animationDelay: `${i * -1.1}s` }} d="M0 -6 v12 M-5 -3 l10 6 M-5 3 l10 -6" fill="none" {...line} strokeWidth={2} />
  </g>
);
const ChristmasArt = () => (
  <>
    <rect x={34} y={34} width={332} height={332} rx={40} fill={BG} {...line} />
    <path d="M34 330 C110 312 170 344 240 326 C300 312 340 330 366 322" fill="none" {...line} />
    {/* snow falls upward here */}
    {[[80, 300], [120, 220], [330, 280], [300, 190], [70, 150], [350, 120]].map(([x, y], i) => (
      <Flake key={i} x={x} y={y} i={i} />
    ))}
    <g>
      {['M158 200 L112 170 M126 180 l-6 -16 M120 176 l-14 2', 'M242 200 L292 168 M276 178 l4 -16 M282 174 l14 0'].map((d) => (
        <path key={d} d={d} fill="none" {...line} strokeWidth={4} />
      ))}
      <circle cx={200} cy={290} r={58} fill={BODY} {...line} />
      <circle cx={200} cy={206} r={42} fill={BODY} {...line} />
      <circle cx={200} cy={142} r={30} fill={BODY} {...line} />
      <path d="M172 168 q28 12 56 0 l2 12 q-30 12 -60 0 z M206 178 l6 30 l12 -4 l-8 -26" fill={ALT} {...line} />
      {/* the body has lost its nose (and its soul) */}
      <circle cx={213} cy={142} r={4.5} fill={HOLE} {...line} strokeWidth={2} />
      <circle cx={200} cy={206} r={4} fill={INK} /><circle cx={200} cy={226} r={4} fill={INK} />
    </g>
    <path d="M222 132 C240 118 252 110 262 104" fill="none" stroke={INK} strokeWidth={2} strokeDasharray="1 6" strokeLinecap="round" />
    {/* the soul escapes as breath, carrying the carrot */}
    <g className="w-escape">
      <Hon x={292} y={84} s={0.82} r={-28} />
      <path d="M252 112 L300 96 L262 128 Z" fill={ACCENT} {...line} />
      <path d="M262 108 l8 8 M272 104 l8 8 M282 100 l6 6" stroke={INK} strokeWidth={1.5} />
      <path d="M300 96 l10 -10 M300 96 l14 -2 M300 96 l6 -12" stroke={ALT} strokeWidth={4} strokeLinecap="round" />
    </g>
  </>
);

// ---------- Mid-Autumn: Lunar Spirits (Chú Cuội, retold) ----------
const Star = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill={BODY} />
);
const MidAutumnArt = () => (
  <>
    <rect x={34} y={34} width={332} height={332} fill={BG} {...line} />
    <Star x={84} y={74} /><Star x={196} y={58} s={0.7} /><Star x={60} y={150} s={0.6} /><Star x={350} y={200} s={0.8} /><Star x={238} y={112} s={0.5} />
    {/* the moon is a sleeping spirit */}
    <circle cx={296} cy={102} r={56} fill={ACCENT} {...line} />
    <circle cx={276} cy={84} r={7} fill={INK} fillOpacity={0.15} /><circle cx={318} cy={124} r={10} fill={INK} fillOpacity={0.12} />
    <path d="M276 104 q7 6 14 0 M302 104 q7 6 14 0" fill="none" {...line} />
    <path d="M34 336 C100 318 160 340 230 328 C300 316 340 334 366 326 L366 366 L34 366 Z" fill={ALT} {...line} />
    {/* banyan tree */}
    <path d="M96 336 C104 296 100 262 108 236 L124 236 C128 266 126 298 134 336 Z" fill={BODY} {...line} />
    {[[88, 210, 34], [128, 196, 40], [100, 176, 30], [146, 226, 26]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill={ALT} {...line} />
    ))}
    <path d="M74 236 v40 M90 240 v52 M150 246 v34" stroke={INK} strokeWidth={2} />
    {/* one root climbs to the moon; the soul climbs it while the body holds on below */}
    <g className="w-sway">
      <path d="M150 222 C196 206 206 168 228 156 C246 146 252 140 252 140" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path d="M150 222 C196 206 206 168 228 156 C246 146 252 140 252 140" fill="none" stroke={BODY} strokeWidth={4} strokeLinecap="round" />
      <Hon x={212} y={172} s={0.5} r={-38} eyes="closed" />
    </g>
    <Xac x={172} y={336} s={0.56} arms="up" />
  </>
);

const ART: Record<WorldId, React.FC> = {
  halloween: HalloweenArt,
  tet: TetArt,
  valentine: ValentineArt,
  christmas: ChristmasArt,
  'mid-autumn': MidAutumnArt,
};

export const WorldKeyVisual: React.FC<{ id: WorldId; title: string }> = ({ id, title }) => {
  const Art = ART[id];
  return (
    <svg viewBox="0 0 400 400" className="world-art w-full h-auto" role="img" aria-label={title} tabIndex={0}>
      <Art />
    </svg>
  );
};

// ---------- Logo mark: the soul wearing the season ----------
const MARK_ACCESSORY: Record<WorldId, React.ReactNode> = {
  halloween: null,
  tet: <path d="M-33 -12 q33 -11 66 0 l-1 6 q-32 -10 -64 0 z" fill={ALT} {...line} strokeWidth={2} />,
  valentine: null,
  christmas: <path d="M-28 16 q28 12 56 0 l2 10 q-30 12 -60 0 z" fill={ACCENT} {...line} />,
  'mid-autumn': <circle cx={26} cy={-34} r={14} fill={ACCENT} {...line} />,
};
const MARK_EYES: Record<WorldId, Eyes> = {
  halloween: 'x', tet: 'happy', valentine: 'heart', christmas: 'open', 'mid-autumn': 'closed',
};

export const WorldMark: React.FC<{ id: WorldId }> = ({ id }) => (
  <span className="world-mark grid place-items-center w-9 h-9 shrink-0 border-[1.5px] border-ink bg-accent overflow-hidden" aria-hidden="true">
    <svg viewBox="-46 -54 92 92" className="w-8 h-8">
      {id === 'mid-autumn' && MARK_ACCESSORY[id]}
      <Hon x={0} y={0} s={0.95} eyes={MARK_EYES[id]} />
      {id !== 'mid-autumn' && MARK_ACCESSORY[id]}
    </svg>
  </span>
);
