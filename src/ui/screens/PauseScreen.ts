export class PauseScreen {
  private container: HTMLElement;

  constructor(onResume: () => void, onQuit: () => void) {
    this.container = document.createElement('div');
    this.container.className = 'pause-overlay';
    this.container.innerHTML = `
      <div class="pause-overlay__content">
        <h2 class="pause-overlay__title">Paused</h2>
        <button class="btn btn--resume">Resume</button>
        <button class="btn btn--quit">Quit</button>
      </div>
    `;

    this.container.querySelector('.btn--resume')!.addEventListener('click', onResume);
    this.container.querySelector('.btn--quit')!.addEventListener('click', onQuit);
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
