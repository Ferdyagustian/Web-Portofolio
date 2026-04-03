"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAudio } from "../../providers/AudioProvider";

// ─── SVG Gear Icon ────────────────────────────────────────────────
function GearIcon({ spinning = false }: { spinning?: boolean }) {
  const gearPath = `
    M 32 4 L 28 4 L 26 10 L 20 8 L 16 13 L 20 18
    L 10 24 L 10 28 L 4 30 L 4 34 L 10 36 L 10 40
    L 16 46 L 20 44 L 26 50 L 28 56 L 32 60 L 36 60
    L 38 56 L 44 50 L 48 44 L 52 46 L 58 40 L 56 36
    L 60 34 L 60 30 L 56 28 L 54 24 L 44 18 L 48 13
    L 44 8 L 38 10 L 36 4 Z
  `;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        animation: spinning ? "settings-gear-spin 0.5s cubic-bezier(0.4,0,0.2,1) forwards" : "none",
        transformOrigin: "center",
      }}
    >
      <path d={gearPath} fill="#1a0a02" transform="translate(2,2)" opacity="0.6" />
      <path d={gearPath} fill="#d4a017" stroke="#8b5a00" strokeWidth="1.5" />
      <path d={gearPath} fill="#f5c842" stroke="none" opacity="0.35" transform="translate(-0.8,-0.8)" />
      <circle cx="32" cy="32" r="13" fill="#5c3a21" stroke="#1a0a02" strokeWidth="2" />
      <circle cx="32" cy="32" r="10" fill="#3d2009" stroke="#8b5a00" strokeWidth="1.5" />
      <line x1="32" y1="26" x2="32" y2="38" stroke="#d4a017" strokeWidth="1.5" />
      <line x1="26" y1="32" x2="38" y2="32" stroke="#d4a017" strokeWidth="1.5" />
      <circle cx="29" cy="29" r="2.5" fill="rgba(255,235,150,0.4)" />
    </svg>
  );
}

