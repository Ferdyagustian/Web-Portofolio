"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  Project,
  getDifficultyLabel,
  getDifficultyColor,
  getStatusDisplay,
  acceptQuest,
  isQuestAccepted,
} from "../../lib/questData";

interface QuestPopupProps {
  project: Project | null;
  onClose: () => void;
  playSfx?: any;
  onQuestNavigate?: (slug: string) => void;
}

export default function QuestPopup({ project, onClose, playSfx, onQuestNavigate }: QuestPopupProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = !!project;
  const [isNavigating, setIsNavigating] = useState(false);

  // Animate in/out with CSS transitions driven by isOpen
  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    if (isOpen) {
      // Prevent background scroll
      document.body.style.overflow = "hidden";
      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        overlay.style.backdropFilter = "blur(8px)";
        overlay.style.pointerEvents = "auto";
        panel.style.opacity = "1";
        panel.style.transform = "translateY(0) scale(1)";
      });
    } else {
      document.body.style.overflow = "";
      overlay.style.opacity = "0";
      overlay.style.backdropFilter = "blur(0px)";
      overlay.style.pointerEvents = "none";
      panel.style.opacity = "0";
      panel.style.transform = "translateY(32px) scale(0.95)";
    }
  }, [isOpen]);

  // Keyboard: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isNavigating) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isNavigating]);

  const handleAccept = useCallback(() => {
    if (!project) return;
    
    if (!isQuestAccepted(project.slug)) {
      if (playSfx) playSfx('success');
    } else {
      if (playSfx) playSfx('click');
    }
    
    acceptQuest(project.slug);
    setIsNavigating(true);

    setTimeout(() => {
      // If we have Next.js router callback (soft navigation), use it
      if (onQuestNavigate) {
        onQuestNavigate(project.slug);
      } else {
        // Fallback for isolated React Three Fiber <Html> where context is lost
        window.location.assign(`/quest/${project.slug}`);
      }
    }, 700);
  }, [project, playSfx, onQuestNavigate]);

  const alreadyAccepted = project ? isQuestAccepted(project.slug) : false;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10100,
          background: "rgba(5, 8, 4, 0.75)",
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.35s ease, backdrop-filter 0.35s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        {/* Panel — stops click propagation */}
        <div
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            opacity: 0,
            transform: "translateY(32px) scale(0.95)",
            transition: "opacity 0.4s cubic-bezier(0.34,1.56,0.64,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            width: "100%",
            maxWidth: "480px",
            backgroundColor: "#1a0f0a",
            border: "4px solid #5c3a1e",
            boxShadow: "8px 8px 0px #000, 0 0 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Corner pixel decorations */}
          <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, backgroundColor: "#5c3a1e" }} />
          <div style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, backgroundColor: "#5c3a1e" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 12, height: 12, backgroundColor: "#5c3a1e" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, backgroundColor: "#5c3a1e" }} />

          {/* Cork texture overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(101,67,33,0.03) 0px, rgba(101,67,33,0.03) 1px, transparent 1px, transparent 8px)",
              pointerEvents: "none",
            }}
          />

          {/* Header banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #3d2b1f, #5c3a1e, #3d2b1f)",
              borderBottom: "3px solid #5c3a1e",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              className="pixel-font"
              style={{
                fontSize: "0.75rem",
                color: "#fbbf24",
                letterSpacing: "3px",
                textShadow: "2px 2px 0px #000",
              }}
            >
              [ QUEST AVAILABLE ]
            </div>
            {/* Close button */}
            <button
              onClick={() => { if (playSfx) playSfx('click'); onClose(); }}
              aria-label="Tutup quest popup"
              className="pixel-font"
              style={{
                background: "none",
                border: "2px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontSize: "0.7rem",
                padding: "2px 8px",
                lineHeight: 1,
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (playSfx) playSfx('hover');
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#f87171";
                (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
              }}
            >
              X
            </button>
          </div>

          {/* Body */}
          <div 
            className="custom-scrollbar-container" 
            style={{ padding: "20px 24px 24px", maxHeight: "70vh", overflowY: "auto" }}
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {project && (
              <>
                {/* Quest number */}
                <div
                  className="pixel-font"
                  style={{
                    fontSize: "0.5rem",
                    color: "rgba(251,191,36,0.6)",
                    letterSpacing: "2px",
                    marginBottom: "6px",
                  }}
                >
                  #{String(QUEST_PROJECTS_ORDER(project) + 1).padStart(2, "0")} ·{" "}
                  {getStatusDisplay(project.status).label}
                </div>

                {/* Title */}
                <div
                  className="pixel-font"
                  style={{
                    fontSize: "0.85rem",
                    color: "#faf3e0",
                    lineHeight: 1.5,
                    marginBottom: "16px",
                    textShadow: "2px 2px 0px #000",
                  }}
                >
                  {project.title}
                </div>

                {/* Video Template Placeholder */}
                {project.questContent?.media?.length > 0 && project.questContent.media[0].type === "youtube" && (
                  <div style={{ marginBottom: "16px", border: "2px solid rgba(255,255,255,0.1)", backgroundColor: "#000", boxShadow: "4px 4px 0px rgba(0,0,0,0.5)" }}>
                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                      <iframe
                        src={project.questContent.media[0].url}
                        title="Project Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  {/* Difficulty */}
                  <div
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      className="pixel-font"
                      style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.4)", marginBottom: "6px", letterSpacing: "1px" }}
                    >
                      DIFFICULTY
                    </div>
                    <div style={{ display: "flex", gap: "3px", marginBottom: "4px" }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor: i < project.difficulty ? getDifficultyColor(project.difficulty) : "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(0,0,0,0.3)",
                          }}
                        />
                      ))}
                    </div>
                    <div
                      className="pixel-font"
                      style={{ fontSize: "0.55rem", color: getDifficultyColor(project.difficulty) }}
                    >
                      {getDifficultyLabel(project.difficulty)}
                    </div>
                  </div>

                  {/* Duration */}
                  <div
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      className="pixel-font"
                      style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.4)", marginBottom: "6px", letterSpacing: "1px" }}
                    >
                      DURASI
                    </div>
                    <div
                      className="pixel-font"
                      style={{ fontSize: "0.75rem", color: "#faf3e0" }}
                    >
                      {project.duration}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p
                  className="pixelify-font"
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(250,243,224,0.75)",
                    lineHeight: 1.65,
                    marginBottom: "16px",
                  }}
                >
                  {project.description}
                </p>

                {/* Tech stack */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "20px" }}>
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="pixel-font"
                      style={{
                        fontSize: "0.6rem",
                        padding: "3px 8px",
                        backgroundColor: "#2d5a27",
                        color: "#fbf8cc",
                        border: "1px solid #1a3a15",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                    marginBottom: "18px",
                  }}
                />

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {/* Accept */}
                  <button
                    id={`accept-quest-${project.slug}`}
                    onClick={handleAccept}
                    className="pixel-font"
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      backgroundColor: "#2d5a27",
                      color: "#fbf8cc",
                      border: "3px solid #4ade80",
                      cursor: "pointer",
                      fontSize: "0.65rem",
                      letterSpacing: "1.5px",
                      boxShadow: "4px 4px 0px #000",
                      transition: "transform 0.1s, box-shadow 0.1s, background-color 0.2s",
                      textShadow: "2px 2px 0px #000",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (playSfx) playSfx('hover');
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#3d7a35";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translate(-2px, -2px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "6px 6px 0px #000";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2d5a27";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translate(0,0)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "4px 4px 0px #000";
                    }}
                    onMouseDown={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translate(2px, 2px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0px #000";
                    }}
                    onMouseUp={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translate(-2px,-2px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "6px 6px 0px #000";
                    }}
                  >
                    {alreadyAccepted ? "[OK] LIHAT KEMBALI" : "[!] ACCEPT QUEST"}
                  </button>

                  {/* Decline */}
                  <button
                    id={`decline-quest-${project.slug}`}
                    onClick={() => { if (playSfx) playSfx('click'); onClose(); }}
                    className="pixel-font"
                    style={{
                      flex: "0 0 auto",
                      padding: "12px 16px",
                      backgroundColor: "transparent",
                      color: "rgba(250,243,224,0.5)",
                      border: "3px solid rgba(255,255,255,0.12)",
                      cursor: "pointer",
                      fontSize: "0.65rem",
                      letterSpacing: "1px",
                      boxShadow: "3px 3px 0px rgba(0,0,0,0.5)",
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (playSfx) playSfx('hover');
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#f87171";
                      (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(250,243,224,0.5)";
                    }}
                  >
                    [X] DECLINE
                  </button>
                </div>

                {/* Already accepted hint */}
                {alreadyAccepted && (
                  <div
                    className="pixelify-font"
                    style={{
                      marginTop: "10px",
                      fontSize: "0.7rem",
                      color: "#4ade80",
                      textAlign: "center",
                      opacity: 0.7,
                    }}
                  >
                    Quest ini sudah pernah kamu terima sebelumnya
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Teleport Transition overlay */}
      {isNavigating && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "#0a0a0c",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            animation: "teleportFadeIn 0.2s ease-out forwards",
          }}
        >
          <div className="pixel-font animate-pulse" style={{ color: "#fbbf24", fontSize: "1.5rem", letterSpacing: "4px", marginBottom: "24px" }}>
            TELEPORTING...
          </div>
          <div style={{ width: "200px", height: "16px", border: "3px solid #fbbf24", padding: "2px" }}>
            <div style={{ height: "100%", background: "#fbbf24", animation: "teleportBar 0.5s linear forwards" }} />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes questPopIn {
          0% { transform: translateY(32px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes teleportFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes teleportBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      ` }} />
    </>
  );
}

// Helper: get order index of a project in the quest list
function QUEST_PROJECTS_ORDER(project: Project): number {
  // Import inline to avoid circular — use slug comparison
  const slugs = [
    "pixel-forest-journey",
    "sentiment-analysis-strava",
    "family-bakery-stock-control",
    "smart-campus-portal",
    "chatbot-assistant",
  ];
  return slugs.indexOf(project.slug);
}
