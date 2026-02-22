import { CANVAS } from '../../config/constants.ts';
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
