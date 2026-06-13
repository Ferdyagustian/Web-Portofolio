// ============================================================
// questData.ts — Central data layer untuk semua project quest
// Semua data project + konten quest detail terpusat di sini
// ============================================================

export type QuestStatus = "completed" | "in-progress" | "archived";
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface MediaItem {
  type: "image" | "youtube" | "gif";
  url: string;
  caption: string;
}

export interface JourneyStep {
  phase: string;
  description: string;
  imageUrl?: string;
}

export interface QuestContent {
  overview: string;
  journey: JourneyStep[];
  media: MediaItem[];
  learnings: string[];
  challenges: string[];
  rewards: string[]; // tech / skills gained
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  live_url?: string;
  difficulty: Difficulty;
  duration: string;
  status: QuestStatus;
  thumbnail?: string;
  questContent: QuestContent;
}

// ============================================================
// QUEST DATA — Isi dengan konten nyata saat sudah tersedia
// ============================================================

export const QUEST_PROJECTS: Project[] = [
  {
    slug: "pixel-forest-journey",
    title: "Pixel Forest Journey (Portofolio)",
    description:
      "Sebuah cerita interaktif berbasis WebGL yang mengajak pengguna menjelajahi hutan piksel. Dibangun dengan Three.js dan animasi GSAP untuk pengalaman imersif.",
    tech_stack: ["React", "Three.js", "GSAP", "Next.js"],
    github_url: "https://github.com/Ferdyagustian",
    difficulty: 4,
    duration: "~3 bulan",
    status: "in-progress",
    questContent: {
      overview:
        "Portofolio ini lahir dari keinginan untuk membuat pengalaman yang berbeda dari portofolio konvensional. Daripada hanya daftar proyek biasa, bagaimana jika pengunjung bisa menjelajahi dunia pixel art interaktif? Itulah titik awal dari Pixel Forest Journey.",
      journey: [
        {
          phase: "Phase 1 — Konsep & Desain",
          description:
            "Merancang konsep dunia RPG pixel art sebagai wadah portofolio. Menentukan tema, palet warna, dan pengalaman pengguna yang ingin dicapai. Inspirasi dari game Stardew Valley dan Zelda.",
        },
        {
          phase: "Phase 2 — 3D Scene & WebGL",
          description:
            "Membangun scene 3D menggunakan React Three Fiber dan Three.js. Implementasi trees, bushes, fireflies, dan sistem pencahayaan dinamis berdasarkan waktu nyata.",
        },
        {
          phase: "Phase 3 — Sistem Tema Waktu",
          description:
            "Membuat sistem theme yang berubah otomatis berdasarkan jam nyata pengguna (pagi/siang/sore/malam) dengan transisi warna yang smooth menggunakan lerp interpolation.",
        },
        {
          phase: "Phase 4 — UI & Interaksi",
          description:
            "Membangun semua komponen UI: Quest Board, Skill Panel, Dialogue Box, dan Contact Form. Semua diintegrasikan ke dalam world 3D sebagai spatial UI.",
        },
      ],
      media: [
        {
          type: "youtube",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          caption: "Demo walkthrough Pixel Forest Journey (coming soon)",
        },
      ],
      learnings: [
        "WebGL rendering optimization untuk performa tinggi di browser",
        "Spatial UI design — menggabungkan 2D UI dengan dunia 3D",
        "GSAP animation pipeline untuk transisi yang halus",
        "Time-based theming system dengan CSS custom properties",
        "React Three Fiber ecosystem (Drei, Fiber, Postprocessing)",
      ],
      challenges: [
        "Optimasi performa — terlalu banyak instance mesh menyebabkan frame drop",
        "Sinkronisasi antara React state dan Three.js render loop",
        "Responsivitas di mobile dengan keterbatasan GPU",
      ],
      rewards: ["React", "Three.js", "GSAP", "WebGL", "Next.js", "TypeScript"],
    },
  },
  {
    slug: "sentiment-analysis-strava",
    title: "Sentiment Analysis Strava dengan Metode LSTM BI",
    description:
      "Membangun model machine learning untuk menganalisis sentimen pengguna Strava menggunakan metode BI-LSTM.",
    tech_stack: ["Python", "Scikit-Learn", "Pandas", "numpy", "sastrawi", "Kaggle"],
    github_url: "https://github.com/Ferdyagustian",
    difficulty: 3,
    duration: "~2 bulan",
    status: "completed",
    questContent: {
      overview:
        "Proyek ini bertujuan untuk menganalisis sentimen ulasan pengguna aplikasi Strava di Google Play Store menggunakan model Bidirectional LSTM. Dataset dikumpulkan dari scraping ulasan berbahasa Indonesia.",
      journey: [
        {
          phase: "Phase 1 — Data Collection",
          description:
            "Mengumpulkan dataset ulasan Strava dari Google Play Store menggunakan Google Play Scraper. Total lebih dari 10.000 ulasan berbahasa Indonesia.",
        },
        {
          phase: "Phase 2 — Preprocessing",
          description:
            "Membersihkan data: case folding, remove stopwords menggunakan Sastrawi, tokenisasi, dan stemming untuk teks bahasa Indonesia.",
        },
        {
          phase: "Phase 3 — Model Training",
          description:
            "Membangun dan melatih model Bidirectional LSTM dengan embedding layer. Eksperimen dengan berbagai hyperparameter untuk mendapatkan akurasi optimal.",
        },
        {
          phase: "Phase 4 — Evaluasi",
          description:
            "Mengevaluasi model menggunakan confusion matrix, precision, recall, dan F1-score. Model mencapai akurasi ~85% pada test set.",
        },
      ],
      media: [
        {
          type: "youtube",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          caption: "Presentasi hasil penelitian (coming soon)",
        },
      ],
      learnings: [
        "NLP untuk bahasa Indonesia dengan Sastrawi stemmer",
        "Arsitektur Bidirectional LSTM untuk sequence classification",
        "Data preprocessing pipeline untuk teks tidak terstruktur",
        "Evaluasi model dengan berbagai metrik klasifikasi",
      ],
      challenges: [
        "Kualitas data yang tidak konsisten dari ulasan pengguna",
        "Ambiguitas bahasa Indonesia informal dan slang",
        "Imbalanced dataset antara sentimen positif dan negatif",
      ],
      rewards: ["Python", "TensorFlow/Keras", "NLP", "LSTM", "Data Science"],
    },
  },
  {
    slug: "family-bakery-stock-control",
    title: "Family Bakery Stock Control System",
    description:
      "Aplikasi web untuk membantu mengelola stok barang di berbagai cabang dalam suatu toko keluarga.",
    tech_stack: ["Next.js", "React", "Typescript", "PostgreSQL"],
    github_url: "https://github.com/Ferdyagustian",
    difficulty: 3,
    duration: "~2 bulan",
    status: "completed",
    questContent: {
      overview:
        "Sebuah toko bakeri keluarga menghadapi kesulitan mengelola stok di beberapa cabang secara manual menggunakan spreadsheet. Sistem ini dibangun untuk mengotomasi dan mempermudah proses tersebut.",
      journey: [
        {
          phase: "Phase 1 — Requirements Analysis",
          description:
            "Wawancara dengan pemilik toko untuk memahami alur kerja bisnis, titik nyeri, dan fitur yang dibutuhkan. Membuat user story dan flow diagram.",
        },
        {
          phase: "Phase 2 — Database Design",
          description:
            "Merancang skema database PostgreSQL untuk multi-cabang: tabel produk, stok per cabang, transaksi, dan laporan.",
        },
        {
          phase: "Phase 3 — Development",
          description:
            "Membangun aplikasi full-stack dengan Next.js App Router. CRUD stok, sistem transfer antar cabang, dan dashboard laporan.",
        },
        {
          phase: "Phase 4 — Testing & Deployment",
          description:
            "User acceptance testing bersama pemilik toko, perbaikan bug, dan deployment ke Vercel dengan database PostgreSQL.",
        },
      ],
      media: [
        {
          type: "youtube",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          caption: "Demo aplikasi stok kontrol (coming soon)",
        },
      ],
      learnings: [
        "Next.js App Router dengan Server Components",
        "PostgreSQL query optimization untuk laporan agregasi",
        "Multi-tenant architecture untuk manajemen cabang",
        "TypeScript strict mode untuk keandalan kode",
      ],
      challenges: [
        "Sinkronisasi stok real-time antar cabang",
        "Validasi data yang kompleks untuk transfer stok",
        "UI yang mudah digunakan oleh staf non-teknis",
      ],
      rewards: ["Next.js", "PostgreSQL", "TypeScript", "Full-Stack Development"],
    },
  },
  {
    slug: "smart-campus-portal",
    title: "Smart Campus Portal",
    description:
      "Platform manajemen kampus terintegrasi untuk mahasiswa dan dosen. Mengelola jadwal, nilai, dan komunikasi akademik dalam satu aplikasi.",
    tech_stack: ["Next.js", "PostgreSQL", "Supabase"],
    github_url: "https://github.com/Ferdyagustian",
    difficulty: 4,
    duration: "~3 bulan",
    status: "completed",
    questContent: {
      overview:
        "Smart Campus Portal adalah solusi terpadu untuk manajemen akademik kampus. Proyek ini dibangun untuk menjawab kebutuhan sistem informasi yang lebih modern dan efisien dibandingkan sistem konvensional.",
      journey: [
        {
          phase: "Phase 1 — Arsitektur Sistem",
          description:
            "Merancang arsitektur aplikasi multi-role (mahasiswa, dosen, admin). Memilih Supabase untuk autentikasi dan real-time database.",
        },
        {
          phase: "Phase 2 — Autentikasi & Authorization",
          description:
            "Implementasi sistem login multi-role dengan Supabase Auth, Row Level Security (RLS) untuk keamanan data per-role.",
        },
        {
          phase: "Phase 3 — Fitur Akademik",
          description:
            "Membangun modul jadwal kuliah, input nilai, pengumuman, dan sistem pengajuan dokumen akademik.",
        },
        {
          phase: "Phase 4 — Real-time Features",
          description:
            "Implementasi notifikasi real-time menggunakan Supabase Realtime untuk pengumuman dan update jadwal.",
        },
      ],
      media: [
        {
          type: "youtube",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          caption: "Demo Smart Campus Portal (coming soon)",
        },
      ],
      learnings: [
        "Supabase sebagai Backend-as-a-Service: Auth, DB, Realtime",
        "Row Level Security (RLS) untuk keamanan data multi-tenant",
        "Next.js Server Actions untuk form submission",
        "Real-time subscription dengan Supabase Realtime",
      ],
      challenges: [
        "Kompleksitas permission system untuk tiga role berbeda",
        "Performance optimization untuk query dengan join banyak tabel",
        "UX yang konsisten untuk pengguna non-teknis (dosen, staf)",
      ],
      rewards: ["Next.js", "Supabase", "PostgreSQL", "Real-time Systems", "Multi-role Auth"],
    },
  },
  {
    slug: "chatbot-assistant",
    title: "Chat Bot Assistant",
    description:
      "Asisten chatbot berbasis NLP yang mampu menjawab pertanyaan FAQ dan membantu navigasi website. Dilatih dengan dataset custom.",
    tech_stack: ["Python", "TensorFlow", "FastAPI"],
    github_url: "https://github.com/Ferdyagustian",
    difficulty: 3,
    duration: "~6 minggu",
    status: "completed",
    questContent: {
      overview:
        "Chatbot ini dibangun untuk membantu pengguna website menemukan informasi yang mereka butuhkan dengan cepat melalui percakapan natural. Model dilatih dengan dataset intent dan response custom.",
      journey: [
        {
          phase: "Phase 1 — Intent Design",
          description:
            "Merancang struktur intent dan entity untuk domain FAQ website. Membuat dataset training dengan variasi pertanyaan yang beragam.",
        },
        {
          phase: "Phase 2 — Model Training",
          description:
            "Melatih model klasifikasi intent menggunakan TensorFlow/Keras dengan arsitektur feedforward neural network dan embedding layer.",
        },
        {
          phase: "Phase 3 — API Development",
          description:
            "Membangun REST API menggunakan FastAPI untuk serving model. Implementasi endpoint predict dan sistem logging conversation.",
        },
        {
          phase: "Phase 4 — Frontend Integration",
          description:
            "Membuat widget chat interaktif yang terintegrasi dengan API, dengan UI yang familiar dan responsif.",
        },
      ],
      media: [
        {
          type: "youtube",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          caption: "Demo chatbot assistant (coming soon)",
        },
      ],
      learnings: [
        "Intent classification dengan TensorFlow/Keras",
        "FastAPI untuk high-performance ML model serving",
        "Conversation state management",
        "Dataset engineering untuk NLP",
      ],
      challenges: [
        "Menangani variasi bahasa yang tidak terduga dari pengguna",
        "Fallback yang baik untuk intent yang tidak dikenali",
        "Latency model inference di production",
      ],
      rewards: ["Python", "TensorFlow", "FastAPI", "NLP", "REST API Design"],
    },
  },
];

