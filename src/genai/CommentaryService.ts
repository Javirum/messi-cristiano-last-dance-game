import { EventBus } from '../core/EventBus.ts';
import { GameEvent } from '../types/events.ts';
import { CommentaryOverlay } from '../ui/components/CommentaryOverlay.ts';
import {
  GoalScoredPayload,
  NearMissPayload,
  RallyLongPayload,
  GameOverPayload,
  GameStartedPayload,
} from '../types/events.ts';

const SYSTEM_PROMPT = `You are an enthusiastic soccer commentator for a Messi vs Cristiano air hockey football game. Keep commentary short (1-2 sentences max), exciting, and use soccer terminology. Vary your style - sometimes dramatic, sometimes humorous. Never repeat the exact same phrase.`;

const API_URL = '/api/commentary';

export class CommentaryService {
  private eventBus: EventBus;
  private overlay: CommentaryOverlay;
  private history: string[] = [];
  private abortController: AbortController | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubscribers: (() => void)[] = [];

  constructor(eventBus: EventBus, overlay: CommentaryOverlay) {
    this.eventBus = eventBus;
    this.overlay = overlay;
    this.attachListeners();
  }

  private attachListeners(): void {
    this.unsubscribers.push(
      this.eventBus.on(GameEvent.GAME_STARTED, (p) =>
        this.onGameStarted(p as GameStartedPayload),
      ),
      this.eventBus.on(GameEvent.GOAL_SCORED, (p) =>
        this.debounce(() => this.onGoalScored(p as GoalScoredPayload)),
      ),
      this.eventBus.on(GameEvent.NEAR_MISS, (p) =>
        this.debounce(() => this.onNearMiss(p as NearMissPayload)),
      ),
      this.eventBus.on(GameEvent.RALLY_LONG, (p) =>
        this.debounce(() => this.onRallyLong(p as RallyLongPayload)),
      ),
      this.eventBus.on(GameEvent.GAME_OVER, (p) =>
        this.onGameOver(p as GameOverPayload),
      ),
    );
  }

  private debounce(fn: () => void, delayMs = 500): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(fn, delayMs);
  }

  private onGameStarted(payload: GameStartedPayload): void {
    const modeText = payload.mode === 'PVP' ? '2-player match' : 'match against AI';
    this.generate(`The ${modeText} between Messi and Cristiano is about to begin! Set the scene.`);
  }

  private onGoalScored(payload: GoalScoredPayload): void {
    this.generate(
      `${payload.scorerName} just scored! The score is now Cristiano ${payload.score.left} - ${payload.score.right} Messi. Give an excited goal commentary.`,
    );
  }

  private onNearMiss(_payload: NearMissPayload): void {
    this.generate('The ball just narrowly missed the goal! React with a near-miss commentary.');
  }

  private onRallyLong(payload: RallyLongPayload): void {
    this.generate(
      `What an exchange! ${payload.hitCount} consecutive hits in this rally. Comment on this intense back-and-forth.`,
    );
  }

  private onGameOver(payload: GameOverPayload): void {
    this.generate(
      `${payload.winnerName} has won the match ${payload.finalScore.left}-${payload.finalScore.right}! Give a dramatic match summary and celebrate the winner.`,
    );
  }

  private async generate(userPrompt: string): Promise<void> {
    // Cancel any in-flight request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    const recentHistory = this.history.slice(-3).join('\n');
    const contextNote = recentHistory
      ? `\nPrevious commentary (do not repeat):\n${recentHistory}`
      : '';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: SYSTEM_PROMPT + contextNote,
          prompt: userPrompt,
          stream: true,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok || !response.body) {
        // Fallback: show the prompt context
        this.overlay.showText(userPrompt, 4000);
        return;
      }

      this.overlay.startStream();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE events
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullText += parsed.delta.text;
                this.overlay.streamCharacter(parsed.delta.text);
              }
            } catch {
              // Non-JSON data, treat as plain text
              fullText += data;
              this.overlay.streamCharacter(data);
            }
          }
        }
      }

      this.overlay.endStream(4000);
      if (fullText) {
        this.history.push(fullText);
        if (this.history.length > 10) this.history.shift();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Commentary generation failed:', err);
      }
    }
  }

  destroy(): void {
    if (this.abortController) this.abortController.abort();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.overlay.clear();
  }
}
