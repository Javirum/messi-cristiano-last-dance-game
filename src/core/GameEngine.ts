import { GameState, GameMode, Difficulty } from '../types/game.ts';
import { GameEvent } from '../types/events.ts';
import { CANVAS, GAME, ASSETS } from '../config/constants.ts';
import { EventBus } from './EventBus.ts';
import { AssetLoader } from './AssetLoader.ts';
import { InputManager, P1_KEYS, P2_KEYS } from './InputManager.ts';
import { PhysicsEngine } from './PhysicsEngine.ts';
import { Renderer } from './Renderer.ts';
import { Player } from '../entities/Player.ts';
import { Ball } from '../entities/Ball.ts';
import { Goal } from '../entities/Goal.ts';
import { AIController } from '../ai/AIController.ts';
import { UIManager } from '../ui/UIManager.ts';
import { GameScreen } from '../ui/screens/GameScreen.ts';
import { PlayerSide } from '../types/entities.ts';
import { SelectedCharacter } from '../ui/screens/SplashScreen.ts';
import { saveMatchResult } from '../ui/WinHistory.ts';
import { ParticleSystem } from './ParticleSystem.ts';
import { MatchStats } from './MatchStats.ts';
import { TutorialOverlay } from '../ui/components/TutorialOverlay.ts';

export class GameEngine {
  private state: GameState = GameState.LOADING;

  readonly eventBus: EventBus;
  private assetLoader: AssetLoader;
  private inputManager: InputManager;
  private physicsEngine: PhysicsEngine;
  private renderer: Renderer | null = null;

  private uiManager: UIManager;
  private gameScreen: GameScreen | null = null;

  private player1: Player | null = null;
  private player2: Player | null = null;
  private ball: Ball | null = null;
  private goalLeft: Goal | null = null;
  private goalRight: Goal | null = null;

  private aiController: AIController | null = null;
  private matchStats: MatchStats | null = null;
  private particleSystem: ParticleSystem = new ParticleSystem();
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private goalCelebrationTimer: ReturnType<typeof setTimeout> | null = null;
  private isPaused = false;
  private humanSide: PlayerSide = 'left';

  constructor(app: HTMLElement) {
    this.eventBus = new EventBus();
    this.assetLoader = new AssetLoader();
    this.inputManager = new InputManager();
    this.physicsEngine = new PhysicsEngine(this.eventBus);

    this.uiManager = new UIManager(app, {
      onStartGame: (mode, difficulty, character) => this.startGame(mode, difficulty, character),
      onRestart: () => this.restart(),
      onResume: () => this.resume(),
      onQuit: () => this.quit(),
    });
  }

  async init(): Promise<void> {
    this.setState(GameState.LOADING);
    await this.assetLoader.loadAll({
      cristiano: ASSETS.CRISTIANO,
      messi: ASSETS.MESSI,
      ball: ASSETS.BALL,
      field: ASSETS.FIELD,
      stadium: ASSETS.STADIUM,
    });
    this.setState(GameState.MENU);
    this.uiManager.showSplash();
  }

