export enum GameState {
  LOADING = 'LOADING',
  MENU = 'MENU',
  MODE_SELECT = 'MODE_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GOAL_SCORED = 'GOAL_SCORED',
  GAME_OVER = 'GAME_OVER',
}

export enum GameMode {
  PVP = 'PVP',
  PVE = 'PVE',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
}

export interface Vector2D {
  x: number;
  y: number;
}
