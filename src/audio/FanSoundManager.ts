import { EventBus } from '../core/EventBus.ts';
import { GameEvent } from '../types/events.ts';
import { SoundManager } from './SoundManager.ts';
import { generateSounds } from './SyntheticSounds.ts';
import {
  GoalScoredPayload,
  NearMissPayload,
  RallyLongPayload,
  GameOverPayload,
} from '../types/events.ts';

export class FanSoundManager {
  private soundManager: SoundManager;
  private eventBus: EventBus;
  private ambientSource: AudioBufferSourceNode | null = null;
  private unsubscribers: (() => void)[] = [];
  private loaded = false;

  /** Real audio files to load from public/audio/ */
  private static readonly REAL_AUDIO_FILES: Array<[string, string]> = [
    ['whistle-start', import.meta.env.BASE_URL + 'audio/whistle-start.mp3'],
    ['whistle-end', import.meta.env.BASE_URL + 'audio/whistle-end.mp3'],
    ['crowd-ambient-1', import.meta.env.BASE_URL + 'audio/crowd-ambient-1.mp3'],
    ['crowd-ambient-2', import.meta.env.BASE_URL + 'audio/crowd-ambient-2.mp3'],
    ['crowd-roar-1', import.meta.env.BASE_URL + 'audio/crowd-roar-1.mp3'],
    ['crowd-roar-2', import.meta.env.BASE_URL + 'audio/crowd-roar-2.mp3'],
    ['crowd-roar-3', import.meta.env.BASE_URL + 'audio/crowd-roar-3.mp3'],
    ['crowd-roar-4', import.meta.env.BASE_URL + 'audio/crowd-roar-4.mp3'],
  ];

  constructor(eventBus: EventBus) {
    this.soundManager = new SoundManager();
    this.eventBus = eventBus;
  }

  async init(): Promise<void> {
    try {
      const ctx = this.soundManager.getContext();
      // Generate synthetic sounds (for UI sounds, gasp, chant, boo, goal-horn)
      const buffers = await generateSounds(ctx);
      for (const [key, buffer] of buffers) {
        this.soundManager.setBuffer(key, buffer);
      }
    } catch (e) {
      console.warn('Failed to generate synthetic sounds:', e);
    }

    // Load real audio files (whistle, crowd ambient, crowd roar)
    await Promise.all(
      FanSoundManager.REAL_AUDIO_FILES.map(([key, url]) =>
        this.soundManager.loadSound(key, url).catch((e) =>
          console.warn(`Failed to load ${key}:`, e),
        ),
      ),
    );

    this.loaded = true;
    this.attachListeners();
  }

  private attachListeners(): void {
    this.unsubscribers.push(
      this.eventBus.on(GameEvent.GAME_STARTED, () => this.onGameStarted()),
      this.eventBus.on(GameEvent.GOAL_SCORED, (p) =>
        this.onGoalScored(p as GoalScoredPayload),
      ),
      this.eventBus.on(GameEvent.NEAR_MISS, (p) =>
        this.onNearMiss(p as NearMissPayload),
      ),
      this.eventBus.on(GameEvent.RALLY_LONG, (p) =>
        this.onRallyLong(p as RallyLongPayload),
      ),
      this.eventBus.on(GameEvent.GAME_OVER, (p) =>
        this.onGameOver(p as GameOverPayload),
      ),
    );
  }

  private onGameStarted(): void {
    if (!this.loaded) return;
    this.soundManager.resume();
    this.soundManager.play('whistle-start', 0.6);
    // Start ambient crowd noise (random variation)
    const ambientIndex = Math.floor(Math.random() * 2) + 1;
    this.ambientSource = this.soundManager.playLoop(`crowd-ambient-${ambientIndex}`, 0.15);
  }

  private onGoalScored(payload: GoalScoredPayload): void {
    if (!this.loaded) return;
    // Goal horn blast
    this.soundManager.play('goal-horn', 0.7);
    // Random roar variation (4 real audio variations)
    const roarIndex = Math.floor(Math.random() * 4) + 1;
    this.soundManager.play(`crowd-roar-${roarIndex}`, 0.8);

    // Chant scorer's name
    const chantKey =
      payload.scorerName === 'Messi'
        ? 'crowd-chant-messi'
        : 'crowd-chant-cristiano';
    setTimeout(() => this.soundManager.play(chantKey, 0.5), 1500);
  }

  private onNearMiss(_payload: NearMissPayload): void {
    if (!this.loaded) return;
    this.soundManager.play('crowd-gasp', 0.6);
  }

  private onRallyLong(_payload: RallyLongPayload): void {
    // Crowd gets more excited during long rallies — we could ramp
    // ambient volume but without direct gain node access we just
    // play an extra cheer layer
    if (!this.loaded) return;
    const roarIndex = Math.floor(Math.random() * 4) + 1;
    this.soundManager.play(`crowd-roar-${roarIndex}`, 0.3);
  }

  private onGameOver(payload: GameOverPayload): void {
    if (!this.loaded) return;
    // Stop ambient
    if (this.ambientSource) {
      this.ambientSource.stop();
      this.ambientSource = null;
    }

    this.soundManager.play('whistle-end', 0.7);

    // Winner celebration chant + loser boo
    const chantKey =
      payload.winnerName === 'Messi'
        ? 'crowd-chant-messi'
        : 'crowd-chant-cristiano';
    setTimeout(() => {
      const roarIndex = Math.floor(Math.random() * 4) + 1;
      this.soundManager.play(`crowd-roar-${roarIndex}`, 1.0);
      this.soundManager.play(chantKey, 0.7);
    }, 800);
    setTimeout(() => this.soundManager.play('crowd-boo', 0.4), 2000);
  }

  toggleMute(): boolean {
    return this.soundManager.toggleMute();
  }

  destroy(): void {
    if (this.ambientSource) {
      this.ambientSource.stop();
      this.ambientSource = null;
    }
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }
}
