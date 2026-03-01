interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

const CONFETTI_COLORS = [
  '#d4a843', '#f0ece4', '#c22a3e', '#2563a8',
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
];

export class ParticleSystem {
  private particles: Particle[] = [];

  spawn(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      const maxLife = 60 + Math.random() * 60; // 1-2 seconds at 60fps
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3, // bias upward
        life: maxLife,
        maxLife,
        size: 3 + Math.random() * 5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
      });
    }
  }

  update(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.rotationSpeed;
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = Math.min(1, p.life / (p.maxLife * 0.3));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
  }

  get active(): boolean {
    return this.particles.length > 0;
  }

  clear(): void {
    this.particles = [];
  }
}
