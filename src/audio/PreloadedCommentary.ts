import { EventBus } from '../core/EventBus.ts';
import { GameEvent } from '../types/events.ts';
import { CommentaryOverlay } from '../ui/components/CommentaryOverlay.ts';
import type { GoalScoredPayload, GameOverPayload } from '../types/events.ts';

const TTS_URL = '/api/tts';
const HEALTH_URL = '/api/health';

const FUN_FACT_INTERVAL_MS = 45_000;
const FUN_FACT_COOLDOWN_MS = 20_000;

interface Clip {
  text: string;
  audio: HTMLAudioElement | null;
  blobUrl: string | null;
}

// ── Text pools ──────────────────────────────────────────────────────────

const GAME_START_TEXTS = [
  "THIS IS IT! THE MOMENT THE ENTIRE WORLD HAS BEEN DREAMING OF! Messi versus Cristiano, THE LAST DANCE! Twenty years of rivalry, thousands of goals, and it ALL comes down to THIS! The stadium is TREMBLING! I have CHILLS! LETS GOOOOO!",
  "CAN YOU FEEL IT?! CAN YOU HEAR THE ROAR?! BILLIONS of people watching, hearts POUNDING, and two IMMORTALS step onto the pitch for THE VERY LAST TIME! Messi! Cristiano! This is not just a game, THIS IS HISTORY! THE FINAL CHAPTER BEGINS NOW!",
  "OH MY GOD! OH MY GOD! I can barely SPEAK! Messi and Cristiano, side by side, one LAST time! The greatest rivalry in the history of ALL sports ends TONIGHT! Every touch, every goal, every SECOND counts! THIS IS THE MATCH OF THE CENTURY!",
];

const FUN_FACT_TEXTS = [
  "THINK ABOUT THIS! Messi and Cristiano have scored over SEVENTEEN HUNDRED goals COMBINED! We are watching TWO GODS of football in their FINAL battle! This is a once in a LIFETIME moment, people!",
  "INCREDIBLE! Cristiano has conquered England, Spain, AND Italy! Everywhere he goes, he DOMINATES! And now, in his LAST EVER match against Messi, he wants to conquer ONE MORE TIME!",
  "EIGHT Ballon d'Ors! EIGHT! Messi has more golden balls than ANYONE who has EVER lived! And tonight, in this HISTORIC final showdown, he's playing like he wants a NINTH!",
  "NINE HUNDRED career goals for Ronaldo! Let that sink in! NINE! HUNDRED! And in this LEGENDARY final match, every single shot could be his LAST! The emotion is OVERWHELMING!",
  "Messi scored NINETY ONE goals in a single year! A record that may NEVER be broken! And here he is, in the BIGGEST game of his life, the LAST dance against his greatest rival! ELECTRIC!",
];

const GOAL_MESSI_TEXTS = [
  "GOOOOOOOOL! GOOOOOOOL! MESSI! IN THE LAST DANCE! THE LITTLE GENIUS STRIKES! The whole world is on its FEET! This is LEGENDARY! This is MESSI at his ABSOLUTE FINEST!",
  "HE SCORES! MESSI SCORES IN THE FINAL SHOWDOWN! That magical left foot has done it AGAIN! TEARS in the crowd! GOOSEBUMPS everywhere! THIS IS WHY HE'S THE GREATEST!",
  "MESSI! MESSI! MESSI! IN THE MOST IMPORTANT GAME OF HIS LIFE, HE DELIVERS! The net RIPPLES, the stadium ERUPTS! You are watching GREATNESS! Pure, undeniable GREATNESS!",
  "I CANNOT BELIEVE WHAT I'M SEEING! MESSI WITH THE GOAL! In the LAST DANCE, the maestro conducts his MASTERPIECE! The emotion! The BRILLIANCE! I'm SHAKING!",
  "GOOOOOL DE MESSI! The world STOPS! In this historic final chapter, the GOAT writes his name in GOLD! What a strike! What a MOMENT! UNFORGETTABLE!",
];

const GOAL_CRISTIANO_TEXTS = [
  "GOOOOOOOOL! RONALDO! SIUUUUUUUU! IN THE LAST DANCE, THE MACHINE FIRES! WHAT A ROCKET! The stadium is BOUNCING! THIS IS CRISTIANO RONALDO AT HIS MOST DEVASTATING!",
  "CRISTIANO SCORES! SIUUUUUUU! IN THE BIGGEST GAME IN HISTORY, HE RISES TO THE OCCASION! That is MENTALITY! That is HUNGER! That is the GREATEST COMPETITOR ALIVE!",
  "BOOM! RONALDO! IN THE FINAL SHOWDOWN! The ball nearly BROKE the net! PURE POWER! PURE FURY! CR7 will NOT go quietly into the night! HE IS A FORCE OF NATURE!",
  "I'M LOSING MY VOICE! RONALDO SCORES IN THE LAST DANCE! LOOK AT THAT CELEBRATION! LOOK AT THOSE EYES! He wants this MORE than ANYTHING! This is HIS MOMENT!",
  "SIUUUUUUUUUU! CRISTIANO RONALDO! THE KING! THE LEGEND! In the most important match EVER PLAYED, he BURIES it! Absolute SCENES! I have NEVER felt energy like this!",
];

