export class Scoreboard {
  private container: HTMLElement;
  private leftScoreEl: HTMLElement;
  private rightScoreEl: HTMLElement;
  private leftNameEl: HTMLElement;
  private rightNameEl: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'scoreboard';

    this.leftNameEl = document.createElement('span');
    this.leftNameEl.className = 'scoreboard__name scoreboard__name--left';
    this.leftNameEl.textContent = 'Cristiano';

    this.leftScoreEl = document.createElement('span');
    this.leftScoreEl.className = 'scoreboard__score scoreboard__score--left';
    this.leftScoreEl.textContent = '0';

    const separator = document.createElement('span');
    separator.className = 'scoreboard__separator';
    separator.textContent = '-';

    this.rightScoreEl = document.createElement('span');
    this.rightScoreEl.className = 'scoreboard__score scoreboard__score--right';
    this.rightScoreEl.textContent = '0';

    this.rightNameEl = document.createElement('span');
    this.rightNameEl.className = 'scoreboard__name scoreboard__name--right';
    this.rightNameEl.textContent = 'Messi';

    this.container.append(
      this.leftNameEl,
      this.leftScoreEl,
      separator,
      this.rightScoreEl,
      this.rightNameEl,
    );
  }

  getElement(): HTMLElement {
    return this.container;
  }

  updateScore(left: number, right: number): void {
    this.leftScoreEl.textContent = String(left);
    this.rightScoreEl.textContent = String(right);
  }
}
