import { GameMode, Difficulty } from '../../types/game.ts';
import { ASSETS } from '../../config/constants.ts';
import { SoundManager } from '../../audio/SoundManager.ts';
import { generateSounds } from '../../audio/SyntheticSounds.ts';
import { getMatchHistory, getRivalryTally } from '../WinHistory.ts';

export type SelectedCharacter = 'messi' | 'cristiano';

export interface SplashCallbacks {
  onStart: (mode: GameMode, difficulty: Difficulty, character: SelectedCharacter) => void;
  onInstructions: () => void;
}

let introPlayed = false;

export class SplashScreen {
  private container: HTMLElement;
  private callbacks: SplashCallbacks;
  private selectedMode: GameMode = GameMode.PVP;
  private selectedDifficulty: Difficulty = Difficulty.MEDIUM;
  private selectedCharacter: SelectedCharacter = 'cristiano';
  private soundManager: SoundManager | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private bgMusic: HTMLAudioElement | null = null;
  private audioInitialized = false;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private introTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(callbacks: SplashCallbacks) {
    this.callbacks = callbacks;
    this.container = document.createElement('div');
    this.container.className = 'screen splash-screen';
    this.build();
  }

  private build(): void {
    const showIntro = !introPlayed;

    this.container.innerHTML = `
      <div class="splash-screen__bg"></div>
      ${showIntro ? `
      <div class="splash-screen__intro">
        <span class="splash-screen__intro-text">THE LAST DANCE</span>
      </div>
      ` : ''}
      <div class="splash-screen__content${showIntro ? ' splash-screen__content--hidden' : ''}">

        <div class="splash-screen__versus">
          <div class="splash-screen__portrait splash-screen__portrait--left">
            <img src="${ASSETS.CRISTIANO}" alt="Cristiano">
          </div>
          <div class="splash-screen__vs-badge">VS</div>
          <div class="splash-screen__portrait splash-screen__portrait--right">
            <img src="${ASSETS.MESSI}" alt="Messi">
          </div>
        </div>

        <h1 class="splash-screen__title">Messi vs Cristiano</h1>
        <h2 class="splash-screen__subtitle">The Last Dance</h2>

        <div class="splash-screen__mode-select">
          <button class="btn btn--mode btn--active" data-mode="PVP">2 Players <kbd>1</kbd></button>
          <button class="btn btn--mode" data-mode="PVE">vs AI <kbd>2</kbd></button>
        </div>

        <div class="splash-screen__difficulty splash-screen__difficulty--hidden">
          <button class="btn btn--diff" data-diff="EASY">Easy <kbd>7</kbd></button>
          <button class="btn btn--diff btn--active" data-diff="MEDIUM">Medium <kbd>8</kbd></button>
          <button class="btn btn--diff" data-diff="HARD">Hard <kbd>9</kbd></button>
        </div>

        <div class="splash-screen__character-select splash-screen__character-select--hidden">
          <span class="splash-screen__character-label">Play as:</span>
          <button class="btn btn--char btn--char-cristiano btn--active" data-char="cristiano">
            Cristiano <kbd>&larr;</kbd>
          </button>
          <button class="btn btn--char btn--char-messi" data-char="messi">
            Messi <kbd>&rarr;</kbd>
          </button>
        </div>

        <button class="btn btn--start">
          <img class="btn--start__ball" src="${ASSETS.BALL}" alt="">
          Kick Off!
        </button>

        <div class="splash-screen__history"></div>
      </div>

      <div class="splash-screen__ticker">
        <div class="splash-screen__ticker-track">
          <span>&#9917; 1,700+ combined goals &nbsp;&bull;&nbsp; 13 Ballon d'Ors &nbsp;&bull;&nbsp; 5 Champions Leagues for CR7 &nbsp;&bull;&nbsp; 4 Champions Leagues for Messi &nbsp;&bull;&nbsp; 800+ goals each &nbsp;&bull;&nbsp; The Greatest Rivalry in Football &nbsp;&bull;&nbsp;</span>
          <span>&#9917; 1,700+ combined goals &nbsp;&bull;&nbsp; 13 Ballon d'Ors &nbsp;&bull;&nbsp; 5 Champions Leagues for CR7 &nbsp;&bull;&nbsp; 4 Champions Leagues for Messi &nbsp;&bull;&nbsp; 800+ goals each &nbsp;&bull;&nbsp; The Greatest Rivalry in Football &nbsp;&bull;&nbsp;</span>
        </div>
      </div>
    `;

    // Feature 3: Set stadium background via JS
    const bg = this.container.querySelector('.splash-screen__bg') as HTMLElement;
    bg.style.backgroundImage = `url('${ASSETS.STADIUM}')`;

    // Feature 10: Populate history
    this.populateHistory();

    // Feature 4: Intro animation timing
    if (showIntro) {
      introPlayed = true;
      this.introTimeout = setTimeout(() => {
        const content = this.container.querySelector('.splash-screen__content');
        content?.classList.remove('splash-screen__content--hidden');
      }, 3500);
    }

    // Wire everything up
    this.wireButtons();
    this.wireKeyboard();
    this.wireSounds();
    this.startBgMusic();
  }

