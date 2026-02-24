/**
 * Generates all game sounds programmatically using the Web Audio API.
 * No external audio files needed.
 */

type SoundGenerator = (ctx: OfflineAudioContext) => void;

function renderBuffer(
  audioCtx: AudioContext,
  duration: number,
  generator: SoundGenerator,
): Promise<AudioBuffer> {
  const sampleRate = audioCtx.sampleRate;
  const offline = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
  generator(offline);
  return offline.startRendering();
}

function createNoiseBuffer(ctx: OfflineAudioContext, duration: number): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

// --- Sound generators ---

function whistleStart(ctx: OfflineAudioContext): void {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(3200, 0);
  osc.frequency.linearRampToValueAtTime(3500, 0.1);
  osc.frequency.setValueAtTime(3500, 0.8);

  // Vibrato
  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 6;
  const vibratoGain = ctx.createGain();
  vibratoGain.gain.value = 30;
  vibrato.connect(vibratoGain);
  vibratoGain.connect(osc.frequency);
  vibrato.start(0);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(0.8, 0.05);
  gain.gain.setValueAtTime(0.8, 0.7);
  gain.gain.linearRampToValueAtTime(0, 0.9);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(0);
  osc.stop(0.9);
}

function whistleEnd(ctx: OfflineAudioContext): void {
  // Three short blasts
  for (let i = 0; i < 3; i++) {
    const start = i * 0.35;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3400, start);
    osc.frequency.linearRampToValueAtTime(3000, start + 0.25);

    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 5;
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.value = 25;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    vibrato.start(start);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.8, start + 0.03);
    gain.gain.setValueAtTime(0.8, start + 0.2);
    gain.gain.linearRampToValueAtTime(0, start + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  }
}

function crowdAmbient(ctx: OfflineAudioContext): void {
  const noise = createNoiseBuffer(ctx, 4);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 600;
  filter.Q.value = 0.5;

  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'lowpass';
  filter2.frequency.value = 1200;

  const gain = ctx.createGain();
  gain.gain.value = 0.35;

  // Gentle volume modulation for realism
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.3;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  lfo.start(0);

  noise.connect(filter);
  filter.connect(filter2);
  filter2.connect(gain);
  gain.connect(ctx.destination);
  noise.start(0);
}

function crowdRoar(ctx: OfflineAudioContext, variation: number): void {
  const duration = 1.5;
  const noise = createNoiseBuffer(ctx, duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 500 + variation * 150;
  filter.Q.value = 0.8;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(0.9, 0.05 + variation * 0.02);
  gain.gain.setValueAtTime(0.9, 0.3);
  gain.gain.exponentialRampToValueAtTime(0.01, duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(0);
}

function crowdGasp(ctx: OfflineAudioContext): void {
  const noise = createNoiseBuffer(ctx, 0.6);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  filter.Q.value = 1.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(0.7, 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, 0.5);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(0);
}

function crowdChant(ctx: OfflineAudioContext, syllables: number): void {
  // Rhythmic pulsed noise to simulate syllable chanting
  const pulseLength = 0.2;
  const gap = 0.12;

  for (let i = 0; i < syllables; i++) {
    const start = i * (pulseLength + gap);
    const noise = createNoiseBuffer(ctx, pulseLength + 0.05);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 700 + i * 100;
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.6, start + 0.02);
    gain.gain.setValueAtTime(0.6, start + pulseLength * 0.6);
    gain.gain.linearRampToValueAtTime(0, start + pulseLength);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(start);
    noise.stop(start + pulseLength + 0.05);
  }
}

function crowdBoo(ctx: OfflineAudioContext): void {
  const duration = 2.0;
  const noise = createNoiseBuffer(ctx, duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(0.5, 0.1);
  gain.gain.setValueAtTime(0.5, 1.2);
  gain.gain.linearRampToValueAtTime(0, duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(0);
}

// --- Main export ---

export async function generateSounds(
  audioCtx: AudioContext,
): Promise<Map<string, AudioBuffer>> {
  const buffers = new Map<string, AudioBuffer>();

  const specs: Array<[string, number, SoundGenerator]> = [
    ['whistle-start', 1.0, whistleStart],
    ['whistle-end', 1.2, whistleEnd],
    ['crowd-ambient', 4.0, crowdAmbient],
    ['crowd-roar-1', 1.5, (ctx) => crowdRoar(ctx, 0)],
    ['crowd-roar-2', 1.5, (ctx) => crowdRoar(ctx, 1)],
    ['crowd-roar-3', 1.5, (ctx) => crowdRoar(ctx, 2)],
    ['crowd-gasp', 0.6, crowdGasp],
    ['crowd-chant-messi', 1.0, (ctx) => crowdChant(ctx, 2)],
    ['crowd-chant-cristiano', 1.6, (ctx) => crowdChant(ctx, 3)],
    ['crowd-boo', 2.0, crowdBoo],
  ];

  const results = await Promise.all(
    specs.map(([key, duration, gen]) =>
      renderBuffer(audioCtx, duration, gen).then(
        (buf) => [key, buf] as [string, AudioBuffer],
      ),
    ),
  );

  for (const [key, buf] of results) {
    buffers.set(key, buf);
  }

  return buffers;
}
