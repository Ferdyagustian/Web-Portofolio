"use client";

import { useState, useEffect } from "react";
import ProjectMap from "./ProjectMap";
import MobileCarousel from "./MobileCarousel";

interface Project {
  title: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  live_url?: string;
}

const DUMMY_PROJECTS: Project[] = [
  {
    title: "Pixel Forest Journey (Portofolio)",
    description:
      "Sebuah cerita interaktif berbasis WebGL yang mengajak pengguna menjelajahi hutan piksel. Dibangun dengan Three.js dan animasi GSAP untuk pengalaman imersif.",
    tech_stack: ["React", "Three.js", "GSAP"],
    github_url: "https://github.com/Ferdyagustian",
  },
  {
    title: "Sentiment Analysis Strava Dengan Metode LSTM BI",
    description:
      "Membangun model machine learning untuk menganalisis sentimen pengguna Strava menggunakan metode BI-LSTM .",
    tech_stack: ["Python", "Scikit-Learn", "Pandas", "numpy", "sastrawi", "Kaggle"],
    github_url: "https://github.com/Ferdyagustian",
  },
  {
    title: "Family Bakery Stock Control System",
    description:
      "Aplikasi web untuk membantu mengelola stok barang di berbagai cabang dalam suatu toko keluarga.",
    tech_stack: ["Next.js", "React", "Typescript", "PostgreSQL"],
    github_url: "https://github.com/Ferdyagustian",
  },
  {
    title: "Smart Campus Portal",
    description:
      "Platform manajemen kampus terintegrasi untuk mahasiswa dan dosen. Mengelola jadwal, nilai, dan komunikasi akademik dalam satu aplikasi.",
    tech_stack: ["Next.js", "PostgreSQL", "Supabase"],
    github_url: "https://github.com/Ferdyagustian",
  },
  {
    title: "Chat Bot Assistant",
    description:
      "Asisten chatbot berbasis NLP yang mampu menjawab pertanyaan FAQ dan membantu navigasi website. Dilatih dengan dataset custom.",
    tech_stack: ["Python", "TensorFlow", "FastAPI"],
    github_url: "https://github.com/Ferdyagustian",
  },
];

export default function ProjectGallery() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: isMobile ? "12px 10px 10px 10px" : "24px 16px 16px 16px",
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: isMobile ? "0.5rem" : "1rem" }}>
        <h2
          className="pixel-font"
          style={{
            fontSize: isMobile ? "1.1rem" : "1.6rem",
            color: "var(--color-cream)",
            textShadow: "3px 3px 0px var(--color-black)",
            margin: 0
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
            margin: 0
          }}
        >
          {isMobile
            ? "Geser catatan untuk membaca setiap project"
            : "Klik & drag untuk menjelajahi papan project"}
        </p>
      </div>

      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {isMobile ? (
          <MobileCarousel projects={DUMMY_PROJECTS} />
        ) : (
          <ProjectMap projects={DUMMY_PROJECTS} />
        )}
      </div>
    </div>
  );
}
