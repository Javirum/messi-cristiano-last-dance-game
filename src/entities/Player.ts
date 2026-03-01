import { PLAYER } from '../config/constants.ts';
import { PlayerSide, PlayerInput } from '../types/entities.ts';
import { Vector2D } from '../types/game.ts';
import { AssetLoader } from '../core/AssetLoader.ts';

export class Player {
  position: Vector2D;
  velocity: Vector2D;
  readonly radius: number;
  readonly side: PlayerSide;
  readonly maxSpeed: number;
  readonly acceleration: number;
  readonly deceleration: number;
  score: number;
  input: PlayerInput;
  chargeAmount: number;
  isCharging: boolean;
  kickPower: number;

  private readonly initialPosition: Vector2D;
  private readonly assetLoader: AssetLoader;
  private readonly imageKey: string;

  constructor(side: PlayerSide, assetLoader: AssetLoader) {
    this.side = side;
    this.assetLoader = assetLoader;
    this.radius = PLAYER.RADIUS;
    this.maxSpeed = PLAYER.MAX_SPEED;
    this.acceleration = PLAYER.ACCELERATION;
    this.deceleration = PLAYER.DECELERATION;
    this.score = 0;
    this.chargeAmount = 0;
    this.isCharging = false;
    this.kickPower = 0;

    const start = side === 'left' ? PLAYER.START_P1 : PLAYER.START_P2;
    this.position = { x: start.x, y: start.y };
    this.initialPosition = { x: start.x, y: start.y };
    this.velocity = { x: 0, y: 0 };
    this.input = { up: false, down: false, left: false, right: false, kick: false };
    this.imageKey = side === 'left' ? 'cristiano' : 'messi';
  }

  get name(): string {
    return this.side === 'left' ? 'Cristiano' : 'Messi';
  }

  update(_dt: number): void {
    // Horizontal acceleration/deceleration
    if (this.input.left) {
      if (this.velocity.x > -this.maxSpeed) {
        this.velocity.x -= this.acceleration;
      } else {
        this.velocity.x = -this.maxSpeed;
      }
    } else if (this.velocity.x < 0) {
      this.velocity.x += this.deceleration;
      if (this.velocity.x > 0) this.velocity.x = 0;
    }

    if (this.input.right) {
      if (this.velocity.x < this.maxSpeed) {
        this.velocity.x += this.acceleration;
      } else {
        this.velocity.x = this.maxSpeed;
      }
    } else if (this.velocity.x > 0) {
      this.velocity.x -= this.deceleration;
      if (this.velocity.x < 0) this.velocity.x = 0;
    }

    // Vertical acceleration/deceleration
    if (this.input.up) {
      if (this.velocity.y > -this.maxSpeed) {
        this.velocity.y -= this.acceleration;
      } else {
        this.velocity.y = -this.maxSpeed;
      }
    } else if (this.velocity.y < 0) {
      this.velocity.y += this.deceleration;
      if (this.velocity.y > 0) this.velocity.y = 0;
    }

    if (this.input.down) {
      if (this.velocity.y < this.maxSpeed) {
        this.velocity.y += this.acceleration;
      } else {
        this.velocity.y = this.maxSpeed;
      }
    } else if (this.velocity.y > 0) {
      this.velocity.y -= this.deceleration;
      if (this.velocity.y < 0) this.velocity.y = 0;
    }

    // Power shot charge logic
    if (this.input.kick) {
      this.isCharging = true;
      this.chargeAmount = Math.min(1, this.chargeAmount + 0.014);
      // Reduce speed while charging (commitment cost)
      this.velocity.x *= 0.6;
      this.velocity.y *= 0.6;
    } else if (this.isCharging) {
      // Released kick — transfer charge to kick power
      this.kickPower = this.chargeAmount;
      this.chargeAmount = 0;
      this.isCharging = false;
    }

    // Apply velocity to position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const img = this.assetLoader.get(this.imageKey);
    const offsetY = this.side === 'left'
      ? PLAYER.IMAGE_OFFSET_Y_LEFT
      : PLAYER.IMAGE_OFFSET_Y_RIGHT;

    ctx.drawImage(
      img,
      this.position.x + PLAYER.IMAGE_OFFSET_X,
      this.position.y + offsetY,
      PLAYER.IMAGE_WIDTH,
      PLAYER.IMAGE_HEIGHT,
    );
  }

  reset(): void {
    this.position.x = this.initialPosition.x;
    this.position.y = this.initialPosition.y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.input = { up: false, down: false, left: false, right: false, kick: false };
    this.chargeAmount = 0;
    this.isCharging = false;
    this.kickPower = 0;
  }

  clampToBounds(canvasWidth: number, canvasHeight: number): void {
    if (this.position.x + this.radius > canvasWidth) {
      this.position.x = canvasWidth - this.radius;
      this.velocity.x *= -0.5;
    }
    if (this.position.x - this.radius < 0) {
      this.position.x = this.radius;
      this.velocity.x *= -0.5;
    }
    if (this.position.y + this.radius > canvasHeight) {
      this.position.y = canvasHeight - this.radius;
      this.velocity.y *= -0.5;
    }
    if (this.position.y - this.radius < 0) {
      this.position.y = this.radius;
      this.velocity.y *= -0.5;
    }
  }
}
