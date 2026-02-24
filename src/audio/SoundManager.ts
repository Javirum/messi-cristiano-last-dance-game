export class SoundManager {
  private audioCtx: AudioContext | null = null;
  private sounds = new Map<string, AudioBuffer>();
  private muted = false;
  private masterGain: GainNode | null = null;

  getContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.connect(this.audioCtx.destination);
    }
    return this.audioCtx;
  }

  setBuffer(key: string, buffer: AudioBuffer): void {
    this.sounds.set(key, buffer);
  }

  async loadSound(key: string, url: string): Promise<void> {
    try {
      const ctx = this.getContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.sounds.set(key, audioBuffer);
    } catch {
      console.warn(`Failed to load sound: ${key} from ${url}`);
    }
  }

  play(key: string, volume = 1.0): AudioBufferSourceNode | null {
    if (this.muted) return null;
    const buffer = this.sounds.get(key);
    if (!buffer) return null;

    const ctx = this.getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode);
    gainNode.connect(this.masterGain!);

    source.start(0);
    return source;
  }

  playLoop(key: string, volume = 0.3): AudioBufferSourceNode | null {
    if (this.muted) return null;
    const buffer = this.sounds.get(key);
    if (!buffer) return null;

    const ctx = this.getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode);
    gainNode.connect(this.masterGain!);

    source.start(0);
    return source;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1;
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  resume(): void {
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
  }
}
