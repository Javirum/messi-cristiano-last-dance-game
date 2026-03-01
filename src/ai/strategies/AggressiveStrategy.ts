import { Player } from '../../entities/Player.ts';
import { Ball } from '../../entities/Ball.ts';
import { CANVAS } from '../../config/constants.ts';
import { PlayerInput } from '../../types/entities.ts';

export function aggressiveStrategy(
  player: Player,
  ball: Ball,
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

  // Actively chase the ball when it's on our side or near midfield
  if (ballOnOurSide || Math.abs(ball.position.x - midfield) < 100) {
    const dx = ball.position.x - player.position.x;
    const dy = ball.position.y - player.position.y;
    if (Math.abs(dx) > deadZone) {
      if (dx < 0) input.left = true;
      else input.right = true;
    }
    if (Math.abs(dy) > deadZone) {
      if (dy < 0) input.up = true;
      else input.down = true;
    }
  } else {
    // Push past midfield aggressively
    const targetX = player.side === 'right' ? midfield + 60 : midfield - 60;
    const dx = targetX - player.position.x;
    if (Math.abs(dx) > deadZone) {
      if (dx < 0) input.left = true;
      else input.right = true;
    }
    const dy = ball.position.y - player.position.y;
    if (Math.abs(dy) > deadZone) {
      if (dy < 0) input.up = true;
      else input.down = true;
    }
  }

  return input;
}
