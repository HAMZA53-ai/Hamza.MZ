import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, afterNextRender, OnDestroy } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

@Component({
  selector: 'app-constellation-background',
  templateUrl: './constellation-background.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstellationBackgroundComponent implements OnDestroy {
  @ViewChild('constellationCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrameId?: number;

  constructor() {
    afterNextRender(() => this.initCanvas());
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;
    this.ctx = context;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    this.createParticles();
    this.animate();

    window.addEventListener('resize', this.onResize);
  }
  
  private onResize = (): void => {
     if (!this.ctx) return;
     const canvas = this.canvasRef.nativeElement;
     const dpr = window.devicePixelRatio || 1;
     canvas.width = window.innerWidth * dpr;
     canvas.height = window.innerHeight * dpr;
     this.ctx.scale(dpr, dpr);
     this.createParticles();
  }

  private createParticles(): void {
    this.particles = [];
    const particleCount = (window.innerWidth * window.innerHeight) / 10000;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5,
      });
    }
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

      this.drawParticle(p);
    });

    this.drawLines();
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private drawParticle(particle: Particle): void {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(236, 72, 153, 0.7)';
    this.ctx.fill();
  }

  private drawLines(): void {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

        if (dist < 150) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(168, 85, 247, ${1 - dist / 150})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }
}
