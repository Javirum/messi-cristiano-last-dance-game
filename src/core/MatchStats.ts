import { EventBus } from './EventBus.ts';
import { GameEvent, CollisionPayload, RallyLongPayload } from '../types/events.ts';

export interface MatchStatsData {
  shotsLeft: number;
  shotsRight: number;
  powerShotsLeft: number;
  powerShotsRight: number;
  longestRally: number;
  totalRallies: number;
}

export class MatchStats {
  private shotsLeft = 0;
  private shotsRight = 0;
  private powerShotsLeft = 0;
  private powerShotsRight = 0;
  private longestRally = 0;
  private totalRallies = 0;
  private unsubscribers: (() => void)[] = [];

  constructor(eventBus: EventBus) {
    this.unsubscribers.push(
      eventBus.on(GameEvent.COLLISION, (p) => this.onCollision(p as CollisionPayload)),
      eventBus.on(GameEvent.RALLY_LONG, (p) => this.onRallyLong(p as RallyLongPayload)),
    );
  }

  private onCollision(payload: CollisionPayload): void {
    if (payload.player === 'left') {
      this.shotsLeft++;
      if (payload.isPowerShot) this.powerShotsLeft++;
    } else {
      this.shotsRight++;
      if (payload.isPowerShot) this.powerShotsRight++;
    }
  }

  private onRallyLong(payload: RallyLongPayload): void {
    this.totalRallies++;
    if (payload.hitCount > this.longestRally) {
      this.longestRally = payload.hitCount;
    }
  }

  getData(): MatchStatsData {
    return {
      shotsLeft: this.shotsLeft,
      shotsRight: this.shotsRight,
      powerShotsLeft: this.powerShotsLeft,
      powerShotsRight: this.powerShotsRight,
      longestRally: this.longestRally,
      totalRallies: this.totalRallies,
    };
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }
}
