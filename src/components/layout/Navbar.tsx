"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useAudio } from "../../providers/AudioProvider";

import { useLenis } from 'lenis/react';

const NAV_LINKS = [
  { name: 'ABOUT', href: '#about', section: 'about' },
  { name: 'SKILLS', href: '#skills', section: 'skills' },
  { name: 'PROJECTS', href: '#projects', section: 'projects' },
  { name: 'CONTACT', href: '#contact', section: 'contact' },
];

type SectionName = 'hero' | 'about' | 'skills' | 'projects' | 'contact';

/** Maps scroll progress (0–1) to the current section name */
function getActiveSection(scrollY: number, totalHeight: number): SectionName {
  const sp = totalHeight > 0 ? scrollY / totalHeight : 0;
  if (sp >= 0.88) return 'contact';
  if (sp >= 0.65) return 'projects';
  if (sp >= 0.42) return 'skills';
  if (sp >= 0.12) return 'about';
  return 'hero';
}

function NavLink({
  name,
  href,
  isActive,
}: {
  name: string;
  href: string;
  section: string;
  isActive: boolean;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();

  let playSfx: (type: 'hover' | 'click' | 'option') => void = () => { };
  try { playSfx = useAudio().playSfx; } catch { /* outside provider */ }

  const isHovered = useRef(false);

  const handleEnter = useCallback(() => {
    if (!linkRef.current || !arrowRef.current || isHovered.current) return;
    isHovered.current = true;
    playSfx('hover');
    gsap.to(linkRef.current, {
      y: -4,
      duration: 0.1,
      ease: "steps(2)",
      yoyo: true,
      repeat: 1,
    });
    gsap.to(linkRef.current, {
      color: "var(--color-pixel-leaf)",
      textShadow: "2px 2px 0px var(--color-black)",
      duration: 0.15,
    });
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
      color: isActive ? "var(--color-pixel-leaf)" : "var(--color-cream)",
      textShadow: "none",
      duration: 0.2,
    });
    gsap.to(arrowRef.current, {
      x: -8,
      opacity: 0,
      duration: 0.15,
    });
  }, [isActive]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playSfx('click');
    if (lenis) {
      lenis.scrollTo(href, { offset: 0, duration: 1.5, lock: false });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
    >
      <a
        ref={linkRef}
        href={href}
        onClick={(e) => e.preventDefault()}
        className="pixel-font nav-link-gsap"
        style={{
          textDecoration: 'none',
          color: isActive ? 'var(--color-pixel-leaf)' : 'var(--color-cream)',
          fontSize: '0.8rem',
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          transition: 'color 0.3s ease',
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

      {/* Active underline indicator */}
      <span
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: '0',
          right: '0',
          height: '3px',
          backgroundColor: 'var(--color-pixel-leaf)',
          boxShadow: '0 0 8px rgba(109, 216, 146, 0.6)',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left center',
          transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionName>('hero');
  const logoRef = useRef<HTMLAnchorElement>(null);

  let playSfx: (type: 'hover' | 'click' | 'option') => void = () => { };
  try { playSfx = useAudio().playSfx; } catch { /* outside provider */ }

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setActiveSection(getActiveSection(scrollY, maxScroll));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLogoHovered = useRef(false);

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
          <NavLink
            key={link.name}
            name={link.name}
            href={link.href}
            section={link.section}
            isActive={activeSection === link.section}
          />
        ))}
      </div>
    </nav>
  );
}
