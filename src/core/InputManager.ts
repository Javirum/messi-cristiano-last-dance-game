import { PlayerInput } from '../types/entities.ts';

export interface KeyBindings {
  up: string;
  down: string;
  left: string;
  right: string;
  kick: string;
}

export const P1_KEYS: KeyBindings = {
  up: 'w',
  down: 's',
  left: 'a',
  right: 'd',
  kick: ' ',
};

export const P2_KEYS: KeyBindings = {
  up: 'i',
  down: 'k',
  left: 'j',
  right: 'l',
  kick: 'enter',
};

export class InputManager {
  private keysDown = new Set<string>();
  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;

  constructor() {
    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onKeyUpBound = this.onKeyUp.bind(this);
  }

  attach(): void {
    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    this.keysDown.clear();
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keysDown.add(e.key.toLowerCase());
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keysDown.delete(e.key.toLowerCase());
  }

  getPlayerInput(bindings: KeyBindings): PlayerInput {
    return {
      up: this.keysDown.has(bindings.up),
      down: this.keysDown.has(bindings.down),
      left: this.keysDown.has(bindings.left),
      right: this.keysDown.has(bindings.right),
      kick: this.keysDown.has(bindings.kick),
    };
  }

  isPausePressed(): boolean {
    return this.keysDown.has('escape') || this.keysDown.has('p');
  }

  consumePause(): void {
    this.keysDown.delete('escape');
    this.keysDown.delete('p');
  }

  isKeyDown(key: string): boolean {
    return this.keysDown.has(key.toLowerCase());
  }
}
