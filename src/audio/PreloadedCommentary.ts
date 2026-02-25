import { EventBus } from '../core/EventBus.ts';
import { GameEvent } from '../types/events.ts';
import { CommentaryOverlay } from '../ui/components/CommentaryOverlay.ts';
import type { GoalScoredPayload, GameOverPayload } from '../types/events.ts';

const MANIFEST_URL = '/audio/commentary/manifest.json';

const FUN_FACT_INTERVAL_MS = 45_000;
const FUN_FACT_COOLDOWN_MS = 20_000;

interface Clip {
  text: string;
  audio: HTMLAudioElement | null;
}

interface ManifestEntry {
  file: string;
  text: string;
}

type Manifest = Record<string, ManifestEntry[]>;

// ── PreloadedCommentary ─────────────────────────────────────────────────

export class PreloadedCommentary {
  private eventBus: EventBus;
  private overlay: CommentaryOverlay;

  private unsubscribers: (() => void)[] = [];

  // Preloaded clip arrays
  private gameStartClips: Clip[] = [];
  private funFactClips: Clip[] = [];
  private goalMessiClips: Clip[] = [];
  private goalCristianoClips: Clip[] = [];
  private gameOverMessiClips: Clip[] = [];
  private gameOverCristianoClips: Clip[] = [];

  // Playback state
  private currentAudio: HTMLAudioElement | null = null;
  private currentFadeTimeout: ReturnType<typeof setTimeout> | null = null;
  private highPriorityPlaying = false;

  // Fun fact timer
  private funFactTimer: ReturnType<typeof setTimeout> | null = null;
  private lastFunFactTime = 0;

  private destroyed = false;

  constructor(eventBus: EventBus, overlay: CommentaryOverlay) {
    this.eventBus = eventBus;
    this.overlay = overlay;
  }

  async start(): Promise<void> {
    // Load manifest
    let manifest: Manifest;
    try {
      const res = await fetch(MANIFEST_URL);
      if (!res.ok) {
        console.warn('Commentary manifest not found — commentary disabled');
        return;
      }
      manifest = await res.json();
    } catch {
      console.warn('Failed to load commentary manifest — commentary disabled');
      return;
    }

    if (this.destroyed) return;

    // Load all clips from manifest
    this.gameStartClips = this.loadCategory(manifest, 'game-start');
    this.funFactClips = this.loadCategory(manifest, 'fun-fact');
    this.goalMessiClips = this.loadCategory(manifest, 'goal-messi');
    this.goalCristianoClips = this.loadCategory(manifest, 'goal-cristiano');
    this.gameOverMessiClips = this.loadCategory(manifest, 'game-over-messi');
    this.gameOverCristianoClips = this.loadCategory(manifest, 'game-over-cristiano');

    if (this.destroyed) return;

    // Play a random game-start clip immediately
    if (this.gameStartClips.length > 0) {
      this.playClip(pick(this.gameStartClips), 10000, false);
    }

    // Attach event listeners
    this.attachListeners();

    // Start fun fact timer
    this.scheduleFunFact();
  }

  private loadCategory(manifest: Manifest, category: string): Clip[] {
    const entries = manifest[category];
    if (!entries) return [];

    return entries.map((entry) => {
      const audio = new Audio(`/audio/commentary/${entry.file}`);
      audio.preload = 'auto';
      return { text: entry.text, audio };
    });
  }

  private attachListeners(): void {
    this.unsubscribers.push(
      this.eventBus.on(GameEvent.GOAL_SCORED, (p) =>
        this.onGoalScored(p as GoalScoredPayload),
      ),
      this.eventBus.on(GameEvent.NEAR_MISS, () => this.tryPlayFunFact()),
      this.eventBus.on(GameEvent.RALLY_LONG, () => this.tryPlayFunFact()),
      this.eventBus.on(GameEvent.GAME_OVER, (p) =>
        this.onGameOver(p as GameOverPayload),
      ),
    );
  }

  private onGoalScored(payload: GoalScoredPayload): void {
    const clips =
      payload.scorerName === 'Messi' ? this.goalMessiClips : this.goalCristianoClips;
    if (clips.length === 0) return;
    this.playClip(pick(clips), 8000, true);
  }

  private onGameOver(payload: GameOverPayload): void {
    const clips =
      payload.winnerName === 'Messi'
        ? this.gameOverMessiClips
        : this.gameOverCristianoClips;
    if (clips.length === 0) return;
    this.playClip(pick(clips), 12000, true);
  }

  private tryPlayFunFact(): void {
    if (this.funFactClips.length === 0) return;
    if (this.highPriorityPlaying) return;

    const now = Date.now();
    if (now - this.lastFunFactTime < FUN_FACT_COOLDOWN_MS) return;

    this.lastFunFactTime = now;
    this.playClip(pick(this.funFactClips), 9000, false);
    this.scheduleFunFact();
  }

  private scheduleFunFact(): void {
    if (this.funFactTimer) clearTimeout(this.funFactTimer);
    this.funFactTimer = setTimeout(() => {
      if (!this.destroyed) this.tryPlayFunFact();
    }, FUN_FACT_INTERVAL_MS);
  }

  private playClip(clip: Clip, durationMs: number, highPriority: boolean): void {
    if (this.destroyed) return;

    // Don't interrupt high-priority audio with low-priority
    if (!highPriority && this.highPriorityPlaying) return;

    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.currentFadeTimeout) {
      clearTimeout(this.currentFadeTimeout);
      this.currentFadeTimeout = null;
    }

    this.highPriorityPlaying = highPriority;

    // Show text in overlay
    this.overlay.showText(clip.text, durationMs);

    // Play audio if available
    if (clip.audio) {
      const audio = clip.audio;
      this.currentAudio = audio;
      audio.currentTime = 0;

      audio.onended = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.highPriorityPlaying = false;
        }
      };

      audio.play().catch(() => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.highPriorityPlaying = false;
        }
      });

      // Safety: clear high-priority flag after duration in case onended doesn't fire
      this.currentFadeTimeout = setTimeout(() => {
        this.highPriorityPlaying = false;
      }, durationMs);
    } else {
      // No audio — clear high-priority after a short period
      this.currentFadeTimeout = setTimeout(() => {
        this.highPriorityPlaying = false;
      }, 2000);
    }
  }

  destroy(): void {
    this.destroyed = true;

    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }

    // Clear timers
    if (this.funFactTimer) clearTimeout(this.funFactTimer);
    if (this.currentFadeTimeout) clearTimeout(this.currentFadeTimeout);

    // Unsubscribe from events
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];

    this.overlay.clear();
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
