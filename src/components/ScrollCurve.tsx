"use client";

import React, { useEffect, useRef } from 'react';

export default function ScrollCurve() {
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current || !pathRef.current) return;
          
          const rect = containerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // Calculate how far the element is into the viewport
          // When rect.top == windowHeight (just entering), progress is 0
          // When rect.top == 0 (at the top), progress is 1
          let progress = 1 - (rect.top / windowHeight);
          
          if (progress < 0) progress = 0;
          if (progress > 1) progress = 1;
          
          // Max curve (hill pointing up) is 0, flat is 600.
          const curveValue = progress * 600; 
          
          pathRef.current.setAttribute(
            "d",
            `M 800 600 Q 400 ${curveValue} 0 600 L 0 900 L 800 900 Z`
          );
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial call to set the correct shape on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="scroll-curve-container" 
      style={{ 
        width: '100%',
        height: '100%', 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        zIndex: 0, 
        pointerEvents: 'none',
        lineHeight: 0
      }}
    >
      <svg 
        viewBox="0 0 800 900" 
        preserveAspectRatio="none" 
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <path ref={pathRef} fill="var(--accent)" d="M 800 300 Q 400 900 0 300 L 0 0 L 800 0 L 800 300 Z" />
      </svg>
    </div>
  );
}
