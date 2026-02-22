import { GameMode, Difficulty } from '../../types/game.ts';

export type SelectedCharacter = 'messi' | 'cristiano';

export interface SplashCallbacks {
  onStart: (mode: GameMode, difficulty: Difficulty, character: SelectedCharacter) => void;
  onInstructions: () => void;
}

export class SplashScreen {
  private container: HTMLElement;
  private callbacks: SplashCallbacks;
  private selectedMode: GameMode = GameMode.PVP;
  private selectedDifficulty: Difficulty = Difficulty.MEDIUM;
  private selectedCharacter: SelectedCharacter = 'cristiano';

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

        <div class="splash-screen__character-select splash-screen__character-select--hidden">
          <span class="splash-screen__character-label">Play as:</span>
          <button class="btn btn--char btn--char-cristiano btn--active" data-char="cristiano">Cristiano</button>
          <button class="btn btn--char btn--char-messi" data-char="messi">Messi</button>
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
        const charSection = this.container.querySelector(
          '.splash-screen__character-select',
        )!;
        if (this.selectedMode === GameMode.PVE) {
          diffSection.classList.remove('splash-screen__difficulty--hidden');
          charSection.classList.remove('splash-screen__character-select--hidden');
        } else {
          diffSection.classList.add('splash-screen__difficulty--hidden');
          charSection.classList.add('splash-screen__character-select--hidden');
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

    // Character selection
    this.container.querySelectorAll('.btn--char').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container
          .querySelectorAll('.btn--char')
          .forEach((b) => b.classList.remove('btn--active'));
        btn.classList.add('btn--active');
        this.selectedCharacter = (btn as HTMLElement).dataset
          .char as SelectedCharacter;
      });
    });

    // Start button
    this.container.querySelector('.btn--start')!.addEventListener('click', () => {
      this.callbacks.onStart(this.selectedMode, this.selectedDifficulty, this.selectedCharacter);
    });
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
