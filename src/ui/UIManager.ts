import { GameState, GameMode, Difficulty } from '../types/game.ts';
import { PlayerSide } from '../types/entities.ts';
import { SplashScreen } from './screens/SplashScreen.ts';
import { InstructionsScreen } from './screens/InstructionsScreen.ts';
import { GameScreen } from './screens/GameScreen.ts';
import { GameOverScreen } from './screens/GameOverScreen.ts';
import { HamburgerMenu } from './components/HamburgerMenu.ts';

export interface UICallbacks {
  onStartGame: (mode: GameMode, difficulty: Difficulty) => void;
  onRestart: () => void;
  onResume: () => void;
  onQuit: () => void;
}

export class UIManager {
  private app: HTMLElement;
  private currentScreen: { destroy: () => void } | null = null;
  private menu: HamburgerMenu;
  private callbacks: UICallbacks;
  private gameScreen: GameScreen | null = null;

  constructor(app: HTMLElement, callbacks: UICallbacks) {
    this.app = app;
    this.callbacks = callbacks;
    this.menu = new HamburgerMenu();
    this.app.appendChild(this.menu.getElement());
  }

  showSplash(): void {
    this.clearScreen();
    const splash = new SplashScreen({
      onStart: (mode, difficulty) => {
        this.callbacks.onStartGame(mode, difficulty);
      },
      onInstructions: () => this.showInstructions(),
    });
    this.menu.setOnInstructions(() => this.showInstructions());
    this.currentScreen = splash;
    this.app.appendChild(splash.getElement());
  }

  showInstructions(): void {
    this.clearScreen();
    const instructions = new InstructionsScreen(() => this.showSplash());
    this.currentScreen = instructions;
    this.app.appendChild(instructions.getElement());
  }

  showGame(): GameScreen {
    this.clearScreen();
    this.gameScreen = new GameScreen();
    this.currentScreen = this.gameScreen;
    this.app.appendChild(this.gameScreen.getElement());
    return this.gameScreen;
  }

  showGameOver(
    winner: PlayerSide,
    finalScore: { left: number; right: number },
  ): GameOverScreen {
    this.clearScreen();
    const gameOver = new GameOverScreen(winner, finalScore, {
      onRestart: () => this.callbacks.onRestart(),
    });
    this.currentScreen = gameOver;
    this.app.appendChild(gameOver.getElement());
    return gameOver;
  }

  getGameScreen(): GameScreen | null {
    return this.gameScreen;
  }

  transitionTo(state: GameState, data?: Record<string, unknown>): void {
    switch (state) {
      case GameState.MENU:
        this.showSplash();
        break;
      case GameState.PLAYING:
        // Game screen created via showGame() from GameEngine
        break;
      case GameState.GAME_OVER:
        this.showGameOver(
          data?.winner as PlayerSide,
          data?.finalScore as { left: number; right: number },
        );
        break;
    }
  }

  private clearScreen(): void {
    if (this.currentScreen) {
      this.currentScreen.destroy();
      this.currentScreen = null;
      this.gameScreen = null;
    }
  }
}