const GAME_OVER_MESSI_TEXTS = [
  "IT'S OVER! IT'S OVER! MESSI WINS THE LAST DANCE! I'M CRYING! THE WHOLE STADIUM IS CRYING! Lionel Messi, the boy from Rosario, WINS the greatest match ever played! What a LEGACY! What an IMMORTAL! MESSI FOREVER!",
  "THE FINAL WHISTLE BLOWS AND MESSI IS CHAMPION OF THE LAST DANCE! TWENTY YEARS of rivalry and HE stands VICTORIOUS! The little genius has written the PERFECT ending to the GREATEST story in football! I will NEVER forget this night!",
  "MESSI! MESSI! MESSI! HE'S DONE IT! THE LAST DANCE BELONGS TO LEO! Players in TEARS, fans EMBRACING, the world UNITED in witnessing PERFECTION! This is the greatest moment in the history of football! LIONEL MESSI, THE ETERNAL GOAT!",
];

const GAME_OVER_CRISTIANO_TEXTS = [
  "IT'S OVER! CRISTIANO RONALDO WINS THE LAST DANCE! THE KING TAKES THE THRONE ONE FINAL TIME! I can barely BREATHE! What WILLPOWER! What DETERMINATION! RONALDO, THE ULTIMATE CHAMPION! THIS IS HIS LEGACY FOREVER!",
  "THE FINAL WHISTLE! RONALDO IS VICTORIOUS! In the BIGGEST game in HISTORY, CR7 delivers the performance of a LIFETIME! TEARS, PASSION, GLORY! Cristiano Ronaldo, you MAGNIFICENT human being! THE LAST DANCE IS YOURS!",
  "CRISTIANO! CRISTIANO! CRISTIANO! HE WINS THE LAST DANCE! The man who was told he'd NEVER be the best just PROVED the entire WORLD wrong ONE LAST TIME! INCREDIBLE! PHENOMENAL! LEGENDARY! RONALDO FOREVER!",
];

// ── PreloadedCommentary ─────────────────────────────────────────────────

export class PreloadedCommentary {
  private eventBus: EventBus;
  private overlay: CommentaryOverlay;

  private hasElevenLabs = false;
  private abortController = new AbortController();
  private unsubscribers: (() => void)[] = [];
  private blobUrls: string[] = [];

  // Preloaded clip arrays
  private gameStartClip: Clip | null = null;
  private funFactClips: Clip[] = [];
  private goalMessiClips: Clip[] = [];
  private goalCristianoClips: Clip[] = [];
  private gameOverMessiClip: Clip | null = null;
  private gameOverCristianoClip: Clip | null = null;

  // Round-robin indices
  private funFactIndex = 0;
  private goalMessiIndex = 0;
  private goalCristianoIndex = 0;

  // Playback state
  private currentAudio: HTMLAudioElement | null = null;
  private currentFadeTimeout: ReturnType<typeof setTimeout> | null = null;
  private highPriorityPlaying = false;

  // Fun fact timer
  private funFactTimer: ReturnType<typeof setTimeout> | null = null;
  private lastFunFactTime = 0;

  private destroyed = false;

  constructor(eventBus: EventBus, overlay: CommentaryOverlay) {
    this.eventBus = eventBus;
    this.overlay = overlay;
  }

  async start(): Promise<void> {
    // Check server health
    try {
      const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        this.hasElevenLabs = !!data.hasTtsKey;
      }
    } catch {
      this.hasElevenLabs = false;
    }

    // Pick random texts
    const gameStartText = pick(GAME_START_TEXTS);
    const funFactTexts = pickN(FUN_FACT_TEXTS, 3);
    const goalMessiTexts = pickN(GOAL_MESSI_TEXTS, 3);
    const goalCristianoTexts = pickN(GOAL_CRISTIANO_TEXTS, 3);
    const gameOverMessiText = pick(GAME_OVER_MESSI_TEXTS);
    const gameOverCristianoText = pick(GAME_OVER_CRISTIANO_TEXTS);

    // Preload game start clip separately (priority) and play ASAP
    this.gameStartClip = await this.preloadSingle(gameStartText);
    if (!this.destroyed) {
      this.playClip(this.gameStartClip, 10000, false);
    }

    // Preload remaining 11 clips in parallel
    const remaining = [
      ...funFactTexts.map((t) => this.preloadSingle(t)),
      ...goalMessiTexts.map((t) => this.preloadSingle(t)),
      ...goalCristianoTexts.map((t) => this.preloadSingle(t)),
      this.preloadSingle(gameOverMessiText),
      this.preloadSingle(gameOverCristianoText),
    ];

