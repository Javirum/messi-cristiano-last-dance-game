import { ASSETS, CANVAS } from '../../config/constants.ts';
import { Scoreboard } from '../components/Scoreboard.ts';
import { CommentaryOverlay } from '../components/CommentaryOverlay.ts';

export class GameScreen {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private stadium: HTMLElement;
  readonly scoreboard: Scoreboard;
  readonly commentaryOverlay: CommentaryOverlay;
  private resizeHandler: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'screen game-screen';

    // Stadium background
    this.stadium = document.createElement('div');
    this.stadium.className = 'game-screen__stadium';
    this.stadium.style.backgroundImage = `url('${ASSETS.STADIUM}')`;
    this.container.appendChild(this.stadium);

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

    // Align stadium background after layout
    this.resizeHandler = () => this.alignStadiumBackground();
    requestAnimationFrame(() => this.alignStadiumBackground());
    window.addEventListener('resize', this.resizeHandler);
  }

  /** Position the stadium background so the pitch aligns with the canvas */
  private alignStadiumBackground(): void {
    const containerRect = this.container.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    // Canvas center relative to container
    const canvasCenterX = canvasRect.left - containerRect.left + canvasRect.width / 2;
    const canvasCenterY = canvasRect.top - containerRect.top + canvasRect.height / 2;

    // Pitch boundaries in custom stadium-bg.png (1800 x 1080)
    const IMG_W = 1800, IMG_H = 1080;
    const PITCH_LEFT = 400, PITCH_TOP = 240;
    const PITCH_W = 1000, PITCH_H = 600;

    // Scale 1:1 — pitch in image matches canvas pixel-for-pixel
    const scale = canvasRect.width / PITCH_W;
    const imgW = IMG_W * scale;
    const imgH = IMG_H * scale;

    // Pitch center in the scaled image
    const pitchCenterX = (PITCH_LEFT + PITCH_W / 2) * scale;
    const pitchCenterY = (PITCH_TOP + PITCH_H / 2) * scale;

    // Position background so pitch center = canvas center
    const bgX = canvasCenterX - pitchCenterX;
    const bgY = canvasCenterY - pitchCenterY;

    this.stadium.style.backgroundSize = `${imgW}px ${imgH}px`;
    this.stadium.style.backgroundPosition = `${bgX}px ${bgY}px`;
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
    window.removeEventListener('resize', this.resizeHandler);
    this.commentaryOverlay.clear();
    this.container.remove();
  }
}
