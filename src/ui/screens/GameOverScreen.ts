import { PlayerSide } from '../../types/entities.ts';

export interface GameOverCallbacks {
  onRestart: () => void;
}

export class GameOverScreen {
  private container: HTMLElement;
  private callbacks: GameOverCallbacks;
  private imageContainer: HTMLElement;

  constructor(
    winner: PlayerSide,
    finalScore: { left: number; right: number },
    callbacks: GameOverCallbacks,
  ) {
    this.callbacks = callbacks;
    this.container = document.createElement('div');
    this.container.className = 'screen game-over-screen';

    const winnerName = winner === 'left' ? 'Cristiano' : 'Messi';
    const loserName = winner === 'left' ? 'Messi' : 'Cristiano';

    this.imageContainer = document.createElement('div');
    this.imageContainer.className = 'game-over-screen__image';

    this.container.innerHTML = `
      <div class="game-over-screen__content">
        <h1 class="game-over-screen__title">${winnerName} Wins!</h1>
        <p class="game-over-screen__subtitle">${winnerName} defeats ${loserName}</p>
        <p class="game-over-screen__score">${finalScore.left} - ${finalScore.right}</p>
        <div class="game-over-screen__image-slot"></div>
        <button class="btn btn--restart">Play Again!</button>
      </div>
    `;

    const slot = this.container.querySelector('.game-over-screen__image-slot')!;
    slot.appendChild(this.imageContainer);

    this.container
      .querySelector('.btn--restart')!
      .addEventListener('click', () => {
        this.callbacks.onRestart();
      });
  }

  getElement(): HTMLElement {
    return this.container;
  }

  setVictoryImage(imgSrc: string): void {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.className = 'game-over-screen__victory-img';
    this.imageContainer.innerHTML = '';
    this.imageContainer.appendChild(img);
  }

  destroy(): void {
    this.container.remove();
  }
}
