import { BALL, CANVAS } from '../config/constants.ts';
import { Vector2D } from '../types/game.ts';
import { AssetLoader } from '../core/AssetLoader.ts';

export class Ball {
  position: Vector2D;
  velocity: Vector2D;
  readonly radius: number;
  readonly deceleration: number;
  readonly maxSpeed: number;
  spin: number;

  private readonly assetLoader: AssetLoader;

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
    this.radius = BALL.RADIUS;
    this.deceleration = BALL.DECELERATION;
    this.maxSpeed = BALL.MAX_SPEED;
    this.spin = 0;

    this.position = {
      x: CANVAS.WIDTH / 2,
      y: CANVAS.HEIGHT / 2,
    };
    this.velocity = { x: 0, y: 0 };
  }

  update(_dt: number): void {
    // Decelerate X
    if (this.velocity.x !== 0) {
      if (this.velocity.x > 0) {
        this.velocity.x -= this.deceleration;
        if (this.velocity.x < 0) this.velocity.x = 0;
      } else {
        this.velocity.x += this.deceleration;
        if (this.velocity.x > 0) this.velocity.x = 0;
      }
    }

    // Decelerate Y
    if (this.velocity.y !== 0) {
      if (this.velocity.y > 0) {
        this.velocity.y -= this.deceleration;
        if (this.velocity.y < 0) this.velocity.y = 0;
      } else {
        this.velocity.y += this.deceleration;
        if (this.velocity.y > 0) this.velocity.y = 0;
      }
    }

    // Apply spin to Y velocity (curves the ball)
    if (this.spin !== 0) {
      this.velocity.y += this.spin * 0.05;
      this.spin *= 0.98; // spin decays
      if (Math.abs(this.spin) < 0.01) this.spin = 0;
    }

    // Clamp speed
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
    }

    // Apply velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const img = this.assetLoader.get('ball');
    ctx.drawImage(
      img,
      this.position.x - BALL.IMAGE_SIZE / 2,
      this.position.y - BALL.IMAGE_SIZE / 2,
      BALL.IMAGE_SIZE,
      BALL.IMAGE_SIZE,
    );
  }

  reset(canvasWidth: number, canvasHeight: number): void {
    this.position.x = canvasWidth / 2;
    this.position.y = canvasHeight / 2;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.spin = 0;
  }
}
