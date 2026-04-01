"use client";

import { useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function Card3D() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Muat kedua tekstur
  const [frontTexture, backTexture] = useTexture([
    '/pixel_avatar_profile.png',
    '/monkey.jpg'
  ]);

  // Agar pixel art tidak buram (NearestFilter)
  frontTexture.magFilter = THREE.NearestFilter;
  frontTexture.minFilter = THREE.NearestFilter;

  // Urutan material BoxGeometry:
  // 0: Kanan, 1: Kiri, 2: Atas, 3: Bawah, 4: Depan, 5: Belakang
  const materials = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: '#1a2e1d' }), // sisi samping tebal
    new THREE.MeshStandardMaterial({ color: '#1a2e1d' }),
    new THREE.MeshStandardMaterial({ color: '#1a2e1d' }),
    new THREE.MeshStandardMaterial({ color: '#1a2e1d' }),
    new THREE.MeshStandardMaterial({ map: frontTexture, roughness: 0.4, side: THREE.FrontSide }),
    new THREE.MeshStandardMaterial({ map: backTexture, roughness: 0.4, side: THREE.FrontSide })
  ], [frontTexture, backTexture]);

  return (
    <mesh ref={meshRef} material={materials}>
      <boxGeometry args={[4, 4, 0.1]} />
    </mesh>
  );
}

const LoadingText = () => {
  return (
    <mesh>
      <boxGeometry args={[4, 4, 0.1]} />
      <meshStandardMaterial color="#222" />
    </mesh>
  );
};

export default function Avatar3DCanvas() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        
        <Suspense fallback={<LoadingText />}>
          <Card3D />
        </Suspense>

        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={true}
          autoRotateSpeed={2.5}
        />
      </Canvas>
    </div>
  );
}
