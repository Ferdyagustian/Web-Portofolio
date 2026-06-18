"use client";

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Pixelation } from '@react-three/postprocessing';
import { useLenis } from 'lenis/react';
import { TimeTheme } from '../../lib/useTimeTheme';
import { THEME_CONFIGS } from '../../lib/themeConfig';

import DialogueBox from '../ui/DialogueBox';
import PixelCard from '../ui/PixelCard';
import ObservableSkill from '../ui/ObservableSkill';
import PixelButton from '../ui/PixelButton';
import InteractiveAvatar from '../ui/InteractiveAvatar';
import { LoadingScreen } from '../ui/LoadingScreen';
import { useAudio } from '../../providers/AudioProvider';

// Import split components
import { SkyDome, DynamicSky, CelestialBody, DynamicClouds } from './environment/Sky';
import { InteractiveFog, SceneController } from './environment/Effects';
import { Trees, GroundBushes, FallingLeaves, Fireflies, Ground } from './environment/Nature';
import { Campfire, QuestBoardStand, WorkshopDecorations, Bookshelf } from './environment/Props';
import { CameraRig } from './environment/CameraRig';
import { SpatialHTMLUI } from './environment/SpatialUI';

interface PixelForestProps {
  theme: TimeTheme;
  mousePosRef?: React.RefObject<{ x: number; y: number }>;
  formData: { name: string; email: string; message: string };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; email: string; message: string }>>;
  status: 'idle' | 'loading' | 'success' | 'error';
  handleSubmit: (e: React.FormEvent) => void;
  errorMessage: string;
  onQuestNavigate?: (slug: string) => void;
}

