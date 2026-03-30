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
    <section
      id="projects"
      style={{
        minHeight: "100vh",
        padding: "80px 5% 40px 5%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2
          className="pixel-font"
          style={{
            fontSize: isMobile ? "1.4rem" : "2rem",
            color: "var(--color-cream)",
            textShadow: "4px 4px 0px var(--color-black)",
          }}
        >
          QUEST BOARD (PROJECTS)
        </h2>
        <p
          className="pixelify-font"
          style={{
            color: "var(--color-cream)",
            marginTop: "0.8rem",
            opacity: 0.6,
            fontStyle: "italic",
            fontSize: isMobile ? "0.85rem" : "1rem",
          }}
        >
          {isMobile
            ? "Geser catatan untuk membaca setiap project"
            : "Klik & drag untuk menjelajahi papan project"}
        </p>
      </div>

      {isMobile ? (
        <MobileCarousel projects={DUMMY_PROJECTS} />
      ) : (
        <ProjectMap projects={DUMMY_PROJECTS} />
      )}
    </section>
  );
}
