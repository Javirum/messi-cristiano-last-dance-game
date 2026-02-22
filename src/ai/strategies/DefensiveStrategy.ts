import { Player } from '../../entities/Player.ts';
import { Ball } from '../../entities/Ball.ts';
import { CANVAS } from '../../config/constants.ts';
import { PlayerInput } from '../../types/entities.ts';

export function defensiveStrategy(
  player: Player,
  ball: Ball,
  deadZone: number,
): PlayerInput {
  const input: PlayerInput = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  // Stay near goal, high blocking priority
  const goalX = player.side === 'right' ? CANVAS.WIDTH - 60 : 60;
  const dx = goalX - player.position.x;
  if (Math.abs(dx) > deadZone) {
    if (dx < 0) input.left = true;
    else input.right = true;
  }

  // Track ball Y position
  const dy = ball.position.y - player.position.y;
  if (Math.abs(dy) > deadZone) {
    if (dy < 0) input.up = true;
    else input.down = true;
  }

  return input;
}
