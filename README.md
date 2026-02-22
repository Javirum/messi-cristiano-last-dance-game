# Messi vs Cristiano — The Last Dance

A 2-player air hockey football game where Messi and Cristiano face off to settle who is the greatest of all time. Built with TypeScript, HTML Canvas, and Vite.

## Features

- **2 Player Mode (PvP)** — Cristiano (WASD) vs Messi (IJKL)
- **vs AI Mode (PvE)** — Play against an AI opponent with 3 difficulty levels (Easy, Medium, Hard)
- **Real physics** — Circle-circle collision detection, momentum transfer, ball spin, and deceleration
- **Goal areas** — Score only counts when the ball enters the goal zone (not the entire edge)
- **Pause/Resume** — Press ESC during gameplay
- **Live AI Commentary** — Real-time soccer commentary powered by Claude API (streaming)
- **Dynamic Fan Sounds** — Crowd ambience, goal roars, near-miss gasps, name chanting via Web Audio API
- **Victory & Celebration Images** — AI-generated pixel art on goals and game over (requires image generation API)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## GenAI Features (Optional)

The game includes optional AI-powered features that require a running API proxy server:

```bash
# Install server dependencies
cd server && npm install

# Set your Anthropic API key
export ANTHROPIC_API_KEY=your-key-here

# Start the API proxy
npm start
```

The Vite dev server proxies `/api/*` requests to the local Express server on port 3001.

### Commentary
Live soccer commentary streams in at the bottom of the screen during gameplay — reacting to goals, near-misses, long rallies, and match results.

### Fan Sounds
Place audio files in `public/audio/` to enable dynamic crowd atmosphere:
- `crowd-ambient.mp3`, `crowd-roar-1.mp3` through `crowd-roar-3.mp3`
- `crowd-gasp.mp3`, `crowd-chant-messi.mp3`, `crowd-chant-cristiano.mp3`
- `crowd-boo.mp3`, `whistle-start.mp3`, `whistle-end.mp3`

## Project Structure

```
src/
  config/       Constants (canvas size, physics values, asset paths)
  core/         GameEngine, PhysicsEngine, Renderer, InputManager, EventBus, AssetLoader
  entities/     Player, Ball, Goal
  ai/           AIController + strategies (Defensive, Aggressive, Balanced)
  ui/           UIManager, screens (Splash, Game, Instructions, GameOver, Pause), components
  genai/        CommentaryService, CelebrationService, VictoryService
  audio/        SoundManager, FanSoundManager
  types/        TypeScript interfaces and enums
server/         Express API proxy for Anthropic API
public/images/  Game sprites (Messi, Cristiano, ball, field, stadium)
```

## Controls

| Action | Player 1 (Cristiano) | Player 2 (Messi) |
|--------|---------------------|-------------------|
| Up     | W                   | I                 |
| Down   | S                   | K                 |
| Left   | A                   | J                 |
| Right  | D                   | L                 |
| Pause  | ESC                 | ESC               |

## Tech Stack

- **TypeScript** with strict mode
- **Vite** for dev server and production builds
- **HTML Canvas** for game rendering
- **Web Audio API** for dynamic sound mixing
- **Express** API proxy server for Claude API integration
- **Claude API** (Sonnet) for live commentary streaming

## Original Repository

This is a modernized rewrite of [messi-vs-cristiano](https://github.com/Javirum/messi-vs-cristiano), which remains as a historical reference.
