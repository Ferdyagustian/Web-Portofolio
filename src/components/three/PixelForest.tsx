"use client";

import React, { useRef, useMemo, useEffect, useState, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Instance, Instances, Html } from '@react-three/drei';
import { EffectComposer, Pixelation } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TimeTheme } from '../../lib/useTimeTheme';
import { THEME_CONFIGS } from '../../lib/themeConfig';

import DialogueBox from '../ui/DialogueBox';
import PixelCard from '../ui/PixelCard';
import ObservableSkill from '../ui/ObservableSkill';
import PixelButton from '../ui/PixelButton';
import ProjectGallery from '../ui/ProjectGallery';
import InteractiveAvatar from '../ui/InteractiveAvatar';

const LERP_SPEED = 0.008; // ~2 seconds for full transition at 60fps

const v = new THREE.Vector3();

/* ===== Sky Dome (Locks Z to Camera to simulate infinity) ===== */
function SkyDome({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Get exact absolute camera position
      state.camera.getWorldPosition(v);
      // Agar tidak terasa "mengikuti/nempel" di layar, kita berikan sedikit pelepas parallax
      // sehingga saat user maju, bulan di kejauhan akan terasa tertinggal di kedalaman 3D.
      groupRef.current.position.z = v.z * 0.85;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function lerpColor(current: THREE.Color, target: THREE.Color, t: number) {
  current.r += (target.r - current.r) * t;
  current.g += (target.g - current.g) * t;
  current.b += (target.b - current.b) * t;
}

function lerpNum(current: number, target: number, t: number): number {
  return current + (target - current) * t;
}

/* ===== Dynamic Sky ===== */
function DynamicSky({ theme }: { theme: TimeTheme }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const configRef = useRef(THEME_CONFIGS[theme]);
  const currentColors = useRef({
    top: new THREE.Color(THEME_CONFIGS[theme].skyTop),
    midTop: new THREE.Color(THEME_CONFIGS[theme].skyMidTop),
    mid: new THREE.Color(THEME_CONFIGS[theme].skyMid),
    midBottom: new THREE.Color(THEME_CONFIGS[theme].skyMidBottom),
    bottom: new THREE.Color(THEME_CONFIGS[theme].skyBottom),
  });

  useEffect(() => {
    configRef.current = THEME_CONFIGS[theme];
  }, [theme]);

  useFrame(() => {
    if (!matRef.current) return;
    const cfg = configRef.current;
    const cc = currentColors.current;
    const u = matRef.current.uniforms;

    lerpColor(cc.top, new THREE.Color(cfg.skyTop), LERP_SPEED);
    lerpColor(cc.midTop, new THREE.Color(cfg.skyMidTop), LERP_SPEED);
    lerpColor(cc.mid, new THREE.Color(cfg.skyMid), LERP_SPEED);
    lerpColor(cc.midBottom, new THREE.Color(cfg.skyMidBottom), LERP_SPEED);
    lerpColor(cc.bottom, new THREE.Color(cfg.skyBottom), LERP_SPEED);

    u.uTopColor.value.copy(cc.top);
    u.uMidTopColor.value.copy(cc.midTop);
    u.uMidColor.value.copy(cc.mid);
    u.uMidBottomColor.value.copy(cc.midBottom);
    u.uBottomColor.value.copy(cc.bottom);
  });

  const skyMaterial = useMemo(() => {
    const cfg = THEME_CONFIGS[theme];
    return new THREE.ShaderMaterial({
      uniforms: {
        uTopColor: { value: new THREE.Color(cfg.skyTop) },
        uMidTopColor: { value: new THREE.Color(cfg.skyMidTop) },
        uMidColor: { value: new THREE.Color(cfg.skyMid) },
        uMidBottomColor: { value: new THREE.Color(cfg.skyMidBottom) },
        uBottomColor: { value: new THREE.Color(cfg.skyBottom) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uMidTopColor;
        uniform vec3 uMidColor;
        uniform vec3 uMidBottomColor;
        uniform vec3 uBottomColor;
        varying vec2 vUv;
        
        void main() {
          vec3 color;
          float y = vUv.y;
          
          if (y > 0.75) {
            color = mix(uMidTopColor, uTopColor, (y - 0.75) / 0.25);
          } else if (y > 0.5) {
            color = mix(uMidColor, uMidTopColor, (y - 0.5) / 0.25);
          } else if (y > 0.25) {
            color = mix(uMidBottomColor, uMidColor, (y - 0.25) / 0.25);
          } else {
            color = mix(uBottomColor, uMidBottomColor, y / 0.25);
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <mesh position={[0, 10, -100]} scale={[250, 120, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={skyMaterial} attach="material" ref={matRef} />
    </mesh>
  );
}

/* ===== Celestial Body (Sun or Moon) — LOCKED in SkyDome ===== */
function CelestialBody({ theme }: { theme: TimeTheme }) {
  const groupRef = useRef<THREE.Group>(null);
  const configRef = useRef(THEME_CONFIGS[theme]);

  // Color refs for lerping
  const coreColor = useRef(new THREE.Color(THEME_CONFIGS[theme].celestialCoreColor));
  const innerColor = useRef(new THREE.Color(THEME_CONFIGS[theme].celestialInnerGlow));
  const outerColor = useRef(new THREE.Color(THEME_CONFIGS[theme].celestialOuterGlow));
  const hazeColor = useRef(new THREE.Color(THEME_CONFIGS[theme].celestialHaze));
  const rayColor = useRef(new THREE.Color(THEME_CONFIGS[theme].celestialRayColor));
  const targetPos = useRef(new THREE.Vector3(...THEME_CONFIGS[theme].celestialPosition));
  const currentSize = useRef(THEME_CONFIGS[theme].celestialCoreSize);

  // Material & Group refs
  const coreMaterial = useMemo(() => new THREE.MeshBasicMaterial({ fog: false }), []);
  const innerMat = useRef<THREE.MeshBasicMaterial>(null);
  const outerMat = useRef<THREE.MeshBasicMaterial>(null);
  const hazeMat = useRef<THREE.MeshBasicMaterial>(null);

  const raysGroup = useRef<THREE.Group>(null);
  const cratersGroup = useRef<THREE.Group>(null);
  const rayMultiplier = useRef(THEME_CONFIGS[theme].celestialType === 'sun' ? 1 : 0);

  useEffect(() => {
    const cfg = THEME_CONFIGS[theme];
    configRef.current = cfg;
    targetPos.current.set(...cfg.celestialPosition);
  }, [theme]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const cfg = configRef.current;

    // Lerp position relative to SkyDome
    groupRef.current.position.lerp(targetPos.current, LERP_SPEED);

    // Lerp colors
    lerpColor(coreColor.current, new THREE.Color(cfg.celestialCoreColor), LERP_SPEED);
    lerpColor(innerColor.current, new THREE.Color(cfg.celestialInnerGlow), LERP_SPEED);
    lerpColor(outerColor.current, new THREE.Color(cfg.celestialOuterGlow), LERP_SPEED);
    lerpColor(hazeColor.current, new THREE.Color(cfg.celestialHaze), LERP_SPEED);

    // Lerp size
    currentSize.current = lerpNum(currentSize.current, cfg.celestialCoreSize, LERP_SPEED);

    // Apply to materials
    coreMaterial.color.copy(coreColor.current);
    if (innerMat.current) innerMat.current.color.copy(innerColor.current);
    if (outerMat.current) outerMat.current.color.copy(outerColor.current);
    if (hazeMat.current) hazeMat.current.color.copy(hazeColor.current);

    // Dibuat "bersifat tetap" seperti instruksi (tidak berdenyut)
    const s = currentSize.current / 3; // Normalize to base scale
    groupRef.current.scale.set(s, s, s);

    // Bulan terkunci diam di posisinya
    if (cfg.celestialType === 'moon') {
      groupRef.current.rotation.z = Math.PI / 4; // Kemiringan sabit statis
    } else {
      groupRef.current.rotation.z = 0;
    }

    // Transition rays and craters
    const targetMult = cfg.celestialType === 'sun' ? 1 : 0;
    rayMultiplier.current = lerpNum(rayMultiplier.current, targetMult, LERP_SPEED * 1.5);

    if (raysGroup.current) {
      raysGroup.current.children.forEach((mesh: any, i: number) => {
        const baseO = i < 4 ? 0.5 : 0.35;
        mesh.material.opacity = baseO * rayMultiplier.current;
        lerpColor(mesh.material.color, rayColor.current, LERP_SPEED);
      });
    }

    if (cratersGroup.current) {
      cratersGroup.current.children.forEach((mesh: any) => {
        // Craters fade in when rays fade out
        mesh.material.opacity = (1 - rayMultiplier.current) * 0.45;
      });
    }
  });

  return (
    <group ref={groupRef} position={THEME_CONFIGS[theme].celestialPosition}>
      {/* Core */}
      {THEME_CONFIGS[theme].celestialType === 'moon' ? (
        /* Smooth, elegant Crescent Moon */
        <mesh material={coreMaterial}>
          {/* args: innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength */}
          <ringGeometry args={[1.5, 2.5, 32, 1, 0, Math.PI * 1.3]} />
        </mesh>
      ) : (
        /* Voxel Sun & Craters (disabled for moon) */
        <>
          <mesh material={coreMaterial}>
            <boxGeometry args={[3, 3, 0.5]} />
          </mesh>
        </>
      )}

      {/* Inner glow */}
      <mesh>
        {THEME_CONFIGS[theme].celestialType === 'moon' ? <circleGeometry args={[4, 32]} /> : <boxGeometry args={[5, 5, 0.3]} />}
        <meshBasicMaterial ref={innerMat} color={THEME_CONFIGS[theme].celestialInnerGlow} transparent opacity={0.65} fog={false} />
      </mesh>
      {/* Outer glow */}
      <mesh>
        {THEME_CONFIGS[theme].celestialType === 'moon' ? <circleGeometry args={[6, 32]} /> : <boxGeometry args={[7, 7, 0.2]} />}
        <meshBasicMaterial ref={outerMat} color={THEME_CONFIGS[theme].celestialOuterGlow} transparent opacity={0.3} fog={false} />
      </mesh>
      {/* Haze */}
      <mesh>
        {THEME_CONFIGS[theme].celestialType === 'moon' ? <circleGeometry args={[9, 32]} /> : <boxGeometry args={[10, 10, 0.1]} />}
        <meshBasicMaterial ref={hazeMat} color={THEME_CONFIGS[theme].celestialHaze} transparent opacity={0.1} fog={false} />
      </mesh>

      {/* Pixel rays — 8 directions (visible only when sun) */}
      <group ref={raysGroup}>
        <mesh position={[0, 4.5, 0]}>
          <boxGeometry args={[1, 2.5, 0.3]} />
          <meshBasicMaterial color="#FFD93D" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, -4.5, 0]}>
          <boxGeometry args={[1, 2.5, 0.3]} />
          <meshBasicMaterial color="#FFD93D" transparent opacity={0.5} />
        </mesh>
        <mesh position={[-4.5, 0, 0]}>
          <boxGeometry args={[2.5, 1, 0.3]} />
          <meshBasicMaterial color="#FFD93D" transparent opacity={0.5} />
        </mesh>
        <mesh position={[4.5, 0, 0]}>
          <boxGeometry args={[2.5, 1, 0.3]} />
          <meshBasicMaterial color="#FFD93D" transparent opacity={0.5} />
        </mesh>
        <mesh position={[3.2, 3.2, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.8, 2, 0.3]} />
          <meshBasicMaterial color="#FFB347" transparent opacity={0.35} />
        </mesh>
        <mesh position={[-3.2, 3.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.8, 2, 0.3]} />
          <meshBasicMaterial color="#FFB347" transparent opacity={0.35} />
        </mesh>
        <mesh position={[3.2, -3.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.8, 2, 0.3]} />
          <meshBasicMaterial color="#FFB347" transparent opacity={0.35} />
        </mesh>
        <mesh position={[-3.2, -3.2, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.8, 2, 0.3]} />
          <meshBasicMaterial color="#FFB347" transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
}

/* ===== Clouds ===== */
function DynamicClouds({ theme }: { theme: TimeTheme }) {
  const configRef = useRef(THEME_CONFIGS[theme]);
  const groupRef = useRef<THREE.Group>(null);
  const currentOpacity = useRef(THEME_CONFIGS[theme].cloudOpacity);

  useEffect(() => {
    configRef.current = THEME_CONFIGS[theme];
  }, [theme]);

  const clouds = useMemo(() => {
    const arr = [];
    const cloudCount = 20; // Lebih jarang dari pohon (50)
    for (let i = 0; i < cloudCount; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 100, // Tersebar luas kiri-kanan (-50 ke 50)
        y: 15 + Math.random() * 15,     // Tinggi di langit (15 ke 30)
        z: 10 - Math.random() * 110,    // Tersebar dari kedalaman depan (10) sampai belakang (-100)
        scaleX: 3 + Math.random() * 6,  // Panjang awan bervariasi
        scaleY: 0.8 + Math.random() * 1.5,// Ketebalan awan
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const cfg = configRef.current;
    currentOpacity.current = lerpNum(currentOpacity.current, cfg.cloudOpacity, LERP_SPEED);

    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (cfg.cloudColors.length > 0) {
        const targetColor = new THREE.Color(cfg.cloudColors[i % cfg.cloudColors.length]);
        lerpColor(mat.color, targetColor, LERP_SPEED);
      }
      mat.opacity = currentOpacity.current;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => {
        const initCfg = THEME_CONFIGS[theme];
        const color = initCfg.cloudColors.length > 0 ? initCfg.cloudColors[i % initCfg.cloudColors.length] : '#ffffff';
        return (
          <mesh key={`cloud-${i}`} position={[cloud.x, cloud.y, cloud.z]}>
            <boxGeometry args={[cloud.scaleX, cloud.scaleY, 0.5]} />
            <meshBasicMaterial color={color} transparent opacity={initCfg.cloudOpacity} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ===== Scene Controller — manages lighting, fog, background ===== */
function SceneController({ theme }: { theme: TimeTheme }) {
  const { scene } = useThree();
  const configRef = useRef(THEME_CONFIGS[theme]);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const mainLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);

  // Current interpolated values
  const currentBg = useRef(new THREE.Color(THEME_CONFIGS[theme].bgColor));
  const currentFogColor = useRef(new THREE.Color(THEME_CONFIGS[theme].fogColor));
  const currentFogNear = useRef(THEME_CONFIGS[theme].fogNear);
  const currentFogFar = useRef(THEME_CONFIGS[theme].fogFar);

  useEffect(() => {
    configRef.current = THEME_CONFIGS[theme];
  }, [theme]);

  useFrame(() => {
    const cfg = configRef.current;

    // Lerp background
    lerpColor(currentBg.current, new THREE.Color(cfg.bgColor), LERP_SPEED);
    scene.background = currentBg.current;

    // Lerp fog
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      lerpColor(currentFogColor.current, new THREE.Color(cfg.fogColor), LERP_SPEED);
      scene.fog.color.copy(currentFogColor.current);
      currentFogNear.current = lerpNum(currentFogNear.current, cfg.fogNear, LERP_SPEED);
      currentFogFar.current = lerpNum(currentFogFar.current, cfg.fogFar, LERP_SPEED);
      scene.fog.near = currentFogNear.current;
      scene.fog.far = currentFogFar.current;
    }

    // Lerp ambient light
    if (ambientRef.current) {
      lerpColor(ambientRef.current.color, new THREE.Color(cfg.ambientColor), LERP_SPEED);
      ambientRef.current.intensity = lerpNum(ambientRef.current.intensity, cfg.ambientIntensity, LERP_SPEED);
    }

    // Lerp main directional light
    if (mainLightRef.current) {
      lerpColor(mainLightRef.current.color, new THREE.Color(cfg.mainLightColor), LERP_SPEED);
      mainLightRef.current.intensity = lerpNum(mainLightRef.current.intensity, cfg.mainLightIntensity, LERP_SPEED);
      mainLightRef.current.position.lerp(new THREE.Vector3(...cfg.mainLightPosition), LERP_SPEED);
    }

    // Lerp fill light
    if (fillLightRef.current) {
      lerpColor(fillLightRef.current.color, new THREE.Color(cfg.fillLightColor), LERP_SPEED);
      fillLightRef.current.intensity = lerpNum(fillLightRef.current.intensity, cfg.fillLightIntensity, LERP_SPEED);
    }
  });

  const cfg = THEME_CONFIGS[theme];
  return (
    <>
      <ambientLight ref={ambientRef} intensity={cfg.ambientIntensity} color={cfg.ambientColor} />
      <directionalLight ref={mainLightRef} position={cfg.mainLightPosition} intensity={cfg.mainLightIntensity} color={cfg.mainLightColor} />
      <directionalLight ref={fillLightRef} position={[5, 8, -10]} intensity={cfg.fillLightIntensity} color={cfg.fillLightColor} />
    </>
  );
}

/* ===== Trees ===== */
function Trees({ theme }: { theme: TimeTheme }) {
  const treeCount = 35; // Reduced from 50
  const configRef = useRef(THEME_CONFIGS[theme]);
  const trunkMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const leavesMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => { configRef.current = THEME_CONFIGS[theme]; }, [theme]);

  const positions = useMemo(() => {
    const pos = [];
    const minDistance = 4.0; // Safe distance from interactive objects
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
    const cfg = configRef.current;
    if (trunkMatRef.current) lerpColor(trunkMatRef.current.color, new THREE.Color(cfg.trunkColor), LERP_SPEED);
    if (leavesMatRef.current) lerpColor(leavesMatRef.current.color, new THREE.Color(cfg.leavesColor), LERP_SPEED);
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

interface Waypoint {
  pos: [number, number, number];
  rot: [number, number, number];
}

const WAYPOINTS: Waypoint[] = [
  { pos: [0, 2, 5], rot: [0, 0, 0] },          // Hero (t = 0)
  { pos: [-2.5, 1.5, -9.2], rot: [0, 0.35, 2] }, // About (t = 0.25) (kiri/kanan,atas/bawah,maju/mundur)
  { pos: [2.5, 1.9, -25], rot: [0, -0.45, 0] }, // Skills (t = 0.5)
  { pos: [0, 1.8, -40], rot: [0, 0, 0] },       // Projects (t = 0.75)
  { pos: [0, 4.3, -52], rot: [0.3, 0, 0] }      // Contact (t = 1.0)
];

function interpolateWaypoints(t: number, isMobile: boolean): Waypoint {

  const segmentCount = WAYPOINTS.length - 1;
  const rawIndex = t * segmentCount;
  const index = Math.min(Math.floor(rawIndex), segmentCount - 1);
  const localT = rawIndex - index;

  const wpA = WAYPOINTS[index];
  const wpB = WAYPOINTS[index + 1];

  const pos: [number, number, number] = [
    THREE.MathUtils.lerp(wpA.pos[0], wpB.pos[0], localT),
    THREE.MathUtils.lerp(wpA.pos[1], wpB.pos[1], localT),
    THREE.MathUtils.lerp(wpA.pos[2], wpB.pos[2], localT),
  ];

  const rot: [number, number, number] = [
    THREE.MathUtils.lerp(wpA.rot[0], wpB.rot[0], localT),
    THREE.MathUtils.lerp(wpA.rot[1], wpB.rot[1], localT),
    THREE.MathUtils.lerp(wpA.rot[2], wpB.rot[2], localT),
  ];

  return { pos, rot };
}

const FOG_THEME_PARAMS: Record<TimeTheme, {
  highlightColor: string;
  maxDensity: number;
  driftSpeed: [number, number]; // [speedX, speedY]
  heightFalloff: number;
  rimIntensity: number;
}> = {
  pagi: {
    highlightColor: '#ffd700', // Warm Gold
    maxDensity: 0.85,
    driftSpeed: [0.02, 0.06], // Evaporating morning mist (rising vertically)
    heightFalloff: 0.65,
    rimIntensity: 0.7,
  },
  siang: {
    highlightColor: '#e0f7fa', // Sunbeam Cyan
    maxDensity: 0.65, // Thickened to be more visible
    driftSpeed: [0.01, 0.01], // Extremely calm drift
    heightFalloff: 0.30,
    rimIntensity: 0.4,
  },
  sore: {
    highlightColor: '#ff6a00', // Glowing Sunset Orange
    maxDensity: 0.90, // Heavy sunset twilight haze
    driftSpeed: [0.07, -0.04], // Swirling/tumbling dust particles
    heightFalloff: 0.80,
    rimIntensity: 1.1,
  },
  malam: {
    highlightColor: '#88ddff', // Bioluminescent Cyan
    maxDensity: 0.95, // Mystical, dense ground forest fog
    driftSpeed: [0.05, 0.00], // Smooth horizontal creeping fog
    heightFalloff: 0.90,
    rimIntensity: 1.3,
  },
};

/* ===== Interactive 3D Fog (UI/UX Pro Max) ===== */
function InteractiveFog({
  theme,
  scrollProgress,
}: {
  theme: TimeTheme;
  scrollProgress: React.RefObject<number>;
}) {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Velocity tracking refs
  const prevPointer = useRef(new THREE.Vector2());
  const mouseVelocity = useRef(0);

  // Active theme parameters
  const currentParams = useRef({
    fogColor: new THREE.Color(THEME_CONFIGS[theme].fogColor),
    highlightColor: new THREE.Color(FOG_THEME_PARAMS[theme].highlightColor),
    maxDensity: FOG_THEME_PARAMS[theme].maxDensity,
    driftSpeed: new THREE.Vector2(...FOG_THEME_PARAMS[theme].driftSpeed),
    heightFalloff: FOG_THEME_PARAMS[theme].heightFalloff,
    rimIntensity: FOG_THEME_PARAMS[theme].rimIntensity,
    opacity: 1.0,
  });

  // Shader uniforms memoization
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouseVelocity: { value: 0.0 },
    uScrollProgress: { value: 0.0 },
    uOpacity: { value: 1.0 },
    uFogColor: { value: new THREE.Color(THEME_CONFIGS[theme].fogColor) },
    uHighlightColor: { value: new THREE.Color(FOG_THEME_PARAMS[theme].highlightColor) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uDriftSpeed: { value: new THREE.Vector2(...FOG_THEME_PARAMS[theme].driftSpeed) },
    uHeightFalloff: { value: FOG_THEME_PARAMS[theme].heightFalloff },
    uRimIntensity: { value: FOG_THEME_PARAMS[theme].rimIntensity },
  }), []);

  // Update resolution on size change
  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  useFrame((state, delta) => {
    // 1. Performance Guard: If scroll has progressed past landing page or if screen is mobile,
    // we make the mesh completely invisible and bypass uniform updates to save GPU power.
    const sp = scrollProgress.current ?? 0;
    const targetOpacity = isMobile ? 0.0 : Math.max(0, 1.0 - sp * 2.5); // Slower fade for tunneling effect

    if (targetOpacity <= 0.001) {
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }

    if (meshRef.current) meshRef.current.visible = true;

    // 2. Interpolate Theme Values smoothly
    const cfg = THEME_CONFIGS[theme];
    const params = FOG_THEME_PARAMS[theme];
    const cp = currentParams.current;

    lerpColor(cp.fogColor, new THREE.Color(cfg.fogColor), LERP_SPEED);
    lerpColor(cp.highlightColor, new THREE.Color(params.highlightColor), LERP_SPEED);
    cp.maxDensity = lerpNum(cp.maxDensity, params.maxDensity, LERP_SPEED);
    cp.driftSpeed.lerp(new THREE.Vector2(...params.driftSpeed), LERP_SPEED);
    cp.heightFalloff = lerpNum(cp.heightFalloff, params.heightFalloff, LERP_SPEED);
    cp.rimIntensity = lerpNum(cp.rimIntensity, params.rimIntensity, LERP_SPEED);
    cp.opacity = lerpNum(cp.opacity, targetOpacity * cp.maxDensity, LERP_SPEED * 1.5);

    // 3. Update uniforms
    if (matRef.current) {
      const u = matRef.current.uniforms;
      u.uTime.value = state.clock.getElapsedTime();
      u.uScrollProgress.value = sp;

      // Calculate velocity
      const dt = Math.max(0.001, delta);
      const dist = state.pointer.distanceTo(prevPointer.current);
      const currentVel = dist / dt;

      // Decay velocity fast if not moving, rise fast if moving
      mouseVelocity.current = lerpNum(mouseVelocity.current, currentVel, LERP_SPEED * 2.0);
      prevPointer.current.copy(state.pointer);

      u.uMouseVelocity.value = mouseVelocity.current;

      // Interpolate mouse vector to prevent jerky motion on sudden moves
      u.uMouse.value.lerp(state.pointer, 0.08);

      u.uOpacity.value = cp.opacity;
      u.uFogColor.value.copy(cp.fogColor);
      u.uHighlightColor.value.copy(cp.highlightColor);
      u.uDriftSpeed.value.copy(cp.driftSpeed);
      u.uHeightFalloff.value = cp.heightFalloff;
      u.uRimIntensity.value = cp.rimIntensity;
    }
  });

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0); // Fullscreen Quad positioned locally
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uMouseVelocity;
        uniform float uScrollProgress;
        uniform float uOpacity;
        uniform vec3 uFogColor;
        uniform vec3 uHighlightColor;
        uniform vec2 uResolution;
        uniform vec2 uDriftSpeed;
        uniform float uHeightFalloff;
        uniform float uRimIntensity;
        varying vec2 vUv;

        // Standard high-performance pseudo-random hash
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        // 2D Smooth Bilinear Noise
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                     mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        // 3-Octave Fractal Brownian Motion
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          vec2 shift = vec2(100.0);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < 3; ++i) {
            v += a * noise(p);
            p = rot * p * 2.0 + shift;
            a *= 0.5;
          }
          return v;
        }

        // GLSL ES 1.0 Safe Bayer Matrix for Ordered Dithering
        float bayer4x4(vec2 screenPos) {
          vec2 p = floor(mod(screenPos, 4.0));
          float idx = p.y * 4.0 + p.x;
          float m = 0.0;
          if(idx == 0.0) m = 0.0; else if(idx == 1.0) m = 8.0;
          else if(idx == 2.0) m = 2.0; else if(idx == 3.0) m = 10.0;
          else if(idx == 4.0) m = 12.0; else if(idx == 5.0) m = 4.0;
          else if(idx == 6.0) m = 14.0; else if(idx == 7.0) m = 6.0;
          else if(idx == 8.0) m = 3.0; else if(idx == 9.0) m = 11.0;
          else if(idx == 10.0) m = 1.0; else if(idx == 11.0) m = 9.0;
          else if(idx == 12.0) m = 15.0; else if(idx == 13.0) m = 7.0;
          else if(idx == 14.0) m = 13.0; else if(idx == 15.0) m = 5.0;
          return m / 16.0;
        }

        void main() {
          // --- Aspect Ratio Correction ---
          float aspect = uResolution.x / uResolution.y;
          vec2 uv = vUv * vec2(aspect, 1.0);
          vec2 mouse = (uMouse * 0.5 + 0.5) * vec2(aspect, 1.0);
          
          vec2 screenCenter = vec2(0.5 * aspect, 0.5);
          float distToCenter = length(uv - screenCenter);

          // --- Mouse Vector ---
          vec2 mouseDir = uv - mouse;       
          float mouseDist = length(mouseDir);
          
          float activeFactor = clamp(uMouseVelocity * 0.8, 0.0, 1.0);

          // --- 1. Mouse Displacement & Fluid Vortex Physics ---
          float force = smoothstep(0.3, 0.0, mouseDist) * activeFactor;

          // Linear displacement
          vec2 displacement = normalize(mouseDir + 0.0001) * force * 0.08;
          
          // Vortex Rotation (twist around cursor)
          float swirlStrength = force * 0.15; 
          float s = sin(swirlStrength);
          float c = cos(swirlStrength);
          mat2 rot = mat2(c, -s, s, c);

          // Z-Scale Parallax (Zoom in saat scroll)
          float zoomScale = 3.5 - (uScrollProgress * 5.0); 
          vec2 noiseUv = uv * max(0.5, zoomScale);

          // Base Drift
          noiseUv += uTime * uDriftSpeed;
          
          // Apply Vortex Twist
          vec2 localUv = noiseUv - (mouse * max(0.5, zoomScale));
          localUv = rot * localUv;
          noiseUv = localUv + (mouse * max(0.5, zoomScale));
          
          // Add Outward Push
          noiseUv += displacement * 2.5;

          float rawFogDensity = fbm(noiseUv);

          // --- 2. Pixelated Dithered Fog ---
          vec2 screenPx = vUv * uResolution;
          float dither = bayer4x4(screenPx);
          float pixelFog = smoothstep(dither - 0.2, dither + 0.2, rawFogDensity);
          float fogDensity = mix(rawFogDensity, pixelFog, 0.15);

          // --- 3. Height-based Gradient Fog ---
          // Dimatikan atas permintaan agar kabut menutupi seluruh layar (full screen)
          // float heightMask = 1.0 - smoothstep(0.0, uHeightFalloff, vUv.y);
          // heightMask = pow(heightMask, 1.6);
          // fogDensity *= heightMask;

          // --- 4. Transisi Tunneling (Menembus Kabut) ---
          float baseRadius = 0.04;
          float scrollHoleRadius = uScrollProgress * 4.0; 
          
          // Brush Distortion (memecah bentuk lingkaran kursor menjadi partikel/asap)
          float brushNoise = fbm(uv * 12.0 - uTime * 0.8) * 0.15;
          float distortedMouseDist = mouseDist + brushNoise;

          // Mouse clearing
          float clearFactor = smoothstep(baseRadius, baseRadius + 0.15, distortedMouseDist);
          // Only apply clear if moving
          float velocityClear = mix(1.0, clearFactor, activeFactor);
          
          // Scroll tunneling clearing
          float tunnelClear = smoothstep(scrollHoleRadius, scrollHoleRadius + 0.80, distToCenter);
          
          fogDensity *= (velocityClear * tunnelClear);

          // --- 5. Breathing Rim-Light & Chromatic Purity ---
          float glow = smoothstep(0.3, 0.0, distortedMouseDist) * activeFactor;
          vec3 finalColor = mix(uFogColor, uHighlightColor, glow * 0.4);

          // Breathing Pulse
          float pulse = 1.0 + sin(uTime * 4.0) * 0.15;
          float rimInner = smoothstep(0.03, 0.08, distortedMouseDist);
          float rimOuter = smoothstep(0.20, 0.12, distortedMouseDist);
          float rimLight = rimInner * rimOuter * uRimIntensity * pulse * activeFactor;
          
          finalColor += uHighlightColor * rimLight;

          // Additive Chromatic Aberration
          vec2 chromaOffset = normalize(mouseDir + 0.0001) * 0.015 * force;
          float rChannel = fbm((noiseUv + chromaOffset) * 1.0);
          float gChannel = rawFogDensity; 
          float bChannel = fbm((noiseUv - chromaOffset) * 1.0);
          
          // Murni RGB terpisah dari uFogColor
          vec3 chromaticFog = vec3(rChannel, gChannel, bChannel);
          
          // Additive Blend
          finalColor += chromaticFog * rimLight * 0.7;

          // --- 6. Cinematic Vignette Framing ---
          float vignette = smoothstep(1.6, 0.5, length(vUv * 2.0 - 1.0));
          float alpha = fogDensity * uOpacity * vignette;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
  }, [uniforms]);

  // Fullscreen quad using custom shader that bypasses view/projection matrices.
  // Using args={[2, 2]} ensures vertices go from -1 to 1 in both axes (filling the NDC space completely).
  return (
    <mesh ref={meshRef} raycast={() => null}>
      <planeGeometry args={[2, 2]} />
      <primitive object={shaderMaterial} attach="material" ref={matRef} />
    </mesh>
  );
}

function CameraRig({
  mousePosRef,
  scrollProgress,
}: {
  mousePosRef: React.RefObject<{ x: number; y: number }>;
  scrollProgress: React.RefObject<number>;
}) {
  const cameraGroup = useRef<THREE.Group>(null);
  const { size } = useThree();
  const isMobile = size.width < 768;

  useFrame(() => {
    if (!cameraGroup.current) return;

    // Read the ref's current value (updated without re-renders)
    const mp = mousePosRef.current ?? { x: 0, y: 0 };
    const sp = scrollProgress.current ?? 0;

    const target = interpolateWaypoints(sp, isMobile);

    // Add parallax offsets (now enabled for mobile via gyroscope)
    const finalPosX = target.pos[0] + (mp.x * 0.4);
    const finalPosY = target.pos[1] + (mp.y * 0.25);
    const finalPosZ = target.pos[2];

    const finalRotX = target.rot[0] + (-mp.y * 0.15);
    const finalRotY = target.rot[1] + (mp.x * 0.15);

    cameraGroup.current.position.x = THREE.MathUtils.lerp(cameraGroup.current.position.x, finalPosX, 0.05);
    cameraGroup.current.position.y = THREE.MathUtils.lerp(cameraGroup.current.position.y, finalPosY, 0.05);
    cameraGroup.current.position.z = THREE.MathUtils.lerp(cameraGroup.current.position.z, finalPosZ, 0.05);

    cameraGroup.current.rotation.x = THREE.MathUtils.lerp(cameraGroup.current.rotation.x, finalRotX, 0.05);
    cameraGroup.current.rotation.y = THREE.MathUtils.lerp(cameraGroup.current.rotation.y, finalRotY, 0.05);
  });

  return (
    <group ref={cameraGroup} position={[0, 2, 5]}>
      <PerspectiveCamera makeDefault fov={60} />
    </group>
  );
}

/* ===== RPG 3D Campfire Anchor ===== */
function Campfire({ position, onClick }: { position: [number, number, number]; onClick?: (e: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const flame1 = useRef<THREE.Mesh>(null);
  const flame2 = useRef<THREE.Mesh>(null);
  const flame3 = useRef<THREE.Mesh>(null);
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
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
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
function QuestBoardStand({ position }: { position: [number, number, number] }) {
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
function WorkshopDecorations({ position }: { position: [number, number, number] }) {
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
function Bookshelf({ position, onClick }: { position: [number, number, number]; onClick?: (e: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
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
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
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

/* ===== Spatial 3D HTML UI Overlay Component ===== */
function SpatialHTMLUI({
  scrollProgress,
  formData,
  setFormData,
  status,
  handleSubmit,
  errorMessage,
  isAboutOpen,
  isSkillsOpen,
  setIsAboutOpen,
  setIsSkillsOpen,
}: {
  scrollProgress: React.RefObject<number>;
  formData: any;
  setFormData: any;
  status: any;
  handleSubmit: any;
  errorMessage: any;
  isAboutOpen: boolean;
  isSkillsOpen: boolean;
  setIsAboutOpen: (val: boolean) => void;
  setIsSkillsOpen: (val: boolean) => void;
}) {
  const heroHtmlRef = useRef<HTMLDivElement>(null);
  const aboutPromptRef = useRef<HTMLDivElement>(null);
  const skillsPromptRef = useRef<HTMLDivElement>(null);
  const projectsHtmlRef = useRef<HTMLDivElement>(null);
  const contactHtmlRef = useRef<HTMLDivElement>(null);

  const { size } = useThree();
  const isMobile = size.width < 768;

  useFrame(() => {
    const sp = scrollProgress.current ?? 0;

    const getOpacity = (val: number, s: number, ps: number, pe: number, e: number) => {
      if (val < s || val > e) return 0;
      if (val >= ps && val <= pe) return 1;
      if (val < ps) return (val - s) / (ps - s);
      return (e - val) / (e - pe);
    };

    const oHero = getOpacity(sp, -0.1, 0.0, 0.1, 0.22);
    const oAbout = getOpacity(sp, 0.12, 0.22, 0.32, 0.42);
    const oSkills = getOpacity(sp, 0.35, 0.45, 0.55, 0.65);
    // Projects: align activation with camera waypoint (sp=0.75) — fade in 0.68-0.78, full 0.78-0.88
    const oProjects = getOpacity(sp, 0.68, 0.78, 0.82, 0.92);
    const oContact = getOpacity(sp, 0.82, 0.92, 1.0, 1.1);

    const updateEl = (ref: React.RefObject<HTMLDivElement | null>, opacity: number) => {
      if (!ref.current) return;
      ref.current.style.opacity = opacity.toString();
      if (opacity <= 0.01) {
        ref.current.style.display = 'none';
        ref.current.style.pointerEvents = 'none';
      } else {
        ref.current.style.display = 'block';
        ref.current.style.pointerEvents = 'auto';
      }
    };

    // Toggle 3D interaction prompts
    updateEl(aboutPromptRef, !isAboutOpen ? oAbout : 0);
    updateEl(skillsPromptRef, !isSkillsOpen ? oSkills : 0);

    // Toggle standard cards
    updateEl(heroHtmlRef, oHero);
    updateEl(contactHtmlRef, oContact);

    // Toggle projects board with smooth CSS class transitions instead of raw inline opacity overrides
    if (projectsHtmlRef.current) {
      const isActive = oProjects > 0.01;
      if (isActive) {
        projectsHtmlRef.current.classList.add('active');
        projectsHtmlRef.current.style.pointerEvents = 'auto';
      } else {
        projectsHtmlRef.current.classList.remove('active');
        projectsHtmlRef.current.style.pointerEvents = 'none';
      }
    }
  });

  return (
    <group>
      {/* 1. Hero Card */}
      <Html
        transform
        pointerEvents="auto"
        position={[0, 1.8, 1]}
        distanceFactor={isMobile ? 2.0 : 3.5}
        zIndexRange={[100, 101]}
      >
        <div ref={heroHtmlRef} className="hero-box-billboard" style={{ transition: 'opacity 0.2s', width: isMobile ? '320px' : '480px', pointerEvents: 'auto' }}>
          <div className="hero-box" style={{ willChange: 'transform, opacity' }}>
            <div className="wave-text-wrapper">
              <h1 className="hero-title" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                {"FERDY AGUSTIAN".split(' ').map((word, wIdx) => (
                  <span key={wIdx} style={{ display: 'flex' }}>
                    {word.split('').map((char, index) => {
                      const letterIndex = wIdx === 0 ? index : 6 + index; // offset by length of first word plus space
                      return (
                        <span
                          key={index}
                          className="pixel-font wave-letter"
                          style={{ animationDelay: `${letterIndex * 0.05}s` }}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </h1>
            </div>
            <p className="vt323-font hero-subtitle">
              AI Enthusiast &nbsp;|&nbsp; CS UnderGraduate Student
            </p>
          </div>
          <div className="hero-scroll-arrow" style={{
            marginTop: '1.5rem',
            fontSize: '1.5rem',
            textAlign: 'center',
            color: 'var(--color-cream)',
            textShadow: '2px 2px 0px var(--color-black)',
          }}>
            <span style={{ display: 'inline-block', animation: 'bounce 2s infinite' }}>▼</span>
          </div>
        </div>
      </Html>

      {/* 2a. About Interactive Prompt */}
      <Html
        position={[-3.5, 1.4, -13.2]}
        transform
        distanceFactor={3.5}
        zIndexRange={[110, 111]}
      >
        <div
          ref={aboutPromptRef}
          className="pixel-font"
          style={{
            transition: 'opacity 0.2s',
            backgroundColor: 'rgba(10, 5, 2, 0.9)',
            color: '#ffbe5c',
            padding: '6px 14px',
            border: '2px solid #e67e22',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.6)',
            fontSize: '0.55rem',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            letterSpacing: '1px',
            animation: 'gachaBlinkPulse 1.4s ease-in-out infinite',
            userSelect: 'none',
            // Non-interactive: purely a visual hint. Click is handled by the 3D Campfire object.
            pointerEvents: 'none',
          }}
        >
          ✦ KLIK API UNGGUN UNTUK MELIHAT ABOUT ✦
        </div>
      </Html>

      {/* 3a. Skills Interactive Prompt */}
      <Html
        position={[4.0, 2.5, -28.8]}
        transform
        distanceFactor={3.5}
        zIndexRange={[110, 111]}
      >
        <div
          ref={skillsPromptRef}
          className="pixel-font"
          style={{
            transition: 'opacity 0.2s',
            backgroundColor: 'rgba(5, 10, 8, 0.95)',
            color: '#7dffb3',
            padding: '6px 14px',
            border: '2px solid #4ade80',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.6)',
            fontSize: '0.55rem',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            letterSpacing: '1px',
            animation: 'gachaBlinkPulse 1.4s ease-in-out infinite',
            userSelect: 'none',
            // Non-interactive: purely a visual hint. Click is handled by the 3D Bookshelf object.
            pointerEvents: 'none',
          }}
        >
          ✦ KLIK RAK BUKU UNTUK MELIHAT SKILL ✦
        </div>
      </Html>

      {/* 4. Projects (Quest Board HTML Billboard) - Precision Aligned */}
      <Html
        transform
        position={[0, 2.0, -44.9]}
        distanceFactor={isMobile ? 2.2 : 1.61}
        zIndexRange={[100, 101]}
      >
        <div
          ref={projectsHtmlRef}
          className="projects-board-billboard"
          style={{
            width: isMobile ? '380px' : '1000px',
            height: isMobile ? '560px' : '580px',
            pointerEvents: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <ProjectGallery />
        </div>
      </Html>

      {/* 5. Contact Card */}
      <Html
        transform
        position={[0, 5.8, -57.5]}
        rotation={[0.3, 0, 0]}
        distanceFactor={isMobile ? 2.8 : 3.5}
        zIndexRange={[100, 101]}
      >
        <div ref={contactHtmlRef} style={{ transition: 'opacity 0.2s', width: isMobile ? '360px' : '520px', pointerEvents: 'auto' }}>
          <DialogueBox title="Send a Message" className="contact-box" style={{ width: '100%' }}>
            <p style={{ marginBottom: '1rem', textAlign: 'center', fontSize: isMobile ? '1rem' : '0.9rem', lineHeight: 1.6 }}>
              Im more to be happy when i can make a good things for other people , so if you have a good things for me , just send a message!
            </p>
            <form style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '0.8rem' }} onSubmit={handleSubmit}>
              <div>
                <label className="pixel-font" style={{ fontSize: '0.65rem', color: 'var(--color-pixel-leaf)' }}>NAMA</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData((p: any) => ({ ...p, name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: isMobile ? '0.9rem' : '0.6rem', border: '2px solid var(--color-pixel-leaf)', backgroundColor: 'rgba(5, 5, 10, 0.65)', color: 'var(--color-cream)', outline: 'none', fontFamily: "'VT323', monospace", fontSize: '1.1rem' }}
                />
              </div>
              <div>
                <label className="pixel-font" style={{ fontSize: '0.65rem', color: 'var(--color-pixel-leaf)' }}>EMAIL</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData((p: any) => ({ ...p, email: e.target.value }))}
                  required
                  style={{ width: '100%', padding: isMobile ? '0.9rem' : '0.6rem', border: '2px solid var(--color-pixel-leaf)', backgroundColor: 'rgba(5, 5, 10, 0.65)', color: 'var(--color-cream)', outline: 'none', fontFamily: "'VT323', monospace", fontSize: '1.1rem' }}
                />
              </div>
              <div>
                <label className="pixel-font" style={{ fontSize: '0.65rem', color: 'var(--color-pixel-leaf)' }}>PESAN</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={e => setFormData((p: any) => ({ ...p, message: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '0.6rem', border: '2px solid var(--color-pixel-leaf)', backgroundColor: 'rgba(5, 5, 10, 0.65)', color: 'var(--color-cream)', outline: 'none', fontFamily: "'VT323', monospace", fontSize: '1.1rem', resize: 'vertical' }}
                />
              </div>
              <PixelButton type="submit" disabled={status === 'loading'} style={{ width: '100%', marginTop: '0.3rem', opacity: status === 'loading' ? 0.5 : 1 }}>
                {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
              </PixelButton>
              {status === 'success' && <p style={{ color: 'var(--color-moss-green)', fontSize: '1.1rem', textAlign: 'center', marginTop: '0.3rem', fontFamily: "'VT323', monospace" }}>Berhasil dikirim, terimakasih telah mengirim pesan! :D</p>}
              {status === 'error' && <p style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.3rem', fontFamily: "'VT323', monospace" }}>Gagal: {errorMessage}</p>}
            </form>
          </DialogueBox>
        </div>
      </Html>
    </group>
  );
}

function Fireflies({ theme }: { theme: TimeTheme }) {
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

function GroundBushes({ theme }: { theme: TimeTheme }) {
  const count = 50;
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const configRef = useRef(THEME_CONFIGS[theme]);

  useEffect(() => { configRef.current = THEME_CONFIGS[theme]; }, [theme]);

  // Bake BOTH position AND rotation into the memoized array
  // so re-renders never regenerate random values
  const bushData = useMemo(() => {
    const data = [];
    const minDistance = 3.0; // Safe distance from interactive objects
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
    if (matRef.current) lerpColor(matRef.current.color, new THREE.Color(configRef.current.bushColor), LERP_SPEED);
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

function FallingLeaves({ theme }: { theme: TimeTheme }) {
  const count = 100; // Reduced from 150
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshLambertMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const configRef = useRef(THEME_CONFIGS[theme]);

  useEffect(() => { configRef.current = THEME_CONFIGS[theme]; }, [theme]);

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
      lerpColor(matRef.current.color, new THREE.Color(cfg.leafParticleColor), LERP_SPEED);
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

/* ===== Ground ===== */
function Ground({ theme }: { theme: TimeTheme }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const configRef = useRef(THEME_CONFIGS[theme]);
  useEffect(() => { configRef.current = THEME_CONFIGS[theme]; }, [theme]);
  useFrame(() => {
    if (matRef.current) lerpColor(matRef.current.color, new THREE.Color(configRef.current.groundColor), LERP_SPEED);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial ref={matRef} color={THEME_CONFIGS[theme].groundColor} />
    </mesh>
  );
}

/* ===== Main Export ===== */
interface PixelForestProps {
  theme: TimeTheme;
  mousePosRef?: React.RefObject<{ x: number; y: number }>;
  formData: { name: string; email: string; message: string };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; email: string; message: string }>>;
  status: 'idle' | 'loading' | 'success' | 'error';
  handleSubmit: (e: React.FormEvent) => void;
  errorMessage: string;
}

export default function PixelForest({
  theme,
  mousePosRef,
  formData,
  setFormData,
  status,
  handleSubmit,
  errorMessage,
}: PixelForestProps) {
  const defaultRef = useRef({ x: 0, y: 0 });
  const effectiveRef = mousePosRef ?? defaultRef;
  const cfg = THEME_CONFIGS[theme];
  // containerRef is passed to Canvas as eventSource so that R3F raycasting
  // fires from the full wrapper div — not blocked by Drei Html overlay divs
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollProgress = useRef(0);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'about' | 'skills' | 'projects' | 'contact'>('hero');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const sp = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      scrollProgress.current = sp;

      // Section boundary matching (same as interpolateWaypoints)
      let section: 'hero' | 'about' | 'skills' | 'projects' | 'contact' = 'hero';
      if (sp >= 0.12 && sp <= 0.42) {
        section = 'about';
      } else if (sp > 0.42 && sp <= 0.65) {
        section = 'skills';
      } else if (sp > 0.65 && sp <= 0.88) {
        section = 'projects';
      } else if (sp > 0.88) {
        section = 'contact';
      }

      setActiveSection((prev) => {
        if (prev !== section) return section;
        return prev;
      });

      // Auto close overlays when scrolling away from their respective section
      if (sp < 0.12 || sp > 0.42) {
        setIsAboutOpen(false);
      }
      if (sp < 0.35 || sp > 0.65) {
        setIsSkillsOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock body scroll when overlay is open for maximum reading comfort
  useEffect(() => {
    if (isAboutOpen || isSkillsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAboutOpen, isSkillsOpen]);

  // Wave animation is handled purely via CSS and animationDelay inline style

  return (
    <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'auto' }}>
      <Canvas dpr={[1, 1.5]} eventSource={containerRef as React.RefObject<HTMLElement>} eventPrefix="client">
        <color attach="background" args={[cfg.bgColor]} />
        <fog attach="fog" args={[cfg.fogColor, cfg.fogNear, cfg.fogFar]} />
        <InteractiveFog theme={theme} scrollProgress={scrollProgress} />

        <CameraRig mousePosRef={effectiveRef} scrollProgress={scrollProgress} />
        <SceneController theme={theme} />

        {/* Sky Elements — Locked to camera Z to simulate infinite distance */}
        <SkyDome>
          {/* Sky background */}
          <DynamicSky theme={theme} />

          {/* Celestial body (Sun/Moon) */}
          <CelestialBody theme={theme} />
        </SkyDome>

        {/* Clouds - Outside SkyDome so they exhibit parallax scrolling */}
        <DynamicClouds theme={theme} />

        {/* Ground */}
        <Ground theme={theme} />

        {/* Nature Waypoint Decorations */}
        <Campfire position={[-3.5, 0, -13.2]} onClick={() => { setIsAboutOpen(true); }} />
        <WorkshopDecorations position={[2.8, 0, -27.6]} />
        <Bookshelf position={[4.0, 0, -28.8]} onClick={() => { setIsSkillsOpen(true); }} />
        <QuestBoardStand position={[0, 0, -45]} />

        {/* Nature */}
        <Trees theme={theme} />
        <GroundBushes theme={theme} />
        <FallingLeaves theme={theme} />
        <Fireflies theme={theme} />

        {/* Spatial HTML Overlay Content */}
        <SpatialHTMLUI
          scrollProgress={scrollProgress}
          formData={formData}
          setFormData={setFormData}
          status={status}
          handleSubmit={handleSubmit}
          errorMessage={errorMessage}
          isAboutOpen={isAboutOpen}
          isSkillsOpen={isSkillsOpen}
          setIsAboutOpen={setIsAboutOpen}
          setIsSkillsOpen={setIsSkillsOpen}
        />

        <EffectComposer multisampling={0}>
          <Pixelation granularity={5} />
        </EffectComposer>
      </Canvas>

      {mounted && createPortal(
        <>
          {/* Screen-Space Overlay Modals (Containerless style - Rendered outside of Three.js stacking context) */}
          <div className={`fullscreen-overlay-modal ${isAboutOpen ? 'is-open' : ''}`} onClick={() => setIsAboutOpen(false)}>
            <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
              <div className="modal-containerless-panel">
                <DialogueBox title="Ferdy Agustian Prasetyo">
                  <div className="about-content" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start' }}>
                    <div style={{ transform: isMobile ? 'scale(0.85)' : 'none', transformOrigin: 'center top', marginBottom: isMobile ? '-1.5rem' : '0' }}>
                      <InteractiveAvatar />
                    </div>
                    <div style={{ flex: '1', minWidth: '250px', maxWidth: isMobile ? '100%' : '60ch', paddingLeft: isMobile ? '0' : '2rem', paddingRight: '1rem', maxHeight: isMobile ? '65vh' : '55vh', overflowY: 'auto' }} className="custom-scrollbar-container">
                      <p style={{ marginBottom: '1.2rem', fontSize: isMobile ? '1.05rem' : '1.1rem', lineHeight: '1.8' }}>
                        <span style={{ color: 'var(--color-accent, #ffd700)', fontWeight: 'bold', fontSize: '1.15rem' }}>Hello! (こんにちは!)</span> I am Ferdy Agustian Prasetyo, a final-year undergraduate student at <strong style={{ color: '#7dffb3' }}>Universitas Gunadarma</strong>.
                      </p>
                      <p style={{ marginBottom: '1.2rem', fontSize: isMobile ? '1.05rem' : '1.1rem', lineHeight: '1.8' }}>
                        I have a profound passion for <strong style={{ color: '#7dffb3' }}>Artificial Intelligence</strong> and <strong style={{ color: '#7dffb3' }}>Software Development</strong>, driven by a continuous desire to solve complex problems through code. I thrive on combining precise logic and creative design to build scalable applications that are not only visually engaging but also functionally impactful.
                      </p>
                      <p style={{ marginBottom: '1.2rem', fontSize: isMobile ? '1.05rem' : '1.1rem', lineHeight: '1.8' }}>
                        My technical journey spans across architecting robust <strong style={{ color: '#7dffb3' }}>backend systems</strong>, implementing advanced <strong style={{ color: '#7dffb3' }}>data security</strong> logic, and fine-tuning <strong style={{ color: '#7dffb3' }}>machine learning models</strong> to extract meaningful insights. Beyond just writing code, I am deeply committed to <em style={{ color: '#ffd700' }}>software quality</em> and <em style={{ color: '#ffd700' }}>structural integrity</em>. Whether I am conducting rigorous system testing, managing relational databases, or crafting interactive user interfaces, my ultimate goal is to deliver secure, flawless, and user-centric digital experiences.
                      </p>
                      <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.7', color: 'rgba(255, 255, 255, 0.85)' }}>
                        <em style={{ borderLeft: '3px solid #ffd700', paddingLeft: '10px', display: 'block' }}>I believe that the best products are built at the intersection of innovative algorithms and meticulous engineering. </em>
                      </p>
                      <div className="about-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                        <PixelButton
                          href="https://github.com/Ferdyagustian"
                          target="_blank"
                          rel="noreferrer"
                          variant="secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <span className="pixel-font" style={{ fontSize: '0.6rem' }}>[GH]</span> GitHub
                        </PixelButton>
                        <PixelButton
                          href="https://www.linkedin.com/in/ferdy-agustian-5a3521247/"
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <span className="pixel-font" style={{ fontSize: '0.6rem' }}>[IN]</span> LinkedIn
                        </PixelButton>
                      </div>
                    </div>
                  </div>
                </DialogueBox>
              </div>
            </div>
          </div>

          <div className={`fullscreen-overlay-modal ${isSkillsOpen ? 'is-open' : ''}`} onClick={() => setIsSkillsOpen(false)}>
            <div className="modal-content-wrapper skills-modal-wrapper" onClick={(e) => e.stopPropagation()}>
              <div className="modal-containerless-panel">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h2 className="pixel-font" style={{ fontSize: '1.5rem', color: 'var(--color-cream)', textShadow: '3px 3px 0px var(--color-black)' }}>
                    WORKSHOP // SKILLS
                  </h2>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                  gap: isMobile ? '0.8rem' : '1.2rem',
                  width: '100%'
                }}>
                  <PixelCard title="Frontend">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <ObservableSkill name="HTML/CSS/JS" rank="A" percentage={85} iconColor="#e34c26" />
                      <ObservableSkill name="React / Next.js" rank="S" percentage={95} iconColor="#61dafb" />
                      <ObservableSkill name="WebGL / Three.js" rank="B" percentage={70} iconColor="#88ce02" />
                    </div>
                  </PixelCard>
                  <PixelCard title="Backend">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <ObservableSkill name="Node.js" rank="S" percentage={90} iconColor="#339933" />
                      <ObservableSkill name="Python" rank="A" percentage={80} iconColor="#3776ab" />
                      <ObservableSkill name="Java" rank="B" percentage={75} iconColor="#5382a1" />
                    </div>
                  </PixelCard>
                  <PixelCard title="Database">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <ObservableSkill name="MySQL" rank="A" percentage={85} iconColor="#4479a1" />
                      <ObservableSkill name="PostgreSQL" rank="A" percentage={80} iconColor="#336791" />
                      <ObservableSkill name="MongoDB" rank="B" percentage={75} iconColor="#47a248" />
                    </div>
                  </PixelCard>
                  <PixelCard title="Tools & Others">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <ObservableSkill name="Git / GitHub" rank="S" percentage={90} iconColor="#f05032" />
                      <ObservableSkill name="Docker" rank="B" percentage={70} iconColor="#2496ed" />
                      <ObservableSkill name="Figma" rank="A" percentage={85} iconColor="#f24e1e" />
                      <ObservableSkill name="AI / ML" rank="B" percentage={75} iconColor="#ffeb3b" />
                    </div>
                  </PixelCard>
                </div>
              </div>
            </div>
          </div>
        </>
        , document.body)}
    </div>
  );
}
