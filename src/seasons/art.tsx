import React from 'react';
import { WorldId } from './worlds';

// Original 2D art for the seasonal worlds. Halloween stars two characters:
//   Hồn: a soul made of projector light (teardrop body, wavy tail, two eyes)
//   Xác: a faceless body (mannequin), missing its head
// The other worlds each draw their own object. Every colour comes from --art-* tokens (worlds.css).

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

// ---------- Tết: the opening show (lì xì holds a ticket, not money) ----------
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
const display = { fontFamily: 'Archivo, sans-serif', fontWeight: 900, fill: INK } as const;
const TetArt = () => (
  <>
    <rect x={30} y={30} width={340} height={340} fill={BG} {...line} />
    <rect x={42} y={42} width={316} height={316} fill="none" stroke={INK} strokeWidth={1.5} />
    <Spiral x={58} y={58} /><Spiral x={342} y={58} r={90} /><Spiral x={58} y={342} r={-90} /><Spiral x={342} y={342} r={180} />
    {/* peach branch across the corner */}
    <path d="M44 120 C84 118 112 96 132 64 M96 110 C104 92 100 76 92 60" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <Blossom x={132} y={66} s={0.8} /><Blossom x={92} y={62} s={0.6} /><Blossom x={70} y={116} s={0.7} />
    <Blossom x={314} y={262} s={0.75} /><Blossom x={334} y={296} s={0.5} />
    <g transform="rotate(-6 200 260)">
      {/* envelope back + open flap */}
      <rect x={120} y={180} width={160} height={168} rx={6} fill={ACCENT} {...line} />
      <path d="M120 184 L200 132 L280 184 Z" fill={ACCENT} {...line} />
      {/* the first ticket of the year slides out */}
      <g className="w-rise">
        <path d="M142 104 h116 v86 a10 10 0 0 0 0 20 v86 h-116 v-86 a10 10 0 0 0 0 -20 z" fill={BODY} {...line} />
        <text x={200} y={134} textAnchor="middle" {...display} fontSize={13} letterSpacing={3}>SUẤT</text>
        <text x={200} y={182} textAnchor="middle" {...display} fontSize={44}>01</text>
        <path d="M160 200 h80" stroke={INK} strokeWidth={1.5} strokeDasharray="4 5" />
        <text x={200} y={226} textAnchor="middle" {...display} fontSize={12} letterSpacing={2} fill={ACCENT}>MỞ HÀNG</text>
      </g>
      {/* front pocket with the seal */}
      <path d="M120 236 L200 262 L280 236 V342 a6 6 0 0 1 -6 6 H126 a6 6 0 0 1 -6 -6 Z" fill={ACCENT} {...line} />
      <circle cx={200} cy={302} r={26} fill={BG} {...line} />
      <circle cx={200} cy={302} r={20} fill="none" stroke={INK} strokeWidth={1.5} />
      <text x={200} y={308} textAnchor="middle" {...display} fontSize={15}>LỘC</text>
    </g>
    <path d="M286 104 l12 -10 M292 124 l16 -2 M112 148 l-14 -6" stroke={INK} strokeWidth={3} strokeLinecap="round" />
  </>
);

