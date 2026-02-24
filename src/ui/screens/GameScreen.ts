import { ASSETS, CANVAS } from '../../config/constants.ts';
import { Scoreboard } from '../components/Scoreboard.ts';
import { CommentaryOverlay } from '../components/CommentaryOverlay.ts';

export class GameScreen {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  readonly scoreboard: Scoreboard;
  readonly commentaryOverlay: CommentaryOverlay;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'screen game-screen';

    // Stadium background
    const stadium = document.createElement('div');
    stadium.className = 'game-screen__stadium';
    stadium.style.backgroundImage = `
      radial-gradient(ellipse at 20% 50%, rgba(231, 76, 60, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 50%, rgba(52, 152, 219, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 0%, rgba(255, 255, 0, 0.05) 0%, transparent 40%),
      linear-gradient(180deg, #0a0a20 0%, #0d1a0d 40%, #0a1a0a 60%, #0a0a20 100%),
      url('${ASSETS.STADIUM}')
    `;
    this.container.appendChild(stadium);

    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'game-screen__canvas';
    this.canvas.width = CANVAS.WIDTH;
    this.canvas.height = CANVAS.HEIGHT;
    this.container.appendChild(this.canvas);

    // Scoreboard
    this.scoreboard = new Scoreboard();
    this.container.appendChild(this.scoreboard.getElement());

    // Commentary overlay
    this.commentaryOverlay = new CommentaryOverlay();
    this.container.appendChild(this.commentaryOverlay.getElement());
  }

  getElement(): HTMLElement {
    return this.container;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    return ctx;
  }

  destroy(): void {
    this.commentaryOverlay.clear();
    this.container.remove();
  }
}