    const results = await Promise.allSettled(remaining);
    if (this.destroyed) return;

    const clips = results.map((r) =>
      r.status === 'fulfilled' ? r.value : { text: '', audio: null, blobUrl: null },
    );

    this.funFactClips = clips.slice(0, 3);
    this.goalMessiClips = clips.slice(3, 6);
    this.goalCristianoClips = clips.slice(6, 9);
    this.gameOverMessiClip = clips[9];
    this.gameOverCristianoClip = clips[10];

    // Attach event listeners
    this.attachListeners();

    // Start fun fact timer
    this.scheduleFunFact();
  }

  private async preloadSingle(text: string): Promise<Clip> {
    if (!this.hasElevenLabs) {
      return { text, audio: null, blobUrl: null };
    }

    try {
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        return { text, audio: null, blobUrl: null };
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      this.blobUrls.push(url);

      const audio = new Audio(url);
      // Preload the audio data
      audio.preload = 'auto';

      return { text, audio, blobUrl: url };
    } catch {
      return { text, audio: null, blobUrl: null };
    }
  }

  private attachListeners(): void {
    this.unsubscribers.push(
      this.eventBus.on(GameEvent.GOAL_SCORED, (p) =>
        this.onGoalScored(p as GoalScoredPayload),
      ),
      this.eventBus.on(GameEvent.NEAR_MISS, () => this.tryPlayFunFact()),
      this.eventBus.on(GameEvent.RALLY_LONG, () => this.tryPlayFunFact()),
      this.eventBus.on(GameEvent.GAME_OVER, (p) =>
        this.onGameOver(p as GameOverPayload),
      ),
    );
  }

  private onGoalScored(payload: GoalScoredPayload): void {
    const clips =
      payload.scorerName === 'Messi' ? this.goalMessiClips : this.goalCristianoClips;
    if (clips.length === 0) return;

    const indexRef =
      payload.scorerName === 'Messi' ? 'goalMessiIndex' : 'goalCristianoIndex';
    const clip = clips[this[indexRef] % clips.length];
    this[indexRef]++;

    this.playClip(clip, 8000, true);
  }

  private onGameOver(payload: GameOverPayload): void {
    const clip =
      payload.winnerName === 'Messi'
        ? this.gameOverMessiClip
        : this.gameOverCristianoClip;
    if (!clip) return;
    this.playClip(clip, 12000, true);
  }

  private tryPlayFunFact(): void {
    if (this.funFactClips.length === 0) return;
    if (this.highPriorityPlaying) return;

    const now = Date.now();
    if (now - this.lastFunFactTime < FUN_FACT_COOLDOWN_MS) return;

    const clip = this.funFactClips[this.funFactIndex % this.funFactClips.length];
    this.funFactIndex++;
    this.lastFunFactTime = now;

    this.playClip(clip, 9000, false);
    this.scheduleFunFact();
  }

  private scheduleFunFact(): void {
    if (this.funFactTimer) clearTimeout(this.funFactTimer);
    this.funFactTimer = setTimeout(() => {
      if (!this.destroyed) this.tryPlayFunFact();
    }, FUN_FACT_INTERVAL_MS);
  }

  private playClip(clip: Clip, durationMs: number, highPriority: boolean): void {
    if (this.destroyed) return;

    // Don't interrupt high-priority audio with low-priority
    if (!highPriority && this.highPriorityPlaying) return;

    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.currentFadeTimeout) {
      clearTimeout(this.currentFadeTimeout);
      this.currentFadeTimeout = null;
    }

    this.highPriorityPlaying = highPriority;

    // Show text in overlay
    this.overlay.showText(clip.text, durationMs);

    // Play audio if available
    if (clip.audio) {
      const audio = clip.audio;
      this.currentAudio = audio;
      audio.currentTime = 0;

      audio.onended = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.highPriorityPlaying = false;
        }
      };

      audio.play().catch(() => {
        // Audio playback failed — text-only fallback is already showing
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.highPriorityPlaying = false;
        }
      });

      // Safety: clear high-priority flag after duration in case onended doesn't fire
      this.currentFadeTimeout = setTimeout(() => {
        this.highPriorityPlaying = false;
      }, durationMs);
    } else {
      // No audio — clear high-priority after a short period
      this.currentFadeTimeout = setTimeout(() => {
        this.highPriorityPlaying = false;
      }, 2000);
    }
  }

  destroy(): void {
    this.destroyed = true;

    // Abort in-flight fetches
    this.abortController.abort();

    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }

    // Clear timers
    if (this.funFactTimer) clearTimeout(this.funFactTimer);
    if (this.currentFadeTimeout) clearTimeout(this.currentFadeTimeout);

    // Revoke all blob URLs
    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls = [];

    // Unsubscribe from events
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];

    this.overlay.clear();
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
