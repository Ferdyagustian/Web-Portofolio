"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TimeTheme } from '../../../lib/useTimeTheme';
import { THEME_CONFIGS } from '../../../lib/themeConfig';
import { LERP_SPEED, lerpColor, lerpNum } from './utils';

const v = new THREE.Vector3();

/* ===== Sky Dome (Locks Z to Camera to simulate infinity) ===== */
export function SkyDome({ children }: { children: React.ReactNode }) {
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

/* ===== Dynamic Sky ===== */
export function DynamicSky({ theme }: { theme: TimeTheme }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const configRef = useRef(THEME_CONFIGS[theme]);
  const currentColors = useRef({
    top: new THREE.Color(THEME_CONFIGS[theme].skyTop),
    midTop: new THREE.Color(THEME_CONFIGS[theme].skyMidTop),
    mid: new THREE.Color(THEME_CONFIGS[theme].skyMid),
    midBottom: new THREE.Color(THEME_CONFIGS[theme].skyMidBottom),
    bottom: new THREE.Color(THEME_CONFIGS[theme].skyBottom),
  });

  const targetColors = useRef({
    top: new THREE.Color(THEME_CONFIGS[theme].skyTop),
    midTop: new THREE.Color(THEME_CONFIGS[theme].skyMidTop),
    mid: new THREE.Color(THEME_CONFIGS[theme].skyMid),
    midBottom: new THREE.Color(THEME_CONFIGS[theme].skyMidBottom),
    bottom: new THREE.Color(THEME_CONFIGS[theme].skyBottom),
  });

  useEffect(() => {
    configRef.current = THEME_CONFIGS[theme];
    const cfg = THEME_CONFIGS[theme];
    targetColors.current.top.set(cfg.skyTop);
    targetColors.current.midTop.set(cfg.skyMidTop);
    targetColors.current.mid.set(cfg.skyMid);
    targetColors.current.midBottom.set(cfg.skyMidBottom);
    targetColors.current.bottom.set(cfg.skyBottom);
  }, [theme]);

  useFrame(() => {
    if (!matRef.current) return;
    const cc = currentColors.current;
    const u = matRef.current.uniforms;

    lerpColor(cc.top, targetColors.current.top, LERP_SPEED);
    lerpColor(cc.midTop, targetColors.current.midTop, LERP_SPEED);
    lerpColor(cc.mid, targetColors.current.mid, LERP_SPEED);
    lerpColor(cc.midBottom, targetColors.current.midBottom, LERP_SPEED);
    lerpColor(cc.bottom, targetColors.current.bottom, LERP_SPEED);

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
export function CelestialBody({ theme }: { theme: TimeTheme }) {
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

  // Cached target colors — updated only on theme change, not per-frame
  const targetCoreColor = useRef(new THREE.Color(THEME_CONFIGS[theme].celestialCoreColor));
  const targetInnerColor = useRef(new THREE.Color(THEME_CONFIGS[theme].celestialInnerGlow));
  const targetOuterColor = useRef(new THREE.Color(THEME_CONFIGS[theme].celestialOuterGlow));
  const targetHazeColor = useRef(new THREE.Color(THEME_CONFIGS[theme].celestialHaze));

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
    targetCoreColor.current.set(cfg.celestialCoreColor);
    targetInnerColor.current.set(cfg.celestialInnerGlow);
    targetOuterColor.current.set(cfg.celestialOuterGlow);
    targetHazeColor.current.set(cfg.celestialHaze);
  }, [theme]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const cfg = configRef.current;

    // Lerp position relative to SkyDome
    groupRef.current.position.lerp(targetPos.current, LERP_SPEED);

    // Lerp colors
    lerpColor(coreColor.current, targetCoreColor.current, LERP_SPEED);
    lerpColor(innerColor.current, targetInnerColor.current, LERP_SPEED);
    lerpColor(outerColor.current, targetOuterColor.current, LERP_SPEED);
    lerpColor(hazeColor.current, targetHazeColor.current, LERP_SPEED);

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
export function DynamicClouds({ theme, performanceMode = 'normal' }: { theme: TimeTheme, performanceMode?: 'normal' | 'light' | 'potato' }) {
  const configRef = useRef(THEME_CONFIGS[theme]);
  const groupRef = useRef<THREE.Group>(null);
  const currentOpacity = useRef(THEME_CONFIGS[theme].cloudOpacity);
  const _tmpCloudColor = useRef(new THREE.Color());

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
        _tmpCloudColor.current.set(cfg.cloudColors[i % cfg.cloudColors.length]);
        lerpColor(mat.color, _tmpCloudColor.current, LERP_SPEED);
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
