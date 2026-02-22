import { CANVAS, GAME } from '../config/constants.ts';
import { Player } from '../entities/Player.ts';
import { Ball } from '../entities/Ball.ts';
import { Goal } from '../entities/Goal.ts';

export class Renderer {
  private ctx: CanvasRenderingContext2D;

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
    this.ctx.arc(CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, 4, 0, Math.PI * 2);
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
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px "Press Start 2P"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 20);
    this.ctx.font = '12px "Press Start 2P"';
    this.ctx.fillText(
      'Press ESC to resume',
      CANVAS.WIDTH / 2,
      CANVAS.HEIGHT / 2 + 20,
    );
    this.ctx.restore();
  }

  drawGoalCelebration(scorerName: string): void {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '28px "Press Start 2P"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GOAL!', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 20);
    this.ctx.font = '14px "Press Start 2P"';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(scorerName, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 20);
    this.ctx.restore();
  }
}