// ─── Draggable Volume Slider ──────────────────────────────────────
function VolumeSlider({
  value,
  onChange,
  label,
  emoji,
  id,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  emoji: string;
  id: string;
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
  const barColor =
    value > 0.6
      ? "linear-gradient(90deg, #4ade80, #22c55e)"
      : value > 0.3
      ? "linear-gradient(90deg, #facc15, #f59e0b)"
      : "linear-gradient(90deg, #f87171, #ef4444)";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #e8d4a0, #ddc888)",
        border: "3px solid #b89561",
        boxShadow:
          "inset 2px 2px 0px rgba(255,255,255,0.5), inset -2px -2px 0px rgba(0,0,0,0.12), 2px 2px 0px rgba(0,0,0,0.25)",
        padding: "10px 14px",
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-vt323), monospace",
            fontSize: "1.05rem",
            color: "#3d2009",
            fontWeight: "bold",
            textShadow: "1px 1px 0px rgba(255,255,255,0.5)",
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "16px" }}>{emoji}</span>
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-vt323), monospace",
            fontSize: "0.9rem",
            color: "#5c3a21",
            fontWeight: "bold",
            minWidth: "36px",
            textAlign: "right",
          }}
        >
          {pct}%
        </span>
      </div>

      {/* Draggable bar */}
      <div
        ref={barRef}
        id={id}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${label} volume`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "relative",
          height: "22px",
          background: "#3d2413",
          border: "3px solid #1a0a02",
          boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.6)",
          padding: "2px",
          cursor: "pointer",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {/* Fill */}
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            boxShadow: "inset 0 3px 0px rgba(255,255,255,0.3)",
            transition: isDragging.current ? "none" : "width 0.1s ease",
            position: "relative",
          }}
        />
        {/* Notches */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 3px",
            pointerEvents: "none",
          }}
        >
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "1px",
                height: "50%",
                background: "rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>
        {/* Drag handle knob */}
        <div
          style={{
            position: "absolute",
            top: "-2px",
            left: `calc(${pct}% - 7px)`,
            width: "14px",
            height: "calc(100% + 4px)",
            background: "linear-gradient(180deg, #fcebb8, #c8952a)",
            border: "2px solid #5c3a21",
            boxShadow: "1px 1px 0px rgba(0,0,0,0.5)",
            pointerEvents: "none",
            transition: isDragging.current ? "none" : "left 0.1s ease",
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
  const panelRef = useRef<HTMLDivElement>(null);

  const { bgmVolume, sfxVolume, setBgmVolume, setSfxVolume, playSfx } =
    useAudio();

  // Hydration guard
  useEffect(() => {
    setIsRendered(true);
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
    playSfx("option"); // Use dedicated option.wav for the settings button
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      setIsOpen((prev) => !prev);
    }, 400);
  };

  if (!isRendered) return null;

  return (
    <>
      {/* Keyframe styles */}
      <style>{`
        @keyframes settings-gear-spin {
          0%   { transform: rotate(0deg); }
          60%  { transform: rotate(200deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes settings-board-appear {
          0%   { opacity: 0; transform: scale(0.85) translateY(12px); }
          70%  { opacity: 1; transform: scale(1.02) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes settings-gear-glow {
          0%, 100% { box-shadow: 0 0 0 2px rgba(200,149,42,0.3), 4px 6px 0px #1a0a02, inset 2px 2px 0px rgba(255,255,255,0.15); }
          50%       { box-shadow: 0 0 0 3px rgba(200,149,42,0.6), 0 0 18px rgba(212,160,23,0.5), 4px 6px 0px #1a0a02, inset 2px 2px 0px rgba(255,255,255,0.15); }
        }
        @keyframes settings-nail-shine {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>

      <div
        ref={panelRef}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
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
        {/* ═══ WOODEN SETTINGS BOARD ═══ */}
        {isOpen && (
          <div
            style={{
              animation: "settings-board-appear 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
              transformOrigin: "bottom right",
              marginBottom: "12px",
              userSelect: "none",
            }}
          >
            {/* Outer wooden frame */}
            <div
              style={{
                position: "relative",
                background:
                  "linear-gradient(135deg, #6b3c1a 0%, #8b5a2b 25%, #5c3015 50%, #7a4a24 75%, #6b3c1a 100%)",
                border: "6px solid #3d2009",
                boxShadow: `
                  inset 3px 3px 0px #a0622e,
                  inset -3px -3px 0px #2e1608,
                  6px 6px 0px #1a0a02,
                  0 0 30px rgba(60,20,5,0.7)
                `,
                width: "280px",
                padding: "6px",
                imageRendering: "pixelated",
              }}
            >
              {/* Corner nails */}
              {[
                { top: 6, left: 6 },
                { top: 6, right: 6 },
                { bottom: 6, left: 6 },
                { bottom: 6, right: 6 },
              ].map((pos, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    ...pos,
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, #d4af7b, #8a6a3a, #5c4020)",
                    border: "1.5px solid #2e1608",
                    boxShadow: "1px 1px 0px rgba(0,0,0,0.6)",
                    animation: "settings-nail-shine 3s ease-in-out infinite",
                    animationDelay: `${i * 0.4}s`,
                    zIndex: 5,
                  }}
                />
              ))}

              {/* Inner parchment area */}
              <div
                style={{
                  background: `
                    repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px),
                    repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(139,90,43,0.05) 7px, rgba(139,90,43,0.05) 8px),
                    linear-gradient(170deg, #fcebb8 0%, #f5dfa0 40%, #f0d48e 70%, #fcebb8 100%)
                  `,
                  border: "4px solid #8b5a2b",
                  boxShadow:
                    "inset 2px 2px 6px rgba(0,0,0,0.12), inset -2px -2px 4px rgba(255,255,255,0.3)",
                  padding: "16px 14px 14px",
                }}
              >
                {/* Title plaque */}
                <div style={{ textAlign: "center", marginBottom: "14px" }}>
                  <div
                    style={{
                      display: "inline-block",
                      background: "linear-gradient(135deg, #3d2009, #5c3015, #3d2009)",
                      border: "3px solid #1a0a02",
                      boxShadow:
                        "inset 2px 2px 0px #6b3c1a, inset -2px -2px 0px #1a0a02, 3px 3px 0px rgba(0,0,0,0.5)",
                      padding: "6px 16px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-pixelify), monospace",
                        color: "#fcebb8",
                        fontSize: "0.85rem",
                        textShadow: "1px 1px 0px #1a0a02, 0 0 6px rgba(252,235,184,0.3)",
                        letterSpacing: "0.18em",
                      }}
                    >
                      ⚙ SETTINGS ⚙
                    </span>
                  </div>
                </div>

                {/* Volume sliders */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <VolumeSlider
                    id="bgm-volume-slider"
                    value={bgmVolume}
                    onChange={setBgmVolume}
                    label="Music"
                    emoji="🎵"
                  />
                  <VolumeSlider
                    id="sfx-volume-slider"
                    value={sfxVolume}
                    onChange={setSfxVolume}
                    label="SFX"
                    emoji="🔊"
                  />
                </div>

                {/* Bottom decorative dots */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "12px",
                    padding: "0 4px",
                  }}
                >
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle at 35% 35%, #d4af7b, #5c4020)",
                        border: "1px solid #2e1608",
                        boxShadow: "1px 1px 0px rgba(0,0,0,0.3)",
                        opacity: 0.6,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ GEAR BUTTON ═══ */}
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
            width: "64px",
            height: "64px",
            background: isOpen
              ? "radial-gradient(circle, #3d2413, #2a1608)"
              : "radial-gradient(circle, #5c3a21, #3d2009)",
            border: "4px solid #1a0a02",
            borderRadius: "4px",
            cursor: "pointer",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isHoveringGear
              ? "0 0 0 3px rgba(200,149,42,0.6), 0 0 18px rgba(212,160,23,0.5), 4px 6px 0px #1a0a02"
              : "4px 6px 0px #1a0a02, inset 2px 2px 0px rgba(255,255,255,0.15)",
            transform: isHoveringGear && !isSpinning
              ? "scale(1.12) translateY(-4px)"
              : isOpen
              ? "scale(0.95)"
              : "scale(1)",
            filter: isHoveringGear ? "brightness(1.15)" : "none",
            animation:
              isHoveringGear && !isSpinning
                ? "settings-gear-glow 1.5s ease-in-out infinite"
                : "none",
            transition:
              "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, background 0.3s ease",
          }}
        >
          <GearIcon spinning={isSpinning} />
        </button>
      </div>
    </>
  );
}
