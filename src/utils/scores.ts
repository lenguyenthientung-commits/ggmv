// The club's music as data: one 8-bar score per seasonal world, plus the everyday "GG Theme".
// Every score carries two G notes: "G-G", the club's initials. Tunes quoted here are public
// domain; for film scores still under copyright we only borrow a style, never the notes.
// Steps are 16th notes; a loop is 128 of them.

export interface Chord {
  notes: number[]; // midi
  bass: number;
  at?: number; // step in the bar where this chord starts
}

export interface Score {
  bpm: number;
  swing: number; // how late off-16ths land, as a fraction of a step
  harmony: Chord[][]; // one entry per bar
  melody: [number, number, number][]; // [step in loop, midi, length in 16ths]
  comp: number[]; // steps in a bar where the keys play
  arpeggio?: boolean; // keys walk through the chord instead of striking it
  keys: 'epiano' | 'pad' | 'pluck' | 'bell';
  lead: 'triangle' | 'musicbox' | 'pluck' | 'bell' | 'flute' | 'soft';
  bass: [number, number][]; // [step in bar, semitone offset]
  kick: number[];
  kickOddBars?: number[]; // extra kicks on even-numbered bars
  kickLevel: number;
  snare: number[];
  snareVoice: 'snare' | 'wood';
  hats: number[];
  hatVoice: 'tick' | 'sleigh';
}

// City-pop / anime lo-fi at 92 BPM in G major over the "royal road" (IVmaj7 - V7 - iii7 - vi7)
const GG_THEME: Score = {
  bpm: 92,
  swing: 0.12,
  harmony: [
    [{ notes: [55, 59, 60, 64], bass: 36 }],                 // Cmaj7
    [{ notes: [54, 57, 60, 62], bass: 38 }],                 // D7
    [{ notes: [54, 57, 59, 62], bass: 35 }],                 // Bm7
    [{ notes: [55, 59, 62, 64], bass: 40 }],                 // Em7
    [{ notes: [55, 57, 60, 64], bass: 45 }],                 // Am7
    [{ notes: [55, 57, 60, 62], bass: 38 }, { notes: [54, 57, 60, 62], bass: 38, at: 8 }], // D7sus4 -> D7
    [{ notes: [54, 59, 62, 67], bass: 43 }],                 // Gmaj7
    [{ notes: [54, 59, 62, 67], bass: 43 }],                 // Gmaj7
  ],
  melody: [
    [0, 67, 2], [2, 67, 2], [4, 74, 4], [8, 71, 6],
    [16, 69, 2], [18, 72, 2], [20, 71, 2], [22, 69, 4], [28, 66, 4],
    [32, 67, 2], [34, 67, 2], [36, 74, 4], [40, 76, 6],
    [48, 74, 3], [51, 71, 3], [54, 67, 6],
    [64, 76, 2], [66, 76, 2], [68, 74, 2], [70, 72, 2], [72, 71, 4], [76, 69, 4],
    [80, 72, 4], [84, 71, 2], [86, 69, 2], [88, 66, 8],
    [96, 67, 2], [98, 67, 2], [100, 74, 2], [102, 79, 10],
    [112, 78, 4], [116, 74, 4],
  ],
  comp: [0, 6, 10], // city-pop push on 1 and the "and" of 2
  keys: 'epiano',
  lead: 'triangle',
  bass: [[0, 0], [6, 12], [10, 7], [14, 0]],
  kick: [0, 8],
  kickOddBars: [11],
  kickLevel: 0.55,
  snare: [4, 12],
  snareVoice: 'snare',
  hats: [0, 2, 4, 6, 8, 10, 12, 14],
  hatVoice: 'tick',
};

