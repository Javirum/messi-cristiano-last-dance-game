import { CANVAS, GAME } from '../config/constants.ts';
import { Player } from '../entities/Player.ts';
import { Ball } from '../entities/Ball.ts';
import { Goal } from '../entities/Goal.ts';
import { ParticleSystem } from './ParticleSystem.ts';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private flashAlpha = 0;
  private flashStartTime = 0;
  private readonly FLASH_DURATION = 500;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
  }

  drawField(): void {
    // Center line
    this.ctx.save();
    this.ctx.strokeStyle = GAME.CENTER_LINE_COLOR;
    this.ctx.lineWidth = GAME.CENTER_LINE_WIDTH;
    this.ctx.setLineDash([8, 8]);
    this.ctx.beginPath();
    this.ctx.moveTo(CANVAS.WIDTH / 2, 0);
    this.ctx.lineTo(CANVAS.WIDTH / 2, CANVAS.HEIGHT);
    this.ctx.stroke();
    this.ctx.closePath();

    // Center circle
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.arc(
      CANVAS.WIDTH / 2,
      CANVAS.HEIGHT / 2,
      GAME.CENTER_CIRCLE_RADIUS,
      0,
      Math.PI * 2,
    );
    this.ctx.stroke();
    this.ctx.closePath();

    // Center dot
    this.ctx.fillStyle = GAME.CENTER_LINE_COLOR;
    this.ctx.beginPath();
    this.ctx.arc(CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }

  drawPlayer(player: Player): void {
    player.draw(this.ctx);
  }

  drawBall(ball: Ball): void {
    ball.draw(this.ctx);
  }

  drawGoal(goal: Goal): void {
    goal.draw(this.ctx);
  }

  drawAll(
    player1: Player,
    player2: Player,
    ball: Ball,
    goalLeft: Goal,
    goalRight: Goal,
  ): void {
    this.clear();
    this.drawField();
    this.drawGoal(goalLeft);
    this.drawGoal(goalRight);
    this.drawPlayer(player1);
    this.drawPlayer(player2);
    this.drawBall(ball);
  }

  drawPauseOverlay(): void {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    this.ctx.fillStyle = '#d4a843';
    this.ctx.font = '60px "Bebas Neue"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 20);
    this.ctx.fillStyle = '#8a8692';
    this.ctx.font = '500 20px "Rajdhani"';
    this.ctx.fillText(
      'Press ESC to resume',
      CANVAS.WIDTH / 2,
      CANVAS.HEIGHT / 2 + 30,
    );
    this.ctx.restore();
  }

  drawGoalCelebration(scorerName: string): void {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    this.ctx.fillStyle = '#d4a843';
    this.ctx.font = '72px "Bebas Neue"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GOAL!', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 20);
    this.ctx.font = '600 28px "Rajdhani"';
    this.ctx.fillStyle = '#f0ece4';
    this.ctx.fillText(scorerName, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 30);
    this.ctx.restore();
  }

  triggerScreenFlash(): void {
    this.flashAlpha = 0.4;
    this.flashStartTime = performance.now();
  }

  drawScreenFlash(): void {
    if (this.flashAlpha <= 0) return;
    const elapsed = performance.now() - this.flashStartTime;
    this.flashAlpha = Math.max(0, 0.4 * (1 - elapsed / this.FLASH_DURATION));
    if (this.flashAlpha > 0) {
      this.ctx.save();
      this.ctx.globalAlpha = this.flashAlpha;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
      this.ctx.restore();
    }
  }

  drawParticles(particles: ParticleSystem): void {
    particles.draw(this.ctx);
  }

  drawChargeIndicator(player: Player): void {
    if (player.chargeAmount <= 0) return;
    const charge = player.chargeAmount;
    const cx = player.position.x;
    const cy = player.position.y;
    const r = player.radius + 8;

    this.ctx.save();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + charge * Math.PI * 2;

    // Color gradient from gold to red
    const red = Math.floor(212 + (255 - 212) * charge);
    const green = Math.floor(168 * (1 - charge));
    const blue = Math.floor(67 * (1 - charge));

    this.ctx.strokeStyle = `rgb(${red}, ${green}, ${blue})`;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, startAngle, endAngle);
    this.ctx.stroke();
    this.ctx.restore();
  }
}
