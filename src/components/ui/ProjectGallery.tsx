"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ProjectMap from "./ProjectMap";
import MobileCarousel from "./MobileCarousel";
import QuestPopup from "./QuestPopup";
import { QUEST_PROJECTS, Project } from "../../lib/questData";

export default function ProjectGallery({ playSfx, onQuestNavigate }: { playSfx?: any, onQuestNavigate?: (slug: string) => void }) {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  // isMounted prevents createPortal from running on the server (SSR safety)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: isMobile ? "12px 10px 10px 10px" : "24px 16px 16px 16px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? "0.5rem" : "1rem" }}>
          <h2
            className="pixel-font"
            style={{
              fontSize: isMobile ? "1.1rem" : "1.6rem",
              color: "var(--color-cream)",
              textShadow: "3px 3px 0px var(--color-black)",
              margin: 0,
            }}
          >
            QUEST BOARD (PROJECTS)
          </h2>
          <p
            className="pixelify-font"
            style={{
              color: "var(--color-cream)",
              marginTop: "0.4rem",
              opacity: 0.6,
              fontStyle: "italic",
              fontSize: isMobile ? "0.7rem" : "0.85rem",
              margin: 0,
            }}
          >
            {isMobile
              ? "Geser & tap catatan untuk menerima quest"
              : "Klik catatan untuk menerima quest · Drag untuk menjelajahi papan"}
          </p>
        </div>

        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          {isMobile ? (
            <MobileCarousel
              projects={QUEST_PROJECTS}
              onSelectProject={setSelectedProject}
            />
          ) : (
            <ProjectMap
              projects={QUEST_PROJECTS}
              onSelectProject={setSelectedProject}
            />
          )}
        </div>
      </div>

      {/*
        QuestPopup dirender via createPortal ke document.body.
        Ini WAJIB karena ProjectGallery hidup di dalam R3F <Html transform>,
        yang menerapkan CSS transform ke ancestor — membuat position:fixed
        "terjebak" dalam konteks transform dan tidak muncul di viewport.
        Portal melewati constraint ini sepenuhnya.
      */}
      {isMounted && createPortal(
        <QuestPopup
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          playSfx={playSfx}
          onQuestNavigate={onQuestNavigate}
        />,
        document.body
      )}
    </>
  );
}
