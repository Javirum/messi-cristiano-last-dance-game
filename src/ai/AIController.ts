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
      // Ball moving away — track ball Y to stay in attacking position
      return ball.position.y;
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
    const ballOnOurSide =
      (player.side === 'right' && ball.position.x > midfield) ||
      (player.side === 'left' && ball.position.x < midfield);

    const ballMovingToward =
      (player.side === 'right' && ball.velocity.x > 0) ||
      (player.side === 'left' && ball.velocity.x < 0);

    // When ball is on our side, intercept it
    if (ballOnOurSide && ballMovingToward) {
      return ball.position.x;
    }

    // Ball is on opponent's side — chase it to attack/score
    if (!ballOnOurSide) {
      if (this.difficulty === Difficulty.HARD) {
        // Hard: chase the ball all the way
        return ball.position.x;
      } else if (this.difficulty === Difficulty.MEDIUM) {
        // Medium: push well past midfield toward the ball
        const attackX = player.side === 'right'
          ? Math.max(ball.position.x, midfield - 200)
          : Math.min(ball.position.x, midfield + 200);
        return attackX;
      } else {
        // Easy: push slightly past midfield
        return player.side === 'right'
          ? midfield - 80
          : midfield + 80;
      }
    }

    // Ball on our side but moving away — hold midfield area
    return player.side === 'right'
      ? CANVAS.WIDTH * 0.6
      : CANVAS.WIDTH * 0.4;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.reactionDelay = AI_REACTION_DELAY[difficulty];
  }
}
