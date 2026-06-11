"use client";

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ===== RPG 3D Campfire Anchor ===== */
export function Campfire({ position, onClick }: { position: [number, number, number]; onClick?: (e: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const flame1 = useRef<THREE.Mesh>(null);
  const flame2 = useRef<THREE.Mesh>(null);
  const flame3 = useRef<THREE.Mesh>(null);
  const _scaleVec3 = useRef(new THREE.Vector3(1, 1, 1));
  const [hovered, setHovered] = React.useState(false);

  useEffect(() => {
    if (onClick) {
      document.body.style.cursor = hovered ? 'pointer' : 'auto';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, onClick]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (flame1.current) {
      flame1.current.scale.y = 0.8 + Math.sin(t * 12) * 0.3;
      flame1.current.position.y = 0.4 + Math.sin(t * 12) * 0.15;
    }
    if (flame2.current) {
      flame2.current.scale.y = 0.6 + Math.cos(t * 15) * 0.25;
      flame2.current.position.y = 0.3 + Math.cos(t * 15) * 0.12;
    }
    if (flame3.current) {
      flame3.current.scale.y = 0.7 + Math.sin(t * 18) * 0.35;
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
      onClick={onClick}
      onPointerOver={onClick ? (e) => { e.stopPropagation(); setHovered(true); } : undefined}
      onPointerOut={onClick ? () => setHovered(false) : undefined}
    >
      {/* Logs */}
      <mesh position={[0, 0.1, 0]} rotation={[0.2, Math.PI / 4, 0.1]}>
        <boxGeometry args={[1.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[-0.1, -Math.PI / 4, 0.2]}>
        <boxGeometry args={[1.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#4d2f17" roughness={0.9} />
      </mesh>

      {/* Flames */}
      <mesh ref={flame1} position={[-0.15, 0.4, 0]}>
        <boxGeometry args={[0.25, 0.6, 0.25]} />
        <meshBasicMaterial color="#ff5722" fog={false} />
      </mesh>
      <mesh ref={flame2} position={[0.15, 0.3, 0.15]}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshBasicMaterial color="#ff9800" fog={false} />
      </mesh>
      <mesh ref={flame3} position={[0, 0.35, -0.15]}>
        <boxGeometry args={[0.22, 0.55, 0.22]} />
        <meshBasicMaterial color="#ffeb3b" fog={false} />
      </mesh>

      <pointLight distance={8} intensity={hovered ? 5.5 : 2.5} color="#ff7700" position={[0, 0.8, 0]} />
    </group>
  );
}

/* ===== RPG 3D Quest Board Stand Anchor ===== */
export function QuestBoardStand({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Left Post */}
      <mesh position={[-3.25, 2.2, 0]}>
        <boxGeometry args={[0.25, 4.4, 0.25]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      {/* Right Post */}
      <mesh position={[3.25, 2.2, 0]}>
        <boxGeometry args={[0.25, 4.4, 0.25]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      {/* Crossbar Top */}
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[6.7, 0.3, 0.3]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      {/* Back Panel */}
      <mesh position={[0, 2.15, -0.1]}>
        <boxGeometry args={[6.25, 3.65, 0.15]} />
        <meshStandardMaterial color="#4a3525" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ===== RPG 3D Workshop Decorations Anchor ===== */
export function WorkshopDecorations({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table Top */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2, 0.15, 0.8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      {/* Table Legs */}
      <mesh position={[-0.8, 0.3, -0.3]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      <mesh position={[0.8, 0.3, -0.3]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      <mesh position={[-0.8, 0.3, 0.3]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      <mesh position={[0.8, 0.3, 0.3]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      {/* Voxel Anvil */}
      <mesh position={[-0.3, 0.8, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.3]} />
        <meshStandardMaterial color="#424242" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Voxel Chest */}
      <mesh position={[1.4, 0.4, 0.1]} rotation={[0, -Math.PI / 6, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.9} />
      </mesh>
      <mesh position={[1.3, 0.4, 0.49]} rotation={[0, -Math.PI / 6, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffd54f" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ===== RPG 3D Bookshelf Anchor ===== */
export function Bookshelf({ position, onClick }: { position: [number, number, number]; onClick?: (e: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const _scaleVec3 = useRef(new THREE.Vector3(1, 1, 1));
  const [hovered, setHovered] = React.useState(false);

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
      onClick={onClick}
      onPointerOver={onClick ? (e) => { e.stopPropagation(); setHovered(true); } : undefined}
      onPointerOut={onClick ? () => setHovered(false) : undefined}
    >
      {/* Back Panel */}
      <mesh position={[0, 1.5, -0.2]}>
        <boxGeometry args={[1.6, 3, 0.1]} />
        <meshStandardMaterial color="#4a2e1b" roughness={0.9} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-0.85, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, 0.5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[0.85, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, 0.5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      {/* Top Board */}
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[1.8, 0.1, 0.5]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      {/* Middle Shelf 1 */}
      <mesh position={[0, 2.0, 0]}>
        <boxGeometry args={[1.6, 0.08, 0.45]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      {/* Middle Shelf 2 */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[1.6, 0.08, 0.45]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      {/* Bottom Board */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.8, 0.1, 0.5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>

      {/* Books on Shelf 2 (Top Shelf, Y=2 to Y=3) */}
      <mesh position={[-0.5, 2.35, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.35]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.6} />
      </mesh>
      <mesh position={[-0.32, 2.35, 0]}>
        <boxGeometry args={[0.18, 0.6, 0.35]} />
        <meshStandardMaterial color="#3498db" roughness={0.6} />
      </mesh>
      <mesh position={[-0.1, 2.32, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.12, 0.55, 0.35]} />
        <meshStandardMaterial color="#2ecc71" roughness={0.6} />
      </mesh>
      <mesh position={[0.4, 2.3, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.35]} />
        <meshStandardMaterial color="#f1c40f" roughness={0.6} />
      </mesh>

      {/* Books on Shelf 1 (Middle Shelf, Y=1 to Y=2) */}
      <mesh position={[-0.6, 1.35, 0]}>
        <boxGeometry args={[0.14, 0.6, 0.35]} />
        <meshStandardMaterial color="#9b59b6" roughness={0.6} />
      </mesh>
      <mesh position={[0.1, 1.3, 0]}>
        <boxGeometry args={[0.22, 0.5, 0.35]} />
        <meshStandardMaterial color="#1abc9c" roughness={0.6} />
      </mesh>
      <mesh position={[0.3, 1.35, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.35]} />
        <meshStandardMaterial color="#e67e22" roughness={0.6} />
      </mesh>

      <pointLight distance={5} intensity={hovered ? 4.5 : 0} color="#ffd54f" position={[0, 1.5, 0.5]} />
    </group>
  );
}
