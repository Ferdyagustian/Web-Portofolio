'use client';

import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { useTheme } from "../../providers/TimeThemeProvider";

const getThemeAccentColor = (theme: string) => {
  switch (theme) {
    case 'pagi': return '#fbbf24'; // Golden Amber
    case 'siang': return '#7dd3fc'; // Sky Cyan (brighter for daylight feel)
    case 'sore': return '#d8b4fe'; // Sunset Lavender (higher contrast)
    case 'malam': 
    default: return '#4ade80'; // Neon Green
  }
};

interface LoadingScreenProps {
  onStart: () => void;
}

export function LoadingScreen({ onStart }: LoadingScreenProps) {
  const { progress } = useProgress();
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const theme = useTheme();
  const themeColor = getThemeAccentColor(theme);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fallback to auto-complete if progress gets stuck (common WebGL quirk)
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    // Drei's useProgress sometimes jumps or misses 100% on fast loads,
    // so we blend it with a simulated minimum progress.
    const interval = setInterval(() => {
      setSimulatedProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const currentProgress = Math.max(progress, simulatedProgress);
  const isLoaded = currentProgress >= 100 || progress === 100;

  const handleStart = () => {
    if (isFading) return; // Prevent double-click
    setIsFading(true);
    
    // CRITICAL: Wait for the CSS opacity fade-out to be visually complete
    // BEFORE triggering the heavy React 3D re-render via onStart().
    // Previously, onStart() fired after only ~33ms (2 rAF), blocking the
    // main thread and making the fade invisible (appeared as an instant jump).
    setTimeout(() => {
      onStart();
    }, 600); // Fire after 75% of the 0.8s transition — screen is nearly invisible

    setTimeout(() => {
      setIsVisible(false);
    }, 900); 
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={isLoaded ? handleStart : undefined}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        backgroundColor: '#0a0a0c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFading ? 0 : 1,
        transition: 'opacity 0.8s ease-in-out',
        pointerEvents: isFading ? 'none' : 'auto',
        cursor: isLoaded ? 'pointer' : 'default',
      }}
    >
      <style>{`
        @keyframes slime-hop {
          0%, 100% { transform: scale(0.8) translateY(0); }
          50% { transform: scale(0.8) translateY(-6px); }
        }
      `}</style>
      <div style={{ position: 'relative', width: '100%', maxWidth: 'min(380px, 85vw)', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Title — Sixtyfour for arcade "PRESS START" feel */}
        <h2 style={{ 
          color: '#e2e8f0', 
          marginBottom: '2rem', 
          letterSpacing: '0.08em', 
          fontSize: '0.7rem', 
          fontFamily: 'var(--font-sixtyfour), monospace',
          textTransform: 'uppercase'
        }}>
          Loading...
        </h2>

        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '16px', 
          border: `2px solid ${themeColor}`, 
          padding: '2px', 
          marginBottom: '0.8rem',
          boxShadow: `0 0 10px ${themeColor}33`
        }}>
          
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '16px', 
              left: `calc(${isLoaded ? 100 : currentProgress}% - 16px)`,
              transition: 'left 0.3s ease-out' 
            }}
          >
            <div className="pixel-slime-container" style={{ animation: 'slime-hop 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) infinite' }}>
              <div className="pixel-slime"></div>
              <div className="pixel-sword"></div>
            </div>
          </div>

          <div
            style={{
              height: '100%',
              backgroundColor: themeColor,
              width: `${isLoaded ? 100 : currentProgress}%`,
              transition: 'width 0.3s ease-out', 
            }}
          />
        </div>

        {/* Status Text & Percentage */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%', 
          color: '#94a3b8', 
          fontSize: '1.2rem', 
          fontFamily: 'var(--font-vt323), monospace',
        }}>
          <span>{isLoaded ? 'DONE' : 'INITIALIZING'}</span>
          <span style={{ color: themeColor }}>{isLoaded ? '100%' : `${Math.floor(currentProgress)}%`}</span>
        </div>

        {/* Enter Prompt — Sixtyfour for arcade CTA */}
        <div style={{ 
          marginTop: isMobile ? '3rem' : '4rem',
          height: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
        }}>
          <span 
            className={isLoaded ? "animate-pulse" : ""}
            style={{
              color: themeColor,
              fontFamily: 'var(--font-sixtyfour), monospace',
              letterSpacing: '0.05em',
              fontSize: isMobile ? '0.45rem' : '0.55rem',
              textShadow: `0 0 12px ${themeColor}80`
            }}
          >
            CLICK ANYWHERE TO START
          </span>
        </div>
      </div>
    </div>
  );
}
