"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAudio } from "../../providers/AudioProvider";
import { useTheme } from "../../providers/TimeThemeProvider";

const getThemeAccentColor = (theme: string) => {
  switch (theme) {
    case 'pagi': return '#fbbf24'; // Golden Amber
    case 'siang': return '#7dd3fc'; // Sky Cyan (brighter for daylight feel)
    case 'sore': return '#d8b4fe'; // Sunset Lavender (higher contrast)
    case 'malam': 
    default: return '#4ade80'; // Neon Green
  }
};

// ─── SVG Gear Icon (Modern Cyber/Pixel Theme) ─────────────────────
function GearIcon({ spinning = false, isHovering = false, themeColor = "#4ade80" }: { spinning?: boolean; isHovering?: boolean; themeColor?: string }) {
  // A clean, geometric gear
  const gearPath = `
    M 32 4 L 28 4 L 26 10 L 20 8 L 16 13 L 20 18
    L 10 24 L 10 28 L 4 30 L 4 34 L 10 36 L 10 40
    L 16 46 L 20 44 L 26 50 L 28 56 L 32 60 L 36 60
    L 38 56 L 44 50 L 48 44 L 52 46 L 58 40 L 56 36
    L 60 34 L 60 30 L 56 28 L 54 24 L 44 18 L 48 13
    L 44 8 L 38 10 L 36 4 Z
  `;

  const accentColor = isHovering ? themeColor : "#94a3b8";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        animation: spinning ? "settings-gear-spin 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none",
        transformOrigin: "center",
        transition: "all 0.3s ease",
      }}
    >
      {/* Base Gear shape */}
      <path d={gearPath} fill="#0a0a0c" stroke={accentColor} strokeWidth="4" strokeLinejoin="miter" />
      {/* Inner ring */}
      <circle cx="32" cy="32" r="12" fill="#0a0a0c" stroke={accentColor} strokeWidth="3" />
      {/* Center hub */}
      <circle cx="32" cy="32" r="4" fill={accentColor} />
    </svg>
  );
}

// ─── Sleek Digital Volume Slider ──────────────────────────────────
function VolumeSlider({
  value,
  onChange,
  label,
  emoji,
  id,
  themeColor = "#4ade80",
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  emoji: string;
  id: string;
  themeColor?: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateFromEvent = useCallback(
    (clientX: number) => {
      if (!barRef.current) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      onChange(Math.round(ratio * 100) / 100);
    },
    [onChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateFromEvent(e.clientX);
    },
    [updateFromEvent]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      updateFromEvent(e.clientX);
    },
    [updateFromEvent]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const pct = Math.round(value * 100);
  const steppedPct = Math.round(pct / 10) * 10; // Discrete 10% chunks for retro feel
  // Sleek color when active, slate when muted
  const barColor = value > 0 ? themeColor : "#475569";

  return (
    <div style={{ padding: "4px 0" }}>
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-vt323), monospace",
            fontSize: "1.15rem",
            color: "#e2e8f0",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px", opacity: 0.9 }}>{emoji}</span>
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-vt323), monospace",
            fontSize: "1.1rem",
            color: barColor,
            minWidth: "40px",
            textAlign: "right",
            textShadow: value > 0 ? "0 0 8px " + themeColor + "4D" : "none",
          }}
        >
          {steppedPct}%
        </span>
      </div>

      {/* Draggable bar track */}
      <div
        ref={barRef}
        id={id}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={steppedPct}
        aria-label={`${label} volume`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "relative",
          height: "14px",
          background: "#050505",
          border: "2px solid #1e293b",
          cursor: "pointer",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {/* Active Fill */}
        <div
          style={{
            height: "100%",
            width: `${steppedPct}%`,
            background: barColor,
            transition: "none", // Removed smooth transition for 8-bit snap effect
          }}
        />
        {/* Track markers (digital segments) */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0",
            pointerEvents: "none",
          }}
        >
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "2px",
                height: "100%",
                background: "#0a0a0c",
                opacity: 0.5,
              }}
            />
          ))}
        </div>
        {/* Sleek handle knob */}
        <div
          style={{
            position: "absolute",
            top: "-4px",
            left: `calc(${steppedPct}% - 4px)`,
            width: "8px",
            height: "18px",
            background: "#ffffff",
            boxShadow: "0 0 8px rgba(255,255,255,0.4)",
            pointerEvents: "none",
            transition: "none", // Removed smooth transition
          }}
        />
      </div>
    </div>
  );
}