  private startGame(mode: GameMode, difficulty: Difficulty, character: SelectedCharacter = 'cristiano'): void {
    // Create game screen
    this.gameScreen = this.uiManager.showGame();
    const ctx = this.gameScreen.getContext();
    this.renderer = new Renderer(ctx);

    // Create entities
    this.player1 = new Player('left', this.assetLoader);
    this.player2 = new Player('right', this.assetLoader);
    this.ball = new Ball(this.assetLoader);
    this.goalLeft = new Goal('left');
    this.goalRight = new Goal('right');

    // Determine which side the human controls in PVE
    // Cristiano is always left, Messi is always right
    this.humanSide = (mode === GameMode.PVE && character === 'messi') ? 'right' : 'left';

    // Match stats tracker
    this.matchStats = new MatchStats(this.eventBus);

    // AI controller for PvE mode
    if (mode === GameMode.PVE) {
      this.aiController = new AIController(difficulty);
    } else {
      this.aiController = null;
    }

    // Start input
    this.inputManager.attach();
    this.isPaused = false;

    this.setState(GameState.PLAYING);
    this.eventBus.emit(GameEvent.GAME_STARTED, { mode });

    // Show tutorial for first-time players
    if (TutorialOverlay.shouldShow()) {
      this.isPaused = true;
      this.setState(GameState.PAUSED);
      const tutorial = new TutorialOverlay(() => {
        this.isPaused = false;
        this.setState(GameState.PLAYING);
        this.lastTimestamp = performance.now();
        this.animFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
      });
      this.gameScreen!.getElement().appendChild(tutorial.getElement());

      // Render the initial frame so the field is visible behind the tutorial
      this.renderer!.drawAll(
        this.player1!, this.player2!, this.ball!,
        this.goalLeft!, this.goalRight!,
      );
      return;
    }

    // Start game loop
    this.lastTimestamp = performance.now();
    this.animFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  private gameLoop(timestamp: number): void {
    if (this.state !== GameState.PLAYING && this.state !== GameState.PAUSED) {
      return;
    }

    const dt = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Check pause toggle
    if (this.inputManager.isPausePressed()) {
      this.inputManager.consumePause();
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    }

    if (this.isPaused) {
      this.animFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
      return;
    }

    const p1 = this.player1!;
    const p2 = this.player2!;
    const ball = this.ball!;

    // Read input
    if (this.aiController) {
      const humanPlayer = this.humanSide === 'left' ? p1 : p2;
      const aiPlayer = this.humanSide === 'left' ? p2 : p1;
      humanPlayer.input = this.inputManager.getPlayerInput(P1_KEYS);
      aiPlayer.input = this.aiController.update(aiPlayer, ball, timestamp, humanPlayer);
    } else {
      p1.input = this.inputManager.getPlayerInput(P1_KEYS);
      p2.input = this.inputManager.getPlayerInput(P2_KEYS);
    }

    // Update entities
    p1.update(dt);
    p2.update(dt);
    ball.update(dt);

    // Physics
    const scored = this.physicsEngine.update(
      p1,
      p2,
      ball,
      this.goalLeft!,
      this.goalRight!,
    );

    // Render
    this.renderer!.drawAll(p1, p2, ball, this.goalLeft!, this.goalRight!);
    this.renderer!.drawChargeIndicator(p1);
    this.renderer!.drawChargeIndicator(p2);

    // Update scoreboard
    this.gameScreen!.scoreboard.updateScore(p1.score, p2.score);

    // Handle scoring
    if (scored) {
      this.onGoalScored(scored);
      return;
    }

    this.animFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  private onGoalScored(scorer: PlayerSide): void {
    const p1 = this.player1!;
    const p2 = this.player2!;

    if (scorer === 'left') {
      p1.score++;
    } else {
      p2.score++;
    }

    const scorerName = scorer === 'left' ? 'Cristiano' : 'Messi';

    // Update scoreboard immediately
    this.gameScreen!.scoreboard.updateScore(p1.score, p2.score);

    this.eventBus.emit(GameEvent.GOAL_SCORED, {
      scorer,
      scorerName,
      score: { left: p1.score, right: p2.score },
    });

    this.eventBus.emit(GameEvent.SCORE_UPDATED, {
      left: p1.score,
      right: p2.score,
    });

    // Check win
    if (p1.score >= GAME.SCORE_TO_WIN || p2.score >= GAME.SCORE_TO_WIN) {
      this.onGameOver(scorer);
      return;
    }

    // Celebration pause with particles + flash
    this.setState(GameState.GOAL_SCORED);

    // Spawn confetti at the scoring goal position
    const goalX = scorer === 'left' ? CANVAS.WIDTH - 20 : 20;
    const goalY = CANVAS.HEIGHT / 2;
    this.particleSystem.spawn(goalX, goalY, 40);
    this.renderer!.triggerScreenFlash();

    // Start celebration render loop
    const celebrationLoop = () => {
      if (this.state !== GameState.GOAL_SCORED) return;
      this.particleSystem.update();
      this.renderer!.drawAll(p1, p2, this.ball!, this.goalLeft!, this.goalRight!);
      this.renderer!.drawGoalCelebration(scorerName);
      this.renderer!.drawParticles(this.particleSystem);
      this.renderer!.drawScreenFlash();
      requestAnimationFrame(celebrationLoop);
    };
    requestAnimationFrame(celebrationLoop);

    this.goalCelebrationTimer = setTimeout(() => {
      // Reset positions
      this.particleSystem.clear();
      p1.reset();
      p2.reset();
      this.ball!.reset(CANVAS.WIDTH, CANVAS.HEIGHT);
      this.physicsEngine.resetRally();

      this.setState(GameState.PLAYING);
      this.lastTimestamp = performance.now();
      this.animFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }, GAME.GOAL_CELEBRATION_MS);
  }

  private onGameOver(winner: PlayerSide): void {
    this.setState(GameState.GAME_OVER);
    this.inputManager.detach();

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const finalScore = {
      left: this.player1!.score,
      right: this.player2!.score,
    };
    const winnerName = winner === 'left' ? 'Cristiano' : 'Messi';

    this.eventBus.emit(GameEvent.GAME_OVER, {
      winner,
      winnerName,
      finalScore,
    });

    saveMatchResult({
      winner: winner === 'left' ? 'cristiano' : 'messi',
      score: finalScore,
      date: new Date().toISOString(),
    });

    const stats = this.matchStats?.getData();
    this.uiManager.showGameOver(winner, finalScore, stats);
  }

  private restart(): void {
    this.destroy();
    this.uiManager.showSplash();
    this.setState(GameState.MENU);
  }

  private pause(): void {
    this.isPaused = true;
    this.setState(GameState.PAUSED);
    this.renderer?.drawPauseOverlay();
  }

  private resume(): void {
    this.isPaused = false;
    this.setState(GameState.PLAYING);
    this.lastTimestamp = performance.now();
  }

  private quit(): void {
    this.destroy();
    this.uiManager.showSplash();
    this.setState(GameState.MENU);
  }

  private setState(newState: GameState): void {
    const oldState = this.state;
    this.state = newState;
    this.eventBus.emit(GameEvent.STATE_CHANGED, {
      from: oldState,
      to: newState,
    });
  }

  getState(): GameState {
    return this.state;
  }

  getGameScreen(): GameScreen | null {
    return this.gameScreen;
  }

  private destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.goalCelebrationTimer) {
      clearTimeout(this.goalCelebrationTimer);
      this.goalCelebrationTimer = null;
    }
    this.inputManager.detach();
    this.player1 = null;
    this.player2 = null;
    this.ball = null;
    this.goalLeft = null;
    this.goalRight = null;
    this.aiController = null;
    if (this.matchStats) {
      this.matchStats.destroy();
      this.matchStats = null;
    }
    this.renderer = null;
    this.gameScreen = null;
    this.isPaused = false;
  }
}
