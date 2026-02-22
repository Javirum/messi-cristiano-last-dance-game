export const CANVAS = {
  WIDTH: 686,
  HEIGHT: 343,
} as const;

export const PLAYER = {
  RADIUS: 20,
  MAX_SPEED: 3,
  ACCELERATION: 0.55,
  DECELERATION: 0.55,
  START_P1: { x: 150, y: 180 },
  START_P2: { x: 520, y: 180 },
  IMAGE_WIDTH: 50,
  IMAGE_HEIGHT: 80,
  IMAGE_OFFSET_X: -10,
  IMAGE_OFFSET_Y_LEFT: -50,
  IMAGE_OFFSET_Y_RIGHT: -55,
} as const;

export const BALL = {
  RADIUS: 10,
  DECELERATION: 0.1,
  MAX_SPEED: 8,
  BOUNCE_FACTOR: 1.5,
  IMAGE_SIZE: 20,
} as const;

export const GOAL = {
  Y_TOP: 100,
  Y_BOTTOM: 243,
  POST_WIDTH: 10,
  POST_COLOR_LEFT: '#e74c3c',
  POST_COLOR_RIGHT: '#3498db',
} as const;

export const GAME = {
  SCORE_TO_WIN: 3,
  GOAL_CELEBRATION_MS: 2000,
  FIELD_COLOR: '#66aa66',
  CENTER_CIRCLE_RADIUS: 80,
  CENTER_LINE_COLOR: 'rgba(255,255,255,0.6)',
  CENTER_LINE_WIDTH: 3,
} as const;

export const ASSETS = {
  CRISTIANO: '/images/cristiano.png',
  MESSI: '/images/messi.png',
  BALL: '/images/ball.png',
  FIELD: '/images/field.png',
  STADIUM: '/images/stadium.png',
} as const;

export const AI_REACTION_DELAY = {
  EASY: 300,
  MEDIUM: 150,
  HARD: 50,
} as const;
