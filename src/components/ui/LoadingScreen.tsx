'use client';

import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { useTheme } from "../../providers/TimeThemeProvider";

const getThemeAccentColor = (theme: string) => {
  switch (theme) {
    case 'pagi': return '#fbbf24';
    case 'siang': return '#7dd3fc';
    case 'sore': return '#d8b4fe';
    case 'malam':
    default: return '#4ade80';
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

  const [simulatedProgress, setSimulatedProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedProgress((p) => {
        if (p >= 85) { clearInterval(interval); return 85; }
        return p + 5;
      });
    }, 100);
    const timeout = setTimeout(() => setSimulatedProgress(100), 8000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  const currentProgress = Math.max(progress, simulatedProgress);
  const isLoaded = currentProgress >= 100 || progress === 100;

  const handleStart = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => onStart(), 500);
    setTimeout(() => setIsVisible(false), 900);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={isLoaded && !isFading ? handleStart : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#0a0a0c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isLoaded ? 'pointer' : 'default',
        pointerEvents: isFading ? 'none' : 'auto',
        // Fade whole screen to black + very subtle zoom-in (feels like stepping into the world)
        opacity: isFading ? 0 : 1,
        transform: isFading ? 'scale(1.06)' : 'scale(1)',
        transition: isFading
          ? 'opacity 0.8s ease-in, transform 0.8s ease-in'
          : 'none',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes slime-hop {
          0%, 100% { transform: scale(0.8) translateY(0); }
          50% { transform: scale(0.8) translateY(-6px); }
        }
      `}</style>

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 'min(380px, 85vw)',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{
          color: '#e2e8f0',
          marginBottom: '5rem',
          letterSpacing: '0.08em',
          fontSize: '1rem',
          fontFamily: 'var(--font-sixtyfour), monospace',
          textTransform: 'uppercase',
        }}>
          Loading...
        </h2>

        {/* Progress bar */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '16px',
          border: `2px solid ${themeColor}`,
          padding: '2px',
          marginBottom: '0.8rem',
          boxShadow: `0 0 10px ${themeColor}33`,
        }}>
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: `calc(${isLoaded ? 100 : currentProgress}% - 16px)`,
            transition: 'left 0.3s ease-out',
          }}>
            <div className="pixel-slime-container" style={{ animation: 'slime-hop 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) infinite' }}>
              <div className="pixel-slime" />
              <div className="pixel-sword" />
            </div>
          </div>
          <div style={{
            height: '100%',
            backgroundColor: themeColor,
            width: `${isLoaded ? 100 : currentProgress}%`,
            transition: 'width 0.3s ease-out',
          }} />
        </div>

        {/* Status text */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          color: '#94a3b8',
          fontSize: '1.2rem',
          fontFamily: 'var(--font-vt323), monospace',
        }}>
          <span>{isLoaded ? 'DONE' : 'INITIALIZING'}</span>
          <span style={{ color: themeColor }}>
            {isLoaded ? '100%' : `${Math.floor(currentProgress)}%`}
          </span>
        </div>

        {/* Click to start prompt */}
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
            className={isLoaded ? 'animate-pulse' : ''}
            style={{
              color: themeColor,
              fontFamily: 'var(--font-sixtyfour), monospace',
              letterSpacing: '0.05em',
              fontSize: isMobile ? '0.45rem' : '0.55rem',
              textShadow: `0 0 12px ${themeColor}80`,
            }}
          >
            CLICK ANYWHERE TO START
          </span>
        </div>
      </div>
    </div>
  );
}
