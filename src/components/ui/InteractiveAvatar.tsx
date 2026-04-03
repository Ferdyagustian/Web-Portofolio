"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import Avatar3DCanvas from "../three/Avatar3DCanvas";
import PixelButton from "./PixelButton";

export default function InteractiveAvatar() {
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div 
        className="about-avatar-interactive"
        onClick={() => setIs3DModalOpen(true)}
        style={{
          width: '140px', flexShrink: 0,
          backgroundColor: 'var(--color-moss-green)',
          border: '4px solid var(--color-forest-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          zIndex: 2,
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animation = 'scaredShake 0.3s infinite';
          e.currentTarget.style.boxShadow = '8px 12px 0px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animation = 'none';
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,0,0,0.5)';
        }}
      >
        <Image 
          src="/pixel_avatar_profile.png" 
          width={140} 
          height={140} 
          style={{ imageRendering: 'pixelated', objectFit: 'cover', display: 'block' }} 
          alt="Ferdy Agustian" 
          priority
        />
        {/* Gacha click label */}
        <div style={{
          width: '100%',
          background: 'rgba(0,0,0,0.75)',
          borderTop: '2px solid var(--color-moss-green)',
          textAlign: 'center',
          padding: '4px 2px',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-pixelify), monospace',
            fontSize: '0.48rem',
            color: '#7dffb3',
            letterSpacing: '0.05em',
            textShadow: '0 0 6px #4ade80',
            animation: 'gachaBlinkPulse 1.4s ease-in-out infinite',
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}>✦ KLIK UNTUK GACHA ✦</span>
        </div>
      </div>

      {is3DModalOpen && mounted && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          {/* Close Button */}
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
            <PixelButton onClick={() => setIs3DModalOpen(false)} style={{ padding: '0.5rem 1rem' }}>
              X KEMBALI
            </PixelButton>
          </div>
          
          {/* Subtle instruction text */}
          <div style={{ position: 'absolute', top: '5rem', zIndex: 5, color: 'var(--color-cream)', textShadow: '2px 2px 0px var(--color-black)', opacity: 0.8, textAlign: 'center' }}>
            <h3 className="pixel-font" style={{ fontSize: '1.5rem', animation: 'pulse 2s infinite' }}>[SERET/DRAG UNTUK MEMUTAR]</h3>
          </div>

          <div style={{ width: '100%', height: '80%', position: 'relative' }}>
            <Avatar3DCanvas />
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes pulse {
              0%, 100% { opacity: 0.8; }
              50% { opacity: 0.3; }
            }
          `}} />
        </div>,
        document.body
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scaredShake {
          0% { transform: translateY(-4px) scale(1.05) translate(1px, 1px) rotate(0deg); }
          10% { transform: translateY(-4px) scale(1.05) translate(-1px, -2px) rotate(-2deg); }
          20% { transform: translateY(-4px) scale(1.05) translate(-2px, 0px) rotate(2deg); }
          30% { transform: translateY(-4px) scale(1.05) translate(2px, 2px) rotate(0deg); }
          40% { transform: translateY(-4px) scale(1.05) translate(1px, -1px) rotate(2deg); }
          50% { transform: translateY(-4px) scale(1.05) translate(-1px, 2px) rotate(-2deg); }
          60% { transform: translateY(-4px) scale(1.05) translate(-2px, 1px) rotate(0deg); }
          70% { transform: translateY(-4px) scale(1.05) translate(2px, 1px) rotate(-2deg); }
          80% { transform: translateY(-4px) scale(1.05) translate(-1px, -1px) rotate(2deg); }
          90% { transform: translateY(-4px) scale(1.05) translate(1px, 2px) rotate(0deg); }
          100% { transform: translateY(-4px) scale(1.05) translate(1px, -2px) rotate(-2deg); }
        }
        @keyframes gachaBlinkPulse {
          0%, 100% { opacity: 1; text-shadow: 0 0 6px #4ade80, 0 0 12px #4ade80; }
          50%       { opacity: 0.45; text-shadow: 0 0 2px #4ade80; }
        }
      `}} />
    </>
  );
}