export default function PixelForest({
  theme,
  mousePosRef,
  formData,
  setFormData,
  status,
  handleSubmit,
  errorMessage,
  onQuestNavigate,
}: PixelForestProps) {
  const defaultRef = useRef({ x: 0, y: 0 });
  const effectiveRef = mousePosRef ?? defaultRef;
  const cfg = THEME_CONFIGS[theme];
  // containerRef is passed to Canvas as eventSource so that R3F raycasting
  // fires from the full wrapper div — not blocked by Drei Html overlay divs
  const containerRef = useRef<HTMLDivElement>(null);

  let playSfx: any = () => {};
  try { playSfx = useAudio().playSfx; } catch {}

  const scrollProgress = useRef(0);
  const lenis = useLenis();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'normal' | 'light' | 'potato'>('normal');
  const scrollToTopBtnRef = useRef<HTMLButtonElement>(null);
  const sectionDotsRef = useRef<HTMLElement>(null);
  
  const SECTIONS = ['hero', 'about', 'skills', 'projects', 'contact'] as const;
  const SECTION_SCROLL_TARGETS: Record<typeof SECTIONS[number], string> = {
    hero: '#hero',
    about: '#about',
    skills: '#skills',
    projects: '#projects',
    contact: '#contact',
  };

  // Initialize scroll progress immediately on mount based on current scroll position (useful when loading via hash)
  useEffect(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      scrollProgress.current = window.scrollY / maxScroll;
    }
  }, []);

  // Synchronize scroll and camera position to location hash on load/start
  useEffect(() => {
    if (!lenis || !isStarted) return;

    const handleInitialHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          // Small delay to make sure DOM nodes are fully positioned and loading screen is fading
          const timer = setTimeout(() => {
            lenis.scrollTo(hash, {
              offset: 0,
              duration: 1.0,
              lock: false,
              immediate: true, // Snap instantly so camera starts at the correct position
            });

            // Re-sync scrollProgress ref immediately
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll > 0) {
              scrollProgress.current = window.scrollY / maxScroll;
            }
          }, 80);
          return () => clearTimeout(timer);
        }
      }
    };

    handleInitialHash();
    
    // Also listen to hashchange event (Navbar clicks or manual URL changes)
    window.addEventListener('hashchange', handleInitialHash);
    return () => window.removeEventListener('hashchange', handleInitialHash);
  }, [lenis, isStarted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (performanceMode === 'potato') {
        document.body.setAttribute('data-potato', 'true');
      } else {
        document.body.removeAttribute('data-potato');
      }
    }
  }, [performanceMode]);

  // P4: Detect prefers-reduced-motion accessibility preference
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const sp = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      scrollProgress.current = sp;

      // Show scroll-to-top button after 30% scroll
      if (scrollToTopBtnRef.current) {
        if (sp > 0.3) {
          scrollToTopBtnRef.current.classList.add('visible');
        } else {
          scrollToTopBtnRef.current.classList.remove('visible');
        }
      }

      // Section boundary matching (same as interpolateWaypoints)
      let section: 'hero' | 'about' | 'skills' | 'projects' | 'contact' = 'hero';
      if (sp >= 0.12 && sp <= 0.42) {
        section = 'about';
      } else if (sp > 0.42 && sp <= 0.65) {
        section = 'skills';
      } else if (sp > 0.65 && sp <= 0.88) {
        section = 'projects';
      } else if (sp > 0.88) {
        section = 'contact';
      }

      // Update section dots without triggering React state re-render
      if (sectionDotsRef.current) {
        const dots = sectionDotsRef.current.children;
        SECTIONS.forEach((sec, idx) => {
          if (dots[idx]) {
            if (sec === section) {
              dots[idx].classList.add('active');
            } else {
              dots[idx].classList.remove('active');
            }
          }
        });
      }

      // Auto close overlays when scrolling away from their respective section
      if (sp < 0.12 || sp > 0.42) {
        setIsAboutOpen(false);
      }
      if (sp < 0.35 || sp > 0.65) {
        setIsSkillsOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock body scroll when overlay is open for maximum reading comfort
  useEffect(() => {
    if (isAboutOpen || isSkillsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAboutOpen, isSkillsOpen]);

  // Scroll-to-top handler
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'auto' }}>
      <Canvas 
        dpr={performanceMode === 'potato' ? [0.5, 0.75] : performanceMode === 'light' ? [1, 1.2] : [1, 1.5]} 
        eventSource={containerRef as React.RefObject<HTMLElement>} 
        eventPrefix="client"
      >
        <color attach="background" args={[cfg.bgColor]} />
        <fog attach="fog" args={[cfg.fogColor, cfg.fogNear, cfg.fogFar]} />
        {performanceMode === 'normal' && <InteractiveFog theme={theme} scrollProgress={scrollProgress} reducedMotion={prefersReducedMotion} isStarted={isStarted} />}

        <CameraRig mousePosRef={effectiveRef} scrollProgress={scrollProgress} />
        <SceneController theme={theme} />

        {/* Sky Elements — Locked to camera Z to simulate infinite distance */}
        <SkyDome>
          {/* Sky background */}
          <DynamicSky theme={theme} />

          {/* Celestial body (Sun/Moon) */}
          <CelestialBody theme={theme} />
        </SkyDome>

        {/* Clouds - Outside SkyDome so they exhibit parallax scrolling */}
        {performanceMode !== 'potato' && <DynamicClouds theme={theme} performanceMode={performanceMode} />}

        {/* Ground */}
        <Ground theme={theme} />

        {/* Nature Waypoint Decorations */}
        <Campfire position={[-3.5, 0, -13.2]} onClick={() => { setIsAboutOpen(true); }} playSfx={playSfx} />
        <WorkshopDecorations position={[2.8, 0, -27.6]} />
        <Bookshelf position={[4.0, 0, -28.8]} onClick={() => { setIsSkillsOpen(true); }} playSfx={playSfx} />
        <QuestBoardStand position={[0, 0, -45]} />

        {/* Nature */}
        <Trees theme={theme} performanceMode={performanceMode} />
        {performanceMode !== 'potato' && (
          <>
            <GroundBushes theme={theme} performanceMode={performanceMode} />
            <FallingLeaves theme={theme} performanceMode={performanceMode} />
            <Fireflies theme={theme} performanceMode={performanceMode} />
          </>
        )}

        {/* Spatial HTML Overlay Content */}
        <SpatialHTMLUI
          scrollProgress={scrollProgress}
          formData={formData}
          setFormData={setFormData}
          status={status}
          handleSubmit={handleSubmit}
          errorMessage={errorMessage}
          isAboutOpen={isAboutOpen}
          isSkillsOpen={isSkillsOpen}
          setIsAboutOpen={setIsAboutOpen}
          setIsSkillsOpen={setIsSkillsOpen}
          isStarted={isStarted}
          playSfx={playSfx}
          onQuestNavigate={onQuestNavigate}
          performanceMode={performanceMode}
        />

        {performanceMode === 'normal' && (
          <EffectComposer multisampling={0}>
            <Pixelation granularity={5} />
          </EffectComposer>
        )}
      </Canvas>

      {mounted && createPortal(
        <>
          {/* About Modal */}
          <div className={`fullscreen-overlay-modal ${isAboutOpen ? 'is-open' : ''}`} onClick={() => setIsAboutOpen(false)}>
            <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()} data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
              {/* Close Button */}
              <button
                className="modal-close-btn pixel-font"
                onClick={(e) => { e.stopPropagation(); setIsAboutOpen(false); }}
                aria-label="Close About panel"
              >
                ×
              </button>
              <div className="modal-containerless-panel">
                <DialogueBox title="Ferdy Agustian Prasetyo">
                  <div className="about-content" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start' }}>
                    <div style={{ transform: isMobile ? 'scale(0.85)' : 'none', transformOrigin: 'center top', marginBottom: isMobile ? '-1.5rem' : '0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <InteractiveAvatar isOpen={isAboutOpen} playSfx={playSfx} />
                      {!isMobile && (
                        <div className="about-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '2rem', width: '100%', padding: '0 10px' }}>
                          <PixelButton
                            href="https://github.com/Ferdyagustian"
                            target="_blank"
                            rel="noreferrer"
                            variant="secondary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem' }}
                          >
                            <span className="pixel-font" style={{ fontSize: '0.6rem' }}>[GH]</span> GitHub
                          </PixelButton>
                          <PixelButton
                            href="https://www.linkedin.com/in/ferdy-agustian-5a3521247/"
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem' }}
                          >
                            <span className="pixel-font" style={{ fontSize: '0.6rem' }}>[IN]</span> LinkedIn
                          </PixelButton>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: '1', minWidth: '250px', maxWidth: isMobile ? '100%' : '60ch', paddingLeft: isMobile ? '0' : '2rem', paddingRight: '1rem', maxHeight: isMobile ? '65vh' : '55vh', overflowY: 'auto' }} className="custom-scrollbar-container" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
                      <p style={{ marginBottom: '1.2rem', fontSize: isMobile ? '1.05rem' : '1.1rem', lineHeight: '1.8' }}>
                        <span style={{ color: 'var(--color-accent, #ffd700)', fontWeight: 'bold', fontSize: '1.15rem' }}>Hello! (こんにちは!)</span> I am Ferdy Agustian Prasetyo, a final-year undergraduate student at <strong style={{ color: '#7dffb3' }}>Universitas Gunadarma</strong>.
                      </p>
                      <p style={{ marginBottom: '1.2rem', fontSize: isMobile ? '1.05rem' : '1.1rem', lineHeight: '1.8' }}>
                        I have a profound passion for <strong style={{ color: '#7dffb3' }}>Artificial Intelligence</strong> and <strong style={{ color: '#7dffb3' }}>Software Development</strong>, driven by a continuous desire to solve complex problems through code. I thrive on combining precise logic and creative design to build scalable applications that are not only visually engaging but also functionally impactful.
                      </p>
                      <p style={{ marginBottom: '1.2rem', fontSize: isMobile ? '1.05rem' : '1.1rem', lineHeight: '1.8' }}>
                        My technical journey spans across architecting robust <strong style={{ color: '#7dffb3' }}>backend systems</strong>, implementing advanced <strong style={{ color: '#7dffb3' }}>data security</strong> logic, and fine-tuning <strong style={{ color: '#7dffb3' }}>machine learning models</strong> to extract meaningful insights. Beyond just writing code, I am deeply committed to <em style={{ color: '#ffd700' }}>software quality</em> and <em style={{ color: '#ffd700' }}>structural integrity</em>. Whether I am conducting rigorous system testing, managing relational databases, or crafting interactive user interfaces, my ultimate goal is to deliver secure, flawless, and user-centric digital experiences.
                      </p>
                      <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.7', color: 'rgba(255, 255, 255, 0.85)' }}>
                        <em style={{ borderLeft: '3px solid #ffd700', paddingLeft: '10px', display: 'block' }}>I believe that the best products are built at the intersection of innovative algorithms and meticulous engineering. </em>
                      </p>
                      {isMobile && (
                        <div className="about-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                          <PixelButton
                            href="https://github.com/Ferdyagustian"
                            target="_blank"
                            rel="noreferrer"
                            variant="secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <span className="pixel-font" style={{ fontSize: '0.6rem' }}>[GH]</span> GitHub
                          </PixelButton>
                          <PixelButton
                            href="https://www.linkedin.com/in/ferdy-agustian-5a3521247/"
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <span className="pixel-font" style={{ fontSize: '0.6rem' }}>[IN]</span> LinkedIn
                          </PixelButton>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogueBox>
              </div>
            </div>
          </div>

          {/* Skills Modal */}
          <div className={`fullscreen-overlay-modal ${isSkillsOpen ? 'is-open' : ''}`} onClick={() => setIsSkillsOpen(false)}>
            <div className="modal-content-wrapper skills-modal-wrapper" onClick={(e) => e.stopPropagation()} data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
              {/* Close Button */}
              <button
                className="modal-close-btn pixel-font"
                onClick={(e) => { e.stopPropagation(); setIsSkillsOpen(false); }}
                aria-label="Close Skills panel"
              >
                ×
              </button>
              <div className="modal-containerless-panel">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h2 className="pixel-font" style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', color: 'var(--color-cream)', textShadow: '3px 3px 0px var(--color-black)' }}>
                    WORKSHOP // SKILLS
                  </h2>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                  gap: isMobile ? '0.8rem' : '1.2rem',
                  width: '100%'
                }}>
                  <PixelCard title="Frontend">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <ObservableSkill name="HTML/CSS/JS" rank="A" percentage={85} iconColor="#e34c26" />
                      <ObservableSkill name="React / Next.js" rank="S" percentage={95} iconColor="#61dafb" />
                      <ObservableSkill name="WebGL / Three.js" rank="B" percentage={70} iconColor="#88ce02" />
                    </div>
                  </PixelCard>
                  <PixelCard title="Backend">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <ObservableSkill name="Node.js" rank="S" percentage={90} iconColor="#339933" />
                      <ObservableSkill name="Python" rank="A" percentage={80} iconColor="#3776ab" />
                      <ObservableSkill name="Java" rank="B" percentage={75} iconColor="#5382a1" />
                    </div>
                  </PixelCard>
                  <PixelCard title="Database">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <ObservableSkill name="MySQL" rank="A" percentage={85} iconColor="#4479a1" />
                      <ObservableSkill name="PostgreSQL" rank="A" percentage={80} iconColor="#336791" />
                      <ObservableSkill name="MongoDB" rank="B" percentage={75} iconColor="#47a248" />
                    </div>
                  </PixelCard>
                  <PixelCard title="Tools & Others">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <ObservableSkill name="Git / GitHub" rank="S" percentage={90} iconColor="#f05032" />
                      <ObservableSkill name="Docker" rank="B" percentage={70} iconColor="#2496ed" />
                      <ObservableSkill name="Figma" rank="A" percentage={85} iconColor="#f24e1e" />
                      <ObservableSkill name="AI / ML" rank="B" percentage={75} iconColor="#ffeb3b" />
                    </div>
                  </PixelCard>
                </div>
              </div>
            </div>
          </div>

          {/* Section Progress Dots — vertical pills on right side */}
          <nav
            ref={sectionDotsRef}
            className={`section-progress-dots ${(isAboutOpen || isSkillsOpen) ? 'hidden' : ''}`}
            aria-label="Section navigation"
          >
            {SECTIONS.map((sec) => (
              <button
                key={sec}
                className={`section-dot-btn ${sec === 'hero' ? 'active' : ''}`}
                onClick={() => {
                  const el = document.querySelector(SECTION_SCROLL_TARGETS[sec]);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                aria-label={`Go to ${sec} section`}
                title={sec.charAt(0).toUpperCase() + sec.slice(1)}
              />
            ))}
          </nav>

          {/* Scroll-to-Top Button */}
          <button
            ref={scrollToTopBtnRef}
            className="scroll-to-top-btn pixel-font"
            onClick={handleScrollToTop}
            aria-label="Scroll back to top"
            title="Back to Top"
          >
            ▲
          </button>

          <LoadingScreen onStart={(mode) => {
            setIsStarted(true);
            setPerformanceMode(mode);
          }} />
        </>
        , document.body)}
    </div>
  );
}
