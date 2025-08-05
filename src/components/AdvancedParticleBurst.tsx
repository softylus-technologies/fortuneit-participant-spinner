import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'sparkle' | 'firework' | 'confetti' | 'star';
  rotation: number;
  rotationSpeed: number;
}

interface AdvancedParticleBurstProps {
  width: number;
  height: number;
  origin: { x: number; y: number } | null;
  intensity?: 'low' | 'medium' | 'high' | 'epic';
}

export const AdvancedParticleBurst = ({ width, height, origin, intensity = 'high' }: AdvancedParticleBurstProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const particleConfig = useMemo(() => {
    switch (intensity) {
      case 'low': return { count: 50, duration: 2000 };
      case 'medium': return { count: 100, duration: 3000 };
      case 'high': return { count: 200, duration: 4000 };
      case 'epic': return { count: 500, duration: 6000 };
      default: return { count: 200, duration: 4000 };
    }
  }, [intensity]);

  const colors = [
    '#FFC000', '#FCD535', '#FFE55C', '#FFFFFF',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
  ];

  const createParticle = useCallback((origin: { x: number; y: number }): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    const life = Math.random() * 120 + 60;
    
    return {
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 8 + 2,
      life,
      maxLife: life,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: (['sparkle', 'firework', 'confetti', 'star'] as const)[Math.floor(Math.random() * 4)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    };
  }, [colors]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    const alpha = particle.life / particle.maxLife;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    
    switch (particle.type) {
      case 'sparkle':
        // Diamond sparkle
        ctx.beginPath();
        ctx.moveTo(0, -particle.size);
        ctx.lineTo(particle.size * 0.3, 0);
        ctx.lineTo(0, particle.size);
        ctx.lineTo(-particle.size * 0.3, 0);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'firework':
        // Plus sign burst
        ctx.fillRect(-particle.size, -particle.size * 0.2, particle.size * 2, particle.size * 0.4);
        ctx.fillRect(-particle.size * 0.2, -particle.size, particle.size * 0.4, particle.size * 2);
        break;
        
      case 'confetti':
        // Rectangle confetti
        ctx.fillRect(-particle.size * 0.5, -particle.size * 0.8, particle.size, particle.size * 1.6);
        break;
        
      case 'star':
        // 5-pointed star
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? particle.size : particle.size * 0.4;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }, []);

  useEffect(() => {
    if (!origin || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    
    // Create initial burst
    for (let i = 0; i < particleConfig.count; i++) {
      particles.push(createParticle(origin));
    }
    
    // Add continuous sparkles for epic mode
    let sparkleInterval: NodeJS.Timeout | null = null;
    if (intensity === 'epic') {
      sparkleInterval = setInterval(() => {
        for (let i = 0; i < 10; i++) {
          const sparkleOrigin = {
            x: origin.x + (Math.random() - 0.5) * 100,
            y: origin.y + (Math.random() - 0.5) * 100
          };
          particles.push(createParticle(sparkleOrigin));
        }
      }, 200);
    }

    let animationFrameId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98; // Air resistance
        particle.vy += 0.2; // Gravity
        particle.life--;
        particle.rotation += particle.rotationSpeed;
        
        // Remove dead particles
        if (particle.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        
        drawParticle(ctx, particle);
      }
      
      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    // Cleanup after duration
    const cleanup = setTimeout(() => {
      if (sparkleInterval) clearInterval(sparkleInterval);
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, width, height);
    }, particleConfig.duration);
    
    return () => {
      if (sparkleInterval) clearInterval(sparkleInterval);
      clearTimeout(cleanup);
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, origin, intensity, particleConfig, createParticle, drawParticle]);

  if (!origin) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};