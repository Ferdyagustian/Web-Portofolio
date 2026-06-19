"use client";

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ===== GLOBAL 3D CACHE ===== */
// Satu geometri kubus absolut yang akan dibagi-pakai (di-share) ke semua instansi kayu/buku
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);

// Kamus Material Global. Memastikan R3F tidak mencetak material baru ke memori GPU setiap render.
const SHARED_MATERIALS = {
  // Kayu & Kayu Gelap
  woodLight8: new THREE.MeshStandardMaterial({ color: "#5c3a1e", roughness: 0.8 }),
  woodLight9: new THREE.MeshStandardMaterial({ color: "#5c3a1e", roughness: 0.9 }),
  woodMedium: new THREE.MeshStandardMaterial({ color: "#4d2f17", roughness: 0.9 }),
  woodDark: new THREE.MeshStandardMaterial({ color: "#3d2b1f", roughness: 0.8 }),
  woodDarker: new THREE.MeshStandardMaterial({ color: "#4a3525", roughness: 0.9 }),
  woodDarkest: new THREE.MeshStandardMaterial({ color: "#4a2e1b", roughness: 0.9 }),
  chestWood: new THREE.MeshStandardMaterial({ color: "#8d6e63", roughness: 0.9 }),
  
  // Metal & Perabotan
  metalAnvil: new THREE.MeshStandardMaterial({ color: "#424242", metalness: 0.8, roughness: 0.2 }),
  metalGold: new THREE.MeshStandardMaterial({ color: "#ffd54f", metalness: 0.7, roughness: 0.3 }),
  
  // Api (BasicMaterial agar menyala tanpa terpengaruh bayangan)
  flameRed: new THREE.MeshBasicMaterial({ color: "#ff5722", fog: false }),
  flameOrange: new THREE.MeshBasicMaterial({ color: "#ff9800", fog: false }),
  flameYellow: new THREE.MeshBasicMaterial({ color: "#ffeb3b", fog: false }),
  
  // Buku
  bookRed: new THREE.MeshStandardMaterial({ color: "#e74c3c", roughness: 0.6 }),
  bookBlue: new THREE.MeshStandardMaterial({ color: "#3498db", roughness: 0.6 }),
  bookGreen: new THREE.MeshStandardMaterial({ color: "#2ecc71", roughness: 0.6 }),
  bookYellow: new THREE.MeshStandardMaterial({ color: "#f1c40f", roughness: 0.6 }),
  bookPurple: new THREE.MeshStandardMaterial({ color: "#9b59b6", roughness: 0.6 }),
  bookCyan: new THREE.MeshStandardMaterial({ color: "#1abc9c", roughness: 0.6 }),
  bookOrange: new THREE.MeshStandardMaterial({ color: "#e67e22", roughness: 0.6 }),
};