// Helper: get project by slug
export function getQuestBySlug(slug: string): Project | undefined {
  return QUEST_PROJECTS.find((p) => p.slug === slug);
}

// Helper: difficulty label
export function getDifficultyLabel(d: Difficulty): string {
  return ["", "Mudah", "Pemula", "Menengah", "Sulit", "Sangat Sulit"][d];
}

// Helper: difficulty color
export function getDifficultyColor(d: Difficulty): string {
  return ["", "#4ade80", "#60a5fa", "#fbbf24", "#f87171", "#c084fc"][d];
}

// Helper: status display
export function getStatusDisplay(s: QuestStatus): { label: string; color: string } {
  const map: Record<QuestStatus, { label: string; color: string }> = {
    completed: { label: "COMPLETED", color: "#4ade80" },
    "in-progress": { label: "IN PROGRESS", color: "#fbbf24" },
    archived: { label: "ARCHIVED", color: "#9ca3af" },
  };
  return map[s];
}

// ============================================================
// SESSION STORAGE HELPERS — Quest acceptance tracking
// ============================================================

const SESSION_KEY = "accepted_quests";

export function getAcceptedQuests(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]");
  } catch {
    return [];
  }
}

export function acceptQuest(slug: string): void {
  if (typeof window === "undefined") return;
  const current = getAcceptedQuests();
  if (!current.includes(slug)) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...current, slug]));
  }
}

export function isQuestAccepted(slug: string): boolean {
  return getAcceptedQuests().includes(slug);
}
