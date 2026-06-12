"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { TimeTheme } from '../../../lib/useTimeTheme';
import { THEME_CONFIGS } from '../../../lib/themeConfig';
import { LERP_SPEED, lerpColor, lerpNum } from './utils';

/* ===== Trees ===== */
export function Trees({ theme }: { theme: TimeTheme }) {
  const treeCount = 35; // Reduced from 50
  const configRef = useRef(THEME_CONFIGS[theme]);
  const trunkMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const leavesMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const targetTrunkColor = useRef(new THREE.Color(THEME_CONFIGS[theme].trunkColor));
  const targetLeavesColor = useRef(new THREE.Color(THEME_CONFIGS[theme].leavesColor));

  useEffect(() => {
    configRef.current = THEME_CONFIGS[theme];
    targetTrunkColor.current.set(THEME_CONFIGS[theme].trunkColor);
    targetLeavesColor.current.set(THEME_CONFIGS[theme].leavesColor);
  }, [theme]);

  const positions = useMemo(() => {
    const pos = [];
    const minDistance = 4; // Safe distance from interactive objects
    let attempts = 0;

    while (pos.length < treeCount && attempts < 1000) {
      attempts++;
      const x = (Math.random() - 0.5) * 40;
      const z = -Math.random() * 60;

      // Pathway check: keep trees away from central path
      if (Math.abs(x) < 3.5) continue;

      // Campfire check (position: [-3.5, 0, -13.2])
      const distToCampfire = Math.sqrt((x - (-3.5)) ** 2 + (z - (-13.2)) ** 2);
      if (distToCampfire < minDistance) continue;

      // Bookshelf check (position: [4.0, 0, -28.8])
      const distToBookshelf = Math.sqrt((x - 4.0) ** 2 + (z - (-28.8)) ** 2);
      if (distToBookshelf < minDistance) continue;

      pos.push({ x, z });
    }

    // Fallback in case of safe path starvation
    while (pos.length < treeCount) {
      pos.push({ x: (Math.random() > 0.5 ? 8 : -8), z: -Math.random() * 60 });
    }

    return pos;
  }, []);

  useFrame(() => {
    if (trunkMatRef.current) lerpColor(trunkMatRef.current.color, targetTrunkColor.current, LERP_SPEED);
    if (leavesMatRef.current) lerpColor(leavesMatRef.current.color, targetLeavesColor.current, LERP_SPEED);
  });

  return (
    <group>
      <Instances limit={treeCount} range={treeCount}>
        <boxGeometry args={[0.5, 3, 0.5]} />
        <meshStandardMaterial ref={trunkMatRef} color={THEME_CONFIGS[theme].trunkColor} />
        {positions.map((p, i) => (
          <Instance key={`trunk-${i}`} position={[p.x, 1.5, p.z]} />
        ))}
      </Instances>
      <Instances limit={treeCount} range={treeCount}>
        <boxGeometry args={[2, 3, 2]} />
        <meshStandardMaterial ref={leavesMatRef} color={THEME_CONFIGS[theme].leavesColor} />
        {positions.map((p, i) => (
          <Instance key={`leaves-${i}`} position={[p.x, 3.5, p.z]} />
        ))}
      </Instances>
    </group>
  );
}

/* ===== Ground Bushes ===== */
export function GroundBushes({ theme }: { theme: TimeTheme }) {
  const count = 50;
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const configRef = useRef(THEME_CONFIGS[theme]);
  const targetBushColor = useRef(new THREE.Color(THEME_CONFIGS[theme].bushColor));

  useEffect(() => {
    configRef.current = THEME_CONFIGS[theme];
    targetBushColor.current.set(THEME_CONFIGS[theme].bushColor);
  }, [theme]);

  // Bake BOTH position AND rotation into the memoized array
  // so re-renders never regenerate random values
  const bushData = useMemo(() => {
    const data = [];
    const minDistance = 6.0; // Safe distance from interactive objects
    let attempts = 0;

    while (data.length < count && attempts < 1000) {
      attempts++;
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (2.5 + Math.random() * 5);
      const z = -Math.random() * 60;

      // Campfire check (position: [-3.5, 0, -13.2])
      const distToCampfire = Math.sqrt((x - (-3.5)) ** 2 + (z - (-13.2)) ** 2);
      if (distToCampfire < minDistance) continue;

      // Bookshelf check (position: [4.0, 0, -28.8])
      const distToBookshelf = Math.sqrt((x - 4.0) ** 2 + (z - (-28.8)) ** 2);
      if (distToBookshelf < minDistance) continue;

      const scale = 0.4 + Math.random() * 1.2;
      const rotY = Math.random() * Math.PI; // baked rotation
      data.push({ x, z, scale, rotY });
    }

    // Fallback in case of path starvation
    while (data.length < count) {
      data.push({
        x: (Math.random() > 0.5 ? 6 : -6),
        z: -Math.random() * 60,
        scale: 0.8,
        rotY: Math.random() * Math.PI,
      });
    }

    return data;
  }, []);

  useFrame(() => {
    if (matRef.current) lerpColor(matRef.current.color, targetBushColor.current, LERP_SPEED);
  });

  return (
    <Instances limit={count} range={count}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial ref={matRef} color={THEME_CONFIGS[theme].bushColor} />
      {bushData.map((p, i) => (
        <Instance key={`bush-${i}`} position={[p.x, p.scale / 2, p.z]} scale={[p.scale, p.scale, p.scale]} rotation={[0, p.rotY, 0]} />
      ))}
    </Instances>
  );
}