/* ===== RPG 3D Campfire Anchor ===== */
export function Campfire({ position, onClick, playSfx }: { position: [number, number, number]; onClick?: (e: any) => void; playSfx?: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const flame1 = useRef<THREE.Mesh>(null);
  const flame2 = useRef<THREE.Mesh>(null);
  const flame3 = useRef<THREE.Mesh>(null);
  const _scaleVec3 = useRef(new THREE.Vector3(1, 1, 1));
  const [hovered, setHovered] = React.useState(false);
  
  const handleClick = (e: any) => {
    if (onClick) {
      if (playSfx) playSfx('campfire');
      onClick(e);
    }
  };

  useEffect(() => {
    if (onClick) {
      document.body.style.cursor = hovered ? 'pointer' : 'auto';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, onClick]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (flame1.current) {
      flame1.current.scale.y = (0.8 + Math.sin(t * 12) * 0.3) * 0.6; // Scale relative to base scale
      flame1.current.position.y = 0.4 + Math.sin(t * 12) * 0.15;
    }
    if (flame2.current) {
      flame2.current.scale.y = (0.6 + Math.cos(t * 15) * 0.25) * 0.5;
      flame2.current.position.y = 0.3 + Math.cos(t * 15) * 0.12;
    }
    if (flame3.current) {
      flame3.current.scale.y = (0.7 + Math.sin(t * 18) * 0.35) * 0.55;
      flame3.current.position.y = 0.35 + Math.sin(t * 18) * 0.18;
    }
    if (groupRef.current) {
      const targetScale = hovered ? 1.08 : 1.0;
      groupRef.current.scale.lerp(_scaleVec3.current.set(targetScale, targetScale, targetScale), 0.15);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick ? handleClick : undefined}
      onPointerOver={onClick ? (e) => { e.stopPropagation(); setHovered(true); } : undefined}
      onPointerOut={onClick ? () => setHovered(false) : undefined}
    >
      {/* Logs */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight9} scale={[1.2, 0.15, 0.15]} position={[0, 0.1, 0]} rotation={[0.2, Math.PI / 4, 0.1]} />
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodMedium} scale={[1.2, 0.15, 0.15]} position={[0, 0.12, 0]} rotation={[-0.1, -Math.PI / 4, 0.2]} />

      {/* Flames */}
      <mesh ref={flame1} geometry={UNIT_BOX} material={SHARED_MATERIALS.flameRed} scale={[0.25, 0.6, 0.25]} position={[-0.15, 0.4, 0]} />
      <mesh ref={flame2} geometry={UNIT_BOX} material={SHARED_MATERIALS.flameOrange} scale={[0.2, 0.5, 0.2]} position={[0.15, 0.3, 0.15]} />
      <mesh ref={flame3} geometry={UNIT_BOX} material={SHARED_MATERIALS.flameYellow} scale={[0.22, 0.55, 0.22]} position={[0, 0.35, -0.15]} />

      {/* Seating Logs - Detailed Voxel Logs */}
      <group position={[0, 0.175, 1.4]}>
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDarker} scale={[1.8, 0.35, 0.35]} />
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[0.05, 0.28, 0.28]} position={[-0.9, 0, 0]} />
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[0.05, 0.28, 0.28]} position={[0.9, 0, 0]} />
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[0.15, 0.15, 0.15]} position={[0.4, 0.15, 0.15]} /> {/* Small branch stub */}
      </group>

      <group position={[-1.2, 0.175, -0.8]} rotation={[0, Math.PI / 3, 0]}>
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDarker} scale={[1.6, 0.35, 0.35]} />
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[0.05, 0.28, 0.28]} position={[-0.8, 0, 0]} />
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[0.05, 0.28, 0.28]} position={[0.8, 0, 0]} />
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[0.15, 0.15, 0.15]} position={[-0.3, 0.1, -0.15]} />
      </group>

      <group position={[1.2, 0.175, -0.9]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDarker} scale={[1.5, 0.35, 0.35]} />
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[0.05, 0.28, 0.28]} position={[-0.75, 0, 0]} />
        <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[0.05, 0.28, 0.28]} position={[0.75, 0, 0]} />
      </group>

      <pointLight distance={8} intensity={hovered ? 5.5 : 2.5} color="#ff7700" position={[0, 0.8, 0]} />
    </group>
  );
}

/* ===== RPG 3D Quest Board Stand Anchor ===== */
export function QuestBoardStand({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Left Post */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[0.25, 4.4, 0.25]} position={[-3.25, 2.2, 0]} />
      {/* Right Post */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[0.25, 4.4, 0.25]} position={[3.25, 2.2, 0]} />
      {/* Crossbar Top */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[6.7, 0.3, 0.3]} position={[0, 4.3, 0]} />
      {/* Back Panel */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDarker} scale={[6.25, 3.65, 0.15]} position={[0, 2.15, -0.1]} />
    </group>
  );
}

