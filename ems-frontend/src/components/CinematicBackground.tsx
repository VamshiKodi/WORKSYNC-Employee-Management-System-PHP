import React, { useEffect, useRef } from 'react';

const CinematicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let mouseVelocity = { x: 0, y: 0 };
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseVelocity.x = e.clientX - lastMouseX;
      mouseVelocity.y = e.clientY - lastMouseY;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Create explosion effect at mouse position
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const speed = Math.random() * 3 + 2;
        particles.push({
          x: mouseX,
          y: mouseY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 2,
          opacity: 1,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          type: 'star',
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          life: 1,
          maxLife: 1,
        });
      }
    };

    // Enhanced particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
      type: 'star' | 'hexagon' | 'diamond' | 'wave' | 'spiral';
      rotation: number;
      rotationSpeed: number;
      life: number;
      maxLife: number;
    }> = [];

    // Create initial particles
    const createParticles = () => {
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 6 + 3,
          opacity: Math.random() * 0.7 + 0.3,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          type: ['star', 'hexagon', 'diamond', 'wave', 'spiral'][Math.floor(Math.random() * 5)] as any,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          life: 1,
          maxLife: 1,
        });
      }
    };

    // Draw star
    const drawStar = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const x1 = Math.cos(angle) * size;
        const y1 = Math.sin(angle) * size;
        
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
        
        const innerAngle = angle + Math.PI / 5;
        const x2 = Math.cos(innerAngle) * (size * 0.4);
        const y2 = Math.sin(innerAngle) * (size * 0.4);
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw hexagon
    const drawHexagon = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const x1 = Math.cos(angle) * size;
        const y1 = Math.sin(angle) * size;
        
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw diamond
    const drawDiamond = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw wave
    const drawWave = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      for (let i = 0; i <= 20; i++) {
        const t = (i / 20) * 2 * Math.PI;
        const waveX = -size + (i / 20) * size * 2;
        const waveY = Math.sin(t * 3) * (size * 0.3);
        ctx.lineTo(waveX, waveY);
      }
      ctx.stroke();
      ctx.restore();
    };

    // Draw spiral
    const drawSpiral = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      for (let i = 0; i <= 50; i++) {
        const t = (i / 50) * Math.PI * 4;
        const spiralX = Math.cos(t) * (t * size * 0.1);
        const spiralY = Math.sin(t) * (t * size * 0.1);
        
        if (i === 0) ctx.moveTo(spiralX, spiralY);
        else ctx.lineTo(spiralX, spiralY);
      }
      ctx.stroke();
      ctx.restore();
    };

    // Draw particle
    const drawParticle = (particle: typeof particles[0]) => {
      ctx.save();
      ctx.globalAlpha = particle.opacity * particle.life;
      ctx.fillStyle = particle.color;
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 2;

      switch (particle.type) {
        case 'star':
          drawStar(particle.x, particle.y, particle.size, particle.rotation);
          break;
        case 'hexagon':
          drawHexagon(particle.x, particle.y, particle.size, particle.rotation);
          break;
        case 'diamond':
          drawDiamond(particle.x, particle.y, particle.size, particle.rotation);
          break;
        case 'wave':
          drawWave(particle.x, particle.y, particle.size, particle.rotation);
          break;
        case 'spiral':
          drawSpiral(particle.x, particle.y, particle.size, particle.rotation);
          break;
      }
      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      // Create gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.02)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        
        // Mouse attraction with quick response
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          const attractionStrength = 0.15; // Increased for quick response
          particle.vx += (dx / distance) * force * attractionStrength;
          particle.vy += (dy / distance) * force * attractionStrength;
          
          // Add some randomness for more dynamic movement
          particle.vx += (Math.random() - 0.5) * 0.5;
          particle.vy += (Math.random() - 0.5) * 0.5;
        }

        // Bounce off edges with energy loss
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.7;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.7;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Apply friction
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Update life
        particle.life -= 0.005;

        // Draw particle if still alive
        if (particle.life > 0.01) {
          drawParticle(particle);
        } else {
          particles.splice(i, 1);
        }
      }

      // Add new particles if needed
      if (particles.length < 60) {
        createParticles();
      }

      // Create connection lines between nearby particles
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 80) {
            ctx.globalAlpha = (80 - distance) / 80 * 0.3;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    // Initialize
    createParticles();
    canvas.addEventListener('mousemove', handleMouseMove);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Animated gradient background */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, #1a1a2e, #16213e, #0f3460, #533483)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
          zIndex: -2,
        }}
      />
      
      {/* Canvas for interactive particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

export default CinematicBackground; 