  // --- Shared selection methods (used by both click handlers and keyboard) ---

  private selectMode(mode: GameMode): void {
    this.container
      .querySelectorAll('.btn--mode')
      .forEach((b) => b.classList.remove('btn--active'));
    this.container
      .querySelector(`[data-mode="${mode}"]`)
      ?.classList.add('btn--active');
    this.selectedMode = mode;

    const diffSection = this.container.querySelector('.splash-screen__difficulty')!;
    const charSection = this.container.querySelector('.splash-screen__character-select')!;
    if (mode === GameMode.PVE) {
      diffSection.classList.remove('splash-screen__difficulty--hidden');
      charSection.classList.remove('splash-screen__character-select--hidden');
    } else {
      diffSection.classList.add('splash-screen__difficulty--hidden');
      charSection.classList.add('splash-screen__character-select--hidden');
    }
  }

  private selectDifficulty(diff: Difficulty): void {
    this.container
      .querySelectorAll('.btn--diff')
      .forEach((b) => b.classList.remove('btn--active'));
    this.container
      .querySelector(`[data-diff="${diff}"]`)
      ?.classList.add('btn--active');
    this.selectedDifficulty = diff;
  }

  private selectCharacter(char: SelectedCharacter): void {
    this.container
      .querySelectorAll('.btn--char')
      .forEach((b) => b.classList.remove('btn--active'));
    this.container
      .querySelector(`[data-char="${char}"]`)
      ?.classList.add('btn--active');
    this.selectedCharacter = char;
  }

  private handleKickOff(): void {
    const startBtn = this.container.querySelector('.btn--start') as HTMLElement;
    if (startBtn.classList.contains('btn--start--kicked')) return;

    startBtn.classList.add('btn--start--kicked');
    this.playSound('whistle-start', 0.3);

    setTimeout(() => {
      this.callbacks.onStart(
        this.selectedMode,
        this.selectedDifficulty,
        this.selectedCharacter,
      );
    }, 600);
  }

  // --- Wiring ---

