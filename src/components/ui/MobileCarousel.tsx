"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Project {
  title: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  live_url?: string;
}

interface MobileCarouselProps {
  projects: Project[];
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

export default function MobileCarousel({ projects }: MobileCarouselProps) {
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

  // Detect scroll to update current index and restart timer
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

      const scrollLeft = el.scrollLeft;
      const cardWidth = el.offsetWidth * 0.88 + 16;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [startArrowTimer, hasInteracted]);

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
    <div style={{ position: "relative", width: "100%" }}>
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
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "16px",
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
              style={{
                flex: "0 0 88%",
                scrollSnapAlign: "center",
                position: "relative",
                transform: `rotate(${getTilt(i)}deg)`,
                transition: "transform 0.3s ease",
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
                  padding: "24px 20px 20px",
                  position: "relative",
                  boxShadow:
                    "2px 4px 12px rgba(0,0,0,0.2), 1px 1px 0px rgba(0,0,0,0.05)",
                  imageRendering: "pixelated",
                  borderBottom: "2px solid rgba(0,0,0,0.06)",
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

                {/* Project Number */}
                <div
                  className="pixel-font"
                  style={{
                    fontSize: "0.55rem",
                    color: "rgba(0,0,0,0.3)",
                    marginBottom: "8px",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  #{String(i + 1).padStart(2, "0")}
                </div>

                {/* Title */}
                <div
                  className="pixel-font"
                  style={{
                    fontSize: "0.85rem",
                    color: "#1a1a2e",
                    marginBottom: "12px",
                    lineHeight: 1.5,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {project.title}
                </div>

                {/* Description — always visible on mobile */}
                <p
                  className="pixelify-font"
                  style={{
                    fontSize: "0.85rem",
                    color: "#333",
                    lineHeight: 1.7,
                    marginBottom: "14px",
                    position: "relative",
                    zIndex: 2,
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
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="pixel-font"
                      style={{
                        fontSize: "0.48rem",
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

                {/* Links */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "14px",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="pixel-font"
                      style={{
                        fontSize: "0.5rem",
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
                      className="pixel-font"
                      style={{
                        fontSize: "0.5rem",
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows — highlighted after 3s of no interaction */}
      {/* Left Arrow */}
      {currentIndex > 0 && (
        <button
          onClick={goPrev}
          aria-label="Previous project"
          style={{
            position: "absolute",
            left: "4px",
            top: "55%",
            transform: "translateY(-50%)",
            backgroundColor: showArrow
              ? "var(--color-pixel-leaf)"
              : "rgba(2,6,23,0.7)",
            color: showArrow ? "var(--color-black)" : "var(--color-cream)",
            border: showArrow
              ? "3px solid var(--color-cream)"
              : "2px solid var(--color-moss-green)",
            width: "42px",
            height: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 20,
            boxShadow: showArrow
              ? "0 0 18px rgba(74,222,128,0.6), 0 0 40px rgba(74,222,128,0.2), 4px 4px 0px rgba(0,0,0,0.5)"
              : "2px 2px 0px rgba(0,0,0,0.5)",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            animation: showArrow
              ? "pulseArrow 1.2s ease-in-out infinite"
              : "none",
            fontSize: "1.2rem",
          }}
          className="pixel-font"
        >
          ◀
        </button>
      )}

      {/* Right Arrow */}
      {currentIndex < projects.length - 1 && (
        <button
          onClick={goNext}
          aria-label="Next project"
          style={{
            position: "absolute",
            right: "4px",
            top: "55%",
            transform: "translateY(-50%)",
            backgroundColor: showArrow
              ? "var(--color-pixel-leaf)"
              : "rgba(2,6,23,0.7)",
            color: showArrow ? "var(--color-black)" : "var(--color-cream)",
            border: showArrow
              ? "3px solid var(--color-cream)"
              : "2px solid var(--color-moss-green)",
            width: "42px",
            height: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 20,
            boxShadow: showArrow
              ? "0 0 18px rgba(74,222,128,0.6), 0 0 40px rgba(74,222,128,0.2), 4px 4px 0px rgba(0,0,0,0.5)"
              : "2px 2px 0px rgba(0,0,0,0.5)",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            animation: showArrow
              ? "pulseArrow 1.2s ease-in-out infinite"
              : "none",
            fontSize: "1.2rem",
          }}
          className="pixel-font"
        >
          ▶
        </button>
      )}

      {/* Dot indicators — pixel style */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "14px",
        }}
      >
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulseArrow {
              0%, 100% { transform: translateY(-50%) scale(1); }
              50% { transform: translateY(-50%) scale(1.18); }
            }
            @keyframes swipeHintPulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 0.2; }
            }
            /* Hide scrollbar */
            div::-webkit-scrollbar { display: none; }
          `,
        }}
      />
    </div>
  );
}
