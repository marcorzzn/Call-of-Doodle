import { WeaponId } from '../data/gddData';

class FoleySoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      case 'penna_bic': {
        // Click of cap + supersonic FSSS!
        this.triggerNoiseBurst(ctx, now, 0.025, 3200, 0.35);
        this.triggerNoiseBurst(ctx, now + 0.03, 0.16, 1800, 0.28);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
        break;
      }
      case 'penna_scatto': {
        // Rapid click-twang
        this.triggerNoiseBurst(ctx, now, 0.02, 2800, 0.28);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(125, now + 0.11);
        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'spillatrice': {
        // Industrial stapler KA-CHUNK!
        this.triggerNoiseBurst(ctx, now, 0.05, 1900, 0.4);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(85, now + 0.12);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }
      case 'pennarello': {
        // Felt marker SQUEAK + heavy bazooka BOOM!
        const squeak = ctx.createOscillator();
        const sqGain = ctx.createGain();
        squeak.type = 'sine';
        squeak.frequency.setValueAtTime(1400, now);
        squeak.frequency.exponentialRampToValueAtTime(2200, now + 0.07);
        sqGain.gain.setValueAtTime(0.2, now);
        sqGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        squeak.connect(sqGain).connect(ctx.destination);
        squeak.start(now);
        squeak.stop(now + 0.08);

        const boom = ctx.createOscillator();
        const bGain = ctx.createGain();
        boom.type = 'sawtooth';
        boom.frequency.setValueAtTime(150, now + 0.06);
        boom.frequency.exponentialRampToValueAtTime(38, now + 0.38);
        bGain.gain.setValueAtTime(0.38, now + 0.06);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.39);
        boom.connect(bGain).connect(ctx.destination);
        boom.start(now + 0.06);
        boom.stop(now + 0.39);
        break;
      }
      case 'colla_caldo': {
        // Steam PSSST + sticky squish
        this.triggerNoiseBurst(ctx, now, 0.15, 2900, 0.28);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(210, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
        break;
      }
      case 'taglierino': {
        // SNIKT-SNIKT!
        this.triggerNoiseBurst(ctx, now, 0.03, 4200, 0.35);
        this.triggerNoiseBurst(ctx, now + 0.06, 0.09, 2600, 0.35);
        break;
      }
      case 'cucchiaio': {
        // Metallic CLANG!
        const freqs = [560, 840, 1310];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);
          osc.frequency.exponentialRampToValueAtTime(f * 0.96, now + 0.35);
          gain.gain.setValueAtTime(0.22 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.36);
        });
        break;
      }
      case 'mestolo': {
        // Wooden dull TONF!
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(165, now);
        osc.frequency.exponentialRampToValueAtTime(52, now + 0.22);
        gain.gain.setValueAtTime(0.42, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
        this.triggerNoiseBurst(ctx, now, 0.08, 420, 0.3);
        break;
      }
      case 'righello': {
        // Fast plastic SWOOSH!
        this.triggerNoiseBurst(ctx, now, 0.14, 1400, 0.36);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.13);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }
      case 'forchetta': {
        // STAB-TWANG!
        this.triggerNoiseBurst(ctx, now, 0.05, 3400, 0.35);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.28);
        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.29);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.29);
        break;
      }
      case 'padella': {
        // Deep cast-iron DONNNNG!
        const partials = [210, 318, 495, 680];
        partials.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, now);
          osc.frequency.exponentialRampToValueAtTime(f * 0.98, now + 0.72);
          gain.gain.setValueAtTime(0.32 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.75);
        });
        break;
      }
      case 'spugna': {
        // Wet SQUELCH!
        this.triggerNoiseBurst(ctx, now, 0.18, 850, 0.32);
        break;
      }
      case 'gomma': {
        this.playBoing(0);
        break;
      }
      case 'molletta': {
        // Sharp spring SNAP!
        this.triggerNoiseBurst(ctx, now, 0.04, 3100, 0.4);
        break;
      }
      case 'lampadina': {
        // Glass POP-CRACKLE!
        this.triggerNoiseBurst(ctx, now, 0.16, 3900, 0.42);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }
      case 'phon': {
        // Warm turbine WHOOOOSH!
        this.triggerNoiseBurst(ctx, now, 0.25, 1100, 0.35);
        break;
      }
      case 'laser_gatto': {
        // Electronic laser BEEP + Cat MEOW!
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1850, now);
        osc.frequency.setValueAtTime(2200, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }
    }
  }

  public playReload(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.triggerNoiseBurst(ctx, now, 0.04, 2400, 0.25);
    this.triggerNoiseBurst(ctx, now + 0.18, 0.05, 3200, 0.3);
  }

  public playElectroBathBuzz(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Comic 220V BZZZ-BZZZ!
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.setValueAtTime(160, now + 0.12);
    osc.frequency.setValueAtTime(105, now + 0.24);
    osc.frequency.setValueAtTime(180, now + 0.36);
    gain.gain.setValueAtTime(0.36, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  public playCatMeow(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(940, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.38);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
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
