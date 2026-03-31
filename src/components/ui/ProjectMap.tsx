"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Move } from "lucide-react";
import ProjectSignboard from "./ProjectSignboard";

interface Project {
  title: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  live_url?: string;
}

interface ProjectMapProps {
  projects: Project[];
}

export default function ProjectMap({ projects }: ProjectMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(true);

  // Persistent pan state stored in refs — never causes re-render, never resets
  const panPos = useRef({ x: 0, y: 0 });
  const dragState = useRef({ active: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });
  const isCursorGrabbing = useRef(false);

  // Apply transform directly to DOM — bypasses React render cycle completely
  const applyTransform = (x: number, y: number) => {
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
    // Parallax layers
    if (bgRef.current) {
      bgRef.current.style.transform = `translate(calc(-50% + ${x * 0.35}px), calc(-50% + ${y * 0.35}px))`;
    }
    if (fgRef.current) {
      fgRef.current.style.transform = `translate(calc(-50% + ${x * 1.4}px), calc(-50% + ${y * 1.4}px))`;
    }
  };

  // Pointer event handlers — attached via useEffect so they don't cause re-renders
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerDown = (e: PointerEvent) => {
      // Only main mouse button or touch
      if (e.button !== undefined && e.button !== 0) return;
      container.setPointerCapture(e.pointerId);
      dragState.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startPanX: panPos.current.x,
        startPanY: panPos.current.y,
      };
      container.style.cursor = "grabbing";
      isCursorGrabbing.current = true;
      setShowHint(false);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragState.current.active) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const newX = dragState.current.startPanX + dx;
      const newY = dragState.current.startPanY + dy;
      // Store final position
      panPos.current = { x: newX, y: newY };
      // Write directly to DOM — zero React involvement
      applyTransform(newX, newY);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragState.current.active) return;
      dragState.current.active = false;
      container.releasePointerCapture(e.pointerId);
      container.style.cursor = "grab";
      isCursorGrabbing.current = false;
      // panPos.current is already the final position — nothing to update
    };

    const onPointerCancel = () => {
      dragState.current.active = false;
      container.style.cursor = "grab";
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerCancel);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerCancel);
    };
  }, []);

  // Hide hint after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Organic free-scattering positions (with fixed manual ones for the first 8 to avoid overlap)
  const positions = useMemo(() => {
    const manualPositions = [
      { x: -380, y: -180 }, // Project 1: Top Left
      { x: 280,  y: -220 }, // Project 2: Top Right
      { x: 40,   y: 120 },  // Project 3: Center near bottom
      { x: -350, y: 280 },  // Project 4: Bottom Left
      { x: 420,  y: 250 },  // Project 5: Bottom Right
      { x: -750, y: 50 },   // Project 6: Far Left
      { x: 750,  y: -20 },  // Project 7: Far Right
      { x: 0,    y: -450 }, // Project 8: Far Top
    ];

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) % 233280;
      return Math.abs(x / 233280);
    };

    return projects.map((_, i) => {
      // Use predefined coordinates to guarantee no overlap for the first few notes
      if (i < manualPositions.length) {
        return manualPositions[i];
      }

      // Fallback for extra projects: scatter them further away
      const angleBase = (i / projects.length) * Math.PI * 2;
      const angle = angleBase + seededRandom(i * 17 + 3) * 1.2 - 0.6;
      const radiusBase = 600 + i * 150; // Much wider radius to avoid overlap
      const radiusJitter = seededRandom(i * 31 + 7) * 300 - 150;
      const radius = radiusBase + radiusJitter;
      return {
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius),
      };
    });
  }, [projects.length]);

  // Background dots
  const bgDots = useMemo(() => {
    const dots = [];
    for (let i = 0; i < 80; i++) {
      dots.push({
        x: Math.round(Math.sin(i * 127.1 + 311.7) * 0.5 * 3000),
        y: Math.round(Math.sin(i * 269.5 + 183.3) * 0.5 * 3000),
        size: Math.round(2 + (i % 5)),
        opacity: parseFloat((0.1 + (i % 4) * 0.08).toFixed(2)),
        pulse: i % 6 === 0,
      });
    }
    return dots;
  }, []);

  // Foreground pixel leaves
  const fgLeaves = useMemo(() => {
    const leaves = [];
    for (let i = 0; i < 25; i++) {
      leaves.push({
        x: Math.round(Math.sin(i * 43.7 + 97.1) * 0.5 * 3200),
        y: Math.round(Math.cos(i * 67.3 + 151.9) * 0.5 * 3200),
        size: Math.round(3 + (i % 4) * 2),
        rotation: Math.round((i * 37) % 360),
        opacity: parseFloat((0.12 + (i % 3) * 0.06).toFixed(2)),
      });
    }
    return leaves;
  }, []);

  // Constellation lines
  const lines = useMemo(() => {
    const result: { x1: number; y1: number; x2: number; y2: number; dist: number }[] = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = Math.round(
          Math.hypot(positions[i].x - positions[j].x, positions[i].y - positions[j].y)
        );
        if (dist < 600) {
          result.push({
            x1: positions[i].x,
            y1: positions[i].y,
            x2: positions[j].x,
            y2: positions[j].y,
            dist,
          });
        }
      }
    }
    return result;
  }, [positions]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "80vh",
        overflow: "hidden",
        position: "relative",
        touchAction: "none",
        userSelect: "none",
        cursor: "grab",
        backgroundColor: "#1a0f0a",
        backgroundImage: `
          radial-gradient(ellipse at 20% 30%, rgba(139,90,43,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(139,90,43,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(45,90,39,0.04) 0%, transparent 70%)
        `,
        border: "6px solid #3d2b1f",
        borderImage: "linear-gradient(135deg, #5c3a1e, #3d2b1f, #5c3a1e, #3d2b1f) 1",
        boxShadow: "inset 0 0 80px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.5)",
      }}
    >
      {/* Cork texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            repeating-conic-gradient(rgba(139,90,43,0.03) 0% 25%, transparent 0% 50%),
            repeating-linear-gradient(45deg, rgba(101,67,33,0.02) 0px, rgba(101,67,33,0.02) 1px, transparent 1px, transparent 8px)
          `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Dark grid pattern */}
      <div
        style={{
          position: "absolute",
          top: "-100%",
          left: "-100%",
          width: "300%",
          height: "300%",
          backgroundImage: `
            linear-gradient(rgba(45,90,39,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45,90,39,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          pointerEvents: "none",
        }}
      />

      {/* Layer 1: Parallax Background (stars/dots) — transform applied directly via DOM */}
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        {bgDots.map((dot, i) => (
          <div
            key={`dot-${i}`}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              backgroundColor: i % 3 === 0 ? "#4ade80" : i % 3 === 1 ? "#fbbf24" : "#38bdf8",
              opacity: dot.opacity,
              imageRendering: "pixelated",
              animation: dot.pulse ? "dotPulse 3s ease-in-out infinite" : "none",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}

        {/* Constellation lines */}
        <svg
          width="4000"
          height="4000"
          style={{
            position: "absolute",
            top: "-2000px",
            left: "-2000px",
            pointerEvents: "none",
          }}
        >
          {lines.map((line, i) => (
            <line
              key={`line-${i}`}
              x1={line.x1 + 2000}
              y1={line.y1 + 2000}
              x2={line.x2 + 2000}
              y2={line.y2 + 2000}
              stroke={`rgba(74,222,128,${0.06 + (1 - line.dist / 600) * 0.08})`}
              strokeWidth="1"
              strokeDasharray="8 6"
            />
          ))}
        </svg>
      </div>

      {/* Layer 2: Main canvas with project notes — transform applied directly via DOM */}
      <div
        ref={canvasRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          willChange: "transform",
        }}
      >
        {projects.map((project, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: positions[i].x,
              top: positions[i].y,
              transform: "translate(-50%, -50%)",
              animation: `floatNote ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            <ProjectSignboard
              title={project.title}
              description={project.description}
              techStack={project.tech_stack}
              index={i}
              githubUrl={project.github_url}
              liveUrl={project.live_url}
              isHovered={hoveredIndex === i}
              onHover={() => setHoveredIndex(i)}
              onLeave={() => setHoveredIndex(null)}
              onClick={() => {}}
            />
          </div>
        ))}
      </div>

      {/* Layer 3: Foreground pixel leaves — transform applied directly via DOM */}
      <div
        ref={fgRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        {fgLeaves.map((leaf, i) => (
          <div
            key={`leaf-${i}`}
            style={{
              position: "absolute",
              left: leaf.x,
              top: leaf.y,
              width: leaf.size,
              height: leaf.size,
              backgroundColor: i % 2 === 0 ? "#2d5a27" : "#4ade8040",
              opacity: leaf.opacity,
              transform: `rotate(${leaf.rotation}deg)`,
              imageRendering: "pixelated",
            }}
          />
        ))}
      </div>

      {/* Drag hint overlay */}
      {showHint && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            pointerEvents: "none",
            animation: "hintFadeInOut 6s ease-in-out forwards",
            zIndex: 20,
          }}
        >
          <div
            className="pixel-font"
            style={{
              fontSize: "0.85rem",
              color: "var(--color-cream)",
              textShadow: "2px 2px 0px var(--color-black), 0 0 20px rgba(74,222,128,0.4)",
              backgroundColor: "rgba(2,6,23,0.85)",
              padding: "14px 28px",
              border: "3px solid var(--color-pixel-leaf)",
              boxShadow: "4px 4px 0px rgba(0,0,0,0.5), 0 0 30px rgba(74,222,128,0.15)",
            }}
          >
            ✥ DRAG TO EXPLORE ✥
          </div>
          <div
            style={{
              color: "var(--color-pixel-leaf)",
              animation: "bounceHint 2s infinite",
              filter: "drop-shadow(0 0 6px rgba(74,222,128,0.5))",
            }}
          >
            <Move size={32} strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 120px 50px rgba(10,5,2,0.85), inset 0 0 40px 10px rgba(10,5,2,0.4)",
          zIndex: 10,
        }}
      />

      {/* Board label */}
      <div
        className="pixel-font"
        style={{
          position: "absolute",
          bottom: "12px",
          right: "16px",
          fontSize: "0.5rem",
          color: "rgba(139,90,43,0.4)",
          zIndex: 11,
          letterSpacing: "2px",
          pointerEvents: "none",
        }}
      >
        PAPAN PENGUMUMAN
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes floatNote {
            0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
            50% { transform: translate(-50%, -50%) translateY(-6px); }
          }
          @keyframes dotPulse {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.5; }
          }
          @keyframes bounceHint {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-14px); }
            60% { transform: translateY(-7px); }
          }
          @keyframes hintFadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            75% { opacity: 1; }
            100% { opacity: 0; }
          }
        `,
        }}
      />
    </div>
  );
}