  private wireButtons(): void {
    this.container.querySelectorAll('.btn--mode').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectMode((btn as HTMLElement).dataset.mode as GameMode);
      });
    });

    this.container.querySelectorAll('.btn--diff').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectDifficulty((btn as HTMLElement).dataset.diff as Difficulty);
      });
    });

    this.container.querySelectorAll('.btn--char').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectCharacter(
          (btn as HTMLElement).dataset.char as SelectedCharacter,
        );
      });
    });

    this.container
      .querySelector('.btn--start')!
      .addEventListener('click', () => {
        this.handleKickOff();
      });
  }

  private wireKeyboard(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      switch (e.key) {
        case '1':
          this.selectMode(GameMode.PVP);
          this.playSound('ui-click', 0.15);
          break;
        case '2':
          this.selectMode(GameMode.PVE);
          this.playSound('ui-click', 0.15);
          break;
        case '7':
          if (this.selectedMode === GameMode.PVE) {
            this.selectDifficulty(Difficulty.EASY);
            this.playSound('ui-click', 0.15);
          }
          break;
        case '8':
          if (this.selectedMode === GameMode.PVE) {
            this.selectDifficulty(Difficulty.MEDIUM);
            this.playSound('ui-click', 0.15);
          }
          break;
        case '9':
          if (this.selectedMode === GameMode.PVE) {
            this.selectDifficulty(Difficulty.HARD);
            this.playSound('ui-click', 0.15);
          }
          break;
        case 'ArrowLeft':
          if (this.selectedMode === GameMode.PVE) {
            this.selectCharacter('cristiano');
            this.playSound('ui-click', 0.15);
          }
          break;
        case 'ArrowRight':
          if (this.selectedMode === GameMode.PVE) {
            this.selectCharacter('messi');
            this.playSound('ui-click', 0.15);
          }
          break;
        case 'Enter':
          this.handleKickOff();
          break;
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  private wireSounds(): void {
    // Init audio on first user interaction
    const initOnce = () => {
      if (!this.audioInitialized) {
        this.initAudio();
      }
      this.container.removeEventListener('click', initOnce);
    };
    this.container.addEventListener('click', initOnce);

    // Hover and click sounds on all buttons
    this.container.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        this.playSound('ui-hover', 0.08);
      });
      btn.addEventListener('click', () => {
        this.playSound('ui-click', 0.15);
      });
    });
  }

  // --- Audio ---

  private async initAudio(): Promise<void> {
    this.audioInitialized = true;
    this.soundManager = new SoundManager();
    const ctx = this.soundManager.getContext();
    const sounds = await generateSounds(ctx);
    for (const [key, buf] of sounds) {
      this.soundManager.setBuffer(key, buf);
    }
    // Start ambient crowd
    this.ambientSource = this.soundManager.playLoop('crowd-ambient', 0.08);

  }

  private startBgMusic(): void {
    const base = import.meta.env.BASE_URL;
    const music = new Audio(`${base}audio/championship-ascent.mp3`);
    music.loop = true;
    music.volume = 0.3;
    this.bgMusic = music;

    // Try to play immediately; if browser blocks autoplay, start on first interaction
    music.play().catch(() => {
      const resume = () => {
        music.play().catch(() => {});
        document.removeEventListener('click', resume);
        document.removeEventListener('keydown', resume);
      };
      document.addEventListener('click', resume, { once: false });
      document.addEventListener('keydown', resume, { once: false });
    });
  }

  private playSound(key: string, volume: number): void {
    this.soundManager?.play(key, volume);
  }

  // --- Win History ---

  private populateHistory(): void {
    const historyEl = this.container.querySelector(
      '.splash-screen__history',
    ) as HTMLElement;
    const history = getMatchHistory();
    if (history.length === 0) {
      historyEl.style.display = 'none';
      return;
    }

    const tally = getRivalryTally();
    let html = `<div class="splash-screen__history-tally">CR7 ${tally.cristiano} - ${tally.messi} Messi</div>`;
    html += `<div class="splash-screen__history-matches">`;
    for (const match of history) {
      const label = match.winner === 'cristiano' ? 'CR7' : 'Messi';
      const cls = match.winner === 'cristiano' ? 'tag--cr7' : 'tag--messi';
      html += `<span class="splash-screen__history-tag ${cls}">${label} ${match.score.left}-${match.score.right}</span>`;
    }
    html += `</div>`;
    historyEl.innerHTML = html;
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.introTimeout) {
      clearTimeout(this.introTimeout);
      this.introTimeout = null;
    }
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
      } catch {
        /* already stopped */
      }
      this.ambientSource = null;
    }
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.src = '';
      this.bgMusic = null;
    }
    this.container.remove();
  }
}
