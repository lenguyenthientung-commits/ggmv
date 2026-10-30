// The club's own soundtrack, synthesized live with Web Audio (no audio files, no licensed
// music). The scores live in scores.ts: the everyday "GG Theme" plus one per seasonal world.
// The leitmotif is two G notes: "G-G", the club's initials; every sting in the app reuses it.
//
// Behaviour: off by default (opt-in), follows the active world, ducks while the wheel spins,
// turns into a filtered "after hours" mix in dark mode, pauses while the tab is hidden.

import { Score, scoreFor } from './scores';

const BAR_STEPS = 16;
const BARS = 8;
const stepOf = (score: Score) => 60 / score.bpm / 4; // one 16th note
export const loopSeconds = (score: Score) => stepOf(score) * BAR_STEPS * BARS;

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

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

// A long swell under the music box
function pad(ctx: BaseAudioContext, dest: AudioNode, midi: number, t: number) {
  const g = env(ctx, dest, t, 0.03, 0.5, 2.4);
  osc(ctx, 'triangle', hz(midi), g, t, 3);
  osc(ctx, 'sine', hz(midi) * 1.004, g, t, 3); // slightly out of tune, on purpose
}

// Zither-like: the note slides into pitch and dies away
function pluck(ctx: BaseAudioContext, dest: AudioNode, midi: number, t: number, vel: number) {
  const o = osc(ctx, 'triangle', hz(midi) * 1.02, env(ctx, dest, t, 0.1 * vel, 0.003, 0.55), t, 0.6);
  o.frequency.exponentialRampToValueAtTime(hz(midi), t + 0.07);
  osc(ctx, 'sine', hz(midi) * 2, env(ctx, dest, t, 0.025 * vel, 0.002, 0.2), t, 0.25);
}

function bell(ctx: BaseAudioContext, dest: AudioNode, midi: number, t: number, vel: number) {
  osc(ctx, 'sine', hz(midi), env(ctx, dest, t, 0.07 * vel, 0.002, 0.9), t, 1);
  osc(ctx, 'sine', hz(midi) * 3, env(ctx, dest, t, 0.018 * vel, 0.002, 0.3), t, 0.35);
}

// Two tines a hair apart, so it sounds old and not quite right
function musicBox(ctx: BaseAudioContext, dest: AudioNode, midi: number, t: number) {
  const g = env(ctx, dest, t, 0.06, 0.002, 1.3);
  osc(ctx, 'sine', hz(midi), g, t, 1.4);
  osc(ctx, 'sine', hz(midi) * 1.003, g, t, 1.4);
  osc(ctx, 'sine', hz(midi) * 4, env(ctx, dest, t, 0.012, 0.001, 0.15), t, 0.2);
}

// A slow attack: `flute` carries more vibrato, `soft` barely any
function softLead(ctx: BaseAudioContext, dest: AudioNode, midi: number, t: number, len: number, vibrato: number) {
  const o = osc(ctx, 'sine', hz(midi), env(ctx, dest, t, 0.1, 0.07, len + 0.15), t, len + 0.25);
  const lfo = ctx.createOscillator();
  const depth = ctx.createGain();
  lfo.frequency.setValueAtTime(5, t);
  depth.gain.setValueAtTime(vibrato, t);
  lfo.connect(depth);
  depth.connect(o.detune);
  lfo.start(t + 0.15);
  lfo.stop(t + len + 0.25);
}

