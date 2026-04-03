"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useAudio } from "../../providers/AudioProvider";

const NAV_LINKS = [
  { name: 'ABOUT', href: '#about' },
  { name: 'SKILLS', href: '#skills' },
  { name: 'PROJECTS', href: '#projects' },
  { name: 'CONTACT', href: '#contact' },
];

function NavLink({ name, href }: { name: string; href: string }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  let playSfx: (type: 'hover' | 'click' | 'option') => void = () => { };
  try { playSfx = useAudio().playSfx; } catch { /* outside provider */ }

  const isHovered = useRef(false);

  const handleEnter = useCallback(() => {
    if (!linkRef.current || !arrowRef.current || isHovered.current) return;
    isHovered.current = true;
    playSfx('hover');
    // Jiggle jump animation
    gsap.to(linkRef.current, {
      y: -4,
      duration: 0.1,
      ease: "steps(2)",
      yoyo: true,
      repeat: 1,
    });
    // Color flash
    gsap.to(linkRef.current, {
      color: "var(--color-pixel-leaf)",
      textShadow: "2px 2px 0px var(--color-black)",
      duration: 0.15,
    });
    // Pixel arrow slides in
    gsap.to(arrowRef.current, {
      x: 0,
      opacity: 1,
      duration: 0.2,
      ease: "steps(3)",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playSfx]);

  const handleLeave = useCallback(() => {
    if (!linkRef.current || !arrowRef.current) return;
    isHovered.current = false;
    gsap.to(linkRef.current, {
      y: 0,
      color: "var(--color-cream)",
      textShadow: "none",
      duration: 0.2,
    });
    gsap.to(arrowRef.current, {
      x: -8,
      opacity: 0,
      duration: 0.15,
    });
  }, []);

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => playSfx('click')}
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
    >
      <a
        ref={linkRef}
        href={href}
        className="pixel-font nav-link-gsap"
        style={{
          textDecoration: 'none',
          color: 'var(--color-cream)',
          fontSize: '0.8rem',
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <span
          ref={arrowRef}
          className="pixel-font"
          style={{
            fontSize: '0.7rem',
            opacity: 0,
            transform: 'translateX(-8px)',
            color: 'var(--color-pixel-leaf)',
            display: 'inline-block',
          }}
          aria-hidden="true"
        >
          {'>'}
        </span>
        {name}
      </a>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);

  let playSfx: (type: 'hover' | 'click' | 'option') => void = () => { };
  try { playSfx = useAudio().playSfx; } catch { /* outside provider */ }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLogoHovered = useRef(false);

  // Logo hover bounce
  const handleLogoEnter = useCallback(() => {
    if (!logoRef.current || isLogoHovered.current) return;
    isLogoHovered.current = true;
    playSfx('hover');
    gsap.to(logoRef.current, {
      scale: 1.15,
      rotation: -5,
      duration: 0.3,
      ease: "elastic.out(1, 0.4)",
    });
  }, [playSfx]);

  const handleLogoLeave = useCallback(() => {
    if (!logoRef.current) return;
    isLogoHovered.current = false;
    gsap.to(logoRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
    });
  }, []);

  return (
    <nav className="navbar-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'background-color 0.3s, border-bottom 0.3s',
      backgroundColor: scrolled ? 'var(--color-forest-dark)' : 'transparent',
      borderBottom: scrolled ? '4px solid var(--color-moss-green)' : '4px solid transparent',
    }}>
      <div
        className="pixel-font"
        style={{ fontSize: '1.2rem', color: 'var(--color-cream)', cursor: 'pointer' }}
        onMouseEnter={handleLogoEnter}
        onMouseLeave={handleLogoLeave}
        onClick={() => playSfx('click')}
      >
        <a
          ref={logoRef}
          href="#"
          style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}
        >
          FA.
        </a>
      </div>
      <div className="navbar-links">
        {NAV_LINKS.map(link => (
          <NavLink key={link.name} name={link.name} href={link.href} />
        ))}
      </div>
    </nav>
  );
}
