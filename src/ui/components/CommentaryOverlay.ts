export class CommentaryOverlay {
  private container: HTMLElement;
  private textEl: HTMLElement;
  private fadeTimeout: ReturnType<typeof setTimeout> | null = null;
  private typeInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'commentary-overlay commentary-overlay--hidden';

    this.textEl = document.createElement('p');
    this.textEl.className = 'commentary-overlay__text';
    this.container.appendChild(this.textEl);
  }

  getElement(): HTMLElement {
    return this.container;
  }

  showText(text: string, durationMs = 5000): void {
    this.clear();
    this.container.classList.remove('commentary-overlay--hidden');
    this.container.classList.remove('commentary-overlay--fading');
    this.textEl.textContent = '';

    let i = 0;
    this.typeInterval = setInterval(() => {
      if (i < text.length) {
        this.textEl.textContent += text[i];
        i++;
      } else {
        if (this.typeInterval) clearInterval(this.typeInterval);
        this.typeInterval = null;
      }
    }, 30);

    this.fadeTimeout = setTimeout(() => {
      this.container.classList.add('commentary-overlay--fading');
      setTimeout(() => {
        this.container.classList.add('commentary-overlay--hidden');
      }, 1000);
    }, durationMs);
  }

  streamCharacter(char: string): void {
    this.container.classList.remove('commentary-overlay--hidden');
    this.container.classList.remove('commentary-overlay--fading');
    this.textEl.textContent += char;
  }

  startStream(): void {
    this.clear();
    this.container.classList.remove('commentary-overlay--hidden');
    this.container.classList.remove('commentary-overlay--fading');
    this.textEl.textContent = '';
  }

  endStream(durationMs = 5000): void {
    if (this.fadeTimeout) clearTimeout(this.fadeTimeout);
    this.fadeTimeout = setTimeout(() => {
      this.container.classList.add('commentary-overlay--fading');
      setTimeout(() => {
        this.container.classList.add('commentary-overlay--hidden');
      }, 1000);
    }, durationMs);
  }

  clear(): void {
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
    if (this.typeInterval) {
      clearInterval(this.typeInterval);
      this.typeInterval = null;
    }
    this.textEl.textContent = '';
  }
}
