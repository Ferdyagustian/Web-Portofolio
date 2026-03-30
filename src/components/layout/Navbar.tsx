"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      <div className="pixel-font" style={{ fontSize: '1.2rem', color: 'var(--color-cream)' }}>
        <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>FA.</a>
      </div>
      <div className="navbar-links">
        {[
          { name: 'ABOUT', href: '#about' },
          { name: 'SKILLS', href: '#skills' },
          { name: 'PROJECTS', href: '#projects' },
          { name: 'CONTACT', href: '#contact' },
        ].map(link => (
          <a
            key={link.name}
            href={link.href}
            className="pixel-font hover-pixel"
            style={{
              textDecoration: 'none',
              color: 'var(--color-cream)',
              fontSize: '0.8rem',
              transition: 'color 0.2s'
            }}
          >
            {link.name}
          </a>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hover-pixel:hover {
          color: var(--color-pixel-leaf) !important;
          text-shadow: 2px 2px 0px var(--color-black);
        }
      `}} />
    </nav>
  );
}
