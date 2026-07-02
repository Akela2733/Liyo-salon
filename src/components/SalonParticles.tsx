"use client";

import React, { useEffect, useRef, useState } from 'react';

// Minimal luxury line-art SVGs for salon tools
const ICONS = [
  <svg key="scissors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>,
  <svg key="comb" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="20" height="8" rx="1"></rect><line x1="4" y1="16" x2="4" y2="18"></line><line x1="8" y1="16" x2="8" y2="18"></line><line x1="12" y1="16" x2="12" y2="18"></line><line x1="16" y1="16" x2="16" y2="18"></line><line x1="20" y1="16" x2="20" y2="18"></line></svg>,
  <svg key="spray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 10h-4v10a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V10Z"></path><path d="M12 10V6"></path><path d="M12 6c-2 0-3-1-3-3h6c0 2-1 3-3 3Z"></path><path d="M15 6h4"></path></svg>,
  <svg key="dryer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 9V5a2 2 0 0 0-2-2H9L3 6v6l6 3v2a4 4 0 0 0 8 0v-2h4Z"></path><path d="M9 15v3a2 2 0 0 0 2 2h2"></path></svg>,
  <svg key="star" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M2 12h20"></path><path d="m4.9 4.9 14.2 14.2"></path><path d="m4.9 19.1 14.2-14.2"></path></svg>
];

interface ParticleData {
  id: number;
  icon: React.ReactNode;
  offsetX: number;
  offsetY: number;
  speed: number;
}

export default function SalonParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    const newParticles: ParticleData[] = [];
    // Create a massive swarm of 80 icons to match the Antigravity density
    for (let i = 0; i < 80; i++) {
      newParticles.push({ 
        id: i, 
        icon: ICONS[Math.floor(Math.random() * ICONS.length)],
        // Much wider spread for a large cloud effect
        offsetX: (Math.random() - 0.5) * 400, 
        offsetY: (Math.random() - 0.5) * 400,
        // Staggered following speed for organic fluid movement
        speed: 0.04 + Math.random() * 0.08 
      });
    }
    
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !container.parentElement || particles.length === 0) return;
    const parent = container.parentElement;

    let reqId: number;
    let mouseX = parent.offsetWidth / 2;
    let mouseY = parent.offsetHeight / 2;
    let isHovering = false;

    // Track current physical position of each particle
    const currentPositions = particles.map(() => ({ 
      x: mouseX, 
      y: mouseY, 
      angle: 0 
    }));

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    const animate = () => {
      const elements = container.getElementsByClassName('particle-icon');
      
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const p = particles[i];
        if (!p || !currentPositions[i]) continue;

        const pos = currentPositions[i];
        
        // Target position is the mouse + the particle's unique offset in the pack
        const targetX = mouseX + p.offsetX;
        const targetY = mouseY + p.offsetY;

        // Easing towards the target
        const dx = targetX - pos.x;
        const dy = targetY - pos.y;
        
        pos.x += dx * p.speed;
        pos.y += dy * p.speed;
        
        // Rotate to face the direction of movement
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          pos.angle = Math.atan2(dy, dx) * (180 / Math.PI);
        }

        // Apply styles directly for 60fps performance
        el.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.angle}deg)`;
        el.style.opacity = isHovering ? "1" : "0";
      }
      
      reqId = requestAnimationFrame(animate);
    };

    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);
    reqId = requestAnimationFrame(animate);

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(reqId);
    };
  }, [particles]);

  if (!isClient) return null;

  return (
    <div 
      ref={containerRef} 
      className="salon-particles-container"
      style={{ 
        position: 'absolute', 
        inset: 0, 
        pointerEvents: 'none', 
        zIndex: 0 
      }}
      aria-hidden="true"
    >
      {particles.map(p => (
        <div 
          key={p.id} 
          className="particle-icon"
          style={{
            position: 'absolute',
            left: -12, top: -12, 
            width: '24px', height: '24px',
            opacity: 0, 
            transition: 'opacity 0.4s ease', 
            color: 'var(--paper)' // White accent color for high visibility against red background
          }}
        >
          {p.icon}
        </div>
      ))}
    </div>
  );
}
