import { PlayerSide } from './entities.ts';

export enum GameEvent {
  GOAL_SCORED = 'GOAL_SCORED',
  GAME_OVER = 'GAME_OVER',
  GAME_STARTED = 'GAME_STARTED',
  NEAR_MISS = 'NEAR_MISS',
  COLLISION = 'COLLISION',
  RALLY_LONG = 'RALLY_LONG',
  STATE_CHANGED = 'STATE_CHANGED',
  SCORE_UPDATED = 'SCORE_UPDATED',
}

export interface GoalScoredPayload {
  scorer: PlayerSide;
  scorerName: string;
  score: { left: number; right: number };
}

export interface GameOverPayload {
  winner: PlayerSide;
  winnerName: string;
  finalScore: { left: number; right: number };
}

export interface GameStartedPayload {
  mode: string;
}

export interface NearMissPayload {
  side: PlayerSide;
  distance: number;
}

export interface CollisionPayload {
  player: PlayerSide;
  ballSpeed: number;
  isPowerShot: boolean;
}

export interface RallyLongPayload {
  hitCount: number;
}

export interface StateChangedPayload {
  from: string;
  to: string;
}

export interface ScoreUpdatedPayload {
  left: number;
  right: number;
}
