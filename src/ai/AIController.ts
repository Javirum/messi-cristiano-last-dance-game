import { Difficulty } from '../types/game.ts';
import { PlayerInput } from '../types/entities.ts';
import { Player } from '../entities/Player.ts';
import { Ball } from '../entities/Ball.ts';
import { CANVAS, AI_REACTION_DELAY } from '../config/constants.ts';
import { aggressiveStrategy } from './strategies/AggressiveStrategy.ts';
import { defensiveStrategy } from './strategies/DefensiveStrategy.ts';

type Strategy = 'balanced' | 'aggressive' | 'defensive';

export class AIController {
  private difficulty: Difficulty;
  private reactionDelay: number;
  private lastDecisionTime = 0;
  private currentInput: PlayerInput = {
    up: false,
    down: false,
    left: false,
    right: false,
    kick: false,
  };
  private deadZone = 16;
  private kickChargeStart = 0;
  private kickChargeDuration = 0;
  private isChargingKick = false;
  private currentStrategy: Strategy = 'balanced';
  private lastStrategyCheck = 0;

  constructor(difficulty: Difficulty) {
    this.difficulty = difficulty;
    this.reactionDelay = AI_REACTION_DELAY[difficulty];
  }

  update(player: Player, ball: Ball, now: number, opponent?: Player): PlayerInput {
    // Evaluate strategy every 500ms
    if (opponent && now - this.lastStrategyCheck > 500) {
      this.lastStrategyCheck = now;
      this.currentStrategy = this.selectStrategy(player, opponent);
    }

    if (now - this.lastDecisionTime < this.reactionDelay) {
      return this.currentInput;
    }
    this.lastDecisionTime = now;

    let input: PlayerInput;

    // Delegate to strategy
    if (this.currentStrategy === 'aggressive') {
      input = aggressiveStrategy(player, ball, this.deadZone);
    } else if (this.currentStrategy === 'defensive') {
      input = defensiveStrategy(player, ball, this.deadZone);
    } else {
      // Balanced: use the built-in prediction-based logic
      input = this.balancedUpdate(player, ball);
    }

    // Kick logic: charge when near ball and ball is on opponent's side
    const distToBall = Math.sqrt(
      (player.position.x - ball.position.x) ** 2 +
      (player.position.y - ball.position.y) ** 2,
    );
    const midfield = CANVAS.WIDTH / 2;
    const ballOnOpponentSide =
      (player.side === 'right' && ball.position.x < midfield) ||
      (player.side === 'left' && ball.position.x > midfield);

    if (this.isChargingKick) {
      input.kick = true;
      if (now - this.kickChargeStart >= this.kickChargeDuration) {
        input.kick = false;
        this.isChargingKick = false;
      }
    } else if (distToBall < 80 && ballOnOpponentSide) {
      const minCharge = this.difficulty === Difficulty.HARD ? 400 : 300;
      const maxCharge = this.difficulty === Difficulty.HARD ? 900 : 800;
      this.kickChargeDuration = minCharge + Math.random() * (maxCharge - minCharge);
      this.kickChargeStart = now;
      this.isChargingKick = true;
      input.kick = true;
    }

    this.currentInput = input;
    return input;
  }

  private selectStrategy(player: Player, opponent: Player): Strategy {
    const scoreDiff = player.score - opponent.score;
    const aggressiveThreshold = this.difficulty === Difficulty.HARD ? -1 : -2;

    if (scoreDiff <= aggressiveThreshold) {
      return 'aggressive';
    } else if (scoreDiff >= 2) {
      return 'defensive';
    }
    return 'balanced';
  }

  private balancedUpdate(player: Player, ball: Ball): PlayerInput {
    const input: PlayerInput = {
      up: false,
      down: false,
      left: false,
      right: false,
      kick: false,
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

    return input;
  }

  private predictBallY(player: Player, ball: Ball): number {
    if (ball.velocity.x === 0) return ball.position.y;

    const movingToward =
      (player.side === 'right' && ball.velocity.x > 0) ||
      (player.side === 'left' && ball.velocity.x < 0);

    if (!movingToward) {
      return ball.position.y;
    }

    const distX = Math.abs(player.position.x - ball.position.x);
    const timeToReach = distX / Math.abs(ball.velocity.x);
    let predictedY = ball.position.y + ball.velocity.y * timeToReach;

    predictedY = Math.max(
      player.radius,
      Math.min(CANVAS.HEIGHT - player.radius, predictedY),
    );

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

    if (ballOnOurSide && ballMovingToward) {
      return ball.position.x;
    }

    if (!ballOnOurSide) {
      if (this.difficulty === Difficulty.HARD) {
        return ball.position.x;
      } else if (this.difficulty === Difficulty.MEDIUM) {
        const attackX = player.side === 'right'
          ? Math.max(ball.position.x, midfield - 200)
          : Math.min(ball.position.x, midfield + 200);
        return attackX;
      } else {
        return player.side === 'right'
          ? midfield - 80
          : midfield + 80;
      }
    }

    return player.side === 'right'
      ? CANVAS.WIDTH * 0.6
      : CANVAS.WIDTH * 0.4;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.reactionDelay = AI_REACTION_DELAY[difficulty];
  }
}