// ─── Main Settings Menu Component ─────────────────────────────────
export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isHoveringGear, setIsHoveringGear] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { bgmVolume, sfxVolume, setBgmVolume, setSfxVolume, playSfx } =
    useAudio();
  const theme = useTheme();
  const themeColor = getThemeAccentColor(theme);

  // Hydration guard + mobile detection
  useEffect(() => {
    setIsRendered(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ─── Scroll-based fade in/out: only visible in the hero section ──
  useEffect(() => {
    if (!isRendered) return;

    const handleScroll = () => {
      // Show only when within the hero section (approx first viewport height)
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const heroHeight = window.innerHeight * 0.7; // fade starts at 70% of viewport
      setIsVisible(scrollY < heroHeight);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isRendered]);

  // Close panel on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleGearClick = () => {
    playSfx("option");
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      setIsOpen((prev) => !prev);
    }, 300);
  };

  if (!isRendered) return null;

  return (
    <>
      {/* Modern UI Keyframes */}
      <style>{`
        @keyframes settings-gear-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }
        @keyframes modern-board-appear {
          0%   { opacity: 0; transform: scale(0.9) translateY(16px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        ref={panelRef}
        style={{
          position: "fixed",
          bottom: isMobile ? "calc(env(safe-area-inset-bottom, 0px) + 12px)" : "32px",
          right: isMobile ? "calc(env(safe-area-inset-right, 0px) + 12px)" : "32px",
          zIndex: 9998, // Below LoadingScreen (9999) so it hides behind it
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          // Fade in/out based on scroll
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none",
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* ═══ MODERN DIGITAL SETTINGS BOARD ═══ */}
        {isOpen && (
          <div
            style={{
              animation: "modern-board-appear 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              transformOrigin: "bottom right",
              marginBottom: "16px",
              userSelect: "none",
            }}
          >
            <div
              style={{
                position: "relative",
                background: "rgba(10, 10, 12, 0.95)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: `2px solid ${themeColor}`,
                boxShadow: `0px 8px 24px rgba(0,0,0,0.8), 0 0 24px ${themeColor}33`,
                width: isMobile ? "220px" : "260px",
                padding: isMobile ? "16px 18px 20px" : "20px 24px 24px",
              }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px dashed #1e293b", paddingBottom: "16px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-vt323), monospace",
                    color: "#ffffff",
                    fontSize: "1.3rem",
                    letterSpacing: "0.2em",
                    textShadow: "0 0 10px rgba(255,255,255,0.3)",
                  }}
                >
                  SETTINGS
                </span>
              </div>

              {/* Volume sliders */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <VolumeSlider
                  id="bgm-volume-slider"
                  value={bgmVolume}
                  onChange={setBgmVolume}
                  label="MUSIC"
                  emoji=""
                  themeColor={themeColor}
                />
                <VolumeSlider
                  id="sfx-volume-slider"
                  value={sfxVolume}
                  onChange={setSfxVolume}
                  label="SFX"
                  emoji=""
                  themeColor={themeColor}
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══ MINIMALIST GEAR BUTTON ═══ */}
        <button
          id="settings-gear-btn"
          onClick={handleGearClick}
          onMouseEnter={() => {
            playSfx("hover");
            setIsHoveringGear(true);
          }}
          onMouseLeave={() => setIsHoveringGear(false)}
          aria-label="Audio Settings"
          aria-expanded={isOpen}
          title="Audio Settings"
          style={{
            width: isMobile ? "44px" : "56px",
            height: isMobile ? "44px" : "56px",
            background: isOpen ? "#111827" : "#0a0a0c",
            border: "2px solid",
            borderColor: isOpen || isHoveringGear ? themeColor : "#334155",
            cursor: "pointer",
            padding: isMobile ? "8px" : "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: (isOpen || isHoveringGear)
              ? `0 0 16px ${themeColor}40, 4px 4px 0px rgba(0,0,0,0.8)`
              : "4px 4px 0px rgba(0,0,0,0.8)",
            transform: (isHoveringGear && !isSpinning) ? "translateY(-2px)" : "translateY(0)",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <GearIcon spinning={isSpinning} isHovering={isOpen || isHoveringGear} themeColor={themeColor} />
        </button>
      </div>
    </>
  );
}
