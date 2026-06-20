# 📖 DOKUMENTASI KODE — Pixel Portfolio (Ferdy Agustian)

> **Terakhir diperbarui:** 19 Juni 2026  
> **Framework:** Next.js 16 + React 19 + TypeScript  
> **Dibuat oleh:** Ferdy Agustian Prasetyo  
> **URL:** https://slowwalkferdy.vercel.app

---

## 📑 DAFTAR ISI

1. [Gambaran Umum Proyek](#1-gambaran-umum-proyek)
2. [Struktur Folder](#2-struktur-folder)
3. [Teknologi & Dependensi](#3-teknologi--dependensi)
4. [Sistem Tema Waktu (Time-Based Theme)](#4-sistem-tema-waktu-time-based-theme)
5. [Providers (Penyedia Konteks)](#5-providers-penyedia-konteks)
6. [Komponen Layout](#6-komponen-layout)
7. [Komponen 3D / Three.js (PixelForest)](#7-komponen-3d--threejs-pixelforest)
8. [Komponen UI](#8-komponen-ui)
9. [API Routes (Backend)](#9-api-routes-backend)
10. [Styling (CSS)](#10-styling-css)
11. [Halaman Utama (page.tsx)](#11-halaman-utama-pagetsx)
12. [Alur Data & Arsitektur](#12-alur-data--arsitektur)
13. [Aset Publik](#13-aset-publik)
14. [Catatan Performa & Teknis](#14-catatan-performa--teknis)

---

## 1. Gambaran Umum Proyek

Website ini adalah **portofolio interaktif bergaya pixel art / RPG retro** yang dibangun di atas pengalaman 3D berbasis Three.js. Seluruh konten (About, Skills, Projects, Contact) ditampilkan sebagai **panel modal di atas dunia 3D**, bukan sebagai halaman HTML biasa yang di-scroll secara tradisional.

### Konsep Unik

- **Dunia 3D sebagai background**: Hutan piksel 3D animasi (pohon, semak, api unggun, daun jatuh) bertindak sebagai layar belakang yang hidup.
- **Dunia Utama & Halaman Detail**: Menggunakan `app/page.tsx` untuk dunia interaktif 3D utama, serta sistem *dynamic routing* `app/quest/[slug]/page.tsx` untuk menampilkan halaman rincian spesifik dari tiap proyek.
- **Navigasi Mulus**: Berpindah antar section 3D menggunakan `Lenis` (smooth scroll) dan `GSAP ScrollTrigger`.
- **Tema berubah otomatis**: Warna langit, cahaya, musik, dan efek kabut berubah mengikuti waktu nyata di Indonesia (WIB, UTC+7) — pagi, siang, sore, malam.
- **Kabut Interaktif**: Efek kabut GLSL shader merespons pergerakan mouse, kecepatan scroll, dan arah scroll pengguna.

---

## 2. Struktur Folder

```
c:\Portofolio web\
│
├── public/                         # Aset statis
│   ├── audio/                      # File audio (BGM & SFX)
│   │   ├── bgmpagi.mp3             # BGM tema Pagi
│   │   ├── bgmsiang.mp3            # BGM tema Siang
│   │   ├── bgmsore.mp3             # BGM tema Sore
│   │   ├── bgmmalam.mp3            # BGM tema Malam
│   │   ├── hover.wav               # SFX hover
│   │   ├── click.wav               # SFX klik
│   │   └── option.wav              # SFX buka menu settings
│   ├── pixel_avatar_profile.png    # Foto profil pixel art
│   ├── monkey.jpg                  # Gambar tambahan
│   └── loadingscreenweb.mp4        # Video loading screen
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + metadata SEO + font + providers
│   │   ├── page.tsx                # Halaman dunia 3D utama
│   │   ├── globals.css             # CSS global: tema, animasi, komponen UI
│   │   ├── robots.ts               # SEO: robots.txt
│   │   ├── sitemap.ts              # SEO: sitemap.xml
│   │   ├── icon.png                # Favicon utama (standar App Router)
│   │   ├── quest/
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Halaman detail dinamis untuk tiap proyek/quest
│   │   └── api/
│   │       └── contact/
│   │           └── route.ts        # API Route: kirim email + simpan ke Supabase
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx          # Navigasi atas (fixed, transparan → solid saat scroll)
│   │   ├── three/
│   │   │   ├── PixelForest.tsx     # 🌟 Komponen utama: seluruh adegan 3D + UI modal
│   │   │   ├── Avatar3DCanvas.tsx  # Kanvas 3D untuk tampilan avatar interaktif
│   │   │   └── environment/        # Kumpulan sub-komponen dunia 3D (Sky, Effects, SpatialUI, dll)
│   │   └── ui/
│   │       ├── DialogueBox.tsx     # Kotak dialog bergaya RPG (judul + konten)
│   │       ├── InteractiveAvatar.tsx # Avatar profil yang bisa di-klik untuk melihat 3D
│   │       ├── MobileCarousel.tsx  # Karousel proyek khusus mobile (swipe)
│   │       ├── ObservableSkill.tsx # Baris skill yang bisa di-klik untuk expand
│   │       ├── PixelButton.tsx     # Tombol bergaya pixel art
│   │       ├── PixelCard.tsx       # Kartu konten pixel art
│   │       ├── PixelCursor.tsx     # Kursor mouse kustom bergaya pixel
│   │       ├── ProjectGallery.tsx  # Galeri proyek desktop (layout papan pengumuman)
│   │       ├── ProjectMap.tsx      # Tampilan peta 2D untuk proyek (RPG map style)
│   │       ├── ProjectSignboard.tsx# Kartu proyek individual (gaya kertas tempel)
│   │       └── SettingsMenu.tsx    # Menu pengaturan audio (gear icon + panel kayu)
│   │
│   ├── lib/
│   │   ├── questData.ts            # Database utama: data seluruh proyek/quest dan propertinya
│   │   ├── themeConfig.ts          # Konfigurasi visual per tema (warna, cahaya, dll)
│   │   ├── useTimeTheme.ts         # Hook: deteksi tema berdasarkan jam WIB
│   │   └── supabase/
│   │       └── client.ts           # Koneksi Supabase (database pesan kontak)
│   │
│   ├── providers/
│   │   ├── AudioProvider.tsx       # Context: sistem audio BGM + SFX
│   │   ├── GSAPProvider.tsx        # Wrapper: register GSAP plugins
│   │   ├── LenisProvider.tsx       # Wrapper: smooth scroll Lenis
│   │   └── TimeThemeProvider.tsx   # Context: distribusi tema waktu ke seluruh app
│   │
│   └── stores/                     # (Kosong — dipersiapkan untuk Zustand di masa depan)
│
├── package.json                    # Dependensi npm
├── next.config.ts                  # Konfigurasi Next.js
├── tsconfig.json                   # Konfigurasi TypeScript
└── DOKUMENTASI.md                  # 📄 File ini
```

---

## 3. Teknologi & Dependensi

### Core Framework

| Paket | Versi | Fungsi |
|---|---|---|
| `next` | 16.2.1 | Framework React (App Router) |
| `react` | 19.2.4 | UI Library |
| `typescript` | ^5 | Type safety |

### 3D & Grafis

| Paket | Versi | Fungsi |
|---|---|---|
| `three` | ^0.183.2 | Library 3D WebGL |
| `@react-three/fiber` | ^9.5.0 | React binding untuk Three.js |
| `@react-three/drei` | ^10.7.7 | Helper 3D (OrbitControls, dll) |
| `@react-three/postprocessing` | ^3.0.4 | Post-processing (efek Pixelation) |

### Animasi

| Paket | Versi | Fungsi |
|---|---|---|
| `gsap` | ^3.14.2 | Animasi UI profesional + ScrollTrigger |
| `@gsap/react` | ^2.1.2 | React hooks untuk GSAP |
| `lenis` | ^1.3.21 | Smooth scroll |
| `@react-spring/web` | ^10.0.3 | Spring animation (dipersiapkan) |
| `@use-gesture/react` | ^10.3.1 | Gesture (drag, swipe) |

### Backend & Database

| Paket | Versi | Fungsi |
|---|---|---|
| `resend` | ^6.9.4 | Pengiriman email dari form kontak |
| `@supabase/supabase-js` | ^2.100.1 | Database (backup pesan kontak) |
| `postgres` | ^3.4.8 | Driver PostgreSQL |

### UI Utilities

| Paket | Versi | Fungsi |
|---|---|---|
| `lucide-react` | ^1.7.0 | Ikon SVG (panah navigasi carousel) |

### Google Fonts (via next/font)

| Font | Dipakai untuk |
|---|---|
| `Sixtyfour` | Judul, logo, tombol, elemen "retro" utama |
| `Pixelify Sans` | Teks informasi & konten |
| `VT323` | Teks game-style, label slider settings |

---

## 4. Sistem Tema Waktu (Time-Based Theme)

Salah satu fitur paling unik dari website ini. Tema visual (warna, musik, cahaya, kabut) berubah otomatis berdasarkan **jam lokal WIB (UTC+7)** pengguna.

### File Terkait
- `src/lib/useTimeTheme.ts` — Hook yang mendeteksi waktu
- `src/lib/themeConfig.ts` — Database konfigurasi visual per tema
- `src/providers/TimeThemeProvider.tsx` — Distribusi tema ke seluruh komponen

### Jadwal Tema

| Tema | Jam WIB | Deskripsi Visual |
|---|---|---|
| `pagi` | 05:00 – 10:59 | Langit pink-emas, matahari terbit dari kanan, tanpa kunang-kunang |
| `siang` | 11:00 – 14:59 | Langit biru cerah, matahari tinggi di tengah, intensitas cahaya maksimum |
| `sore` | 15:00 – 17:59 | Langit ungu-merah-oranye, matahari terbenam di kiri, suasana dramatis |
| `malam` | 18:00 – 04:59 | Langit biru-hitam, bulan purnama, kunang-kunang hidup, kabut tebal |

### Apa yang Berubah per Tema

Setiap tema mengkonfigurasi **30+ properti visual** yang mencakup:

- **Langit**: 5 gradien warna (bottom → top)
- **Benda langit**: Posisi & ukuran matahari/bulan, warna glow berlapis 4
- **Pencahayaan 3D**: Ambient light, main directional light, fill light
- **Fogground 3D**: `THREE.Fog` (warna, jarak near/far)
- **Warna scene**: Tanah, batang pohon, daun, semak, partikel daun
- **Kunang-kunang**: Warna, opacity (aktif hanya malam), ukuran
- **Awan**: Warna & opacity (hanya pagi & siang)
- **BGM**: Berganti otomatis dengan crossfade via `AudioProvider`

### Cara Kerja `useTimeTheme.ts`

```typescript
// Mengambil jam WIB setiap 60 detik
const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
const hour = wibTime.getHours();
// Mengembalikan 'pagi' | 'siang' | 'sore' | 'malam'
```

### CSS Tema

Tema juga mengubah CSS Variables di `<html>` melalui class:
```css
html.theme-pagi  { --color-forest-dark: #1a2a15; ... }
html.theme-siang { --color-forest-dark: #1a3a15; ... }
html.theme-sore  { --color-forest-dark: #0d0f0a; ... }
html.theme-malam { --color-forest-dark: #050510; ... }
```

---

## 5. Providers (Penyedia Konteks)

Semua provider dibungkus di `layout.tsx` dengan urutan berikut:

```
TimeThemeProvider
  └── AudioProvider
        └── (scanlines, PixelCursor, Navbar)
            └── LenisProvider
                  └── GSAPProvider
                        └── {children} (page.tsx)
            └── SettingsMenu
```

### 5.1 TimeThemeProvider (`TimeThemeProvider.tsx`)

- Membungkus `useTimeTheme()` dan mendistribusikan nilai tema via `React.createContext`
- Menambahkan/menghapus class `theme-*` pada elemen `<html>` saat tema berubah
- Semua komponen bisa akses tema dengan `useTheme()` hook

### 5.2 AudioProvider (`AudioProvider.tsx`)

Sistem audio paling kompleks. Menggunakan **dua layer audio**:

**Layer 1 — BGM (HTML5 Audio):**
- Dua elemen `<audio>` bergantian (audioRef1 & audioRef2) untuk crossfade tanpa jeda
- Crossfade durasi ~1 detik saat tema berubah (fade out lama → fade in baru)
- Volume & status disimpan di `localStorage`

**Layer 2 — SFX (Web Audio API):**
- Menggunakan `AudioContext` untuk playback polyphonic (tidak terpotong saat cepat hover)
- Buffer pre-load 3 file: `hover.wav`, `click.wav`, `option.wav`
- Fallback ke pool HTML5 Audio jika Web Audio belum siap
- Diinisiasi pada interaksi pertama pengguna (mengatasi autoplay restriction browser)

**Hook publik yang tersedia:**
```typescript
const { isBgmEnabled, isSfxEnabled, bgmVolume, sfxVolume,
        setBgmVolume, setSfxVolume, toggleBgm, toggleSfx, playSfx } = useAudio();
```

### 5.3 LenisProvider (`LenisProvider.tsx`)

- Membungkus Lenis untuk smooth scroll di seluruh halaman
- Atribut `data-lenis-prevent="true"` pada elemen mencegah Lenis mengambil alih scroll wheel di dalam modal

### 5.4 GSAPProvider (`GSAPProvider.tsx`)

- Me-register plugin GSAP (`ScrollTrigger`, `useGSAP`) sekali di level root

---

## 6. Komponen Layout

### Navbar (`Navbar.tsx`)

**Fitur:**
- Fixed di atas halaman, `z-index: 50`
- Transparan saat di hero → solid (`--color-forest-dark`) saat scroll > 50px
- Logo "FA." dengan animasi hover elastic via GSAP
- Link navigasi dengan efek jiggle + color flash + pixel arrow via GSAP
- Klik link menggunakan `lenis.scrollTo()` untuk smooth scroll ke section
- SFX hover/click terintegrasi

**Link Navigasi:**
- `#about`, `#skills`, `#projects`, `#contact`

---

## 7. Komponen 3D / Three.js (PixelForest)

> **File:** `src/components/three/PixelForest.tsx`  
> **Ukuran:** ~2000 baris — Komponen terbesar dan paling kompleks

File ini berisi **seluruh adegan 3D dan semua UI modal** dalam satu file besar. Dibagi menjadi sub-komponen berikut:

### 7.1 Sub-komponen 3D (`src/components/three/environment/`)

Semua objek fisik 3D dan efek visual dipisah ke dalam modul kecil di dalam sub-direktori `environment/` demi menjaga kebersihan kode `PixelForest`.

#### `DynamicSky`
- Plane geometry besar yang menutup seluruh background
- Shader GLSL custom: 5-stop gradient dari bawah ke atas, warna berubah mulus antar tema via lerp
- Menampilkan bintang (procedural dot noise) saat tema malam

#### `CelestialBody` (Matahari/Bulan)
- Spherical mesh dengan 4 lapisan material transparan (core, inner glow, outer glow, haze)
- Posisi berubah antar tema (sunrise kanan bawah → tengah atas → sunset kiri bawah → bulan kanan atas)
- Matahari menampilkan ray/sinar saat pagi & siang

#### `DynamicClouds`
- Instanced mesh (performa tinggi) untuk banyak awan sekaligus
- Drift perlahan ke kiri, reset ke kanan saat keluar layar
- Hanya muncul saat tema pagi & siang (cloudOpacity > 0)

#### `Trees`
- Instanced mesh untuk batang + daun
- 40 pohon dengan posisi semi-random tapi deterministik (seed-based)
- Warna berubah per tema

#### `Campfire`
- Beberapa mesh geometri (cone + sphere) yang beranimasi seperti api
- Rotasi osilasi menggunakan `Math.sin(time)` pada `useFrame`
- Interaktif: onClick membuka modal Contact

#### `Bookshelf`
- Beberapa mesh box sederhana membentuk rak buku
- Animasi mengambang (`hovering`) pada `useFrame`
- Interaktif: onClick membuka modal Skills

#### `Ground`
- Plane geometry datar sebagai tanah
- Warna berubah antar tema dengan lerp

#### `GroundBushes`
- Instanced mesh untuk semak-semak di tanah
- ~40 instance dengan posisi deterministik

#### `FallingLeaves`
- Instanced mesh partikel daun yang jatuh & berputar
- Posisi reset ke atas saat turun terlalu jauh
- Aktif semua tema, warna & opacity berubah per tema

#### `Fireflies`
- Instanced mesh partikel menyala kecil yang bergerak melayang (kunang-kunang)
- Menggunakan kalkulasi `Math.sin` dan `Math.cos` untuk gerakan organik
- Hanya aktif pada mode performa normal atau ringan (dimatikan di potato mode)

#### `QuestBoardStand`
- Geometri papan pengumuman 3D bergaya piksel sebagai penanda *waypoint* area proyek
- Mendukung penerimaan bayangan dinamis (*shadows*)

#### `WorkshopDecorations`
- Mesh pelengkap dekorasi meja kerja dan peralatan di area *skills*

#### `SpatialHTMLUI` (`SpatialUI.tsx`)
- Wrapper fungsional memanfaatkan `Html` dari `@react-three/drei`
- Merender teks HTML (seperti judul Hero) dan panel form Kontak seolah-olah menyatu pada titik koordinat absolut 3D

#### `SceneController`
- Mengatur pencahayaan (AmbientLight, DirectionalLight, HemisphereLight)
- Mengatur `THREE.Fog` scene-wide
- Semua nilai berubah per tema dengan lerp

#### `CameraRig`
- Menggerakkan kamera berdasarkan posisi mouse (parallax tilt)
- Menerima `mousePosRef` dari `page.tsx` yang menggabungkan mouse & gyroscope

### 7.2 InteractiveFog (⭐ Komponen Flagship)

> Efek kabut interaktif paling kompleks, menggunakan **GLSL Fragment Shader** custom.

**Cara kerja:**
- Sebuah `PlaneGeometry` fullscreen (menutupi seluruh layar) dengan `ShaderMaterial`
- Shader GLSL berjalan di GPU setiap frame

**Fitur Shader:**

| Fitur | Deskripsi |
|---|---|
| **fBm Noise** | Fractional Brownian Motion — 5 oktaf noise untuk tekstur kabut organik |
| **Bayer Dithering** | Matriks Bayer 4x4 untuk efek piksel retro pada tepi kabut |
| **Mouse Vortex** | Cursor mendorong & memuntir kabut di sekitarnya |
| **Presence Mode** | Kabut selalu sedikit menghindari cursor meski mouse diam |
| **Scroll Zoom** | Kabut "zoom in" saat scroll (efek tunnel) |
| **Curtain Split (Scroll Down)** | Kabut terbelah horizontal seperti tirai saat scroll turun |
| **Rising Fog (Scroll Up)** | Kabut naik dari bawah saat scroll kembali ke hero |
| **Breathing Animation** | Kerapatan kabut berdenyut organik menggunakan `sin(time)` |
| **Pseudo-Depth** | Kabut menipis di tengah layar untuk mengekspos konten 3D |
| **Per-Theme Vignette** | Vignette (penggelapan pinggir layar) berbeda intensitas per tema |
| **Chromatic Aberration** | Fringing warna di sekitar cursor (desktop only, dinonaktifkan mobile) |
| **Reduced Motion** | Animasi dinonaktifkan jika `prefers-reduced-motion` aktif |

**Uniforms (variabel yang dikirim CPU → GPU setiap frame):**

| Uniform | Tipe | Fungsi |
|---|---|---|
| `uTime` | float | Waktu berjalan (untuk animasi) |
| `uMouse` | vec2 | Posisi mouse (normalized -1 to 1) |
| `uMouseVelocity` | float | Kecepatan gerak mouse |
| `uScrollProgress` | float | Progress scroll (0=hero, 1=bawah) |
| `uOpacity` | float | Transparansi kabut keseluruhan |
| `uFogColor` | vec3 | Warna dasar kabut (per tema) |
| `uHighlightColor` | vec3 | Warna highlight cursor (per tema) |
| `uScrollDirection` | float | Arah scroll: 1.0=turun, -1.0=naik |
| `uVignetteIntensity` | float | Intensitas vignette (per tema) |
| `uIsMobile` | float | 1.0 jika mobile (kurangi efek berat) |
| `uReducedMotion` | float | 1.0 jika user prefer reduced motion |

**Performa (Optimasi P0):**
- Semua `new THREE.Color()` & `new THREE.Vector2/3()` di-cache dalam `useRef` — **tidak ada alokasi per frame**
- Mobile mendapat versi fog yang lebih ringan (2 oktaf noise, skip vortex & chromatic)
- Visibility toggle: mesh disembunyikan hanya setelah opacity lerp benar-benar mencapai 0

### 7.3 FOG_THEME_PARAMS

Config fog per tema (di luar `themeConfig.ts` karena spesifik untuk shader):

```typescript
const FOG_THEME_PARAMS = {
  pagi:  { highlightColor, overlayFogColor, maxDensity, driftSpeed, rimIntensity, vignetteIntensity },
  siang: { ... },
  sore:  { ... },
  malam: { ... },
}
```

### 7.4 PixelForest (Main Component)

Komponen utama yang mengorkestrasikan semua sub-komponen di atas. Bertanggung jawab atas:

1. **Scroll tracking**: `IntersectionObserver` memantau section `#hero`, `#about`, `#skills`, `#projects`, `#contact` untuk mengetahui section aktif
2. **State section**: Menentukan bagian mana yang sedang dilihat dan membuka/menutup modal yang sesuai
3. **Portal Modals**: Semua modal (About, Skills, Projects, Contact) di-render menggunakan `createPortal` ke `document.body` agar berada di atas canvas 3D
4. **Mobile Detection**: Menyesuaikan tampilan untuk mobile (carousel vs grid, dll)

### 7.5 Modal yang Ada dalam PixelForest

| Modal | Dibuka oleh | Isi |
|---|---|---|
| **About** | Klik karakter avatar di scene | Profil, InteractiveAvatar, tombol GitHub/LinkedIn |
| **Skills** | Klik Bookshelf di scene / tombol SKILLS | Panel Stardew-style dengan ObservableSkill items |
| **Projects** | Scroll ke section #projects | ProjectGallery (desktop) atau MobileCarousel (mobile) |
| **Contact** | Klik Campfire di scene / scroll ke #contact | Form kontak (nama, email, pesan) |

---

## 8. Komponen UI

### 8.1 DialogueBox (`DialogueBox.tsx`)
Kotak pembungkus bergaya dialog RPG. Props: `title`, `children`. Menampilkan title di header dan children di dalam body.

### 8.2 InteractiveAvatar (`InteractiveAvatar.tsx`)
- Menampilkan `pixel_avatar_profile.png` dengan efek shake saat di-hover (animasi CSS keyframe)
- Klik membuka modal fullscreen yang menampilkan `Avatar3DCanvas` (model 3D yang bisa dirotasi dengan drag)
- Label "✦ KLIK UNTUK GACHA ✦" dengan animasi blink

### 8.3 ObservableSkill (`ObservableSkill.tsx`)
Komponen baris skill yang **expand saat diklik** (accordion):
- **Default**: Ikon pixel art + nama skill
- **Expanded**: Progress bar animasi RPG + badge rank (SS/S/A/B/C/D) + persentase
- Progress bar punya efek: fill animasi, shimmer sweep, glow breathing
- Rank system: SS (kuning), S (merah), A (ungu), B (biru), C (hijau), D (abu)

### 8.4 PixelButton (`PixelButton.tsx`)
Tombol serbaguna bergaya pixel art. Mendukung:
- Mode `button` dan mode `link` (`href` prop)
- Variant: `primary` (hijau) dan `secondary` (abu)
- SFX hover & click terintegrasi
- Efek "tekan" via transform pada `:active`

### 8.5 SettingsMenu (`SettingsMenu.tsx`)
Menu pengaturan audio berbentuk **panel kayu retro** yang muncul dari pojok kanan bawah:
- **Trigger**: Tombol roda gigi (gear icon SVG custom) di pojok kanan bawah
- **Animasi**: Gear berputar 360° saat diklik (GSAP-style via CSS keyframe)
- **Panel**: Bergaya papan kayu dengan paku di sudut dan latar perkamen
- **Slider BGM & SFX**: Draggable custom (pointer events) — bukan `<input type="range">`
- **Visibility**: Hanya muncul saat di hero section (fade out saat scroll)
- **Persistence**: Volume disimpan ke `localStorage`

### 8.6 PixelCursor (`PixelCursor.tsx`)
Mengganti kursor mouse bawaan browser dengan kursor pixel art custom. Mengikuti posisi mouse dengan CSS transform.

### 8.7 ProjectSignboard (`ProjectSignboard.tsx`)
Kartu proyek individual untuk tampilan **desktop** (di dalam `ProjectGallery`):
- Gaya kertas tempel (sticky note) dengan jilatan random
- Push pin di atas dengan warna bervariasi
- Beberapa kartu punya aksen selotip
- **Hover effect**: Straighten + scale + shadow, deskripsi & link muncul
- Random tilt deterministik berdasarkan index

### 8.8 MobileCarousel (`MobileCarousel.tsx`)
Kartu proyek untuk tampilan **mobile**:
- Horizontal scroll dengan `scroll-snap` CSS
- `IntersectionObserver` untuk tracking kartu aktif
- Dot indicator dengan animasi expand
- Tombol navigasi yang "bersinar" hijau setelah 3 detik idle (mengingatkan user untuk scroll)
- Hint geser muncul sekali lalu hilang setelah interaksi pertama

### 8.9 ProjectGallery (`ProjectGallery.tsx`)
Wrapper yang menampilkan `ProjectSignboard` dalam grid untuk desktop.

### 8.10 ProjectMap (`ProjectMap.tsx`)
Tampilan alternatif proyek dalam gaya **peta RPG 2D** (opsional, tersedia tapi mungkin tidak digunakan di UI utama).

### 8.11 LoadingScreen (`LoadingScreen.tsx`)
- Tampilan tabir (*curtain*) awal saat aplikasi pertama kali dimuat
- Menampilkan video loop background atau *fallback* desain piksel warna solid
- Menyediakan layar pemilihan **Mode Performa Grafis** (Normal / Light / Potato) yang sangat krusial bagi stabilitas memori di perangkat berat/ringan
- Mencegah inisialisasi render 3D penuh hingga pengguna mengeklik mulai

### 8.12 QuestPopup (`QuestPopup.tsx`)
- Komponen rincian modal (*pop-up detail*) untuk menampilkan deskripsi spesifik proyek/quest
- Menyematkan langsung integrasi video demonstrasi via **YouTube Iframe**
- Mengimplementasikan `data-lenis-prevent="true"` untuk anti-interferensi kelancaran scroll saat user melihat-lihat deskripsi

### 8.13 PixelCard (`PixelCard.tsx`)
- Kontainer kotak dekoratif dasar bergaya retro dengan border piksel tebal
- Digunakan sebagai *wrapper* generik untuk mengelompokkan elemen lain (seperti kategori-kategori pada halaman Skills)

---

## 9. API Routes (Backend)

### `/api/contact` — POST (`src/app/api/contact/route.ts`)

**Tujuan:** Menerima data form kontak dan:
1. Menyimpan ke Supabase (backup database)
2. Mengirim email notifikasi via Resend API

**Validasi Input:**
- Nama: wajib, max 100 karakter
- Email: wajib, format valid (regex)
- Pesan: wajib, max 2000 karakter

**Alur:**
```
POST /api/contact
  → Validasi input
  → Simpan ke Supabase table 'contact_messages'
  → Cek RESEND_API_KEY (dari .env.local)
  → Kirim email ke agustianprasetyoferdy@gmail.com
  → Return { success: true } atau { error: "..." }
```

**Environment Variables yang dibutuhkan:**
```env
RESEND_API_KEY=re_xxxxx           # API key dari resend.com
NEXT_PUBLIC_SUPABASE_URL=...      # URL project Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=... # Public key Supabase
```

---

## 10. Styling (CSS)

### File: `src/app/globals.css`

Semua styling ada di satu file CSS global (tidak menggunakan Tailwind utility classes di JSX — hanya inline styles). File ini berisi:

#### CSS Variables (Design Tokens)
```css
:root {
  --color-forest-dark: #0d0f0a;   /* Background utama */
  --color-moss-green: #2d5a27;    /* Aksen hijau gelap */
  --color-pixel-leaf: #6dd892;    /* Hijau terang (aksen utama) */
  --color-moonlight: #f0e6d0;     /* Krem terang */
  --color-firefly: #f0c55e;       /* Kuning hangat */
  --color-cream: #faf3e0;         /* Putih hangat */
  --color-black: #020617;         /* Hitam hampir murni */
  /* ... dll */
}
```

#### Sistem Animasi CSS
- `@keyframes waveIntro` — Animasi huruf masuk dari atas
- `@keyframes rankBounceIn` — Bounce badge rank saat skill expand
- `@keyframes shimmerSweep` — Efek cahaya menyapu progress bar
- `@keyframes barBreathGlow` — Glow breathing pada progress bar
- `@keyframes gachaBlinkPulse` — Blink label "KLIK UNTUK GACHA"
- `@keyframes floatTooltip` — Tooltip mengambang naik-turun
- `@keyframes slideUpAction` — Mobile action bar muncul dari bawah
- `@keyframes pulseButton` — Tombol berdenyut
- `@keyframes settings-gear-spin` — Roda gigi berputar

#### Kelas Utama
- `.pixel-corners` — Border pixel art dengan box-shadow
- `.scanlines` — Overlay garis scan retro di seluruh halaman
- `.hero-box` — Container hero section
- `.wave-letter` — Tiap huruf judul yang hover-animatable
- `.fullscreen-overlay-modal` — Modal overlay fullscreen
- `.modal-content-wrapper` — Wrapper isi modal dengan animasi scale-in
- `.modal-containerless-panel` — Panel transparan (konten langsung di atas 3D)
- `.stardew-panel` — Panel bergaya Stardew Valley (kuning coklat)
- `.skill-bar-rpg` — Container progress bar skill
- `.observable-skill-container` — Container per baris skill

#### Scrollbar Kustom
```css
/* Global retro scrollbar */
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-thumb { background: #3a6b33; }

/* Modal-specific scrollbar (lebih tebal, lebih mencolok) */
.custom-scrollbar-container::-webkit-scrollbar { width: 12px; }
.custom-scrollbar-container::-webkit-scrollbar-thumb { background: #4ade80; }
```

#### Aksesibilitas
```css
/* Keyboard focus */
*:focus-visible { outline: 3px solid var(--color-pixel-leaf); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Struktur Halaman Utama & Detail

Website ini menggunakan kombinasi _One-Page 3D Experience_ dan _Dynamic Routing_.

### 11.1 Halaman Dunia Utama (`app/page.tsx`)

File ini mengatur **logika tingkat atas** halaman 3D interaktif:

### State & Refs Utama

| State/Ref | Tipe | Fungsi |
|---|---|---|
| `mousePosRef` | `useRef` | Posisi mouse/gyro (pakai ref, bukan state, agar tidak re-render) |
| `formData` | `useState` | Data form kontak (nama, email, pesan) |
| `status` | `useState` | Status submit form: idle/loading/success/error |
| `showGyroButton` | `useState` | Tampilkan tombol "ENABLE 3D PARALLAX" di iOS |

### Parallax Input

1. **Desktop (Mouse)**: Event `mousemove` → normalize ke -1..1 → simpan ke `mousePosRef`
2. **Mobile Android**: Event `deviceorientation` → normalize `gamma`/`beta` → simpan ke `mousePosRef`
3. **Mobile iOS 13+**: Perlu izin eksplisit. Tombol "✦ ENABLE 3D PARALLAX ✦" muncul → `DeviceOrientationEvent.requestPermission()`

### GSAP Animations (via `useGSAP`)

| Target | Animasi | Trigger |
|---|---|---|
| `.gsap-section-title` | Slide dari kiri (stepped/retro) | ScrollTrigger: masuk viewport |
| `.gsap-pop` | Bounce pop dari bawah | ScrollTrigger: masuk viewport |
| `.gsap-skill-card` | Staggered pop-in | ScrollTrigger: section skills |
| `.gsap-parallax` | Parallax vertikal | ScrollTrigger: scrub mode |

### Render Structure

```jsx
<main>
  <PixelForest theme={...} mousePosRef={...} formData={...} ... />
  
  {/* Invisible scroll sections — hanya untuk trigger GSAP & Lenis */}
  <div style={{ pointerEvents: 'none' }}>
    <section id="hero"    style={{ height: '100vh' }} />
    <section id="about"   style={{ height: '100vh' }} />
    <section id="skills"  style={{ height: '100vh' }} />
    <section id="projects" style={{ height: '100vh' }} />
    <section id="contact" style={{ height: '100vh' }} />
  </div>
  
  {/* iOS Gyro Permission Button (conditional) */}
</main>
```

### 11.2 Halaman Detail Proyek (`app/quest/[slug]/page.tsx`)

Ketika pengguna menekan tombol "ACCEPT QUEST" di Quest Board, mereka akan diarahkan ke halaman detail statis ini. Halaman ini bertugas merender:
- **Hero Image & Metadata:** Judul, durasi, dan tautan kode/demo.
- **Quest Objectives & Fase:** Tahapan pengerjaan yang diambil dari array `questContent.phases`.
- **Media & Dokumentasi:** Menampilkan komponen *iframe* video YouTube atau cuplikan gambar dari rincian `questContent.media`.

---

## 12. Alur Data & Arsitektur

```text
questData.ts (Single Source of Truth)
  └── Menyediakan array QUEST_PROJECTS untuk Gallery dan halaman Detail

page.tsx
  ├── Membaca posisi mouse/gyro → mousePosRef
  ├── State form kontak → formData, status
  └── Render PixelForest + invisible sections

PixelForest.tsx
  ├── Menerima: theme, mousePosRef, formData, ...
  ├── Mengelola: IntersectionObserver untuk scroll progress
  ├── Mengelola: state isAboutOpen, isSkillsOpen, dll
  ├── Render Canvas 3D:
  │   ├── DynamicSky (shader background)
  │   ├── CelestialBody (matahari/bulan)
  │   ├── DynamicClouds
  │   ├── SceneController (lighting + fog)
  │   ├── CameraRig > [semua objek 3D]
  │   │   ├── Ground, Trees, GroundBushes
  │   │   ├── FallingLeaves
  │   │   ├── Campfire (→ buka Contact modal)
  │   │   ├── Bookshelf (→ buka Skills modal)
  │   │   └── (Avatar signage di scene)
  │   └── InteractiveFog (GLSL shader fullscreen)
  └── Render Portal Modals:
      ├── About Modal (DialogueBox + InteractiveAvatar + text)
      ├── Skills Modal (ObservableSkill list)
      ├── Projects (ProjectGallery / MobileCarousel)
      └── Contact (form)
```

---

## 13. Aset Publik

### Audio (`/public/audio/`)

| File | Tipe | Digunakan |
|---|---|---|
| `bgmpagi.mp3` | BGM | Tema Pagi (05-11) |
| `bgmsiang.mp3` | BGM | Tema Siang (11-15) |
| `bgmsore.mp3` | BGM | Tema Sore (15-18) |
| `bgmmalam.mp3` | BGM | Tema Malam (18-05) |
| `hover.wav` | SFX | Mouse masuk ke elemen interaktif |
| `click.wav` | SFX | Klik tombol/link |
| `option.wav` | SFX | Buka menu settings |

### Gambar

| File | Digunakan |
|---|---|
| `pixel_avatar_profile.png` | Foto profil pixel art di modal About |
| `monkey.jpg` | Gambar pendukung |
| `loadingscreenweb.mp4` | Video loading screen (jika ada) |

---

## 14. Catatan Performa & Teknis

### Optimasi yang Sudah Diterapkan

#### Rendering 3D
- **Instanced Mesh**: Trees, GroundBushes, FallingLeaves, DynamicClouds menggunakan `InstancedMesh` — ribuan objek dalam satu draw call
- **Zero per-frame allocation**: Semua `new THREE.Color()`, `new THREE.Vector2/3()` di-cache dalam `useRef` — tidak ada garbage collection pressure setiap frame
- **Shader LOD Mobile**: Fog shader menggunakan 2 oktaf fBm (lebih ringan) dan melewati vortex & chromatic aberration di mobile
- **Visibility culling**: InteractiveFog mesh dimatikan (`visible = false`) saat opacity mencapai 0 untuk menghemat GPU
- **`useMemo` untuk geometri**: Geometri dan material dibuat sekali, tidak setiap render

#### Smooth Scroll & Interaksi
- **`mousePosRef` bukan `useState`**: Menghindari re-render React setiap gerakan mouse (kritis untuk FPS 3D)
- **`LERP_SPEED` interpolation**: Semua perubahan nilai (warna, ukuran, posisi) menggunakan lerp untuk transisi mulus tanpa jank

#### Aksesibilitas
- `prefers-reduced-motion`: CSS dan shader menghormati preferensi ini
- Keyboard focus visible: Semua elemen interaktif punya outline saat fokus keyboard
- ARIA labels pada tombol-tombol non-teks (gear button, carousel arrows)
- `alt` text pada semua gambar

### Batasan & Potensi Masalah

| Masalah | Dampak | Solusi Potensial |
|---|---|---|
| File `PixelForest.tsx` sangat besar (~2000 baris) | Sulit di-maintain | Pecah menjadi sub-file per komponen |
| Inline styles sangat banyak | Susah konsistensi & performance di React | Pindahkan ke CSS modules atau class |
| `console.log` di AudioProvider | Spam di production | Hapus atau gunakan environment guard |
| `dangerouslySetInnerHTML` untuk CSS | Potensi CSP issue | Pindahkan ke file CSS atau `<style jsx>` |
| Tidak ada lazy loading untuk modal | Modal langsung mount meski belum dibuka | Gunakan React.lazy / dynamic import |

### Browser Support

| Browser | Status |
|---|---|
| Chrome/Edge (modern) | ✅ Penuh |
| Firefox | ✅ Penuh |
| Safari (Desktop) | ✅ Penuh (WebGL support) |
| Safari (iOS) | ⚠️ Perlu izin gyroscope |
| Browser lama (no WebGL2) | ❌ Kabut & efek shader tidak muncul |

---

*Dokumentasi ini dibuat secara otomatis dari analisis kode pada 11 Juni 2026 dan diperbarui secara berkala.*

---

## 15. Log Pembaruan (14 Juni 2026)

Pada sesi pembaruan ini, beberapa perbaikan teknis dan penambahan fitur telah diimplementasikan untuk meningkatkan performa dan pengalaman pengguna, khususnya pada perangkat *mobile*.

### 15.1 Optimasi UI & Responsivitas Mobile
- **Custom Scrollbar:** Diubah agar hanya aktif di desktop (`min-width: 769px`), mencegah konflik layout di perangkat *mobile*.
- **Pixel Cursor:** Dinonaktifkan secara paksa di perangkat sentuh (*mobile/tablet*) untuk menghindari *bug* kotak biru statis yang menempel di layar.
- **Font Size:** Penyesuaian ukuran font pada judul "WORKSHOP // SKILLS" di dalam kanvas 3D agar proporsional di layar kecil.

### 15.2 Perbaikan Rendering 3D & Performa
- **InteractiveFog (Kabut):** 
  - Penambahan *warm-up guard* (`isWarmingUp`) agar animasi transisi kabut hanya dimulai *setelah* *loading screen* selesai.
  - Implementasi *velocity clamp* untuk mencegah *spike* tiba-tiba saat inisialisasi.
  - Perbaikan pada sistem manajemen memori (*disposal material*) untuk menjaga stabilitas *frame rate*.
- **SpatialUI Text Glitch (Mobile):** 
  - Menghapus tabrakan antara `transition: 'opacity 0.2s'` CSS dengan pembaruan `useFrame` yang berjalan hingga 60-120 FPS pada elemen antarmuka 3D (seperti Hero Title dan Contact Panel).
  - Menambahkan aturan `visibility: 'hidden'` secara dinamis saat *opacity* menyentuh 0% untuk menghentikan komputasi animasi CSS di latar belakang (seperti efek *wave-letter*), sepenuhnya mengeliminasi efek *jitter/glitch* saat pengguna melakukan *scroll* balik ke posisi atas.

### 15.3 Peningkatan Fungsionalitas Quest Board
- **Template Video YouTube:** Menyematkan komponen *iframe* video YouTube (menggunakan *template walkthrough* bawaan dari sistem) secara langsung ke dalam halaman detail mini (`QuestPopup.tsx`) berdasarkan data rekam jejak `questData.media`.
- **Perbaikan Scroll Modal:** Mengatasi *bug* interaksi *Lenis Smooth Scroll* yang secara tidak sengaja "membajak" area guliran kursor/layar di dalam modal popup. Diaplikasikan `data-lenis-prevent="true"`, `onWheel`, dan `onTouchMove` dengan fungsi `stopPropagation()` agar isi popup panjang yang berisi deskripsi dan video dapat di-*scroll* secara natif dan independen.
- **Pembaruan Content-Security-Policy (CSP):** Memperbaiki berkas `next.config.ts` dengan menyematkan secara eksplisit aturan `frame-src 'self' https://www.youtube.com;` agar perlindungan keamanan internal *browser* mengizinkan injeksi video eksternal.

### 15.4 Standarisasi Favicon (Next.js App Router)
- **Penanganan Konflik Ikon:** Menghapus secara permanen file statis `favicon.ico` bawaan struktur awal (opsi *fallback* Vercel) yang mengambil alih paksa prioritas ikon pada *browser*.
- **Migrasi Struktur Ikon:** Memindahkan file `public/icon.png` ke koridor direktori utama `src/app/icon.png` (langkah ini secara mutlak mematuhi standar hierarki dari *App Router* milik Next.js versi 13 ke atas) serta membersihkan konfigurasi statik `icons` di `layout.tsx` agar Next.js mampu mendeteksi tipe mime dan me-*render* ikon *tab* dengan dinamis serta membangun tembolok (*cache header*) secara otomatis.

---

## 16. Log Pembaruan (19 Juni 2026)

Pada pembaruan ini, telah dilakukan beberapa optimasi antarmuka pada fitur pengunduhan CV serta pembersihan konfigurasi kontrol versi repositori proyek.

### 16.1 Optimasi UI & Fungsionalitas Komponen
- **Penataan Hierarki Tombol:** Mengubah urutan tata letak interaktif pada modal *About* di `PixelForest.tsx` dengan memosisikan tombol "Download CV" persis di bawah tautan "LinkedIn" guna meningkatkan hierarki visual (berlaku untuk resolusi desktop dan mobile).
- **Perbaikan Fungsionalitas Unduhan:** Memperbaiki arsitektur *props* pada `PixelButton.tsx` dengan menyematkan tipe data bawaan `download?: string | boolean`. Hal ini meresolusi kendala galat (*Type Error*) pada *TypeScript* secara holistik serta merutekan atribut ke elemen fundamental HTML `<a>` sehingga proses *download* dapat difasilitasi langsung oleh *browser*.

### 16.2 Pembersihan Lingkungan Repositori
- **Manajemen Git Ignore:** Memperbarui konfigurasi `.gitignore` dengan mengeksklusi direktori dan dokumen ekosistem internal agen AI (seperti `.agents/`, `.temp_skills/`, `AGENTS.md`, `CLAUDE.md`, `lint.txt`). Komponen tersebut secara proaktif dihapus dari pelacakan riwayat *Git Cache* agar tidak memengaruhi kebersihan rilis atau jejak infrastruktur pada proses *deployment*.
