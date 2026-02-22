import { EventBus } from '../core/EventBus.ts';
import { GameEvent } from '../types/events.ts';
import { SoundManager } from './SoundManager.ts';
import {
  GoalScoredPayload,
  NearMissPayload,
  RallyLongPayload,
  GameOverPayload,
} from '../types/events.ts';

const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/`;

const FAN_SOUNDS = {
  'crowd-ambient': `${AUDIO_BASE}crowd-ambient.mp3`,
  'crowd-roar-1': `${AUDIO_BASE}crowd-roar-1.mp3`,
  'crowd-roar-2': `${AUDIO_BASE}crowd-roar-2.mp3`,
  'crowd-roar-3': `${AUDIO_BASE}crowd-roar-3.mp3`,
  'crowd-gasp': `${AUDIO_BASE}crowd-gasp.mp3`,
  'crowd-chant-messi': `${AUDIO_BASE}crowd-chant-messi.mp3`,
  'crowd-chant-cristiano': `${AUDIO_BASE}crowd-chant-cristiano.mp3`,
  'crowd-boo': `${AUDIO_BASE}crowd-boo.mp3`,
  'whistle-start': `${AUDIO_BASE}whistle-start.mp3`,
  'whistle-end': `${AUDIO_BASE}whistle-end.mp3`,
};

export class FanSoundManager {
  private soundManager: SoundManager;
  private eventBus: EventBus;
  private ambientSource: AudioBufferSourceNode | null = null;
  private unsubscribers: (() => void)[] = [];
  private loaded = false;

  constructor(eventBus: EventBus) {
    this.soundManager = new SoundManager();
    this.eventBus = eventBus;
  }

  async init(): Promise<void> {
    const loadPromises = Object.entries(FAN_SOUNDS).map(([key, url]) =>
      this.soundManager.loadSound(key, url),
    );
    await Promise.allSettled(loadPromises);
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
    // Start ambient crowd noise
    this.ambientSource = this.soundManager.playLoop('crowd-ambient', 0.15);
  }

  private onGoalScored(payload: GoalScoredPayload): void {
    if (!this.loaded) return;
    // Random roar variation
    const roarIndex = Math.floor(Math.random() * 3) + 1;
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
    const roarIndex = Math.floor(Math.random() * 3) + 1;
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
      const roarIndex = Math.floor(Math.random() * 3) + 1;
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
