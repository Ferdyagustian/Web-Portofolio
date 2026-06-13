"use client";

import { useMemo } from "react";
import { Difficulty, QuestStatus, getDifficultyColor, getStatusDisplay } from "../../lib/questData";

interface SignboardProps {
  title: string;
  techStack: string[];
  description: string;
  index: number;
  difficulty: Difficulty;
  status: QuestStatus;
  githubUrl?: string;
  liveUrl?: string;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

// Thumbtack/pin colors for variety
const PIN_COLORS = [
  "#e74c3c", // red
  "#f39c12", // orange
  "#2ecc71", // green
  "#3498db", // blue
  "#9b59b6", // purple
  "#1abc9c", // teal
  "#e67e22", // dark orange
  "#e91e63", // pink
];

export default function ProjectSignboard({
  title,
  techStack,
  description,
  index,
  difficulty,
  status,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: SignboardProps) {
  // Random slight tilt for organic pinned-paper feel
  const tilt = useMemo(() => {
    const seed = index * 7 + 3;
    return Math.round(((seed % 11) - 5) * 0.8); // range: -4 to +4 degrees
  }, [index]);

  // Random pin position offset (slightly off-center for realism)
  const pinOffset = useMemo(() => {
    const seed = index * 13 + 5;
    return Math.round(((seed % 7) - 3) * 4); // range: -12 to +12 px
  }, [index]);

  const pinColor = PIN_COLORS[index % PIN_COLORS.length];

  // Paper note background colors for variety (warm yellows/whites)
  const paperColors = [
    "#fff9c4", // light yellow
    "#fff3e0", // light peach
    "#f3e5f5", // very light lavender
    "#e8f5e9", // very light mint
    "#e3f2fd", // very light blue
  ];
  const paperColor = paperColors[index % paperColors.length];

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        cursor: "pointer",
        transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease",
        transform: isHovered
          ? `rotate(0deg) scale(1.08) translateY(-12px)`
          : `rotate(${tilt}deg) scale(1)`,
        filter: isHovered
          ? "drop-shadow(0 12px 24px rgba(0,0,0,0.4))"
          : "drop-shadow(3px 5px 6px rgba(0,0,0,0.35))",
        userSelect: "none",
        position: "relative",
      }}
    >
      {/* Thumbtack / Push Pin */}
      <div
        style={{
          position: "absolute",
          top: "-10px",
          left: `calc(50% + ${pinOffset}px)`,
          transform: "translateX(-50%)",
          zIndex: 10,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Pin head */}
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: pinColor,
            border: `2px solid ${isHovered ? "#fff" : "rgba(0,0,0,0.3)"}`,
            boxShadow: isHovered
              ? `0 0 12px ${pinColor}, 0 0 24px ${pinColor}80, inset 0 -2px 4px rgba(0,0,0,0.3)`
              : "0 2px 4px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)",
            transition: "box-shadow 0.3s ease, border-color 0.3s ease",
            position: "relative",
          }}
        >
          {/* Pin highlight */}
          <div
            style={{
              position: "absolute",
              top: "3px",
              left: "4px",
              width: "5px",
              height: "5px",
              backgroundColor: "rgba(255,255,255,0.6)",
              borderRadius: "50%",
            }}
          />
        </div>
        {/* Pin needle shadow */}
        <div
          style={{
            width: "3px",
            height: "6px",
            backgroundColor: "#666",
            margin: "-2px auto 0",
            borderRadius: "0 0 1px 1px",
          }}
        />
      </div>

      {/* Masking Tape Accent (top-left corner, optional on some cards) */}
      {index % 3 === 0 && (
        <div
          style={{
            position: "absolute",
            top: "-4px",
            left: "-8px",
            width: "40px",
            height: "14px",
            backgroundColor: "rgba(210, 180, 140, 0.7)",
            transform: "rotate(-35deg)",
            zIndex: 5,
            borderTop: "1px solid rgba(255,255,255,0.3)",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
          }}
        />
      )}

      {/* Second tape strip on some cards (bottom-right) */}
      {index % 3 === 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "-3px",
            right: "-6px",
            width: "35px",
            height: "12px",
            backgroundColor: "rgba(180, 200, 220, 0.6)",
            transform: "rotate(25deg)",
            zIndex: 5,
            borderTop: "1px solid rgba(255,255,255,0.3)",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
          }}
        />
      )}

      {/* Paper Note Card */}
      <div
        style={{
          backgroundColor: paperColor,
          padding: "22px 20px 18px",
          minWidth: "230px",
          maxWidth: "290px",
          position: "relative",
          boxShadow: "1px 2px 6px rgba(0,0,0,0.15)",
          // Subtle paper torn-edge effect via bottom border
          borderBottom: "2px solid rgba(0,0,0,0.06)",
          borderRight: "1px solid rgba(0,0,0,0.04)",
          transition: "background-color 0.3s ease",
        }}
      >
        {/* Paper lines effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 27px, rgba(100,149,237,0.12) 27px, rgba(100,149,237,0.12) 28px)",
            pointerEvents: "none",
          }}
        />
        
        {/* Red margin line (like notebook paper) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "30px",
            bottom: 0,
            width: "1px",
            backgroundColor: "rgba(220, 80, 80, 0.18)",
            pointerEvents: "none",
          }}
        />

        {/* Project Number */}
        <div
          className="pixel-font"
          style={{
            fontSize: "0.55rem",
            color: "rgba(0,0,0,0.35)",
            marginBottom: "8px",
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>#{String(index + 1).padStart(2, "0")}</span>
          {/* Status badge */}
          <span
            style={{
              fontSize: "0.45rem",
              padding: "2px 5px",
              backgroundColor: getStatusDisplay(status).color + "22",
              color: getStatusDisplay(status).color,
              border: `1px solid ${getStatusDisplay(status).color}55`,
              letterSpacing: "0.5px",
            }}
          >
            {getStatusDisplay(status).label}
          </span>
        </div>

        {/* Title */}
        <div
          className="pixel-font"
          style={{
            fontSize: "0.75rem",
            color: "#1a1a2e",
            marginBottom: "10px",
            lineHeight: 1.5,
            position: "relative",
            zIndex: 2,
          }}
        >
          {title}
        </div>

        {/* Description — revealed on hover */}
        <div
          className="pixelify-font"
          style={{
            fontSize: "0.82rem",
            color: "#333",
            lineHeight: 1.6,
            maxHeight: isHovered ? "200px" : "0",
            overflow: "hidden",
            opacity: isHovered ? 1 : 0,
            transition: "max-height 0.45s ease, opacity 0.35s ease, margin 0.35s ease",
            marginBottom: isHovered ? "10px" : "0",
            position: "relative",
            zIndex: 2,
          }}
        >
          {description}
        </div>

        {/* Tech Stack Tags */}
        <div
          style={{
            display: "flex",
            gap: "5px",
            flexWrap: "wrap",
            marginTop: "6px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {techStack.map((tech) => (
            <span
              key={tech}
              className="pixel-font tech-badge"
              style={{
                fontSize: "0.75rem",
                padding: "3px 8px",
                backgroundColor: "#2d5a27",
                color: "#fbf8cc",
                border: "1px solid #1a3a15",
                borderRadius: "2px",
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Difficulty dots */}
        <div style={{ display: "flex", gap: "3px", marginTop: "10px", alignItems: "center" }}>
          <span className="pixel-font" style={{ fontSize: "0.45rem", color: "rgba(0,0,0,0.4)", marginRight: "4px", letterSpacing: "0.5px" }}>DIFFICULTY</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: i < difficulty
                  ? getDifficultyColor(difficulty)
                  : "rgba(0,0,0,0.12)",
                border: "1px solid rgba(0,0,0,0.15)",
              }}
            />
          ))}
        </div>

        {/* Click hint — only on hover */}
        {isHovered && (
          <div
            className="pixel-font"
            style={{
              marginTop: "10px",
              fontSize: "0.5rem",
              color: "#2d5a27",
              textAlign: "center",
              letterSpacing: "1px",
              opacity: 0.8,
              animation: "fadeInUp 0.25s ease",
            }}
          >
            ▶ KLIK UNTUK ACCEPT QUEST
          </div>
        )}
      </div>
    </div>
  );
}
