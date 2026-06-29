import { GestureEffect } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
}

class EffectRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private startTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  renderFire(x: number, y: number, intensity: number, duration: number) {
    this.startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - this.startTime;
      if (elapsed > duration) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = `rgba(255, ${Math.floor(165 * intensity)}, 0, 0.7)`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 20 + intensity * 10, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `rgba(255, ${Math.floor(200 * intensity)}, 0, 0.5)`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 15 + intensity * 8, 0, Math.PI * 2);
      this.ctx.fill();

      requestAnimationFrame(animate);
    };
    animate();
  }

  renderLightning(x: number, y: number, intensity: number, duration: number) {
    this.startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - this.startTime;
      if (elapsed > duration) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.strokeStyle = `rgba(0, ${Math.floor(150 + 105 * intensity)}, 255, ${0.8 * intensity})`;
      this.ctx.lineWidth = 3 * intensity;

      this.ctx.beginPath();
      this.ctx.moveTo(x, y - 50);
      for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * 20 * intensity;
        const offsetY = (i + 1) * 20;
        this.ctx.lineTo(x + offsetX, y + offsetY);
      }
      this.ctx.stroke();

      requestAnimationFrame(animate);
    };
    animate();
  }

  renderParticles(x: number, y: number, color: string, intensity: number, duration: number) {
    this.startTime = Date.now();
    const particleCount = Math.floor(20 * intensity);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 5 * intensity;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: duration,
        age: 0,
      });
    }

    const animate = () => {
      const elapsed = Date.now() - this.startTime;
      if (elapsed > duration || this.particles.length === 0) {
        this.particles = [];
        return;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles = this.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.age += 16;
        p.vy += 0.2;

        const alpha = 1 - p.age / p.life;
        this.ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        this.ctx.fill();

        return p.age < p.life;
      });

      if (this.particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  renderConfetti(x: number, y: number, intensity: number, duration: number) {
    this.startTime = Date.now();
    const colors = ['#00f7ff', '#d946ef', '#ec4899', '#22c55e'];
    const pieces = Array.from({ length: Math.floor(30 * intensity) }, () => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      age: 0,
    }));

    const animate = () => {
      const elapsed = Date.now() - this.startTime;
      if (elapsed > duration) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      pieces.forEach((piece) => {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += 0.2;
        piece.rotation += piece.rotationSpeed;
        piece.age += 16;

        const alpha = 1 - piece.age / duration;
        this.ctx.save();
        this.ctx.translate(piece.x, piece.y);
        this.ctx.rotate(piece.rotation);
        this.ctx.fillStyle = piece.color;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillRect(-4, -4, 8, 8);
        this.ctx.restore();
      });

      if (pieces.some((p) => p.age < duration)) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  renderNeon(x: number, y: number, color: string, intensity: number, duration: number) {
    this.startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - this.startTime;
      if (elapsed > duration) return;

      const pulse = Math.sin(elapsed / 100) * 0.5 + 0.5;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2 * intensity;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 20 * intensity * pulse;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 30 * intensity * pulse, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.shadowBlur = 0;
      requestAnimationFrame(animate);
    };
    animate();
  }

  renderRipple(x: number, y: number, color: string, intensity: number, duration: number) {
    this.startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - this.startTime;
      if (elapsed > duration) return;

      const progress = elapsed / duration;
      const radius = progress * 150;
      const alpha = 1 - progress;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.strokeStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      this.ctx.lineWidth = 2 * intensity;

      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.stroke();

      requestAnimationFrame(animate);
    };
    animate();
  }

  renderEffect(effect: GestureEffect, x: number, y: number) {
    switch (effect.type) {
      case 'fire':
        this.renderFire(x, y, effect.intensity, effect.duration);
        break;
      case 'lightning':
        this.renderLightning(x, y, effect.intensity, effect.duration);
        break;
      case 'particles':
        this.renderParticles(x, y, effect.color, effect.intensity, effect.duration);
        break;
      case 'confetti':
        this.renderConfetti(x, y, effect.intensity, effect.duration);
        break;
      case 'neon':
        this.renderNeon(x, y, effect.color, effect.intensity, effect.duration);
        break;
      case 'ripple':
        this.renderRipple(x, y, effect.color, effect.intensity, effect.duration);
        break;
      case 'portal':
        this.renderNeon(x, y, effect.color, effect.intensity, effect.duration);
        break;
    }
  }
}

export default EffectRenderer;