// ---------- Valentine: the back-row love seat ----------
const TICKET = 'M40 70 h320 v100 a26 26 0 0 0 0 60 v100 h-320 v-100 a26 26 0 0 0 0 -60 z';
const HEART = 'M0 10 C-14 0 -14 -12 -6 -12 C-2 -12 0 -9 0 -7 C0 -9 2 -12 6 -12 C14 -12 14 0 0 10 Z';
const Seat = ({ x, label }: { x: number; label: string }) => (
  <g transform={`translate(${x} 0)`}>
    <path d="M10 318 v22 M110 318 v22" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <rect x={0} y={144} width={120} height={140} rx={28} fill={ACCENT} {...line} />
    <path d="M30 168 v90 M60 166 v94 M90 168 v90" stroke={INK} strokeOpacity={0.25} strokeWidth={2} strokeLinecap="round" />
    <rect x={38} y={154} width={44} height={18} rx={3} fill={BODY} {...line} strokeWidth={2} />
    <text x={60} y={167} textAnchor="middle" {...display} fontSize={11}>{label}</text>
    <rect x={-4} y={270} width={128} height={48} rx={16} fill={ACCENT} {...line} />
  </g>
);
const ValentineArt = () => (
  <>
    <Frame d={TICKET} />
    <path d="M60 92 h280" stroke={INK} strokeDasharray="4 6" strokeWidth={1.5} />
    <text x={200} y={124} textAnchor="middle" {...display} fontSize={12} letterSpacing={3}>HÀNG CUỐI · GHẾ ĐÔI</text>
    <Seat x={72} label="H12" /><Seat x={208} label="H13" />
    {/* outer armrests down, the middle one folded up */}
    <rect x={56} y={250} width={22} height={50} rx={9} fill={ALT} {...line} />
    <rect x={322} y={250} width={22} height={50} rx={9} fill={ALT} {...line} />
    <rect x={192} y={150} width={16} height={106} rx={8} fill={ALT} {...line} />
    {/* one popcorn for two */}
    <path d="M168 220 a12 12 0 0 1 18 -14 a13 13 0 0 1 24 -2 a12 12 0 0 1 20 12 a10 10 0 0 1 2 16 h-64 a10 10 0 0 1 0 -12 z" fill={SOUL} {...line} />
    <path d="M168 232 H232 L224 304 H176 Z" fill={BODY} {...line} />
    <path d="M188 232 l2 72 M212 232 l-2 72" stroke={ACCENT} strokeWidth={8} />
    <path d="M168 232 H232 L224 304 H176 Z" fill="none" {...line} />
    <path d="M222 204 C250 180 290 160 312 146" fill="none" stroke={INK} strokeWidth={2} strokeDasharray="1 6" strokeLinecap="round" />
    {/* ...and one kernel popped into a heart */}
    <g transform="translate(326 128) scale(1.3)">
      <path className="w-beat" d={HEART} fill={SOUL} {...line} />
    </g>
  </>
);

// ---------- Christmas: rerun season on an old TV ----------
const Flake = ({ x, y, i }: { x: number; y: number; i: number }) => (
  // position on the outer group, motion on the inner path (a CSS animation replaces the SVG transform)
  <g transform={`translate(${x} ${y})`}>
    <path className="w-snow" style={{ animationDelay: `${i * -0.9}s` }} d="M0 -5 v10 M-4 -2.5 l8 5 M-4 2.5 l8 -5" fill="none" {...line} stroke={BODY} strokeWidth={2} />
  </g>
);
const ChristmasArt = () => (
  <>
    <rect x={34} y={34} width={332} height={332} rx={40} fill={BG} {...line} />
    <path d="M34 340 H366" {...line} />
    {/* antenna with a star on top */}
    <path d="M200 120 L150 58 M200 120 L256 64" fill="none" {...line} />
    <path transform="translate(256 62)" d="M0 -12 L3.5 -4 L12 -3.5 L5.5 2 L7.5 11 L0 6 L-7.5 11 L-5.5 2 L-12 -3.5 L-3.5 -4 Z" fill={ACCENT} {...line} strokeWidth={2} />
    <circle cx={150} cy={58} r={5} fill={ACCENT} {...line} strokeWidth={2} />
    <path d="M128 316 l-10 24 M292 316 l10 24" {...line} strokeWidth={5} />
    <rect x={96} y={118} width={230} height={198} rx={22} fill={ALT} {...line} />
    <defs>
      <clipPath id="w-screen">
        <rect x={116} y={140} width={152} height={154} rx={26} />
      </clipPath>
    </defs>
    <rect x={116} y={140} width={152} height={154} rx={26} fill={INK} />
    {/* the film inside: snow falling on a small hill and a tree */}
    <g clipPath="url(#w-screen)">
      <path d="M116 270 C150 252 190 262 222 252 C246 246 262 254 268 252 V300 H116 Z" fill={BODY} />
      <path d="M230 254 l-14 0 l14 -40 l14 40 z M230 228 l-9 0 l9 -22 l9 22 z" fill={ACCENT} />
      <rect x={227} y={254} width={6} height={8} fill={ACCENT} />
      {[[140, 170], [176, 196], [206, 160], [158, 226], [248, 186], [196, 236], [132, 206], [226, 214]].map(([x, y], i) => (
        <Flake key={i} x={x} y={y} i={i} />
      ))}
      <path d="M134 156 q10 -10 26 -12" fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
    </g>
    <rect x={116} y={140} width={152} height={154} rx={26} fill="none" {...line} />
    {/* knobs, speaker; the stocking hangs off the dial */}
    <circle cx={296} cy={168} r={13} fill={BODY} {...line} />
    <path d="M296 158 v10" {...line} />
    <circle cx={296} cy={208} r={10} fill={BODY} {...line} />
    <path d="M284 240 h24 M284 252 h24 M284 264 h24 M284 276 h24" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M300 176 C320 182 330 192 334 204" fill="none" stroke={INK} strokeWidth={2} />
    <g transform="rotate(-8 334 204)">
      <path d="M322 214 h28 v40 c0 10 4 14 10 18 c8 6 2 20 -10 16 l-22 -8 c-8 -3 -8 -12 -6 -20 z" fill={ACCENT} {...line} />
      <rect x={318} y={202} width={36} height={14} rx={4} fill={BODY} {...line} />
    </g>
    {/* cocoa, still steaming */}
    <path className="w-rise" d="M58 290 q-8 -10 0 -20 q8 -10 0 -20 M72 290 q-8 -10 0 -20" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M86 310 h8 a10 10 0 0 1 0 20 h-8" fill="none" {...line} />
    <rect x={46} y={300} width={42} height={40} rx={6} fill={ACCENT} {...line} />
  </>
);

