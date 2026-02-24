import './ui/styles/main.css';
import './ui/styles/menu.css';
import './ui/styles/game.css';
import './ui/styles/screens.css';

import { GameEngine } from './core/GameEngine.ts';
import { FanSoundManager } from './audio/FanSoundManager.ts';
import { PreloadedCommentary } from './audio/PreloadedCommentary.ts';
import { VictoryService } from './genai/VictoryService.ts';
import { CelebrationService } from './genai/CelebrationService.ts';
import { GameEvent } from './types/events.ts';

async function main(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) throw new Error('Missing #app element');

  const engine = new GameEngine(app);
  await engine.init();

  // Phase 2: Fan sounds (gracefully handles missing audio files)
  const fanSounds = new FanSoundManager(engine.eventBus);
  fanSounds.init().catch(() => {
    console.warn('Fan sounds not available (audio files may be missing)');
  });

  // Phase 2: Preloaded TTS commentary
  let commentary: PreloadedCommentary | null = null;

  engine.eventBus.on(GameEvent.GAME_STARTED, () => {
    if (commentary) commentary.destroy();
    const gameScreen = engine.getGameScreen();
    if (!gameScreen) return;
    commentary = new PreloadedCommentary(engine.eventBus, gameScreen.commentaryOverlay);
    commentary.start();
  });

  // Phase 2: Victory + Celebration image services
  new VictoryService(engine.eventBus);
  new CelebrationService(engine.eventBus);
}

main().catch(console.error);
