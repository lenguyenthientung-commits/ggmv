// "GG Theme": the club's own soundtrack, synthesized live with Web Audio (no audio files,
// no licensed music). City-pop / anime lo-fi at 92 BPM in G major over the "royal road"
// progression (IVmaj7 - V7 - iii7 - vi7). The leitmotif is two G notes: "G-G", the club's
// initials as music; every sting in the app reuses it.
//
// Behaviour: off by default (opt-in), ducks while the wheel spins, turns into a filtered
// "after hours" mix in dark mode, pauses while the tab is hidden.

const BPM = 92;
const STEP = 60 / BPM / 4; // one 16th note
const BAR_STEPS = 16;
const BARS = 8;
export const LOOP_SECONDS = STEP * BAR_STEPS * BARS;

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// One chord per bar (bar 6 moves sus4 -> dominant halfway). Voicings sit around G3-E4.
const HARMONY: { notes: number[]; bass: number; at?: number }[][] = [
  [{ notes: [55, 59, 60, 64], bass: 36 }],                 // Cmaj7
  [{ notes: [54, 57, 60, 62], bass: 38 }],                 // D7
  [{ notes: [54, 57, 59, 62], bass: 35 }],                 // Bm7
  [{ notes: [55, 59, 62, 64], bass: 40 }],                 // Em7
  [{ notes: [55, 57, 60, 64], bass: 45 }],                 // Am7
  [{ notes: [55, 57, 60, 62], bass: 38 }, { notes: [54, 57, 60, 62], bass: 38, at: 8 }], // D7sus4 -> D7
  [{ notes: [54, 59, 62, 67], bass: 43 }],                 // Gmaj7
  [{ notes: [54, 59, 62, 67], bass: 43 }],                 // Gmaj7
];

// Melody: [step in loop, midi, length in 16ths]. Bars 1, 3 and 7 open with the G-G motif.
const MELODY: [number, number, number][] = [
  [0, 67, 2], [2, 67, 2], [4, 74, 4], [8, 71, 6],
  [16, 69, 2], [18, 72, 2], [20, 71, 2], [22, 69, 4], [28, 66, 4],
  [32, 67, 2], [34, 67, 2], [36, 74, 4], [40, 76, 6],
  [48, 74, 3], [51, 71, 3], [54, 67, 6],
  [64, 76, 2], [66, 76, 2], [68, 74, 2], [70, 72, 2], [72, 71, 4], [76, 69, 4],
  [80, 72, 4], [84, 71, 2], [86, 69, 2], [88, 66, 8],
  [96, 67, 2], [98, 67, 2], [100, 74, 2], [102, 79, 10],
  [112, 78, 4], [116, 74, 4],
];

// Electric-piano comping: city-pop push on 1 and the "and" of 2, plus a pickup in bar 4 and 8
const COMP_STEPS = [0, 6, 10];
const BASS_PATTERN: [number, number][] = [[0, 0], [6, 12], [10, 7], [14, 0]]; // [step, semitone offset]

interface Voices {
  keys: AudioNode;
  bass: AudioNode;
  lead: AudioNode;
  drums: AudioNode;
  hats: GainNode;
}

const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();
function noise(ctx: BaseAudioContext): AudioBuffer {
  let buf = noiseCache.get(ctx);
  if (!buf) {
    buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseCache.set(ctx, buf);
  }
  return buf;
}

function env(ctx: BaseAudioContext, dest: AudioNode, t: number, peak: number, attack: number, release: number) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  g.connect(dest);
  return g;
}

function osc(ctx: BaseAudioContext, type: OscillatorType, freq: number, dest: AudioNode, t: number, dur: number) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
  return o;
}

function epiano(ctx: BaseAudioContext, dest: AudioNode, midi: number, t: number, vel: number) {
  const g = env(ctx, dest, t, 0.05 * vel, 0.006, 1.1);
  osc(ctx, 'sine', hz(midi), g, t, 1.2);
  const bell = env(ctx, dest, t, 0.012 * vel, 0.003, 0.35); // tine
  osc(ctx, 'sine', hz(midi) * 2, bell, t, 0.4);
}

function bass(ctx: BaseAudioContext, dest: AudioNode, midi: number, t: number, len: number) {
  const g = env(ctx, dest, t, 0.22, 0.01, len);
  osc(ctx, 'triangle', hz(midi), g, t, len);
  osc(ctx, 'sine', hz(midi - 12), env(ctx, dest, t, 0.12, 0.01, len), t, len);
}