// ---------- Mid-Autumn: the trotting-horse lantern, the first cinema ----------
const Star = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill={BODY} />
);
// paper cut-outs, one per 70px, drawn twice so the loop is seamless
const CUTOUTS = [
  // rider on a horse
  'M-22 0 q8 -10 30 -6 l8 -12 l8 2 l-6 14 l-2 16 h-5 l-1 -12 h-20 l-4 12 h-5 l1 -14 z M-6 -10 l2 -14 h8 l2 14 z M0 -30 a5 5 0 1 0 0.1 0 z',
  // fish
  'M-20 0 q14 -16 32 0 q-18 16 -32 0 z M12 0 l12 -10 v20 z',
  // kid with a star lantern on a stick
  'M-6 18 l6 -26 l6 26 z M0 -14 a6 6 0 1 0 0.1 0 z M4 -2 l14 -14 M18 -24 l3 6 l6 1 l-5 4 l1 6 l-5 -3 l-5 3 l1 -6 l-5 -4 l6 -1 z',
  // galloping horse, no rider
  'M-22 -2 q10 -8 30 -4 l10 -10 l6 3 l-8 13 l4 16 h-5 l-5 -12 h-18 l-6 12 h-5 l4 -14 z',
];
const MidAutumnArt = () => (
  <>
    <rect x={34} y={34} width={332} height={332} fill={BG} {...line} />
    <Star x={292} y={70} /><Star x={330} y={150} s={0.7} /><Star x={60} y={190} s={0.6} /><Star x={170} y={60} s={0.5} /><Star x={320} y={232} s={0.6} />
    <circle cx={92} cy={96} r={40} fill={ACCENT} {...line} />
    <circle cx={78} cy={86} r={7} fill={INK} fillOpacity={0.15} /><circle cx={104} cy={110} r={9} fill={INK} fillOpacity={0.12} />
    <path d="M34 330 C100 316 160 334 230 324 C300 314 340 330 366 324 L366 366 L34 366 Z" fill={ALT} {...line} />
    {/* the lantern's glow lands on the ground like a screen */}
    <path d="M150 310 L250 310 L300 352 L100 352 Z" fill={ACCENT} fillOpacity={0.22} />
    <path d="M200 34 V138" stroke={INK} strokeWidth={2.5} />
    <circle cx={200} cy={220} r={96} fill={ACCENT} fillOpacity={0.14} />
    <defs>
      <clipPath id="w-paper">
        <rect x={130} y={152} width={140} height={146} />
      </clipPath>
    </defs>
    <rect x={130} y={152} width={140} height={146} fill={SOUL} />
    {/* the candle's heat turns the inner drum: shadows chase each other round */}
    <g clipPath="url(#w-paper)">
      <ellipse cx={200} cy={240} rx={60} ry={50} fill={ACCENT} fillOpacity={0.35} />
      <g className="w-reel">
        {[0, 1].map((rep) =>
          CUTOUTS.map((d, i) => (
            <path key={`${rep}-${i}`} transform={`translate(${150 + (rep * 4 + i) * 70} ${i % 2 ? 196 : 232}) scale(1.25)`} d={d} fill={INK} fillOpacity={0.85} />
          )),
        )}
      </g>
      <rect x={194} y={270} width={12} height={28} fill={BODY} {...line} strokeWidth={2} />
      <path className="w-flicker" d="M200 248 q-8 12 0 22 q8 -10 0 -22 z" fill={ACCENT} {...line} strokeWidth={2} />
    </g>
    <rect x={130} y={152} width={140} height={146} fill="none" {...line} />
    <path d="M165 152 v146 M235 152 v146" stroke={INK} strokeWidth={1.5} strokeOpacity={0.5} />
    <rect x={120} y={136} width={160} height={18} fill={ALT} {...line} />
    <rect x={120} y={296} width={160} height={18} fill={ALT} {...line} />
    <path d="M132 314 v26 M200 314 v32 M268 314 v26" stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
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

// ---------- Logo mark: each world's key object, small ----------
const thin = { ...line, strokeWidth: 2 };
const MARK: Record<WorldId, React.ReactNode> = {
  halloween: <Hon x={0} y={0} s={0.95} eyes="x" />,
  tet: (
    <>
      <rect x={-14} y={-42} width={28} height={30} fill={BODY} {...thin} />
      <rect x={-24} y={-24} width={48} height={56} rx={3} fill={ACCENT} {...thin} />
      <circle cx={0} cy={6} r={10} fill={BG} {...thin} />
    </>
  ),
  valentine: (
    <>
      <rect x={-34} y={-22} width={30} height={46} rx={9} fill={BODY} {...thin} />
      <rect x={4} y={-22} width={30} height={46} rx={9} fill={BODY} {...thin} />
      <path transform="translate(0 -30) scale(1.4)" d={HEART} fill={SOUL} {...thin} />
    </>
  ),
  christmas: (
    <>
      <rect x={-34} y={-30} width={68} height={54} rx={9} fill={ALT} {...thin} />
      <rect x={-27} y={-23} width={42} height={40} rx={8} fill={INK} />
      <path d="M-18 -14 v0 M-4 -6 v0 M-14 6 v0 M6 -16 v0 M2 8 v0" stroke={BODY} strokeWidth={4} strokeLinecap="round" />
      <circle cx={25} cy={-14} r={4} fill={BODY} {...thin} />
    </>
  ),
  'mid-autumn': (
    <>
      <rect x={-24} y={-34} width={48} height={56} fill={SOUL} {...thin} />
      <path transform="translate(0 -4) scale(0.8)" d={CUTOUTS[3]} fill={INK} />
      <rect x={-30} y={-42} width={60} height={9} fill={ALT} {...thin} />
      <rect x={-30} y={21} width={60} height={9} fill={ALT} {...thin} />
    </>
  ),
};

export const WorldMark: React.FC<{ id: WorldId }> = ({ id }) => (
  <span className="world-mark grid place-items-center w-9 h-9 shrink-0 border-[1.5px] border-ink bg-accent overflow-hidden" aria-hidden="true">
    <svg viewBox="-46 -54 92 92" className="w-8 h-8">
      {MARK[id]}
    </svg>
  </span>
);