function kick(ctx: BaseAudioContext, dest: AudioNode, t: number, level: number) {
  const g = env(ctx, dest, t, level, 0.002, 0.28);
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

function woodblock(ctx: BaseAudioContext, dest: AudioNode, t: number) {
  osc(ctx, 'sine', 880, env(ctx, dest, t, 0.09, 0.001, 0.06), t, 0.08);
  osc(ctx, 'triangle', 1320, env(ctx, dest, t, 0.03, 0.001, 0.03), t, 0.05);
}

// `release` long and bright = sleigh bells, short = a closed hat
function hat(ctx: BaseAudioContext, dest: AudioNode, t: number, vel: number, cutoff = 7500, release = 0.04) {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(cutoff, t);
  src.connect(hp);
  hp.connect(env(ctx, dest, t, 0.05 * vel, 0.001, release));
  src.start(t);
  src.stop(t + release + 0.02);
}

// Builds the instrument buses (lead gets a dotted-8th echo) feeding `out`
export function createVoices(ctx: BaseAudioContext, out: AudioNode, score: Score): Voices {
  const mix = (g: number) => {
    const n = ctx.createGain();
    n.gain.value = g;
    n.connect(out);
    return n;
  };
  const leadBus = mix(1);
  const delay = ctx.createDelay(1);
  delay.delayTime.value = stepOf(score) * 3;
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
export function scheduleLoop(ctx: BaseAudioContext, v: Voices, t0: number, score: Score) {
  const STEP = stepOf(score);
  const swing = (s: number) => (s % 2 === 1 ? STEP * score.swing : 0); // late off-16ths
  const playKeys = (midi: number, t: number, vel: number) => {
    if (score.keys === 'pad') pad(ctx, v.keys, midi, t);
    else if (score.keys === 'pluck') pluck(ctx, v.keys, midi, t, vel * 0.5);
    else if (score.keys === 'bell') bell(ctx, v.keys, midi, t, vel * 0.6);
    else epiano(ctx, v.keys, midi, t, vel);
  };
  for (let bar = 0; bar < BARS; bar++) {
    const barT = t0 + bar * BAR_STEPS * STEP;
    score.harmony[bar].forEach((chord, i) => {
      const from = chord.at ?? 0;
      const to = score.harmony[bar][i + 1]?.at ?? BAR_STEPS;
      score.comp.filter((s) => s >= from && s < to).forEach((s, n) => {
        const notes = score.arpeggio ? [chord.notes[n % chord.notes.length]] : chord.notes;
        notes.forEach((midi) => playKeys(midi, barT + s * STEP + swing(s), s === 0 ? 1 : 0.7));
      });
      score.bass.filter(([s]) => s >= from && s < to).forEach(([s, off]) =>
        bass(ctx, v.bass, chord.bass + off, barT + s * STEP, STEP * (s === 0 ? 5 : 2))
      );
    });
    for (let s = 0; s < BAR_STEPS; s++) {
      const t = barT + s * STEP + swing(s);
      if (score.kick.includes(s) || (bar % 2 === 1 && score.kickOddBars?.includes(s))) kick(ctx, v.drums, t, score.kickLevel);
      if (score.snare.includes(s)) (score.snareVoice === 'wood' ? woodblock : snare)(ctx, v.drums, t);
      if (score.hats.includes(s)) {
        if (score.hatVoice === 'sleigh') hat(ctx, v.hats, t, s % 4 === 0 ? 0.9 : 0.55, 9000, 0.09);
        else hat(ctx, v.hats, t, s % 4 === 0 ? 1 : 0.6);
      }
    }
  }
  score.melody.forEach(([s, n, len]) => {
    const t = t0 + s * STEP + swing(s);
    const dur = len * STEP;
    if (score.lead === 'musicbox') musicBox(ctx, v.lead, n, t);
    else if (score.lead === 'pluck') pluck(ctx, v.lead, n, t, 0.9);
    else if (score.lead === 'bell') bell(ctx, v.lead, n, t, 1);
    else if (score.lead === 'flute') softLead(ctx, v.lead, n, t, dur, 9);
    else if (score.lead === 'soft') softLead(ctx, v.lead, n, t, dur, 3);
    else lead(ctx, v.lead, n, t, dur);
  });
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
  private bus: GainNode | null = null;
  private world: string | undefined;
  private score: Score = scoreFor();
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

  // A seasonal world brings its own mix, the same way it takes over the palette
  private isNight() {
    return document.documentElement.dataset.mode === 'dark' && !document.documentElement.dataset.world;
  }

  // Everything is scheduled ahead, so a change of score fades out the whole old bus
  private loadScore() {
    if (!this.ctx || !this.duckGain) return;
    const ctx = this.ctx;
    const world = document.documentElement.dataset.world;
    if (this.bus && world === this.world) return;
    const old = this.bus;
    if (old) {
      old.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
      setTimeout(() => old.disconnect(), 1500);
    }
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(old ? 0.0001 : 1, ctx.currentTime);
    if (old) bus.gain.setTargetAtTime(1, ctx.currentTime + 0.3, 0.3);
    bus.connect(this.duckGain);
    this.bus = bus;
    this.world = world;
    this.score = scoreFor(world);
    this.voices = createVoices(ctx, bus, this.score);
    this.nextLoop = ctx.currentTime + (old ? 0.4 : 0.15);
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
    this.loadScore();
    this.playing = true;
    this.setPreference(true);
    // Not awaited: without a user gesture the browser keeps this pending; the music simply
    // starts on the next gesture instead of blocking the UI state.
    ctx.resume().catch(() => {});
    this.applyMood();

    const tick = () => {
      if (!this.ctx || !this.voices) return;
      // keep one loop scheduled ahead
      while (this.nextLoop < this.ctx.currentTime + 2) {
        scheduleLoop(this.ctx, this.voices, this.nextLoop, this.score);
        this.nextLoop += loopSeconds(this.score);
      }
    };
    tick();
    this.timer = setInterval(tick, 500);
    this.observer = new MutationObserver(() => {
      this.loadScore();
      tick();
      this.applyMood();
    });
    this.observer.observe(document.documentElement, { attributeFilter: ['data-mode', 'data-world'] });
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
    this.bus = null;
    this.playing = false;
  }

  // While the wheel spins the music steps back
  duck(on: boolean) {
    if (!this.ctx || !this.duckGain) return;
    this.duckGain.gain.setTargetAtTime(on ? 0.22 : 1, this.ctx.currentTime, on ? 0.25 : 0.8);
  }
}

export const soundtrack = new Soundtrack();
