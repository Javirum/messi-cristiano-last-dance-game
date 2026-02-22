import { EventBus } from '../core/EventBus.ts';
import { GameEvent } from '../types/events.ts';
import { GameOverPayload } from '../types/events.ts';

const API_URL = '/api/generate-image';

export class VictoryService {
  private eventBus: EventBus;
  private unsubscribers: (() => void)[] = [];
  private onImageReady: ((imgSrc: string) => void) | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.attachListeners();
  }

  private attachListeners(): void {
    this.unsubscribers.push(
      this.eventBus.on(GameEvent.GAME_OVER, (p) =>
        this.onGameOver(p as GameOverPayload),
      ),
    );
  }

  setOnImageReady(cb: (imgSrc: string) => void): void {
    this.onImageReady = cb;
  }

  private async onGameOver(payload: GameOverPayload): Promise<void> {
    const loserName =
      payload.winnerName === 'Messi' ? 'Cristiano' : 'Messi';
    const prompt = `Epic victory scene of ${payload.winnerName} after defeating ${loserName} ${payload.finalScore.left}-${payload.finalScore.right} in an air hockey football match. Trophy, confetti, retro pixel art style.`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.imageUrl) {
        this.onImageReady?.(data.imageUrl);
      }
    } catch (err) {
      console.warn('Victory image generation failed:', err);
    }
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }
}
