import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env file from project root
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const envFile = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8');
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
  // .env file not found — rely on environment variables
}

const app = express();
const PORT = process.env.PORT || 3001;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasTtsKey: !!ELEVENLABS_API_KEY });
});

// TTS endpoint — proxies to ElevenLabs TTS API
app.post('/api/tts', async (req, res) => {
  if (!ELEVENLABS_API_KEY) {
    return res.status(503).json({ error: 'ElevenLabs API key not configured' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing "text" in request body' });
  }

  const voiceId = ELEVENLABS_VOICE_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
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
      const error = await response.text();
      console.error('ElevenLabs TTS error:', error);
      return res.status(response.status).json({ error });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    const reader = response.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        res.write(value);
      }
    };

    pump().catch((err) => {
      console.error('TTS stream error:', err);
      res.end();
    });
  } catch (err) {
    console.error('TTS API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Image generation endpoint (placeholder - Claude doesn't generate images directly)
// This would integrate with an image generation API
app.post('/api/generate-image', async (req, res) => {
  const { prompt } = req.body;

  // For now, return a placeholder response
  // In production, this would call an image generation API
  console.log('Image generation requested:', prompt);
  res.json({
    imageUrl: null,
    message: 'Image generation not yet configured. Set up an image generation API.',
  });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  if (!ELEVENLABS_API_KEY) {
    console.warn('Warning: ELEVENLABS_API_KEY not set. Voice commentary will be disabled.');
  }
});
