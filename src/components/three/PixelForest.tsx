"use client";

import React, { useRef, useMemo, useEffect, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Instance, Instances } from '@react-three/drei';
import { EffectComposer, Pixelation } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TimeTheme } from '../../lib/useTimeTheme';
import { THEME_CONFIGS } from '../../lib/themeConfig';

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
    for (let i = 0; i < treeCount; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = -Math.random() * 60;
      if (Math.abs(x) < 3) {
        pos.push({ x: x > 0 ? x + 4 : x - 4, z });
      } else {
        pos.push({ x, z });
      }
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

function CameraRig({ mousePosRef }: { mousePosRef: React.RefObject<{ x: number; y: number }> }) {
  const cameraGroup = useRef<THREE.Group>(null);
  const scrollProgress = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame(() => {
    if (!cameraGroup.current) return;

    // Read the ref's current value (updated without re-renders)
    const mp = mousePosRef.current ?? { x: 0, y: 0 };

    // Scroll: move camera forward along Z
    const targetZ = 5 - scrollProgress.current * 40;
    cameraGroup.current.position.z = THREE.MathUtils.lerp(
      cameraGroup.current.position.z, targetZ, 0.05
    );

    // Mouse parallax — very tight limits
    const targetRotY = mp.x * 0.24;
    const targetRotX = -mp.y * 0.225;
    const targetPosX = mp.x * 0.4;
    const targetPosY = 2 + mp.y * 0.25;

    cameraGroup.current.rotation.y = THREE.MathUtils.lerp(
      cameraGroup.current.rotation.y, targetRotY, 0.04
    );
    cameraGroup.current.rotation.x = THREE.MathUtils.lerp(
      cameraGroup.current.rotation.x, targetRotX, 0.04
    );
    cameraGroup.current.position.x = THREE.MathUtils.lerp(
      cameraGroup.current.position.x, targetPosX, 0.03
    );
    cameraGroup.current.position.y = THREE.MathUtils.lerp(
      cameraGroup.current.position.y, targetPosY, 0.03
    );
  });

  return (
    <group ref={cameraGroup} position={[0, 2, 5]}>
      <PerspectiveCamera makeDefault fov={60} />
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
    for (let i = 0; i < count; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (2.5 + Math.random() * 5);
      const z = -Math.random() * 60;
      const scale = 0.4 + Math.random() * 1.2;
      const rotY = Math.random() * Math.PI; // baked rotation
      data.push({ x, z, scale, rotY });
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
export default function PixelForest({ theme, mousePosRef }: { theme: TimeTheme; mousePosRef?: React.RefObject<{ x: number; y: number }> }) {
  const defaultRef = useRef({ x: 0, y: 0 });
  const effectiveRef = mousePosRef ?? defaultRef;
  const cfg = THEME_CONFIGS[theme];
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <Canvas>
        <color attach="background" args={[cfg.bgColor]} />
        <fog attach="fog" args={[cfg.fogColor, cfg.fogNear, cfg.fogFar]} />

        <CameraRig mousePosRef={effectiveRef} />
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

        {/* Nature */}
        <Trees theme={theme} />
        <GroundBushes theme={theme} />
        <FallingLeaves theme={theme} />
        <Fireflies theme={theme} />

        <EffectComposer multisampling={0}>
          <Pixelation granularity={5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
