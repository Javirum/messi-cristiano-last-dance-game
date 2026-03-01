import { Player } from '../../entities/Player.ts';
import { Ball } from '../../entities/Ball.ts';
import { CANVAS } from '../../config/constants.ts';
import { PlayerInput } from '../../types/entities.ts';

export function balancedStrategy(
  player: Player,
  ball: Ball,
  opponent: Player,
  deadZone: number,
): PlayerInput {
  const input: PlayerInput = {
    up: false,
    down: false,
    left: false,
    right: false,
    kick: false,
  };

  const midfield = CANVAS.WIDTH / 2;
  const ballOnOurSide =
    (player.side === 'right' && ball.position.x > midfield) ||
    (player.side === 'left' && ball.position.x < midfield);

  const losing = player.score < opponent.score;

  // When losing, be more aggressive
  if (losing && !ballOnOurSide) {
    const targetX = player.side === 'right' ? midfield + 30 : midfield - 30;
    const dx = targetX - player.position.x;
    if (Math.abs(dx) > deadZone) {
      if (dx < 0) input.left = true;
      else input.right = true;
    }
  } else if (ballOnOurSide) {
    // Intercept the ball
    const dx = ball.position.x - player.position.x;
    if (Math.abs(dx) > deadZone) {
      if (dx < 0) input.left = true;
      else input.right = true;
    }
  } else {
    // Default position
    const defaultX = player.side === 'right'
      ? CANVAS.WIDTH * 0.7
      : CANVAS.WIDTH * 0.3;
    const dx = defaultX - player.position.x;
    if (Math.abs(dx) > deadZone) {
      if (dx < 0) input.left = true;
      else input.right = true;
    }
  }

  // Always track ball Y
  const dy = ball.position.y - player.position.y;
  if (Math.abs(dy) > deadZone) {
    if (dy < 0) input.up = true;
    else input.down = true;
  }

  return input;
}
