"use client";

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

import DialogueBox from '../../ui/DialogueBox';
import PixelButton from '../../ui/PixelButton';
import ProjectGallery from '../../ui/ProjectGallery';

/* ===== Spatial 3D HTML UI Overlay Component ===== */
export function SpatialHTMLUI({
  scrollProgress,
  formData,
  setFormData,
  status,
  handleSubmit,
  errorMessage,
  isAboutOpen,
  isSkillsOpen,
  setIsAboutOpen,
  setIsSkillsOpen,
  isStarted,
}: {
  scrollProgress: React.RefObject<number>;
  formData: any;
  setFormData: any;
  status: any;
  handleSubmit: any;
  errorMessage: any;
  isAboutOpen: boolean;
  isSkillsOpen: boolean;
  setIsAboutOpen: (val: boolean) => void;
  setIsSkillsOpen: (val: boolean) => void;
  isStarted?: boolean;
}) {
  const heroHtmlRef = useRef<HTMLDivElement>(null);
  const aboutPromptRef = useRef<HTMLDivElement>(null);
  const skillsPromptRef = useRef<HTMLDivElement>(null);
  const projectsHtmlRef = useRef<HTMLDivElement>(null);
  const contactHtmlRef = useRef<HTMLDivElement>(null);

  const { size } = useThree();
  const isMobile = size.width < 768;

  useFrame(() => {
    const sp = scrollProgress.current ?? 0;

    const getOpacity = (val: number, s: number, ps: number, pe: number, e: number) => {
      if (val < s || val > e) return 0;
      if (val >= ps && val <= pe) return 1;
      if (val < ps) return (val - s) / (ps - s);
      return (e - val) / (e - pe);
    };

    const oHero = getOpacity(sp, -0.1, 0.0, 0.1, 0.22);
    const oAbout = getOpacity(sp, 0.12, 0.22, 0.32, 0.42);
    const oSkills = getOpacity(sp, 0.35, 0.45, 0.55, 0.65);
    // Projects: align activation with camera waypoint (sp=0.75) — fade in 0.68-0.78, full 0.78-0.88
    const oProjects = getOpacity(sp, 0.68, 0.78, 0.82, 0.92);
    const oContact = getOpacity(sp, 0.82, 0.92, 1.0, 1.1);

    const updateEl = (ref: React.RefObject<HTMLDivElement | null>, opacity: number) => {
      if (!ref.current) return;
      ref.current.style.opacity = opacity.toString();
      if (opacity <= 0.01) {
        ref.current.style.visibility = 'hidden';
        ref.current.style.pointerEvents = 'none';
      } else {
        ref.current.style.visibility = 'visible';
        ref.current.style.pointerEvents = 'auto';
      }
    };

    // Toggle 3D interaction prompts
    updateEl(aboutPromptRef, !isAboutOpen ? oAbout : 0);
    updateEl(skillsPromptRef, !isSkillsOpen ? oSkills : 0);

    // Toggle standard cards
    updateEl(heroHtmlRef, oHero);
    updateEl(contactHtmlRef, oContact);

    // Toggle projects board with smooth CSS class transitions instead of raw inline opacity overrides
    if (projectsHtmlRef.current) {
      const isActive = oProjects > 0.01;
      if (isActive) {
        projectsHtmlRef.current.classList.add('active');
        projectsHtmlRef.current.style.pointerEvents = 'auto';
      } else {
        projectsHtmlRef.current.classList.remove('active');
        projectsHtmlRef.current.style.pointerEvents = 'none';
      }
    }
  });

  return (
    <group>
      {/* 1. Hero Card */}
      <Html
        transform
        pointerEvents="auto"
        position={[0, 1.8, 1]}
        distanceFactor={isMobile ? 2.0 : 3.5}
        zIndexRange={[100, 101]}
      >
        <div ref={heroHtmlRef} className="hero-box-billboard" style={{ transition: 'opacity 0.2s', width: isMobile ? '320px' : '480px', pointerEvents: 'auto' }}>
          <div 
            className="hero-box" 
            style={{ 
              willChange: 'transform, opacity',
              opacity: isStarted ? 1 : 0,
              animation: isStarted ? 'slideUpAction 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both' : 'none'
            }}
          >
            <div className="wave-text-wrapper">
              <h1 className="hero-title" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                {"FERDY AGUSTIAN".split(' ').map((word, wIdx) => (
                  <span key={wIdx} style={{ display: 'flex' }}>
                    {word.split('').map((char, index) => {
                      const letterIndex = wIdx === 0 ? index : 6 + index; // offset by length of first word plus space
                      return (
                        <span
                          key={index}
                          className="pixel-font wave-letter"
                          style={{ animationDelay: `${letterIndex * 0.05}s` }}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </h1>
            </div>
            <p className="vt323-font hero-subtitle">
              AI Enthusiast &nbsp;|&nbsp; CS UnderGraduate Student
            </p>
          </div>
          <div className="hero-scroll-arrow" style={{
            marginTop: '1.5rem',
            fontSize: '1.5rem',
            textAlign: 'center',
            color: 'var(--color-cream)',
            textShadow: '2px 2px 0px var(--color-black)',
          }}>
            <span style={{ display: 'inline-block', animation: 'bounce 2s infinite' }}>▼</span>
          </div>
        </div>
      </Html>

      {/* 2a. About Interactive Prompt */}
      <Html
        position={[-3.5, 1.4, -13.2]}
        transform
        distanceFactor={3.5}
        zIndexRange={[110, 111]}
      >
        <div
          ref={aboutPromptRef}
          className="pixel-font"
          style={{
            transition: 'opacity 0.2s',
            backgroundColor: 'rgba(10, 5, 2, 0.9)',
            color: '#ffbe5c',
            padding: '6px 14px',
            border: '2px solid #e67e22',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.6)',
            fontSize: '0.55rem',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            letterSpacing: '1px',
            animation: 'gachaBlinkPulse 1.4s ease-in-out infinite',
            userSelect: 'none',
            // Non-interactive: purely a visual hint. Click is handled by the 3D Campfire object.
            pointerEvents: 'none',
          }}
        >
          ✦ KLIK API UNGGUN UNTUK MELIHAT ABOUT ✦
        </div>
      </Html>

      {/* 3a. Skills Interactive Prompt */}
      <Html
        position={[4.0, 2.5, -28.8]}
        transform
        distanceFactor={3.5}
        zIndexRange={[110, 111]}
      >
        <div
          ref={skillsPromptRef}
          className="pixel-font"
          style={{
            transition: 'opacity 0.2s',
            backgroundColor: 'rgba(5, 10, 8, 0.95)',
            color: '#7dffb3',
            padding: '6px 14px',
            border: '2px solid #4ade80',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.6)',
            fontSize: '0.55rem',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            letterSpacing: '1px',
            animation: 'gachaBlinkPulse 1.4s ease-in-out infinite',
            userSelect: 'none',
            // Non-interactive: purely a visual hint. Click is handled by the 3D Bookshelf object.
            pointerEvents: 'none',
          }}
        >
          ✦ KLIK RAK BUKU UNTUK MELIHAT SKILL ✦
        </div>
      </Html>

      {/* 4. Projects (Quest Board HTML Billboard) - Precision Aligned */}
      <Html
        transform
        position={[0, 2.0, -44.9]}
        distanceFactor={isMobile ? 2.2 : 1.61}
        zIndexRange={[100, 101]}
      >
        <div
          ref={projectsHtmlRef}
          className="projects-board-billboard"
          style={{
            width: isMobile ? '380px' : '1000px',
            height: isMobile ? '560px' : '580px',
            pointerEvents: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <ProjectGallery />
        </div>
      </Html>

      {/* 5. Contact Card */}
      <Html
        transform
        position={[0, 5.8, -57.5]}
        rotation={[0.3, 0, 0]}
        distanceFactor={isMobile ? 2.8 : 3.5}
        zIndexRange={[100, 101]}
      >
        <div ref={contactHtmlRef} style={{ transition: 'opacity 0.2s', width: isMobile ? '360px' : '520px', pointerEvents: 'auto' }}>
          <DialogueBox title="Send a Message" className="contact-box" style={{ width: '100%' }}>
            <p style={{ marginBottom: '1rem', textAlign: 'center', fontSize: isMobile ? '1rem' : '0.9rem', lineHeight: 1.6 }}>
              Im more to be happy when i can make a good things for other people , so if you have a good things for me , just send a message!
            </p>
            <form style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '0.8rem' }} onSubmit={handleSubmit}>
              <div>
                <label className="pixel-font" style={{ fontSize: '0.65rem', color: 'var(--color-pixel-leaf)' }}>NAMA</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData((p: any) => ({ ...p, name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: isMobile ? '0.9rem' : '0.6rem', border: '2px solid var(--color-pixel-leaf)', backgroundColor: 'rgba(5, 5, 10, 0.65)', color: 'var(--color-cream)', outline: 'none', fontFamily: "'VT323', monospace", fontSize: '1.1rem' }}
                />
              </div>
              <div>
                <label className="pixel-font" style={{ fontSize: '0.65rem', color: 'var(--color-pixel-leaf)' }}>EMAIL</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData((p: any) => ({ ...p, email: e.target.value }))}
                  required
                  style={{ width: '100%', padding: isMobile ? '0.9rem' : '0.6rem', border: '2px solid var(--color-pixel-leaf)', backgroundColor: 'rgba(5, 5, 10, 0.65)', color: 'var(--color-cream)', outline: 'none', fontFamily: "'VT323', monospace", fontSize: '1.1rem' }}
                />
              </div>
              <div>
                <label className="pixel-font" style={{ fontSize: '0.65rem', color: 'var(--color-pixel-leaf)' }}>PESAN</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={e => setFormData((p: any) => ({ ...p, message: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '0.6rem', border: '2px solid var(--color-pixel-leaf)', backgroundColor: 'rgba(5, 5, 10, 0.65)', color: 'var(--color-cream)', outline: 'none', fontFamily: "'VT323', monospace", fontSize: '1.1rem', resize: 'vertical' }}
                />
              </div>
              <PixelButton type="submit" disabled={status === 'loading'} style={{ width: '100%', marginTop: '0.3rem', opacity: status === 'loading' ? 0.5 : 1 }}>
                {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
              </PixelButton>
              {status === 'success' && <p style={{ color: 'var(--color-moss-green)', fontSize: '1.1rem', textAlign: 'center', marginTop: '0.3rem', fontFamily: "'VT323', monospace" }}>Berhasil dikirim, terimakasih telah mengirim pesan! :D</p>}
              {status === 'error' && <p style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.3rem', fontFamily: "'VT323', monospace" }}>Gagal: {errorMessage}</p>}
            </form>
          </DialogueBox>
        </div>
      </Html>
    </group>
  );
}
