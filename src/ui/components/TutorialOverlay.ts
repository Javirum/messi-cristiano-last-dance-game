const TUTORIAL_KEY = 'tutorial-seen';

interface TutorialStep {
  title: string;
  description: string;
  keys: string;
}

const STEPS: TutorialStep[] = [
  {
    title: 'Move Your Player',
    description: 'Use the keyboard to move around the pitch.',
    keys: 'Player 1: W A S D &nbsp;&nbsp; Player 2: I J K L',
  },
  {
    title: 'Hit the Ball',
    description: 'Run into the ball to kick it toward the opponent\'s goal.',
    keys: 'Move into the ball to send it flying!',
  },
  {
    title: 'Power Shot',
    description: 'Hold the kick key to charge a powerful shot, then release.',
    keys: 'Player 1: Space &nbsp;&nbsp; Player 2: Enter',
  },
  {
    title: 'Score to Win!',
    description: 'First player to score 3 goals wins the match.',
    keys: 'Good luck!',
  },
];

export class TutorialOverlay {
  private container: HTMLElement;
  private currentStep = 0;
  private onDismiss: () => void;

  constructor(onDismiss: () => void) {
    this.onDismiss = onDismiss;
    this.container = document.createElement('div');
    this.container.className = 'tutorial-overlay';
    this.render();
  }

  static shouldShow(): boolean {
    return !localStorage.getItem(TUTORIAL_KEY);
  }

  private render(): void {
    const step = STEPS[this.currentStep];
    const dots = STEPS.map((_, i) =>
      `<span class="tutorial-overlay__dot${i === this.currentStep ? ' tutorial-overlay__dot--active' : ''}"></span>`
    ).join('');

    this.container.innerHTML = `
      <div class="tutorial-overlay__backdrop"></div>
      <div class="tutorial-overlay__card">
        <div class="tutorial-overlay__step-count">Step ${this.currentStep + 1} of ${STEPS.length}</div>
        <h2 class="tutorial-overlay__title">${step.title}</h2>
        <p class="tutorial-overlay__desc">${step.description}</p>
        <p class="tutorial-overlay__keys">${step.keys}</p>
        <div class="tutorial-overlay__dots">${dots}</div>
        <div class="tutorial-overlay__actions">
          <button class="tutorial-overlay__btn tutorial-overlay__btn--skip">Skip</button>
          <button class="tutorial-overlay__btn tutorial-overlay__btn--next">
            ${this.currentStep < STEPS.length - 1 ? 'Next' : 'Got it!'}
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('.tutorial-overlay__btn--skip')!
      .addEventListener('click', () => this.dismiss());
    this.container.querySelector('.tutorial-overlay__btn--next')!
      .addEventListener('click', () => this.next());
  }

  private next(): void {
    if (this.currentStep < STEPS.length - 1) {
      this.currentStep++;
      this.render();
    } else {
      this.dismiss();
    }
  }

  private dismiss(): void {
    localStorage.setItem(TUTORIAL_KEY, '1');
    this.container.remove();
    this.onDismiss();
  }

  getElement(): HTMLElement {
    return this.container;
  }
}