// Bị Ám: a music box plays the Dies Irae, the 13th-century chant that opens The Shining. In
// E minor it starts on G, so the G-G leads straight into it. Then a chromatic slip and a heartbeat.
const HALLOWEEN: Score = {
  bpm: 72,
  swing: 0,
  harmony: [
    [{ notes: [52, 55, 59, 64], bass: 40 }], // Em
    [{ notes: [50, 54, 59, 62], bass: 35 }, { notes: [52, 55, 59, 64], bass: 40, at: 8 }], // Bm -> Em
    [{ notes: [52, 55, 59, 64], bass: 40 }], // Em
    [{ notes: [50, 54, 59, 62], bass: 35 }, { notes: [52, 55, 59, 64], bass: 40, at: 8 }], // Bm -> Em
    [{ notes: [52, 57, 60, 64], bass: 45 }], // Am
    [{ notes: [51, 55, 60, 63], bass: 36 }], // Cm
    [{ notes: [51, 54, 57, 60], bass: 42 }], // F#dim7
    [{ notes: [51, 54, 59, 63], bass: 35 }], // B
  ],
  melody: [
    [0, 79, 2], [2, 79, 2], [4, 78, 4], [8, 79, 4], [12, 76, 4], // Dies Irae: G F# G E
    [16, 78, 4], [20, 74, 4], [24, 76, 8],                       // F# D E E
    [32, 79, 2], [34, 79, 2], [36, 78, 4], [40, 79, 4], [44, 76, 4],
    [48, 78, 4], [52, 74, 4], [56, 76, 8],
    [64, 76, 4], [68, 84, 4], [72, 83, 2], [74, 81, 2], [76, 79, 4],
    [80, 75, 6], [86, 79, 2], [88, 84, 8],
    [96, 79, 2], [98, 79, 2], [100, 78, 4], [104, 75, 4], [108, 72, 4],
    [112, 71, 4], [116, 75, 4], [120, 78, 8],
  ],
  comp: [0, 8],
  keys: 'pad',
  lead: 'musicbox',
  bass: [[0, 0], [8, 0]],
  kick: [0, 3],
  kickLevel: 0.3,
  snare: [],
  snareVoice: 'snare',
  hats: [],
  hatVoice: 'tick',
};

// Mở Hàng: a plucked zither over a bright pentatonic, with the busy kick of a lion-dance drum
const TET: Score = {
  bpm: 108,
  swing: 0,
  harmony: [
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
    [{ notes: [55, 59, 64, 67], bass: 40 }], // Em
    [{ notes: [55, 60, 64, 67], bass: 48 }], // C
    [{ notes: [54, 57, 62, 66], bass: 38 }], // D
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
    [{ notes: [55, 59, 64, 67], bass: 40 }], // Em
    [{ notes: [55, 60, 64, 67], bass: 48 }, { notes: [54, 57, 62, 66], bass: 38, at: 8 }], // C -> D
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
  ],
  melody: [
    [0, 67, 2], [2, 67, 2], [4, 71, 2], [6, 74, 2], [8, 76, 4], [12, 74, 4],
    [16, 76, 2], [18, 74, 2], [20, 71, 4], [24, 69, 2], [26, 71, 2], [28, 67, 4],
    [32, 67, 2], [34, 67, 2], [36, 69, 2], [38, 71, 2], [40, 74, 2], [42, 76, 2], [44, 79, 4],
    [48, 81, 4], [52, 79, 2], [54, 76, 2], [56, 74, 8],
    [64, 79, 2], [66, 79, 2], [68, 76, 2], [70, 74, 2], [72, 71, 4], [76, 74, 4],
    [80, 76, 2], [82, 79, 2], [84, 76, 2], [86, 74, 2], [88, 71, 8],
    [96, 67, 2], [98, 67, 2], [100, 69, 2], [102, 71, 2], [104, 74, 4], [108, 76, 2], [110, 74, 2],
    [112, 71, 2], [114, 69, 2], [116, 67, 8],
  ],
  comp: [0, 4, 8, 12],
  keys: 'pluck',
  lead: 'pluck',
  bass: [[0, 0], [8, 7]],
  kick: [0, 3, 6, 8, 11, 14],
  kickLevel: 0.4,
  snare: [4, 12],
  snareVoice: 'wood',
  hats: [2, 6, 10, 14],
  hatVoice: 'tick',
};

// Ghế Đôi: Pachelbel's Canon, the wedding classic, moved to G: its chord round, then its two best
// known lines, on a soft lead with a lub-dub kick. The G-G comes in ahead of the tune.
const CANON_ROUND: Chord[][] = [
  [{ notes: [55, 59, 62, 67], bass: 43 }, { notes: [54, 57, 62, 66], bass: 38, at: 8 }], // G D
  [{ notes: [55, 59, 64, 67], bass: 40 }, { notes: [54, 59, 62, 66], bass: 35, at: 8 }], // Em Bm
  [{ notes: [55, 60, 64, 67], bass: 48 }, { notes: [55, 59, 62, 67], bass: 43, at: 8 }], // C G
  [{ notes: [55, 60, 64, 67], bass: 48 }, { notes: [54, 57, 62, 66], bass: 38, at: 8 }], // C D
];
const VALENTINE: Score = {
  bpm: 70,
  swing: 0,
  harmony: [...CANON_ROUND, ...CANON_ROUND],
  melody: [
    [0, 67, 2], [2, 67, 2], [4, 71, 4], [8, 69, 8],  // ...B A
    [16, 67, 8], [24, 66, 8],                        // G F#
    [32, 64, 8], [40, 62, 8],                        // E D
    [48, 64, 8], [56, 66, 8],                        // E F#
    [64, 67, 4], [68, 71, 4], [72, 74, 4], [76, 72, 4], // G B D C
    [80, 71, 4], [84, 67, 4], [88, 71, 4], [92, 69, 4], // B G B A
    [96, 67, 4], [100, 64, 4], [104, 67, 4], [108, 62, 4], // G E G D
    [112, 60, 4], [116, 64, 4], [120, 62, 4], [124, 66, 4], // C E D F#
  ],
  comp: [0, 8],
  keys: 'epiano',
  lead: 'soft',
  bass: [[0, 0], [8, 0]],
  kick: [0, 2, 8, 10],
  kickLevel: 0.28,
  snare: [],
  snareVoice: 'snare',
  hats: [],
  hatVoice: 'tick',
};

