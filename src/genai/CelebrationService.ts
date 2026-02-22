import { EventBus } from '../core/EventBus.ts';
import { GameEvent } from '../types/events.ts';
import { GoalScoredPayload } from '../types/events.ts';

const API_URL = '/api/generate-image';

export class CelebrationService {
  private eventBus: EventBus;
  private cache = new Map<string, string>();
  private unsubscribers: (() => void)[] = [];
  private onImageReady: ((imgSrc: string) => void) | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.attachListeners();
  }

  private attachListeners(): void {
    this.unsubscribers.push(
      this.eventBus.on(GameEvent.GOAL_SCORED, (p) =>
        this.onGoalScored(p as GoalScoredPayload),
      ),
    );
  }

  setOnImageReady(cb: (imgSrc: string) => void): void {
    this.onImageReady = cb;
  }

  private async onGoalScored(payload: GoalScoredPayload): Promise<void> {
    const prompt = `Pixel art celebration scene of ${payload.scorerName} celebrating a goal. Score: ${payload.score.left}-${payload.score.right}. Vibrant retro gaming style.`;
    const cacheKey = this.hashPrompt(prompt);

    if (this.cache.has(cacheKey)) {
      this.onImageReady?.(this.cache.get(cacheKey)!);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.imageUrl) {
        this.cache.set(cacheKey, data.imageUrl);
        this.onImageReady?.(data.imageUrl);
      }
    } catch (err) {
      console.warn('Celebration image generation failed:', err);
    }
  }

  private hashPrompt(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return String(hash);
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }
}
