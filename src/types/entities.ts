import { Vector2D } from './game.ts';

export type PlayerSide = 'left' | 'right';

export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface IEntity {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  draw(ctx: CanvasRenderingContext2D): void;
  update(dt: number): void;
}

export interface IPlayer extends IEntity {
  side: PlayerSide;
  score: number;
  input: PlayerInput;
  acceleration: number;
  deceleration: number;
  maxSpeed: number;
  reset(): void;
}

export interface IBall extends IEntity {
  spin: number;
  deceleration: number;
  maxSpeed: number;
  reset(canvasWidth: number, canvasHeight: number): void;
}
