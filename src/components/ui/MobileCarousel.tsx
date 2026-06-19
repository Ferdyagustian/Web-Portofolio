"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Project, getStatusDisplay } from "../../lib/questData";

interface MobileCarouselProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

// Pin colors matching the signboard component
const PIN_COLORS = [
  "#e74c3c",
  "#f39c12",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#1abc9c",
  "#e67e22",
  "#e91e63",
];

// Paper note colors
const PAPER_COLORS = [
  "#fff9c4",
  "#fff3e0",
  "#f3e5f5",
  "#e8f5e9",
  "#e3f2fd",
];

export default function MobileCarousel({ projects, onSelectProject }: MobileCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showArrow, setShowArrow] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const arrowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start/restart the 3-second arrow timer
  const startArrowTimer = useCallback(() => {
    if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);
    setShowArrow(false);

    arrowTimerRef.current = setTimeout(() => {
      setShowArrow(true);
    }, 3000);
  }, []);

  useEffect(() => {
    startArrowTimer();
    return () => {
      if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);
    };
  }, [startArrowTimer]);

  // Detect scroll to update interaction states and restart timer
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        setShowSwipeHint(false);
      }
      setShowArrow(false);
      startArrowTimer();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [startArrowTimer, hasInteracted]);

  // Use IntersectionObserver to accurately track the active card centered on the screen
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setCurrentIndex(index);
            }
          }
        });
      },
      {
        root: el,
        threshold: 0.6, // Trigger when at least 60% of the card is visible
      }
    );

    const cards = el.querySelectorAll(".carousel-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [projects.length]);

  const scrollToIndex = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.offsetWidth * 0.88 + 16;
    el.scrollTo({ left: cardWidth * idx, behavior: "smooth" });
    setCurrentIndex(idx);
    if (!hasInteracted) {
      setHasInteracted(true);
      setShowSwipeHint(false);
    }
    startArrowTimer();
  };

  const goNext = () => {
    if (currentIndex < projects.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  // Random tilt for each card (matching desktop style)
  const getTilt = (i: number) => {
    const seed = i * 7 + 3;
    return Math.round(((seed % 9) - 4) * 0.6);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Card counter */}
      <div
        className="pixel-font"
        style={{
          textAlign: "center",
          fontSize: "0.6rem",
          color: "var(--color-pixel-leaf)",
          marginBottom: "12px",
          letterSpacing: "2px",
          opacity: 0.8,
        }}
      >
        {currentIndex + 1} / {projects.length}
      </div>

      {/* Swipe guide text — fades out after first interaction */}
      {showSwipeHint && (
        <div
          className="pixelify-font"
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            color: "var(--color-cream)",
            marginBottom: "10px",
            opacity: 0.6,
            animation: "swipeHintPulse 2s ease-in-out infinite",
          }}
        >
          ← Geser untuk menjelajahi →
        </div>
      )}

      {/* Carousel scroll container */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "8px",
          paddingLeft: "6%",
          paddingRight: "6%",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {projects.map((project, i) => {
          const pinColor = PIN_COLORS[i % PIN_COLORS.length];
          const paperColor = PAPER_COLORS[i % PAPER_COLORS.length];

          return (
            <div
              key={i}
              className="carousel-card"
              data-index={i}
              style={{
                flex: "0 0 88%",
                height: "100%", // Strictly enforce height
                display: "flex",
                flexDirection: "column",
                scrollSnapAlign: "center",
                position: "relative",
                transform: currentIndex === i ? "rotate(0deg)" : `rotate(${getTilt(i)}deg)`,
                transition: "transform 0.3s ease",
                paddingTop: "12px", // Give space for the pin
              }}
            >
              {/* Thumbtack Pin */}
              <div
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: pinColor,
                    border: "2px solid rgba(0,0,0,0.2)",
                    boxShadow: `0 2px 6px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: "3px",
                      width: "4px",
                      height: "4px",
                      backgroundColor: "rgba(255,255,255,0.5)",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div
                  style={{
                    width: "2px",
                    height: "5px",
                    backgroundColor: "#666",
                    margin: "-1px auto 0",
                  }}
                />
              </div>

              {/* Tape accent on some cards */}
              {i % 3 === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-3px",
                    left: "-5px",
                    width: "35px",
                    height: "12px",
                    backgroundColor: "rgba(210, 180, 140, 0.65)",
                    transform: "rotate(-30deg)",
                    zIndex: 5,
                  }}
                />
              )}

              {/* Paper Note Card */}
              <div
                style={{
                  backgroundColor: paperColor,
                  padding: "20px 16px 16px",
                  position: "relative",
                  height: "100%", // Force strict bounds
                  flex: 1, 
                  display: "flex",
                  flexDirection: "column",
                  boxShadow:
                    "2px 4px 12px rgba(0,0,0,0.2), 1px 1px 0px rgba(0,0,0,0.05)",
                  imageRendering: "pixelated",
                  borderBottom: "2px solid rgba(0,0,0,0.06)",
                  overflow: "hidden", // Prevent any child from breaking the layout
                }}
              >
                {/* Paper lines */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "repeating-linear-gradient(transparent, transparent 27px, rgba(100,149,237,0.1) 27px, rgba(100,149,237,0.1) 28px)",
                    pointerEvents: "none",
                  }}
                />

                {/* Red margin line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "28px",
                    bottom: 0,
                    width: "1px",
                    backgroundColor: "rgba(220, 80, 80, 0.15)",
                    pointerEvents: "none",
                  }}
                />

                {/* Inner Scrollable Content */}
                <div
                  style={{
                    height: "100%", // Fill paper exactly
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    zIndex: 2,
                    paddingRight: "4px", // slight padding for scrollbar
                    paddingBottom: "64px", // Give breathing room for absolute button
                    scrollbarWidth: "thin",
                  }}
                >
                  {/* Project Number */}
                  <div
                    className="pixel-font"
                    style={{
                      fontSize: "0.55rem",
                      color: "rgba(0,0,0,0.3)",
                      marginBottom: "8px",
                    }}
                  >
                    #{String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Title */}
                  <div
                    className="pixel-font"
                    style={{
                      fontSize: "0.75rem",
                      color: "#1a1a2e",
                      marginBottom: "10px",
                      lineHeight: 1.4,
                    }}
                  >
                    {project.title}
                  </div>

                  {/* Description */}
                  <p
                    className="pixelify-font"
                    style={{
                      fontSize: "0.85rem",
                      color: "#333",
                      lineHeight: 1.7,
                      margin: 0,
                      marginBottom: "12px",
                    }}
                  >
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      flexWrap: "wrap",
                    }}
                  >
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="pixel-font tech-badge"
                        style={{
                          fontSize: "0.55rem",
                          padding: "4px 6px",
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

                  {/* Links */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "14px",
                      flexWrap: "wrap",
                      paddingBottom: "8px",
                    }}
                  >
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="pixel-font project-link-btn"
                        style={{
                          fontSize: "0.7rem",
                          padding: "5px 12px",
                          backgroundColor: "#1a1a2e",
                          color: "#fbf8cc",
                          border: "2px solid #fbf8cc",
                          textDecoration: "none",
                        }}
                      >
                        [GITHUB]
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="pixel-font project-link-btn"
                        style={{
                          fontSize: "0.7rem",
                          padding: "5px 12px",
                          backgroundColor: "#2d5a27",
                          color: "#fbf8cc",
                          border: "2px solid #fbf8cc",
                          textDecoration: "none",
                        }}
                      >
                        [LIVE]
                      </a>
                    )}
                    {/* Status badge */}
                    <span
                      className="pixel-font"
                      style={{
                        fontSize: "0.55rem",
                        padding: "4px 8px",
                        backgroundColor: getStatusDisplay(project.status).color + "22",
                        color: getStatusDisplay(project.status).color,
                        border: `1px solid ${getStatusDisplay(project.status).color}55`,
                        alignSelf: "center",
                      }}
                    >
                      {getStatusDisplay(project.status).label}
                    </span>
                  </div>
                </div>

                {/* ACCEPT QUEST button pinned absolutely to bottom */}
                <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", zIndex: 10 }}>
                  <button
                    id={`mobile-accept-quest-${project.slug}`}
                    onClick={() => onSelectProject(project)}
                    className="pixel-font"
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#2d5a27",
                      color: "#fbf8cc",
                      border: "3px solid #4ade80",
                      cursor: "pointer",
                      fontSize: "0.65rem",
                      letterSpacing: "2px",
                      boxShadow: "4px 4px 0px rgba(0,0,0,0.5)",
                      textShadow: "2px 2px 0px #000",
                      animation: currentIndex === i ? "pulseAcceptBtn 2s ease-in-out infinite" : "none",
                    }}
                  >
                    [!] ACCEPT QUEST
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Bar (Arrows + Dots) */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "12px",
          marginBottom: "4px",
          width: "100%",
          padding: "0 8px",
          flexShrink: 0,
        }}
      >
        {/* Left Arrow */}
        <button
          onClick={goPrev}
          aria-label="Previous project"
          disabled={currentIndex === 0}
          style={{
            backgroundColor: currentIndex > 0 ? "var(--color-pixel-leaf)" : "var(--color-moss-green)",
            color: currentIndex > 0 ? "var(--color-black)" : "var(--color-cream)",
            border: currentIndex > 0 ? "2px solid var(--color-cream)" : "2px solid rgba(0,0,0,0.2)",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: currentIndex > 0 ? "pointer" : "default",
            opacity: currentIndex > 0 ? 1 : 0.5,
            boxShadow: currentIndex > 0 ? "2px 2px 0px rgba(0,0,0,0.5)" : "none",
            transition: "all 0.2s",
          }}
          className="pixel-font"
        >
          <ChevronLeft size={18} strokeWidth={3} />
        </button>

        {/* Dots */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to project ${i + 1}`}
              style={{
                width: currentIndex === i ? "24px" : "8px",
                height: "8px",
                backgroundColor:
                  currentIndex === i
                    ? "var(--color-pixel-leaf)"
                    : "var(--color-moss-green)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                imageRendering: "pixelated",
                boxShadow:
                  currentIndex === i
                    ? "0 0 8px rgba(74,222,128,0.4)"
                    : "none",
              }}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={goNext}
          aria-label="Next project"
          disabled={currentIndex === projects.length - 1}
          style={{
            backgroundColor: currentIndex < projects.length - 1 ? "var(--color-pixel-leaf)" : "var(--color-moss-green)",
            color: currentIndex < projects.length - 1 ? "var(--color-black)" : "var(--color-cream)",
            border: currentIndex < projects.length - 1 ? "2px solid var(--color-cream)" : "2px solid rgba(0,0,0,0.2)",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: currentIndex < projects.length - 1 ? "pointer" : "default",
            opacity: currentIndex < projects.length - 1 ? 1 : 0.5,
            boxShadow: currentIndex < projects.length - 1 ? "2px 2px 0px rgba(0,0,0,0.5)" : "none",
            transition: "all 0.2s",
          }}
          className="pixel-font"
        >
          <ChevronRight size={18} strokeWidth={3} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseAcceptBtn {
          0%, 100% { box-shadow: 4px 4px 0px rgba(0,0,0,0.5), 0 0 0px rgba(74,222,128,0); }
          50% { box-shadow: 4px 4px 0px rgba(0,0,0,0.5), 0 0 16px rgba(74,222,128,0.5); }
        }
        @keyframes swipeHintPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      ` }} />

    </div>
  );
}
