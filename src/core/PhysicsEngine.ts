import { CANVAS, BALL } from '../config/constants.ts';
import { Player } from '../entities/Player.ts';
import { Ball } from '../entities/Ball.ts';
import { Goal } from '../entities/Goal.ts';
import { EventBus } from './EventBus.ts';
import { GameEvent } from '../types/events.ts';
import { PlayerSide } from '../types/entities.ts';

export class PhysicsEngine {
  private eventBus: EventBus;
  private rallyCount = 0;
  private lastHitter: PlayerSide | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  update(
    player1: Player,
    player2: Player,
    ball: Ball,
    goalLeft: Goal,
    goalRight: Goal,
  ): 'left' | 'right' | null {
    // Player bounds clamping
    player1.clampToBounds(CANVAS.WIDTH, CANVAS.HEIGHT);
    player2.clampToBounds(CANVAS.WIDTH, CANVAS.HEIGHT);

    // Ball-wall bouncing (top and bottom)
    this.checkBallWallBounce(ball);

    // Player-ball collisions (circle-circle)
    this.checkPlayerBallCollision(player1, ball);
    this.checkPlayerBallCollision(player2, ball);

    // Check scoring (ball exits left or right)
    const scored = this.checkScoring(ball, goalLeft, goalRight);

    // Near-miss detection
    this.checkNearMiss(ball, goalLeft, goalRight);

    return scored;
  }

  private checkBallWallBounce(ball: Ball): void {
    // Bottom wall
    if (ball.position.y + ball.radius > CANVAS.HEIGHT) {
      ball.position.y = CANVAS.HEIGHT - ball.radius;
      ball.velocity.y *= -BALL.BOUNCE_FACTOR;
    }
    // Top wall
    if (ball.position.y - ball.radius < 0) {
      ball.position.y = ball.radius;
      ball.velocity.y *= -BALL.BOUNCE_FACTOR;
    }
  }

  private checkPlayerBallCollision(player: Player, ball: Ball): void {
    const dx = ball.position.x - player.position.x;
    const dy = ball.position.y - player.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDist = player.radius + ball.radius;

    if (distance < minDist && distance > 0) {
      // Normalize collision direction
      const nx = dx / distance;
      const ny = dy / distance;

      // Push ball out of overlap
      const overlap = minDist - distance;
      ball.position.x += nx * overlap;
      ball.position.y += ny * overlap;

      // Transfer player momentum to ball based on hit direction
      const playerSpeed = Math.sqrt(
        player.velocity.x ** 2 + player.velocity.y ** 2,
      );
      const hitStrength = Math.max(playerSpeed * 1.5, 2);

      ball.velocity.x = nx * hitStrength;
      ball.velocity.y = ny * hitStrength;

      // Apply spin from cross-product of player velocity and hit direction
      const cross =
        player.velocity.x * ny - player.velocity.y * nx;
      ball.spin = cross * 0.5;

      // Clamp ball speed
      const speed = Math.sqrt(
        ball.velocity.x ** 2 + ball.velocity.y ** 2,
      );
      if (speed > BALL.MAX_SPEED) {
        const scale = BALL.MAX_SPEED / speed;
        ball.velocity.x *= scale;
        ball.velocity.y *= scale;
      }

      // Rally tracking
      if (this.lastHitter !== player.side) {
        this.rallyCount++;
        this.lastHitter = player.side;
        if (this.rallyCount >= 6) {
          this.eventBus.emit(GameEvent.RALLY_LONG, {
            hitCount: this.rallyCount,
          });
        }
      }

      this.eventBus.emit(GameEvent.COLLISION, {
        player: player.side,
        ballSpeed: speed,
      });
    }
  }

  private checkScoring(
    ball: Ball,
    goalLeft: Goal,
    goalRight: Goal,
  ): 'left' | 'right' | null {
    // Ball exits right side
    if (ball.position.x + ball.radius > CANVAS.WIDTH) {
      if (goalRight.isInGoalArea(ball.position.y)) {
        // Left player (Cristiano) scores
        this.rallyCount = 0;
        this.lastHitter = null;
        return 'left';
      }
      // Bounce off the wall (outside goal area)
      ball.position.x = CANVAS.WIDTH - ball.radius;
      ball.velocity.x *= -BALL.BOUNCE_FACTOR;
    }

    // Ball exits left side
    if (ball.position.x - ball.radius < 0) {
      if (goalLeft.isInGoalArea(ball.position.y)) {
        // Right player (Messi) scores
        this.rallyCount = 0;
        this.lastHitter = null;
        return 'right';
      }
      // Bounce off the wall (outside goal area)
      ball.position.x = ball.radius;
      ball.velocity.x *= -BALL.BOUNCE_FACTOR;
    }

    return null;
  }

  private checkNearMiss(
    ball: Ball,
    goalLeft: Goal,
    goalRight: Goal,
  ): void {
    const nearThreshold = 30;

    // Near miss right goal
    if (
      ball.position.x + ball.radius > CANVAS.WIDTH - nearThreshold &&
      !goalRight.isInGoalArea(ball.position.y)
    ) {
      const distToGoalEdge = Math.min(
        Math.abs(ball.position.y - goalRight.yTop),
        Math.abs(ball.position.y - goalRight.yBottom),
      );
      if (distToGoalEdge < 60 && Math.abs(ball.velocity.x) > 1) {
        this.eventBus.emit(GameEvent.NEAR_MISS, {
          side: 'right' as PlayerSide,
          distance: distToGoalEdge,
        });
      }
    }

    // Near miss left goal
    if (
      ball.position.x - ball.radius < nearThreshold &&
      !goalLeft.isInGoalArea(ball.position.y)
    ) {
      const distToGoalEdge = Math.min(
        Math.abs(ball.position.y - goalLeft.yTop),
        Math.abs(ball.position.y - goalLeft.yBottom),
      );
      if (distToGoalEdge < 60 && Math.abs(ball.velocity.x) > 1) {
        this.eventBus.emit(GameEvent.NEAR_MISS, {
          side: 'left' as PlayerSide,
          distance: distToGoalEdge,
        });
      }
    }
  }

  resetRally(): void {
    this.rallyCount = 0;
    this.lastHitter = null;
  }
}