/* ===== RPG 3D Workshop Decorations Anchor ===== */
export function WorkshopDecorations({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table Top */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[2, 0.15, 0.8]} position={[0, 0.6, 0]} />
      {/* Table Legs */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[0.15, 0.6, 0.15]} position={[-0.8, 0.3, -0.3]} />
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[0.15, 0.6, 0.15]} position={[0.8, 0.3, -0.3]} />
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[0.15, 0.6, 0.15]} position={[-0.8, 0.3, 0.3]} />
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[0.15, 0.6, 0.15]} position={[0.8, 0.3, 0.3]} />
      {/* Voxel Anvil */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.metalAnvil} scale={[0.4, 0.25, 0.3]} position={[-0.3, 0.8, 0]} />
      {/* Voxel Chest */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.chestWood} scale={[0.8, 0.8, 0.8]} position={[1.4, 0.4, 0.1]} rotation={[0, -Math.PI / 6, 0]} />
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.metalGold} scale={[0.15, 0.15, 0.05]} position={[1.3, 0.4, 0.49]} rotation={[0, -Math.PI / 6, 0]} />
    </group>
  );
}

/* ===== RPG 3D Bookshelf Anchor ===== */
export function Bookshelf({ position, onClick, playSfx }: { position: [number, number, number]; onClick?: (e: any) => void; playSfx?: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const _scaleVec3 = useRef(new THREE.Vector3(1, 1, 1));
  const [hovered, setHovered] = React.useState(false);

  const handleClick = (e: any) => {
    if (onClick) {
      if (playSfx) playSfx('page_flip');
      onClick(e);
    }
  };

  useEffect(() => {
    if (onClick) {
      document.body.style.cursor = hovered ? 'pointer' : 'auto';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, onClick]);

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = hovered ? 1.08 : 1.0;
      groupRef.current.scale.lerp(_scaleVec3.current.set(targetScale, targetScale, targetScale), 0.15);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick ? handleClick : undefined}
      onPointerOver={onClick ? (e) => { e.stopPropagation(); setHovered(true); } : undefined}
      onPointerOut={onClick ? () => setHovered(false) : undefined}
    >
      {/* Back Panel */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDarkest} scale={[1.6, 3, 0.1]} position={[0, 1.5, -0.2]} />
      {/* Left Wall */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[0.1, 3, 0.5]} position={[-0.85, 1.5, 0]} />
      {/* Right Wall */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[0.1, 3, 0.5]} position={[0.85, 1.5, 0]} />
      {/* Top Board */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[1.8, 0.1, 0.5]} position={[0, 3.0, 0]} />
      {/* Middle Shelf 1 */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[1.6, 0.08, 0.45]} position={[0, 2.0, 0]} />
      {/* Middle Shelf 2 */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodLight8} scale={[1.6, 0.08, 0.45]} position={[0, 1.0, 0]} />
      {/* Bottom Board */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.woodDark} scale={[1.8, 0.1, 0.5]} position={[0, 0.05, 0]} />

      {/* Books on Shelf 2 (Top Shelf, Y=2 to Y=3) */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.bookRed} scale={[0.15, 0.6, 0.35]} position={[-0.5, 2.35, 0]} />
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.bookBlue} scale={[0.18, 0.6, 0.35]} position={[-0.32, 2.35, 0]} />
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.bookGreen} scale={[0.12, 0.55, 0.35]} position={[-0.1, 2.32, 0]} rotation={[0, 0, -0.2]} />
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.bookYellow} scale={[0.2, 0.5, 0.35]} position={[0.4, 2.3, 0]} />

      {/* Books on Shelf 1 (Middle Shelf, Y=1 to Y=2) */}
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.bookPurple} scale={[0.14, 0.6, 0.35]} position={[-0.6, 1.35, 0]} />
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.bookCyan} scale={[0.22, 0.5, 0.35]} position={[0.1, 1.3, 0]} />
      <mesh geometry={UNIT_BOX} material={SHARED_MATERIALS.bookOrange} scale={[0.15, 0.6, 0.35]} position={[0.3, 1.35, 0]} />

      <pointLight distance={5} intensity={hovered ? 4.5 : 0} color="#ffd54f" position={[0, 1.5, 0.5]} />
    </group>
  );
}
