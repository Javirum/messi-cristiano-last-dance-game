import { GameMode, Difficulty } from '../../types/game.ts';

export interface SplashCallbacks {
  onStart: (mode: GameMode, difficulty: Difficulty) => void;
  onInstructions: () => void;
}

export class SplashScreen {
  private container: HTMLElement;
  private callbacks: SplashCallbacks;
  private selectedMode: GameMode = GameMode.PVP;
  private selectedDifficulty: Difficulty = Difficulty.MEDIUM;

  constructor(callbacks: SplashCallbacks) {
    this.callbacks = callbacks;
    this.container = document.createElement('div');
    this.container.className = 'screen splash-screen';
    this.build();
  }

  private build(): void {
    this.container.innerHTML = `
      <div class="splash-screen__bg"></div>
      <div class="splash-screen__content">
        <h1 class="splash-screen__title">Messi vs Cristiano</h1>
        <h2 class="splash-screen__subtitle">The Last Dance</h2>

        <div class="splash-screen__mode-select">
          <button class="btn btn--mode btn--active" data-mode="PVP">2 Players</button>
          <button class="btn btn--mode" data-mode="PVE">vs AI</button>
        </div>

        <div class="splash-screen__difficulty splash-screen__difficulty--hidden">
          <button class="btn btn--diff" data-diff="EASY">Easy</button>
          <button class="btn btn--diff btn--active" data-diff="MEDIUM">Medium</button>
          <button class="btn btn--diff" data-diff="HARD">Hard</button>
        </div>

        <button class="btn btn--start">Kick Off!</button>
      </div>
    `;

    // Mode selection
    this.container.querySelectorAll('.btn--mode').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container
          .querySelectorAll('.btn--mode')
          .forEach((b) => b.classList.remove('btn--active'));
        btn.classList.add('btn--active');
        this.selectedMode = (btn as HTMLElement).dataset.mode as GameMode;

        const diffSection = this.container.querySelector(
          '.splash-screen__difficulty',
        )!;
        if (this.selectedMode === GameMode.PVE) {
          diffSection.classList.remove('splash-screen__difficulty--hidden');
        } else {
          diffSection.classList.add('splash-screen__difficulty--hidden');
        }
      });
    });

    // Difficulty selection
    this.container.querySelectorAll('.btn--diff').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container
          .querySelectorAll('.btn--diff')
          .forEach((b) => b.classList.remove('btn--active'));
        btn.classList.add('btn--active');
        this.selectedDifficulty = (btn as HTMLElement).dataset
          .diff as Difficulty;
      });
    });

    // Start button
    this.container.querySelector('.btn--start')!.addEventListener('click', () => {
      this.callbacks.onStart(this.selectedMode, this.selectedDifficulty);
    });
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