// Chiếu Lại: the Jingle Bells chorus (1857) on bells with sleigh bells, the tune everyone already
// knows. It ends on G, so the club's G-G answers it before the loop comes round.
const CHRISTMAS: Score = {
  bpm: 120,
  swing: 0.35,
  harmony: [
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
    [{ notes: [55, 60, 64, 67], bass: 48 }], // C
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
    [{ notes: [54, 57, 60, 62], bass: 38 }], // D7
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
  ],
  melody: [
    [0, 71, 4], [4, 71, 4], [8, 71, 8],
    [16, 71, 4], [20, 71, 4], [24, 71, 8],
    [32, 71, 4], [36, 74, 4], [40, 67, 6], [46, 69, 2],
    [48, 71, 16],
    [64, 72, 4], [68, 72, 4], [72, 72, 6], [78, 72, 2],
    [80, 72, 4], [84, 71, 4], [88, 71, 4], [92, 71, 2], [94, 71, 2],
    [96, 74, 4], [100, 74, 4], [104, 72, 4], [108, 69, 4],
    [112, 67, 8], [120, 67, 2], [122, 67, 2],
  ],
  comp: [4, 12],
  keys: 'epiano',
  lead: 'bell',
  bass: [[0, 0], [4, 7], [8, 12], [12, 7]],
  kick: [0, 8],
  kickLevel: 0.45,
  snare: [4, 12],
  snareVoice: 'snare',
  hats: [0, 2, 4, 6, 8, 10, 12, 14],
  hatVoice: 'sleigh',
};

// Đèn Kéo Quân: the keys walk round the chord like the turning lantern, a flute above, and the
// "tùng dinh dinh" of a Mid-Autumn drum below
const MID_AUTUMN: Score = {
  bpm: 88,
  swing: 0.08,
  harmony: [
    [{ notes: [52, 55, 59, 64], bass: 40 }], // Em
    [{ notes: [52, 55, 60, 64], bass: 48 }], // C
    [{ notes: [50, 55, 59, 62], bass: 43 }], // G
    [{ notes: [50, 54, 57, 62], bass: 38 }], // D
    [{ notes: [52, 55, 59, 64], bass: 40 }], // Em
    [{ notes: [52, 57, 60, 64], bass: 45 }], // Am
    [{ notes: [50, 54, 57, 62], bass: 38 }], // D
    [{ notes: [50, 55, 59, 62], bass: 43 }], // G
  ],
  melody: [
    [0, 67, 2], [2, 67, 2], [4, 71, 4], [8, 76, 8],
    [16, 79, 4], [20, 76, 4], [24, 74, 8],
    [32, 67, 2], [34, 67, 2], [36, 74, 4], [40, 71, 8],
    [48, 69, 4], [52, 71, 4], [56, 74, 8],
    [64, 76, 6], [70, 79, 2], [72, 81, 8],
    [80, 79, 4], [84, 76, 4], [88, 72, 8],
    [96, 67, 2], [98, 67, 2], [100, 69, 4], [104, 74, 8],
    [112, 71, 4], [116, 69, 4], [120, 67, 8],
  ],
  comp: [0, 2, 4, 6, 8, 10, 12, 14],
  arpeggio: true,
  keys: 'pluck',
  lead: 'flute',
  bass: [[0, 0], [8, 7]],
  kick: [0, 8],
  kickLevel: 0.32,
  snare: [4, 6, 12, 14],
  snareVoice: 'wood',
  hats: [],
  hatVoice: 'tick',
};

const WORLD_SCORES: Record<string, Score> = {
  halloween: HALLOWEEN,
  tet: TET,
  valentine: VALENTINE,
  christmas: CHRISTMAS,
  'mid-autumn': MID_AUTUMN,
};

export const scoreFor = (world?: string | null): Score => (world && WORLD_SCORES[world]) || GG_THEME;
