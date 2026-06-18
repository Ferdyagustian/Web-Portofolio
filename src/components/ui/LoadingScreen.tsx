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

// Retro Pixel Art Icons using SVGs with shape-rendering: crispEdges
const SunIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 12 12" 
    fill="currentColor" 
    style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle', shapeRendering: 'crispEdges' }}
  >
    <rect x="4" y="4" width="4" height="4" />
    <rect x="5" y="1" width="2" height="1" />
    <rect x="5" y="10" width="2" height="1" />
    <rect x="1" y="5" width="1" height="2" />
    <rect x="10" y="5" width="1" height="2" />
    <rect x="2" y="2" width="1" height="1" />
    <rect x="9" y="2" width="1" height="1" />
    <rect x="2" y="9" width="1" height="1" />
    <rect x="9" y="9" width="1" height="1" />
  </svg>
);

const LightningIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 12 12" 
    fill="currentColor" 
    style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle', shapeRendering: 'crispEdges' }}
  >
    <path d="M7,1 H5 L3,6 H6 L5,11 L9,5 H6 L7,1 Z" />
  </svg>
);

const PotatoIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 12 12" 
    fill="currentColor" 
    style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle', shapeRendering: 'crispEdges' }}
  >
    <path d="M4,2 H8 V3 H10 V5 H11 V7 H10 V9 H8 V10 H4 V9 H2 V7 H1 V5 H2 V3 H4 Z" />
    <rect x="4" y="4" width="1" height="1" fill="#000" opacity="0.35" />
    <rect x="7" y="7" width="1" height="1" fill="#000" opacity="0.35" />
    <rect x="8" y="4" width="1" height="1" fill="#000" opacity="0.35" />
  </svg>
);

interface LoadingScreenProps {
  onStart: (mode: 'normal' | 'light' | 'potato') => void;
}

export function LoadingScreen({ onStart }: LoadingScreenProps) {
  const { progress } = useProgress();
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'normal' | 'light' | 'potato'>('normal');
  const theme = useTheme();
  const themeColor = getThemeAccentColor(theme);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const visited = sessionStorage.getItem('visited_home');
    if (visited) {
      setIsReturning(true);
      setSimulatedProgress(100);
    }
  }, []);

  useEffect(() => {
    if (isReturning) return;
    const interval = setInterval(() => {
      setSimulatedProgress((p) => {
        if (p >= 85) { clearInterval(interval); return 85; }
        return p + 5;
      });
    }, 100);
    const timeout = setTimeout(() => setSimulatedProgress(100), 8000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [isReturning]);

  const currentProgress = Math.max(progress, simulatedProgress);
  const isLoaded = currentProgress >= 100 || progress === 100;

  const [dots, setDots] = useState('...');
  useEffect(() => {
    if (isLoaded) return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [isLoaded]);

  const handleStart = React.useCallback((e?: React.MouseEvent) => {
    if (e && (e.target as HTMLElement).closest('.performance-toggle')) return;
    if (isFading) return;
    setIsFading(true);
    
    // Save preference when starting
    sessionStorage.setItem('visited_home', 'true');
    sessionStorage.setItem('performanceMode', performanceMode);
    
    setTimeout(() => onStart(performanceMode), 150);
    setTimeout(() => setIsVisible(false), 400);
  }, [isFading, onStart, performanceMode]);

  useEffect(() => {
    if (isLoaded && isReturning && !isFading) {
      const savedMode = (sessionStorage.getItem('performanceMode') as 'normal' | 'light' | 'potato') || 'normal';
      setPerformanceMode(savedMode);
      setIsFading(true);
      setTimeout(() => onStart(savedMode), 150);
      setTimeout(() => setIsVisible(false), 400);
    }
  }, [isLoaded, isReturning, isFading, onStart]);

  if (!isVisible) return null;

  return (
    <div
      onClick={isLoaded && !isFading ? handleStart : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#070709',
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
      {/* CRT Scanline Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.22) 50%)',
        backgroundSize: '100% 4px',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Radial Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, transparent 20%, rgba(0, 0, 0, 0.8) 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes slime-hop {
          0%, 100% { transform: scale(0.8) translateY(0); }
          50% { transform: scale(0.8) translateY(-6px); }
        }
        @keyframes arcade-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.2; }
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
        zIndex: 5,
      }}>
        <h2 style={{
          color: '#e2e8f0',
          marginBottom: '5rem',
          letterSpacing: '0.08em',
          fontSize: '1rem',
          fontFamily: 'var(--font-sixtyfour), monospace',
          textTransform: 'uppercase',
          textShadow: '2px 2px 0px #000',
        }}>
          Loading{isLoaded ? '...' : dots}
        </h2>

        {/* Progress bar */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '18px',
          border: `4px solid ${themeColor}`,
          padding: '2px',
          marginBottom: '1rem',
          boxShadow: `4px 4px 0px #000000`,
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
        {!isReturning && (
          <div style={{
            marginTop: isMobile ? '3rem' : '4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          }}>
            {/* Segmented Control for Performance Modes */}
            <div 
              className="performance-toggle pixel-font"
              style={{
                display: 'flex',
                gap: '4px',
                backgroundColor: '#111827',
                padding: '6px',
                borderRadius: '0px',
                border: '2px solid #374151',
                boxShadow: '4px 4px 0px #000000',
                userSelect: 'none',
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setPerformanceMode('normal'); }}
                style={{
                  background: performanceMode === 'normal' ? 'linear-gradient(135deg, #4ade8022, transparent)' : 'transparent',
                  color: performanceMode === 'normal' ? '#4ade80' : '#64748b',
                  border: `2px solid ${performanceMode === 'normal' ? '#4ade80' : 'transparent'}`,
                  borderRadius: '0px',
                  padding: '8px 14px',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s steps(2)',
                  textShadow: performanceMode === 'normal' ? '0 0 8px rgba(74, 222, 128, 0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SunIcon /> Normal
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPerformanceMode('light'); }}
                style={{
                  background: performanceMode === 'light' ? 'linear-gradient(135deg, #60a5fa22, transparent)' : 'transparent',
                  color: performanceMode === 'light' ? '#60a5fa' : '#64748b',
                  border: `2px solid ${performanceMode === 'light' ? '#60a5fa' : 'transparent'}`,
                  borderRadius: '0px',
                  padding: '8px 14px',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s steps(2)',
                  textShadow: performanceMode === 'light' ? '0 0 8px rgba(96, 165, 250, 0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LightningIcon /> Light
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPerformanceMode('potato'); }}
                style={{
                  background: performanceMode === 'potato' ? 'linear-gradient(135deg, #fbbf2422, transparent)' : 'transparent',
                  color: performanceMode === 'potato' ? '#fbbf24' : '#64748b',
                  border: `2px solid ${performanceMode === 'potato' ? '#fbbf24' : 'transparent'}`,
                  borderRadius: '0px',
                  padding: '8px 14px',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s steps(2)',
                  textShadow: performanceMode === 'potato' ? '0 0 8px rgba(251, 191, 36, 0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PotatoIcon /> Ultra Potato
              </button>
            </div>

            <span
              style={{
                color: themeColor,
                fontFamily: 'var(--font-sixtyfour), monospace',
                letterSpacing: '0.05em',
                fontSize: isMobile ? '0.45rem' : '0.55rem',
                textShadow: `0 0 12px ${themeColor}80`,
                animation: isLoaded ? 'arcade-blink 1.0s steps(1) infinite' : 'none',
              }}
            >
              CLICK ANYWHERE TO START
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
