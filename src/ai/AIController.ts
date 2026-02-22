import { Difficulty } from '../types/game.ts';
import { PlayerInput } from '../types/entities.ts';
import { Player } from '../entities/Player.ts';
import { Ball } from '../entities/Ball.ts';
import { CANVAS, AI_REACTION_DELAY } from '../config/constants.ts';

export class AIController {
  private difficulty: Difficulty;
  private reactionDelay: number;
  private lastDecisionTime = 0;
  private currentInput: PlayerInput = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  private deadZone = 16;

  constructor(difficulty: Difficulty) {
    this.difficulty = difficulty;
    this.reactionDelay = AI_REACTION_DELAY[difficulty];
  }

  update(player: Player, ball: Ball, now: number): PlayerInput {
    if (now - this.lastDecisionTime < this.reactionDelay) {
      return this.currentInput;
    }
    this.lastDecisionTime = now;

    const input: PlayerInput = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    // Predict where ball will be when it reaches player's X
    const targetY = this.predictBallY(player, ball);

    // Y tracking
    const dy = targetY - player.position.y;
    if (Math.abs(dy) > this.deadZone) {
      if (dy < 0) input.up = true;
      else input.down = true;
    }

    // X positioning based on ball location and difficulty
    const targetX = this.getTargetX(player, ball);
    const dx = targetX - player.position.x;
    if (Math.abs(dx) > this.deadZone) {
      if (dx < 0) input.left = true;
      else input.right = true;
    }

    this.currentInput = input;
    return input;
  }

  private predictBallY(player: Player, ball: Ball): number {
    if (ball.velocity.x === 0) return ball.position.y;

    // Only predict when ball is moving toward us
    const movingToward =
      (player.side === 'right' && ball.velocity.x > 0) ||
      (player.side === 'left' && ball.velocity.x < 0);

    if (!movingToward) {
      // Ball moving away — hold position near center
      return CANVAS.HEIGHT / 2;
    }

    // Time for ball to reach player's X
    const distX = Math.abs(player.position.x - ball.position.x);
    const timeToReach = distX / Math.abs(ball.velocity.x);
    let predictedY = ball.position.y + ball.velocity.y * timeToReach;

    // Clamp prediction within canvas
    predictedY = Math.max(
      player.radius,
      Math.min(CANVAS.HEIGHT - player.radius, predictedY),
    );

    // Add imprecision for easier difficulties
    if (this.difficulty === Difficulty.EASY) {
      predictedY += (Math.random() - 0.5) * 120;
    } else if (this.difficulty === Difficulty.MEDIUM) {
      predictedY += (Math.random() - 0.5) * 50;
    }

    return predictedY;
  }

  private getTargetX(player: Player, ball: Ball): number {
    const midfield = CANVAS.WIDTH / 2;
    const isDefensiveSituation =
      (player.side === 'right' && ball.position.x > midfield) ||
      (player.side === 'left' && ball.position.x < midfield);

    if (this.difficulty === Difficulty.HARD && !isDefensiveSituation) {
      // Aggressive: push past midfield
      return player.side === 'right'
        ? midfield + 80
        : midfield - 80;
    }

    // Defensive: stay near goal
    if (isDefensiveSituation) {
      return player.side === 'right'
        ? CANVAS.WIDTH - 160
        : 160;
    }

    // Default position
    return player.side === 'right'
      ? CANVAS.WIDTH * 0.75
      : CANVAS.WIDTH * 0.25;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.reactionDelay = AI_REACTION_DELAY[difficulty];
  }
}
