import { GOAL, CANVAS } from '../config/constants.ts';
import { PlayerSide } from '../types/entities.ts';

export class Goal {
  readonly side: PlayerSide;
  readonly x: number;
  readonly yTop: number;
  readonly yBottom: number;
  readonly postWidth: number;
  readonly color: string;

  constructor(side: PlayerSide) {
    this.side = side;
    this.x = side === 'left' ? 0 : CANVAS.WIDTH;
    this.yTop = GOAL.Y_TOP;
    this.yBottom = GOAL.Y_BOTTOM;
    this.postWidth = GOAL.POST_WIDTH;
    this.color = side === 'left' ? GOAL.POST_COLOR_LEFT : GOAL.POST_COLOR_RIGHT;
  }

  isInGoalArea(ballY: number): boolean {
    return ballY > this.yTop && ballY < this.yBottom;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.postWidth;
    ctx.beginPath();
    ctx.moveTo(this.x, this.yTop);
    ctx.lineTo(this.x, this.yBottom);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
}
