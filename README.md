# Pixel Portfolio — 3D Interactive Web Experience

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-white?style=flat&logo=three.js&logoColor=black)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-Animation-green?style=flat)](https://gsap.com/)

Portofolio interaktif bergaya **pixel art / RPG retro** yang dibangun di atas kanvas 3D interaktif. Seluruh konten (About, Skills, Projects, Contact) tidak dirender sebagai halaman statis saja, melainkan sebagai panel antarmuka spasial di atas dunia "Hutan Piksel" yang "hidup" dan "interaktif".

🌐 **Live Demo:** [slowwalkferdy.vercel.app](https://slowwalkferdy.vercel.app)

---

## Fitur Utama

* **Dunia 3D sebagai Fondasi:** Latar belakang hutan 3D interaktif (menggunakan `Three.js` & `React Three Fiber`) yang mencakup pohon, efek partikel daun jatuh, api unggun, dan perubahan lingkungan yang dinamis.
* **Sistem Tema Real-Time (Time-Based Theme):** Suasana visual (pencahayaan, warna langit, visibilitas objek) dan BGM *crossfade* berubah secara otomatis mengikuti jam lokal pengguna (WIB/UTC+7)
Pagi (05.00-10.59), Siang (11.00-14.59) , Sore (15.00-17.59) , dan Malam (18.00-04.59).
* **Kabut Interaktif (GLSL Custom Shader):** Implementasi *Fragment Shader* dengan *fBm Noise* yang merespons posisi *mouse* (*vortex effect*), kecepatan *scroll*, dan perhitungan *pseudo-depth*.
* **Navigasi Sinematik:** Transisi antar-bagian yang mulus menggunakan integrasi **Lenis** (*smooth scroll*) dan **GSAP ScrollTrigger**.
* **Sistem Audio Multi-Layer:** Pemisahan antara BGM (HTML5 Audio) dan efek suara SFX *polyphonic* (Web Audio API) untuk interaksi UI yang responsif tanpa *audio-clipping*.

## TECH STACKS

* **Core:** Next.js 16 (App Router), React 19, TypeScript
* **Grafis & WebGL:** Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
* **Animasi & Interaksi:** GSAP, Lenis, `@use-gesture/react`
* **Backend & Integrasi:** Supabase (PostgreSQL), Resend API
* **Styling:** CSS Variables (Design Tokens) & Keyframe Animations

## Optimization

Proyek ini direkayasa untuk berjalan stabil di 60 FPS pada mayoritas peramban:
* **Instanced Rendering:** Penggunaan `InstancedMesh` untuk menggambar ribuan objek (pohon, semak, awan) secara serentak dalam satu *draw call*.
* **Zero Per-Frame Allocation:** Variabel matematis 3D di-*cache* menggunakan `useRef` untuk menghindari tekanan *Garbage Collection* per *frame*.
* **Shader LOD (Level of Detail):** Pengurangan kompleksitas *noise* dan penonaktifan efek distorsi (*chromatic aberration*) secara dinamis pada perangkat *mobile*.
* **Visibility Culling:** Pemberhentian komputasi grafis dan animasi CSS pada elemen yang berada di luar jangkauan pandang kamera (*opacity 0*).

## Newest Update (v.14 Juni 2026)

* 📱 **Optimasi Mobile:** Penyesuaian kursor, penonaktifan *hover glitch*, dan standarisasi elemen sentuh.
* 🎬 **Quest Board:** Integrasi komponen *iframe* YouTube yang aman secara CSP untuk dokumentasi proyek.
* 🧠 **Manajemen Memori 3D:** Perbaikan siklus hidup material (*material disposal*) dan penjagaan lonjakan kecepatan (*velocity clamp*) pada *shader* kabut.
* ⚙️ **Konfigurasi Meta:** Standarisasi hierarki `icon.png` mengikuti kaidah *App Router* terbaru.


Thanks!!
---

> **Dibuat oleh** Ferdy Agustian Prasetyo.  
> *Hak Cipta © 2026. Semua aset 3D dan kode merupakan karya orisinal.*
