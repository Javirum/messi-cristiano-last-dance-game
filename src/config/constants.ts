export const CANVAS = {
  WIDTH: 1372,
  HEIGHT: 686,
} as const;

export const PLAYER = {
  RADIUS: 40,
  MAX_SPEED: 5,
  ACCELERATION: 0.9,
  DECELERATION: 0.9,
  START_P1: { x: 300, y: 343 },
  START_P2: { x: 1040, y: 343 },
  IMAGE_WIDTH: 100,
  IMAGE_HEIGHT: 160,
  IMAGE_OFFSET_X: -20,
  IMAGE_OFFSET_Y_LEFT: -100,
  IMAGE_OFFSET_Y_RIGHT: -110,
} as const;

export const BALL = {
  RADIUS: 20,
  DECELERATION: 0.15,
  MAX_SPEED: 14,
  BOUNCE_FACTOR: 1.5,
  IMAGE_SIZE: 40,
} as const;

export const GOAL = {
  Y_TOP: 200,
  Y_BOTTOM: 486,
  POST_WIDTH: 16,
  POST_COLOR_LEFT: '#e74c3c',
  POST_COLOR_RIGHT: '#3498db',
} as const;

export const GAME = {
  SCORE_TO_WIN: 3,
  GOAL_CELEBRATION_MS: 2000,
  FIELD_COLOR: '#66aa66',
  CENTER_CIRCLE_RADIUS: 160,
  CENTER_LINE_COLOR: 'rgba(255,255,255,0.6)',
  CENTER_LINE_WIDTH: 4,
} as const;

const base = import.meta.env.BASE_URL;

export const ASSETS = {
  CRISTIANO: `${base}images/cristiano.png`,
  MESSI: `${base}images/messi.png`,
  BALL: `${base}images/ball.png`,
  FIELD: `${base}images/field.png`,
  STADIUM: `${base}images/stadium.png`,
} as const;

export const AI_REACTION_DELAY = {
  EASY: 300,
  MEDIUM: 150,
  HARD: 50,
} as const;
