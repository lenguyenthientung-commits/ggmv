import { playMotif } from './soundtrack';

// Professional Vintage Acoustic Sound Engine for 35mm Projector & Mechanical Tensioner
// Designed for headphone listening in café environments with strict acoustic dynamic range control

class VintageSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private projectorHumOsc: OscillatorNode | null = null;
  private projectorHumGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cinebro_sound_muted');
      this.isMuted = saved === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cinebro_sound_muted', String(this.isMuted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // 1. Mechanical 35mm Escapement Click (Bánh răng & chốt lẫy kim loại có lực đàn hồi)
  // Phân tầng: High transient (kim loại va chạm) + Mid friction (vành đồng) + Low thud (quán tính khối máy)
  playMechanicalTick(speedRatio: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      // Layer A: Metallic Sharp Clack (Spring-loaded pawl strike)
      const oscHigh = ctx.createOscillator();
      const gainHigh = ctx.createGain();
      const filterHigh = ctx.createBiquadFilter();

      oscHigh.type = 'triangle';
      oscHigh.frequency.setValueAtTime(1400 + Math.random() * 200, now);
      oscHigh.frequency.exponentialRampToValueAtTime(320, now + 0.025);

      filterHigh.type = 'bandpass';
      filterHigh.frequency.setValueAtTime(2200, now);
      filterHigh.Q.setValueAtTime(3.5, now);

      gainHigh.gain.setValueAtTime(0.22, now);
      gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      oscHigh.connect(filterHigh);
      filterHigh.connect(gainHigh);
      gainHigh.connect(this.masterGain);

      oscHigh.start(now);
      oscHigh.stop(now + 0.025);

      // Layer B: Heavy Cast-Iron Sub Thump (Lực đầm của bệ máy)
      const oscLow = ctx.createOscillator();
      const gainLow = ctx.createGain();

      oscLow.type = 'sine';
      oscLow.frequency.setValueAtTime(95, now);
      oscLow.frequency.exponentialRampToValueAtTime(42, now + 0.045);

      gainLow.gain.setValueAtTime(0.18, now);
      gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      oscLow.connect(gainLow);
      gainLow.connect(this.masterGain);

      oscLow.start(now);
      oscLow.stop(now + 0.045);
    } catch {
      // Audio fallback
    }
  }

  // 2. Vintage Projector Motor Spool (Tiếng môtơ tời cuộn phim quay êm ái)
  startProjectorWhir() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain || this.projectorHumOsc) return;

      const now = ctx.currentTime;
      this.projectorHumOsc = ctx.createOscillator();
      this.projectorHumGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      this.projectorHumOsc.type = 'sawtooth';
      this.projectorHumOsc.frequency.setValueAtTime(54, now); // 54Hz subtle sub-drone
      this.projectorHumOsc.frequency.linearRampToValueAtTime(68, now + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      this.projectorHumGain.gain.setValueAtTime(0.001, now);
      this.projectorHumGain.gain.linearRampToValueAtTime(0.07, now + 0.5);

      this.projectorHumOsc.connect(filter);
      filter.connect(this.projectorHumGain);
      this.projectorHumGain.connect(this.masterGain);

      this.projectorHumOsc.start(now);
    } catch {
      // Audio fallback
    }
  }

  stopProjectorWhir() {
    try {
      if (this.projectorHumGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.projectorHumGain.gain.linearRampToValueAtTime(0.001, now + 0.6);
        setTimeout(() => {
          if (this.projectorHumOsc) {
            try { this.projectorHumOsc.stop(); } catch {}
            this.projectorHumOsc.disconnect();
            this.projectorHumOsc = null;
          }
        }, 650);
      }
    } catch {
      // Fallback
    }
  }

  // 3. Winner sting: a low impact, then the club leitmotif G-G (see utils/soundtrack.ts)
  playVintageWinnerFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(120, now);
      subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.5);
      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.6);

      playMotif(ctx, this.masterGain, now + 0.05, 'reveal');
    } catch {
      // Audio fallback
    }
  }

  // Achievement unlock: the leitmotif an octave up, short
  playUnlockSting() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;
      playMotif(ctx, this.masterGain, ctx.currentTime + 0.02, 'unlock');
    } catch {
      // Audio fallback
    }
  }

  // 4. Heavy Toggle Switch Clack (Cảm giác gạt công tắc điện đồng thau)
  playVintageSwitch() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Fallback
    }
  }

  // 5. Dry game-show buzzer for the fake-victory "CLAIM DENIED" gag (two short low blasts)
  playTrollBuzzer() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;
      [0, 0.22].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(118, now + offset);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.09, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });
    } catch {
      // Fallback
    }
  }

  // 6. Heartbeat for the last seconds of a spin: a soft "lub-dub" of two low thumps
  playHeartbeat() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;
      [[0, 0.26], [0.16, 0.18]].forEach(([offset, level]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(70, now + offset);
        osc.frequency.exponentialRampToValueAtTime(38, now + offset + 0.14);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(level, now + offset + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.16);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + offset);
        osc.stop(now + offset + 0.18);
      });
    } catch {
      // Fallback
    }
  }

  // Legacy compatibility
  playTick() {
    this.playMechanicalTick();
  }
  playWinnerFanfare() {
    this.playVintageWinnerFanfare();
  }
  playClick() {
    this.playVintageSwitch();
  }
}

export const sounds = new VintageSoundEngine();
