import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  color: string;
  life: number;
  decay: number;
}

interface ParticleBurstProps {
  width: number;
  height: number;
  origin: { x: number; y: number } | null;
}

export const ParticleBurst = ({ width, height, origin }: ParticleBurstProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--foreground))', 'hsl(var(--muted-foreground))'];

  const createParticle = useCallback((origin: { x: number; y: number }): Particle => ({
    x: origin.x,
    y: origin.y,
    size: Math.random() * 5 + 2,
    speed: Math.random() * 8 + 4,
    angle: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1,
    decay: Math.random() * 0.015 + 0.005,
  }), [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !origin) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = Array.from({ length: 200 }, () => createParticle(origin));
    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach((particle, index) => {
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        particle.speed *= 0.97;
        particle.life -= particle.decay;

        if (particle.life <= 0) {
          particles.splice(index, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [width, height, origin, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none z-50"
    />
  );
};