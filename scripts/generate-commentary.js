#!/usr/bin/env node

/**
 * Build-time script: generates 18 static TTS commentary MP3 files
 * using ElevenLabs and writes them + a manifest.json to public/audio/commentary/.
 *
 * Usage:  node scripts/generate-commentary.js
 * Requires: ELEVENLABS_API_KEY in .env (ELEVENLABS_VOICE_ID is optional)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/audio/commentary');

// ── Load .env ───────────────────────────────────────────────────────────

try {
  const envFile = readFileSync(resolve(ROOT, '.env'), 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env not found — rely on environment variables
}

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

if (!API_KEY) {
  console.error('Error: ELEVENLABS_API_KEY is not set. Add it to .env or export it.');
  process.exit(1);
}

// ── Text pools (mirrored from PreloadedCommentary.ts) ───────────────────

const CATEGORIES = {
  'game-start': [
    "THIS IS IT! THE MOMENT THE ENTIRE WORLD HAS BEEN DREAMING OF! Messi versus Cristiano, THE LAST DANCE! Twenty years of rivalry, thousands of goals, and it ALL comes down to THIS! The stadium is TREMBLING! I have CHILLS! LETS GOOOOO!",
    "CAN YOU FEEL IT?! CAN YOU HEAR THE ROAR?! BILLIONS of people watching, hearts POUNDING, and two IMMORTALS step onto the pitch for THE VERY LAST TIME! Messi! Cristiano! This is not just a game, THIS IS HISTORY! THE FINAL CHAPTER BEGINS NOW!",
    "OH MY GOD! OH MY GOD! I can barely SPEAK! Messi and Cristiano, side by side, one LAST time! The greatest rivalry in the history of ALL sports ends TONIGHT! Every touch, every goal, every SECOND counts! THIS IS THE MATCH OF THE CENTURY!",
  ],
  'fun-fact': [
    "THINK ABOUT THIS! Messi and Cristiano have scored over SEVENTEEN HUNDRED goals COMBINED! We are watching TWO GODS of football in their FINAL battle! This is a once in a LIFETIME moment, people!",
    "INCREDIBLE! Cristiano has conquered England, Spain, AND Italy! Everywhere he goes, he DOMINATES! And now, in his LAST EVER match against Messi, he wants to conquer ONE MORE TIME!",
    "EIGHT Ballon d'Ors! EIGHT! Messi has more golden balls than ANYONE who has EVER lived! And tonight, in this HISTORIC final showdown, he's playing like he wants a NINTH!",
  ],
  'goal-messi': [
    "GOOOOOOOOL! GOOOOOOOL! MESSI! IN THE LAST DANCE! THE LITTLE GENIUS STRIKES! The whole world is on its FEET! This is LEGENDARY! This is MESSI at his ABSOLUTE FINEST!",
    "HE SCORES! MESSI SCORES IN THE FINAL SHOWDOWN! That magical left foot has done it AGAIN! TEARS in the crowd! GOOSEBUMPS everywhere! THIS IS WHY HE'S THE GREATEST!",
    "MESSI! MESSI! MESSI! IN THE MOST IMPORTANT GAME OF HIS LIFE, HE DELIVERS! The net RIPPLES, the stadium ERUPTS! You are watching GREATNESS! Pure, undeniable GREATNESS!",
  ],
  'goal-cristiano': [
    "GOOOOOOOOL! RONALDO! SIUUUUUUUU! IN THE LAST DANCE, THE MACHINE FIRES! WHAT A ROCKET! The stadium is BOUNCING! THIS IS CRISTIANO RONALDO AT HIS MOST DEVASTATING!",
    "CRISTIANO SCORES! SIUUUUUUU! IN THE BIGGEST GAME IN HISTORY, HE RISES TO THE OCCASION! That is MENTALITY! That is HUNGER! That is the GREATEST COMPETITOR ALIVE!",
    "BOOM! RONALDO! IN THE FINAL SHOWDOWN! The ball nearly BROKE the net! PURE POWER! PURE FURY! CR7 will NOT go quietly into the night! HE IS A FORCE OF NATURE!",
  ],
  'game-over-messi': [
    "IT'S OVER! IT'S OVER! MESSI WINS THE LAST DANCE! I'M CRYING! THE WHOLE STADIUM IS CRYING! Lionel Messi, the boy from Rosario, WINS the greatest match ever played! What a LEGACY! What an IMMORTAL! MESSI FOREVER!",
    "THE FINAL WHISTLE BLOWS AND MESSI IS CHAMPION OF THE LAST DANCE! TWENTY YEARS of rivalry and HE stands VICTORIOUS! The little genius has written the PERFECT ending to the GREATEST story in football! I will NEVER forget this night!",
    "MESSI! MESSI! MESSI! HE'S DONE IT! THE LAST DANCE BELONGS TO LEO! Players in TEARS, fans EMBRACING, the world UNITED in witnessing PERFECTION! This is the greatest moment in the history of football! LIONEL MESSI, THE ETERNAL GOAT!",
  ],
  'game-over-cristiano': [
    "IT'S OVER! CRISTIANO RONALDO WINS THE LAST DANCE! THE KING TAKES THE THRONE ONE FINAL TIME! I can barely BREATHE! What WILLPOWER! What DETERMINATION! RONALDO, THE ULTIMATE CHAMPION! THIS IS HIS LEGACY FOREVER!",
    "THE FINAL WHISTLE! RONALDO IS VICTORIOUS! In the BIGGEST game in HISTORY, CR7 delivers the performance of a LIFETIME! TEARS, PASSION, GLORY! Cristiano Ronaldo, you MAGNIFICENT human being! THE LAST DANCE IS YOURS!",
    "CRISTIANO! CRISTIANO! CRISTIANO! HE WINS THE LAST DANCE! The man who was told he'd NEVER be the best just PROVED the entire WORLD wrong ONE LAST TIME! INCREDIBLE! PHENOMENAL! LEGENDARY! RONALDO FOREVER!",
  ],
};

// ── Generate ────────────────────────────────────────────────────────────

async function generateClip(text, filename) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?output_format=mp3_44100_128`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_v3',
      voice_settings: {
        stability: 0.0,
        similarity_boost: 0.65,
        style: 1.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs error for ${filename}: ${response.status} — ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const outPath = resolve(OUT_DIR, filename);
  writeFileSync(outPath, buffer);
  console.log(`  ✓ ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return { file: filename, text };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('Generating commentary audio files...\n');

  const manifest = {};
  let total = 0;

  for (const [category, texts] of Object.entries(CATEGORIES)) {
    manifest[category] = [];
    console.log(`[${category}]`);

    for (let i = 0; i < texts.length; i++) {
      const filename = `${category}-${i + 1}.mp3`;
      const entry = await generateClip(texts[i], filename);
      manifest[category].push(entry);
      total++;
    }

    console.log('');
  }

  // Write manifest
  const manifestPath = resolve(OUT_DIR, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✓ manifest.json written`);
  console.log(`\nDone! Generated ${total} audio files in public/audio/commentary/`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
