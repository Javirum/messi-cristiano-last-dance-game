import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasApiKey: !!ANTHROPIC_API_KEY });
});

// Commentary endpoint (streaming)
app.post('/api/commentary', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'API key not configured' });
  }

  const { system, prompt, stream } = req.body;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 150,
        system: system || '',
        messages: [{ role: 'user', content: prompt }],
        stream: stream || false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    if (stream && response.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.write('data: [DONE]\n\n');
            res.end();
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      };

      pump().catch((err) => {
        console.error('Stream error:', err);
        res.end();
      });
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (err) {
    console.error('Commentary API error:', err);
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
  if (!ANTHROPIC_API_KEY) {
    console.warn('Warning: ANTHROPIC_API_KEY not set. Set it via environment variable.');
  }
});