function lead(ctx: BaseAudioContext, dest: AudioNode, midi: number, t: number, len: number) {
  const g = env(ctx, dest, t, 0.07, 0.02, len + 0.12);
  const o = osc(ctx, 'triangle', hz(midi), g, t, len + 0.15);
  const lfo = ctx.createOscillator(); // gentle vibrato
  const depth = ctx.createGain();
  lfo.frequency.setValueAtTime(5.2, t);
  depth.gain.setValueAtTime(6, t);
  lfo.connect(depth);
  depth.connect(o.detune);
  lfo.start(t + 0.12);
  lfo.stop(t + len + 0.2);
}

function kick(ctx: BaseAudioContext, dest: AudioNode, t: number) {
  const g = env(ctx, dest, t, 0.55, 0.002, 0.28);
  const o = osc(ctx, 'sine', 150, g, t, 0.3);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
}

function snare(ctx: BaseAudioContext, dest: AudioNode, t: number) {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(1800, t);
  src.connect(bp);
  bp.connect(env(ctx, dest, t, 0.13, 0.002, 0.16));
  src.start(t);
  src.stop(t + 0.2);
  osc(ctx, 'triangle', 190, env(ctx, dest, t, 0.08, 0.002, 0.08), t, 0.1);
}

function hat(ctx: BaseAudioContext, dest: AudioNode, t: number, vel: number) {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(7500, t);
  src.connect(hp);
  hp.connect(env(ctx, dest, t, 0.05 * vel, 0.001, 0.04));
  src.start(t);
  src.stop(t + 0.06);
}

// Builds the instrument buses (lead gets a dotted-8th echo) feeding `out`
export function createVoices(ctx: BaseAudioContext, out: AudioNode): Voices {
  const mix = (g: number) => {
    const n = ctx.createGain();
    n.gain.value = g;
    n.connect(out);
    return n;
  };
  const leadBus = mix(1);
  const delay = ctx.createDelay(1);
  delay.delayTime.value = STEP * 3;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.28;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 2600;
  leadBus.connect(delay);
  delay.connect(tone);
  tone.connect(feedback);
  feedback.connect(delay);
  tone.connect(out);
  const hats = ctx.createGain();
  hats.gain.value = 1;
  hats.connect(out);
  return { keys: mix(1), bass: mix(1), lead: leadBus, drums: mix(1), hats };
}

// Schedules one full 8-bar loop starting at t0. Pure scheduling, so it also works offline.
export function scheduleLoop(ctx: BaseAudioContext, v: Voices, t0: number) {
  const swing = (s: number) => (s % 2 === 1 ? STEP * 0.12 : 0); // light shuffle on off-16ths
  for (let bar = 0; bar < BARS; bar++) {
    const barT = t0 + bar * BAR_STEPS * STEP;
    HARMONY[bar].forEach((chord, i) => {
      const from = chord.at ?? 0;
      const to = HARMONY[bar][i + 1]?.at ?? BAR_STEPS;
      COMP_STEPS.filter((s) => s >= from && s < to).forEach((s) =>
        chord.notes.forEach((n) => epiano(ctx, v.keys, n, barT + s * STEP + swing(s), s === 0 ? 1 : 0.7))
      );
      BASS_PATTERN.filter(([s]) => s >= from && s < to).forEach(([s, off]) =>
        bass(ctx, v.bass, chord.bass + off, barT + s * STEP, STEP * (s === 0 ? 5 : 2))
      );
    });
    for (let s = 0; s < BAR_STEPS; s++) {
      const t = barT + s * STEP + swing(s);
      if (s === 0 || s === 8 || (s === 11 && bar % 2 === 1)) kick(ctx, v.drums, t);
      if (s === 4 || s === 12) snare(ctx, v.drums, t);
      if (s % 2 === 0) hat(ctx, v.hats, t, s % 4 === 0 ? 1 : 0.6);
    }
  }
  MELODY.forEach(([s, n, len]) => lead(ctx, v.lead, n, t0 + s * STEP + swing(s), len * STEP));
}

