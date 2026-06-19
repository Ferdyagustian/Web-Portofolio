"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import { useAudio } from "../../providers/AudioProvider";
import { useTimeTheme } from "../../lib/useTimeTheme";

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
  accentColor,
}: {
  name: string;
  href: string;
  section: string;
  isActive: boolean;
  accentColor: string;
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
    
    gsap.killTweensOf(linkRef.current);
    gsap.killTweensOf(arrowRef.current);
    gsap.to(linkRef.current, {
      y: -4,
      duration: 0.1,
      ease: "steps(2)",
      yoyo: true,
      repeat: 1,
    });
    gsap.to(linkRef.current, {
      color: `rgb(${accentColor})`,
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

    gsap.killTweensOf(linkRef.current);
    gsap.killTweensOf(arrowRef.current);

    gsap.to(linkRef.current, {
      y: 0,
      color: isActive ? `rgb(${accentColor})` : "var(--color-cream)",
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
    handleLeave(); // Clean up hover state upon clicking
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
          color: isActive ? `rgb(${accentColor})` : 'var(--color-cream)',
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
            color: `rgb(${accentColor})`,
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
          backgroundColor: `rgb(${accentColor})`,
          boxShadow: `0 0 8px rgba(${accentColor}, 0.6)`,
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
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionName>('hero');
  const logoRef = useRef<HTMLAnchorElement>(null);
  const theme = useTimeTheme();

  const getThemeStyles = () => {
    switch (theme) {
      case 'pagi': return { bg: 'rgba(20, 35, 45, 0.65)', accentRgb: '255, 224, 102' };
      case 'siang': return { bg: 'rgba(15, 30, 50, 0.65)', accentRgb: '100, 181, 246' };
      case 'sore': return { bg: 'rgba(25, 10, 30, 0.65)', accentRgb: '243, 156, 18' };
      case 'malam': return { bg: 'rgba(10, 15, 25, 0.65)', accentRgb: '255, 234, 112' };
      default: return { bg: 'rgba(5, 10, 5, 0.65)', accentRgb: '109, 216, 146' };
    }
  };
  const themeStyles = getThemeStyles();

  let playSfx: (type: 'hover' | 'click' | 'option') => void = () => { };
  try { playSfx = useAudio().playSfx; } catch { /* outside provider */ }

  // Lenis scroll callback — eliminates raw window.addEventListener('scroll') re-renders
  useLenis(({ scroll }) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    setScrolled(scroll > 50);
    setActiveSection(getActiveSection(scroll, maxScroll));
  });

  // Initial check on mount (before first Lenis scroll event fires)
  useEffect(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    setActiveSection(getActiveSection(window.scrollY, maxScroll));
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

  // Hide the global Navbar on quest detail pages (to prevent overlap)
  // Must be placed after all hooks to comply with React Rules of Hooks!
  if (pathname && pathname.startsWith("/quest")) {
    return null;
  }

  return (
    <nav
      data-floating-pill
      className="navbar-container"
      style={{
        position: 'fixed',
        top: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem',
        width: 'fit-content',
        whiteSpace: 'nowrap',
        borderRadius: '9999px',
        padding: '0.6rem 1.5rem',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        backgroundColor: themeStyles.bg,
        border: scrolled
          ? `2px solid rgba(${themeStyles.accentRgb}, 0.40)`
          : `2px solid rgba(${themeStyles.accentRgb}, 0.15)`,
        boxShadow: scrolled
          ? `0 0 32px rgba(${themeStyles.accentRgb}, 0.15), inset 0 1px 0 rgba(255,255,255,0.06)`
          : `0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)`,
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease',
      }}
    >
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
            accentColor={themeStyles.accentRgb}
          />
        ))}
      </div>
    </nav>
  );
}
