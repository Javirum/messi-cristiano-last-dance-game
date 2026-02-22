export class InstructionsScreen {
  private container: HTMLElement;
  private onBack: () => void;

  constructor(onBack: () => void) {
    this.onBack = onBack;
    this.container = document.createElement('div');
    this.container.className = 'screen instructions-screen';
    this.build();
  }

  private build(): void {
    this.container.innerHTML = `
      <div class="instructions-screen__content">
        <h1 class="instructions-screen__title">Instructions</h1>
        <div class="instructions-screen__columns">
          <div class="instructions-screen__player">
            <h2>Player 1 (Cristiano)</h2>
            <ul>
              <li><kbd>W</kbd> Move up</li>
              <li><kbd>S</kbd> Move down</li>
              <li><kbd>A</kbd> Move left</li>
              <li><kbd>D</kbd> Move right</li>
            </ul>
          </div>
          <div class="instructions-screen__player">
            <h2>Player 2 (Messi)</h2>
            <ul>
              <li><kbd>I</kbd> Move up</li>
              <li><kbd>K</kbd> Move down</li>
              <li><kbd>J</kbd> Move left</li>
              <li><kbd>L</kbd> Move right</li>
            </ul>
          </div>
        </div>
        <p class="instructions-screen__note">Press <kbd>ESC</kbd> to pause during gameplay. First to 3 goals wins!</p>
        <button class="btn btn--back">Back</button>
      </div>
    `;

    this.container.querySelector('.btn--back')!.addEventListener('click', () => {
      this.onBack();
    });
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
