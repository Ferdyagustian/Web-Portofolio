"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PixelForest from '../components/three/PixelForest';
import DialogueBox from '../components/ui/DialogueBox';
import PixelCard from '../components/ui/PixelCard';
import ObservableSkill from '../components/ui/ObservableSkill';
import PixelButton from '../components/ui/PixelButton';
import ProjectGallery from '../components/ui/ProjectGallery';
import InteractiveAvatar from '../components/ui/InteractiveAvatar';
import { useTheme } from '../providers/TimeThemeProvider';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);

  // Mouse parallax ref — useRef instead of useState to prevent re-renders!
  // Re-renders were causing GroundBushes inline Math.random() to regenerate = spinning bushes
  const mousePosRef = useRef({ x: 0, y: 0 });

  const [showGyroButton, setShowGyroButton] = useState(false);

  // Setup window mousemove & deviceorientation for 3D CameraRig parallax tilt
  useEffect(() => {
    // 1. Mouse move parallax (Desktop)
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const nx = (clientX / innerWidth - 0.5) * 2;
      const ny = (clientY / innerHeight - 0.5) * 2;
      mousePosRef.current = { x: nx * 0.3, y: ny * 0.3 };
    };

    // 2. Gyroscope parallax (Mobile)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let gamma = e.gamma || 0; // Left/Right (-90 to 90)
      let beta = e.beta || 0;   // Front/Back (-180 to 180)
      
      // Clamp values for comfortable phone holding
      gamma = Math.max(-45, Math.min(45, gamma));
      beta = Math.max(0, Math.min(90, beta)) - 45; // Center around 45 degrees holding angle

      // Normalize to -1 to 1 range (matching mouse parallax)
      const nx = gamma / 45;
      const ny = beta / 45;

      mousePosRef.current = { x: nx * 0.3, y: ny * 0.3 };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Check if iOS 13+ device orientation permission is required
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setShowGyroButton(true);
    } else {
      // Android / Older iOS / Desktop
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Handle bfcache restoration (Back button after hard navigation)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const requestGyroPermission = async () => {
    try {
      const permissionState = await (DeviceOrientationEvent as any).requestPermission();
      if (permissionState === 'granted') {
        const handleOrientation = (e: DeviceOrientationEvent) => {
          let gamma = Math.max(-45, Math.min(45, e.gamma || 0));
          let beta = Math.max(0, Math.min(90, e.beta || 0)) - 45;
          mousePosRef.current = { x: (gamma / 45) * 0.3, y: (beta / 45) * 0.3 };
        };
        window.addEventListener('deviceorientation', handleOrientation);
        setShowGyroButton(false);
      }
    } catch (err) {
      console.error("Gyroscope permission error", err);
    }
  };

  useGSAP(() => {
    // ============================================
    // SCROLL-UP REWIND & triggers
    // ============================================

    // Section title animations with "stepped" retro feel
    gsap.utils.toArray('.gsap-section-title').forEach((el: any) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        x: -60,
        opacity: 0,
        duration: 0.6,
        ease: "steps(8)",
      });
    });

    // ============================================
    // EXISTING: RPG Bouncy Pop-in elements
    // ============================================
    gsap.utils.toArray('.gsap-pop').forEach((el: any) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        ease: "back.out(1.7)"
      });
    });

    // Staggered Pop-in for Skills
    if (document.querySelector('.gsap-skill-card')) {
      gsap.from('.gsap-skill-card', {
        scrollTrigger: {
          trigger: '#skills',
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.5)"
      });
    }

    // Parallax Effect Option
    gsap.utils.toArray('.gsap-parallax').forEach((el: any) => {
      const speed = parseFloat(el.getAttribute('data-speed') || "0.2");
      gsap.to(el, {
        yPercent: 50 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }, { scope: container });

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Terjadi kesalahan sistem.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Terjadi kesalahan koneksi.');
    }
  };

  const handleQuestNavigate = useCallback((slug: string) => {
    router.push(`/quest/${slug}`);
  }, [router]);

  return (
    <main style={{ position: 'relative' }} ref={container}>
      {/* 3D Background — theme-aware, receives mouse for parallax, now acts as the interactive scene wrapper */}
      <PixelForest
        theme={theme}
        mousePosRef={mousePosRef}
        formData={formData}
        setFormData={setFormData}
        status={status}
        handleSubmit={handleSubmit}
        errorMessage={errorMessage}
        onQuestNavigate={handleQuestNavigate}
      />

      {/* Invisible Scroll Triggers for Lenis and GSAP ScrollTrigger */}
      <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'none' }}>
        <section id="hero" style={{ minHeight: '100dvh' }} />
        <section id="about" style={{ minHeight: '100dvh' }} />
        <section id="skills" style={{ minHeight: '100dvh' }} />
        <section id="projects" style={{ minHeight: '100dvh' }} />
        <section id="contact" style={{ minHeight: '100dvh' }} />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
      `}} />

      {/* iOS Gyroscope Permission Overlay */}
      {showGyroButton && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '0', width: '100vw', display: 'flex', justifyContent: 'center', zIndex: 10001, pointerEvents: 'auto', padding: '0 1rem'
        }}>
          <button 
            onClick={requestGyroPermission}
            className="pixel-font"
            style={{
              backgroundColor: 'var(--color-sunset-orange)',
              color: 'var(--color-cream)',
              border: '4px solid #000',
              padding: '12px 24px',
              fontSize: '1rem',
              boxShadow: '4px 4px 0px #000',
              cursor: 'pointer',
              textShadow: '2px 2px 0px #000',
              animation: 'pulseButton 1.5s infinite alternate ease-in-out'
            }}
          >
            ENABLE 3D PARALLAX
          </button>
        </div>
      )}
    </main>
  );
}
