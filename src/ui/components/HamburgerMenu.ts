export class HamburgerMenu {
  private container: HTMLElement;
  private menuList: HTMLElement;
  private isOpen = false;

  private onInstructions: (() => void) | null = null;

  constructor() {
    this.container = document.createElement('nav');
    this.container.className = 'nav-bar';

    const topBar = document.createElement('div');
    topBar.className = 'nav-bar__top';

    const icon = document.createElement('div');
    icon.className = 'burger-icon';
    icon.innerHTML = `
      <div class="burger-icon__line burger-icon__line--top"></div>
      <div class="burger-icon__line burger-icon__line--middle"></div>
      <div class="burger-icon__line burger-icon__line--bottom"></div>
    `;
    icon.addEventListener('click', () => this.toggle());
    topBar.appendChild(icon);
    this.container.appendChild(topBar);

    this.menuList = document.createElement('div');
    this.menuList.className = 'nav-menu nav-menu--hidden';
    this.menuList.innerHTML = `
      <ul>
        <li class="nav-menu__item" data-action="instructions">Instructions</li>
      </ul>
    `;
    this.menuList.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.action === 'instructions' && this.onInstructions) {
        this.onInstructions();
        this.close();
      }
    });
    this.container.appendChild(this.menuList);
  }

  getElement(): HTMLElement {
    return this.container;
  }

  setOnInstructions(cb: () => void): void {
    this.onInstructions = cb;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.menuList.classList.remove('nav-menu--hidden');
      this.container.querySelector('.burger-icon')?.classList.add('burger-icon--open');
    } else {
      this.close();
    }
  }

  close(): void {
    this.isOpen = false;
    this.menuList.classList.add('nav-menu--hidden');
    this.container.querySelector('.burger-icon')?.classList.remove('burger-icon--open');
  }
}