// Short GG-motif stings for app moments, played through any destination
export function playMotif(ctx: BaseAudioContext, dest: AudioNode, t: number, kind: 'reveal' | 'unlock') {
  const notes: [number, number, number][] = kind === 'reveal'
    ? [[0, 67, 0.12], [0.14, 67, 0.12], [0.28, 74, 0.14], [0.44, 79, 0.9]] // G G D G'
    : [[0, 79, 0.08], [0.1, 79, 0.08], [0.2, 86, 0.5]];                     // G' G' D'' sparkle
  notes.forEach(([dt, n, len]) => {
    const g = env(ctx, dest, t + dt, kind === 'reveal' ? 0.11 : 0.07, 0.008, len + 0.25);
    osc(ctx, 'triangle', hz(n), g, t + dt, len + 0.3);
    osc(ctx, 'sine', hz(n) * 2, env(ctx, dest, t + dt, 0.025, 0.004, len), t + dt, len + 0.1);
  });
  if (kind === 'reveal') [55, 59, 62].forEach((n) => epiano(ctx, dest, n, t + 0.44, 1.2)); // Gmaj under the last G
}

const PREF_KEY = 'ggmv_music';

class Soundtrack {
  private ctx: AudioContext | null = null;
  private duckGain: GainNode | null = null;
  private night: BiquadFilterNode | null = null;
  private voices: Voices | null = null;
  private nextLoop = 0;
  private timer: ReturnType<typeof setInterval> | undefined;
  private observer: MutationObserver | null = null;
  playing = false;

  getPreference(): boolean {
    try {
      return localStorage.getItem(PREF_KEY) === 'on';
    } catch {
      return false;
    }
  }

  private setPreference(on: boolean) {
    try {
      localStorage.setItem(PREF_KEY, on ? 'on' : 'off');
    } catch {
      // storage blocked
    }
  }

  private isNight() {
    return document.documentElement.dataset.mode === 'dark';
  }

  // Dark mode = "after hours": darker filter, quieter hats
  private applyMood() {
    if (!this.ctx || !this.night || !this.voices) return;
    const t = this.ctx.currentTime;
    this.night.frequency.setTargetAtTime(this.isNight() ? 1500 : 16000, t, 0.4);
    this.voices.hats.gain.setTargetAtTime(this.isNight() ? 0.25 : 1, t, 0.4);
  }

  private onVisibility = () => {
    if (!this.ctx || !this.playing) return;
    if (document.hidden) this.ctx.suspend();
    else this.ctx.resume();
  };

  start(): boolean {
    if (this.playing) return true;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return false;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + 1.5); // fade in
    const comp = ctx.createDynamicsCompressor();
    const night = ctx.createBiquadFilter();
    night.type = 'lowpass';
    night.frequency.value = 16000;
    const duck = ctx.createGain();
    duck.connect(night);
    night.connect(master);
    master.connect(comp);
    comp.connect(ctx.destination);

    this.ctx = ctx;
    this.duckGain = duck;
    this.night = night;
    this.voices = createVoices(ctx, duck);
    this.playing = true;
    this.setPreference(true);
    // Not awaited: without a user gesture the browser keeps this pending; the music simply
    // starts on the next gesture instead of blocking the UI state.
    ctx.resume().catch(() => {});
    this.applyMood();

    this.nextLoop = ctx.currentTime + 0.15;
    const tick = () => {
      if (!this.ctx || !this.voices) return;
      // keep one loop scheduled ahead
      while (this.nextLoop < this.ctx.currentTime + 2) {
        scheduleLoop(this.ctx, this.voices, this.nextLoop);
        this.nextLoop += LOOP_SECONDS;
      }
    };
    tick();
    this.timer = setInterval(tick, 500);
    this.observer = new MutationObserver(() => this.applyMood());
    this.observer.observe(document.documentElement, { attributeFilter: ['data-mode'] });
    document.addEventListener('visibilitychange', this.onVisibility);
    return true;
  }

  stop() {
    this.setPreference(false);
    if (!this.ctx) return;
    clearInterval(this.timer);
    this.observer?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    const ctx = this.ctx;
    this.duckGain?.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
    setTimeout(() => ctx.close(), 600);
    this.ctx = null;
    this.voices = null;
    this.playing = false;
  }

  // While the wheel spins the music steps back
  duck(on: boolean) {
    if (!this.ctx || !this.duckGain) return;
    this.duckGain.gain.setTargetAtTime(on ? 0.22 : 1, this.ctx.currentTime, on ? 0.25 : 0.8);
  }
}

export const soundtrack = new Soundtrack();