/* ===== Falling Leaves ===== */
export function FallingLeaves({ theme }: { theme: TimeTheme }) {
  const count = 100; // Reduced from 150
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshLambertMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const configRef = useRef(THEME_CONFIGS[theme]);
  const targetLeafColor = useRef(new THREE.Color(THEME_CONFIGS[theme].leafParticleColor));

  useEffect(() => {
    configRef.current = THEME_CONFIGS[theme];
    targetLeafColor.current.set(THEME_CONFIGS[theme].leafParticleColor);
  }, [theme]);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 20,
        z: -Math.random() * 60,
        speed: 0.015 + Math.random() * 0.02,
        swaySpeed: 0.5 + Math.random() * 1.5,
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const cfg = configRef.current;

    if (matRef.current) {
      lerpColor(matRef.current.color, targetLeafColor.current, LERP_SPEED);
      matRef.current.opacity = lerpNum(matRef.current.opacity, cfg.leafOpacity, LERP_SPEED);
    }

    if (matRef.current && matRef.current.opacity > 0.01) {
      particles.forEach((p, i) => {
        p.y -= p.speed;
        if (p.y < -1) { p.y = 20; p.x = (Math.random() - 0.5) * 40; p.z = -Math.random() * 60; }
        const sway = Math.sin(state.clock.elapsedTime * p.swaySpeed + i) * 0.3;
        dummy.position.set(p.x + sway, p.y, p.z);
        dummy.rotation.set(state.clock.elapsedTime * p.speed * 10, state.clock.elapsedTime * p.swaySpeed, 0);
        dummy.updateMatrix();
        meshRef.current?.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const cfg = THEME_CONFIGS[theme];
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.25, 0.25]} />
      {/* Menggunakan Lambert untuk mencegah pantulan silau (specular flashes) saat berputar terkena cahaya */}
      <meshLambertMaterial ref={matRef} color={cfg.leafParticleColor} side={THREE.DoubleSide} transparent opacity={cfg.leafOpacity} />
    </instancedMesh>
  );
}

/* ===== Fireflies ===== */
export function Fireflies({ theme }: { theme: TimeTheme }) {
  const count = 50;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const configRef = useRef(THEME_CONFIGS[theme]);

  // Fixed golden-yellow color — never changes across themes
  const FIREFLY_COLOR = '#ffea70';

  useEffect(() => { configRef.current = THEME_CONFIGS[theme]; }, [theme]);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 5,
        z: 5 - Math.random() * 65,
        speedY: 0.005 + Math.random() * 0.015,
        swaySpeed: 0.5 + Math.random() * 1.5,
        swayRange: 0.5 + Math.random() * 1.5,
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current || !matRef.current) return;
    const cfg = configRef.current;
    const targetOpacity = cfg.fireflyOpacity;

    // Always keep the color fixed yellow — no lerping
    matRef.current.color.set(FIREFLY_COLOR);

    // Lerp opacity toward target
    matRef.current.opacity = lerpNum(matRef.current.opacity, targetOpacity, LERP_SPEED * 3);

    // If target is 0, force-clamp to 0 (no breathing effect)
    if (targetOpacity <= 0) {
      matRef.current.opacity = Math.max(0, matRef.current.opacity - 0.01);
      if (matRef.current.opacity < 0.01) {
        matRef.current.opacity = 0;
      }
      return; // Skip all position updates — completely hidden
    }

    // Breathing glow effect (only when visible)
    matRef.current.opacity += Math.sin(state.clock.elapsedTime * 2) * 0.05;
    matRef.current.opacity = Math.max(0, matRef.current.opacity);

    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      p.y += p.speedY;
      if (p.y > 8) {
        p.y = -1;
        p.x = (Math.random() - 0.5) * 40;
        p.z = 5 - Math.random() * 65;
      }
      const moveX = Math.sin(t * p.swaySpeed + i) * p.swayRange;
      const moveZ = Math.cos(t * p.swaySpeed * 0.8 + i) * (p.swayRange * 0.5);
      dummy.position.set(p.x + moveX, p.y, p.z + moveZ);
      dummy.rotation.set(t * p.swaySpeed, t * p.swaySpeed * 1.2, 0);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.15, 0.15, 0.15]} />
      <meshBasicMaterial
        ref={matRef}
        color={FIREFLY_COLOR}
        transparent
        opacity={0}
        fog={false}
      />
    </instancedMesh>
  );
}

/* ===== Ground ===== */
export function Ground({ theme }: { theme: TimeTheme }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const configRef = useRef(THEME_CONFIGS[theme]);
  const targetGroundColor = useRef(new THREE.Color(THEME_CONFIGS[theme].groundColor));
  useEffect(() => {
    configRef.current = THEME_CONFIGS[theme];
    targetGroundColor.current.set(THEME_CONFIGS[theme].groundColor);
  }, [theme]);
  useFrame(() => {
    if (matRef.current) lerpColor(matRef.current.color, targetGroundColor.current, LERP_SPEED);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial ref={matRef} color={THEME_CONFIGS[theme].groundColor} />
    </mesh>
  );
}
