import { PlayerSide } from '../../types/entities.ts';
import { MatchStatsData } from '../../core/MatchStats.ts';

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
    stats?: MatchStatsData,
  ) {
    this.callbacks = callbacks;
    this.container = document.createElement('div');
    this.container.className = 'screen game-over-screen';

    const winnerName = winner === 'left' ? 'Cristiano' : 'Messi';
    const loserName = winner === 'left' ? 'Messi' : 'Cristiano';

    this.imageContainer = document.createElement('div');
    this.imageContainer.className = 'game-over-screen__image';

    let statsHtml = '';
    if (stats) {
      statsHtml = `
        <div class="match-stats">
          <div class="match-stats__title">Match Stats</div>
          <table class="match-stats__table">
            <thead>
              <tr>
                <th class="match-stats__header match-stats__header--left">Cristiano</th>
                <th class="match-stats__header match-stats__header--stat">Stat</th>
                <th class="match-stats__header match-stats__header--right">Messi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="match-stats__value">${stats.shotsLeft}</td>
                <td class="match-stats__label">Shots</td>
                <td class="match-stats__value">${stats.shotsRight}</td>
              </tr>
              <tr>
                <td class="match-stats__value">${stats.powerShotsLeft}</td>
                <td class="match-stats__label">Power Shots</td>
                <td class="match-stats__value">${stats.powerShotsRight}</td>
              </tr>
              <tr>
                <td class="match-stats__value">${stats.longestRally}</td>
                <td class="match-stats__label">Best Rally</td>
                <td class="match-stats__value">${stats.longestRally}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="game-over-screen__content">
        <h1 class="game-over-screen__title">${winnerName} Wins!</h1>
        <p class="game-over-screen__subtitle">${winnerName} defeats ${loserName}</p>
        <p class="game-over-screen__score">${finalScore.left} - ${finalScore.right}</p>
        <div class="game-over-screen__image-slot"></div>
        ${statsHtml}
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
