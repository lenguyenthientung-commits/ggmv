// The club's music as data: one 8-bar score per seasonal world, plus the everyday "GG Theme".
// All original. Every score opens bars 1, 3 and 7 with two G notes: "G-G", the club's initials.
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

// Bị Ám: a music box in an empty theatre. E minor with a chromatic slip to C minor, a tritone
// after the G-G, and a heartbeat for a kick.
const HALLOWEEN: Score = {
  bpm: 72,
  swing: 0,
  harmony: [
    [{ notes: [52, 55, 59, 64], bass: 40 }], // Em
    [{ notes: [51, 55, 60, 63], bass: 36 }], // Cm
    [{ notes: [52, 55, 59, 64], bass: 40 }], // Em
    [{ notes: [51, 54, 59, 63], bass: 35 }], // B
    [{ notes: [52, 57, 60, 64], bass: 45 }], // Am
    [{ notes: [51, 55, 60, 63], bass: 36 }], // Cm
    [{ notes: [51, 54, 57, 60], bass: 42 }], // F#dim7
    [{ notes: [51, 54, 59, 63], bass: 35 }], // B
  ],
  melody: [
    [0, 79, 2], [2, 79, 2], [4, 82, 2], [6, 83, 6], [12, 79, 4],
    [16, 75, 4], [20, 79, 4], [24, 84, 4], [28, 79, 4],
    [32, 79, 2], [34, 79, 2], [36, 82, 2], [38, 83, 6], [44, 88, 4],
    [48, 87, 4], [52, 83, 4], [56, 78, 8],
    [64, 76, 4], [68, 84, 4], [72, 83, 2], [74, 81, 2], [76, 79, 4],
    [80, 75, 6], [86, 79, 2], [88, 84, 8],
    [96, 79, 2], [98, 79, 2], [100, 78, 4], [104, 75, 4], [108, 72, 4],
    [112, 71, 4], [116, 75, 4], [120, 78, 8],
  ],
  comp: [0],
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

// Mở Hàng: a plucked zither over a bright pentatonic and a woodblock, the first screening of the year
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
  kick: [0, 6, 8],
  kickLevel: 0.4,
  snare: [4, 12],
  snareVoice: 'wood',
  hats: [2, 6, 10, 14],
  hatVoice: 'tick',
};

// Ghế Đôi: a slow-dance electric piano with a lub-dub kick
const VALENTINE: Score = {
  bpm: 70,
  swing: 0.3,
  harmony: [
    [{ notes: [54, 59, 62, 67], bass: 43 }], // Gmaj7
    [{ notes: [55, 59, 62, 66], bass: 40 }], // Em9
    [{ notes: [55, 60, 64, 69], bass: 45 }], // Am7
    [{ notes: [54, 60, 64, 69], bass: 38 }], // D9
    [{ notes: [54, 57, 62, 69], bass: 35 }], // Bm7
    [{ notes: [55, 59, 62, 64], bass: 40 }], // Em7
    [{ notes: [55, 59, 64, 71], bass: 48 }], // Cmaj7
    [{ notes: [54, 57, 60, 62], bass: 38 }], // D7
  ],
  melody: [
    [0, 67, 2], [2, 67, 2], [4, 71, 4], [8, 74, 8],
    [16, 71, 4], [20, 74, 4], [24, 78, 4], [28, 76, 4],
    [32, 67, 2], [34, 67, 2], [36, 72, 4], [40, 76, 8],
    [48, 74, 6], [54, 72, 2], [56, 69, 8],
    [64, 69, 4], [68, 74, 4], [72, 78, 8],
    [80, 79, 4], [84, 78, 4], [88, 76, 8],
    [96, 67, 2], [98, 67, 2], [100, 71, 4], [104, 76, 8],
    [112, 74, 4], [116, 72, 4], [120, 71, 8],
  ],
  comp: [0, 8],
  keys: 'epiano',
  lead: 'soft',
  bass: [[0, 0], [8, 7]],
  kick: [0, 2, 8, 10],
  kickLevel: 0.28,
  snare: [],
  snareVoice: 'snare',
  hats: [],
  hatVoice: 'tick',
};

// Chiếu Lại: a shuffling bell tune with sleigh bells, the film everyone already knows
const CHRISTMAS: Score = {
  bpm: 120,
  swing: 0.35,
  harmony: [
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
    [{ notes: [55, 59, 62, 64], bass: 40 }], // Em7
    [{ notes: [55, 60, 64, 69], bass: 45 }], // Am7
    [{ notes: [54, 57, 60, 62], bass: 38 }], // D7
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
    [{ notes: [56, 59, 62, 64], bass: 40 }], // E7
    [{ notes: [55, 60, 64, 69], bass: 45 }, { notes: [54, 57, 60, 62], bass: 38, at: 8 }], // Am7 -> D7
    [{ notes: [55, 59, 62, 67], bass: 43 }], // G
  ],
  melody: [
    [0, 67, 2], [2, 67, 2], [4, 71, 2], [6, 74, 2], [8, 79, 6], [14, 78, 2],
    [16, 76, 4], [20, 74, 2], [22, 71, 2], [24, 74, 8],
    [32, 67, 2], [34, 67, 2], [36, 72, 2], [38, 76, 2], [40, 81, 6], [46, 79, 2],
    [48, 78, 2], [50, 76, 2], [52, 74, 4], [56, 69, 8],
    [64, 74, 2], [66, 79, 2], [68, 83, 2], [70, 81, 2], [72, 79, 4], [76, 74, 4],
    [80, 80, 2], [82, 83, 2], [84, 86, 2], [86, 83, 2], [88, 80, 8],
    [96, 67, 2], [98, 67, 2], [100, 76, 2], [102, 81, 2], [104, 78, 2], [106, 74, 2], [108, 72, 4],
    [112, 71, 4], [116, 74, 2], [118, 78, 2], [120, 79, 8],
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

// Đèn Kéo Quân: the keys walk round the chord like the turning lantern, a flute above, a hand drum below
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
  kick: [0, 6, 8],
  kickLevel: 0.32,
  snare: [4, 10, 12],
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
