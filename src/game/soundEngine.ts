import { WeaponId } from '../data/gddData';

class FoleySoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playWeaponFire(weapon: WeaponId): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (weapon) {
      case 'penna': {
        // Click + rubber band twang
        this.triggerNoiseBurst(ctx, now, 0.03, 2400, 0.25);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'taglierino': {
        // Metallic click-click + sharp paper slice
        this.triggerNoiseBurst(ctx, now, 0.025, 3800, 0.3);
        this.triggerNoiseBurst(ctx, now + 0.04, 0.14, 1800, 0.35);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.14);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'colla': {
        // Wet viscous SQUISH!
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.09);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
        this.triggerNoiseBurst(ctx, now + 0.02, 0.12, 950, 0.22);
        break;
      }
      case 'cucchiaio': {
        // Heavy metallic CLANG! with inharmonic overtones
        const freqs = [540, 815, 1290, 1740];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(f, now);
          osc.frequency.exponentialRampToValueAtTime(f * 0.96, now + 0.42);
          gain.gain.setValueAtTime(0.22 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.42);
        });
        break;
      }
      case 'bianchetto': {
        // Squash-Pop!
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(290, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
        osc.frequency.setValueAtTime(520, now + 0.085);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.19);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'forbici': {
        // Crisp SNIP-SNIP!
        this.triggerNoiseBurst(ctx, now, 0.045, 4400, 0.35);
        this.triggerNoiseBurst(ctx, now + 0.075, 0.055, 5100, 0.38);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(2600, now + 0.06);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      case 'elastici': {
        this.playBoing(0);
        break;
      }
      case 'cerbottana': {
        // Hollow tube FUMP!
        this.triggerNoiseBurst(ctx, now, 0.09, 650, 0.35);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.09);
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'gomma': {
        // Heavy rubber THUD-RUB!
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(135, now);
        osc.frequency.exponentialRampToValueAtTime(52, now + 0.18);
        gain.gain.setValueAtTime(0.36, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
        this.triggerNoiseBurst(ctx, now + 0.05, 0.14, 1500, 0.2);
        break;
      }
    }
  }

  public playBoing(bounceIndex = 0): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const baseFreq = 180 + bounceIndex * 65;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.9, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.24);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playDuckSqueak(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(780, now);
    osc.frequency.exponentialRampToValueAtTime(1350, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(690, now + 0.18);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  public playToiletFlush(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Roaring water vortex
    this.triggerNoiseBurst(ctx, now, 2.2, 480, 0.42);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 2.1);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2.2);
  }

  public playEraseProjectile(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Pencil eraser rub sound
    this.triggerNoiseBurst(ctx, now, 0.11, 2200, 0.3);
  }

  public playPaperPickup(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.triggerNoiseBurst(ctx, now, 0.07, 3200, 0.25);
  }

  private triggerNoiseBurst(
    ctx: AudioContext,
    startTime: number,
    duration: number,
    filterFreq: number,
    volume: number
  ): void {
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, startTime);
    filter.Q.setValueAtTime(1.8, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(startTime);
    noise.stop(startTime + duration);
  }
}

export const foleyAudio = new FoleySoundEngine();
