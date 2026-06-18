"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TimeTheme } from '../../../lib/useTimeTheme';
import { THEME_CONFIGS } from '../../../lib/themeConfig';
import { LERP_SPEED, lerpColor, lerpNum } from './utils';

export const FOG_THEME_PARAMS: Record<TimeTheme, {
  highlightColor: string;
  overlayFogColor: string;
  maxDensity: number;
  driftSpeed: [number, number];
  rimIntensity: number;
  vignetteIntensity: number;
}> = {
  // Pagi: Sunrise — warm peach mist rising, golden celestial highlight
  pagi: {
    highlightColor: '#FFD93D',
    overlayFogColor: '#c9a67a',
    maxDensity: 0.80,
    driftSpeed: [0.02, 0.06],
    rimIntensity: 0.65,
    vignetteIntensity: 0.25,
  },
  // Siang: Noon — light airy haze, barely visible, crisp atmosphere
  siang: {
    highlightColor: '#FFE082',
    overlayFogColor: '#9bbdd8',
    maxDensity: 0.55,
    driftSpeed: [0.01, 0.01],
    rimIntensity: 0.35,
    vignetteIntensity: 0.15,
  },
  // Sore: Sunset — heavy dramatic twilight, ember glow
  sore: {
    highlightColor: '#FF6B35',
    overlayFogColor: '#3d1828',
    maxDensity: 0.88,
    driftSpeed: [0.07, -0.04],
    rimIntensity: 1.0,
    vignetteIntensity: 0.45,
  },
  // Malam: Night — dense mystical ground fog, bioluminescent moonlight
  malam: {
    highlightColor: '#d0e8ff',
    overlayFogColor: '#1e3545',
    maxDensity: 0.92,
    driftSpeed: [0.05, 0.00],
    rimIntensity: 1.2,
    vignetteIntensity: 0.60,
  },
};

export function InteractiveFog({
  theme,
  scrollProgress,
  reducedMotion = false,
  isStarted = false,
}: {
  theme: TimeTheme;
  scrollProgress: React.RefObject<number>;
  reducedMotion?: boolean;
  isStarted?: boolean;
}) {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const prevPointer = useRef(new THREE.Vector2());
  const mouseVelocity = useRef(0);
  const mouseDirection = useRef(new THREE.Vector2(1, 0));

  const currentParams = useRef({
    fogColor: new THREE.Color(FOG_THEME_PARAMS[theme].overlayFogColor),
    highlightColor: new THREE.Color(FOG_THEME_PARAMS[theme].highlightColor),
    maxDensity: FOG_THEME_PARAMS[theme].maxDensity,
    driftSpeed: new THREE.Vector2(...FOG_THEME_PARAMS[theme].driftSpeed),
    rimIntensity: FOG_THEME_PARAMS[theme].rimIntensity,
    vignetteIntensity: FOG_THEME_PARAMS[theme].vignetteIntensity,
    opacity: 0.0,
  });

  const targetParams = useRef({
    fogColor: new THREE.Color(FOG_THEME_PARAMS[theme].overlayFogColor),
    highlightColor: new THREE.Color(FOG_THEME_PARAMS[theme].highlightColor),
    maxDensity: FOG_THEME_PARAMS[theme].maxDensity,
    driftSpeed: new THREE.Vector2(...FOG_THEME_PARAMS[theme].driftSpeed),
    rimIntensity: FOG_THEME_PARAMS[theme].rimIntensity,
    vignetteIntensity: FOG_THEME_PARAMS[theme].vignetteIntensity,
  });

  useEffect(() => {
    const params = FOG_THEME_PARAMS[theme];
    targetParams.current.fogColor.set(params.overlayFogColor);
    targetParams.current.highlightColor.set(params.highlightColor);
    targetParams.current.maxDensity = params.maxDensity;
    targetParams.current.driftSpeed.set(...params.driftSpeed);
    targetParams.current.rimIntensity = params.rimIntensity;
    targetParams.current.vignetteIntensity = params.vignetteIntensity;
  }, [theme]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouseVelocity: { value: 0.0 },
    uMouseDirection: { value: new THREE.Vector2(1, 0) },
    uScrollProgress: { value: 0.0 },
    uOpacity: { value: 0.0 },
    uFogColor: { value: new THREE.Color(FOG_THEME_PARAMS[theme].overlayFogColor) },
    uHighlightColor: { value: new THREE.Color(FOG_THEME_PARAMS[theme].highlightColor) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uDriftSpeed: { value: new THREE.Vector2(...FOG_THEME_PARAMS[theme].driftSpeed) },
    uRimIntensity: { value: FOG_THEME_PARAMS[theme].rimIntensity },
    uIsMobile: { value: isMobile ? 1.0 : 0.0 },
    uVignetteIntensity: { value: FOG_THEME_PARAMS[theme].vignetteIntensity },
    uReducedMotion: { value: reducedMotion ? 1.0 : 0.0 },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uResolution.value.set(size.width, size.height);
      matRef.current.uniforms.uIsMobile.value = isMobile ? 1.0 : 0.0;
    }
  }, [size.width, size.height, isMobile]);


  useFrame((state, delta) => {
    const sp = scrollProgress.current ?? 0;
    const rawFade = Math.max(0, 1.0 - sp * 2.5);
    const easedFade = rawFade * rawFade;
    const targetOpacity = (isMobile ? easedFade * 0.4 : easedFade);

    const cp = currentParams.current;
    const tp = targetParams.current;

    if (!isStarted) {
      cp.opacity = 0.0;
    } else if (cp.opacity < targetOpacity * cp.maxDensity - 0.05) {
      cp.opacity += delta * 0.15;
    } else {
      cp.opacity = lerpNum(cp.opacity, targetOpacity * cp.maxDensity, LERP_SPEED * 1.5);
    }

    if (targetOpacity <= 0.001 && cp.opacity <= 0.005) {
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }

    if (meshRef.current) meshRef.current.visible = true;

    // Lerp semua parameter
    lerpColor(cp.fogColor, tp.fogColor, LERP_SPEED);
    lerpColor(cp.highlightColor, tp.highlightColor, LERP_SPEED);
    cp.maxDensity = lerpNum(cp.maxDensity, tp.maxDensity, LERP_SPEED);
    cp.driftSpeed.lerp(tp.driftSpeed, LERP_SPEED);
    cp.rimIntensity = lerpNum(cp.rimIntensity, tp.rimIntensity, LERP_SPEED);
    cp.vignetteIntensity = lerpNum(cp.vignetteIntensity, tp.vignetteIntensity, LERP_SPEED);

    if (matRef.current) {
      const u = matRef.current.uniforms;
      u.uTime.value = state.clock.getElapsedTime();
      u.uScrollProgress.value = sp;

      const dt = Math.max(0.001, delta);
      const dist = state.pointer.distanceTo(prevPointer.current);
      const currentVel = dist / dt;

      // [PERBAIKAN FISIKA] 
      // Hitung arah mouse SEBELUM prevPointer diupdate, agar vektor arah tidak nol
      if (dist > 0.001) {
        const rawDir = new THREE.Vector2().subVectors(state.pointer, prevPointer.current).normalize();
        mouseDirection.current.lerp(rawDir, 0.12);
        mouseDirection.current.normalize();
      }

      mouseVelocity.current = lerpNum(mouseVelocity.current, currentVel, LERP_SPEED * 2.0);
      prevPointer.current.copy(state.pointer); // Update prev pointer setelah arah dihitung

      u.uMouseVelocity.value = mouseVelocity.current;
      u.uMouse.value.lerp(state.pointer, 0.08);
      u.uMouseDirection.value.copy(mouseDirection.current);

      u.uOpacity.value = cp.opacity;
      u.uFogColor.value.copy(cp.fogColor);
      u.uHighlightColor.value.copy(cp.highlightColor);
      u.uDriftSpeed.value.copy(cp.driftSpeed);
      u.uRimIntensity.value = cp.rimIntensity;
      u.uVignetteIntensity.value = cp.vignetteIntensity;
      u.uReducedMotion.value = reducedMotion ? 1.0 : 0.0;
    }
  });

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uMouseVelocity;
        uniform vec2 uMouseDirection;
        uniform float uScrollProgress;
        uniform float uOpacity;
        uniform vec3 uFogColor;
        uniform vec3 uHighlightColor;
        uniform vec2 uResolution;
        uniform vec2 uDriftSpeed;
        uniform float uRimIntensity;
        uniform float uIsMobile;
        uniform float uVignetteIntensity;
        uniform float uReducedMotion;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), u.x),
                     mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        float fbm(vec2 p) {
          float v = noise(p) * 0.55;
          v += noise(p * 2.1 + 12.3) * 0.28;
          if (uIsMobile < 0.5) {
            v += noise(p * 4.3 + 7.1) * 0.17;
          }
          return v;
        }

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
          float aspect = uResolution.x / uResolution.y;
          vec2 uv = vUv * vec2(aspect, 1.0);
          vec2 mouse = (uMouse * 0.5 + 0.5) * vec2(aspect, 1.0);
          
          vec2 screenCenter = vec2(0.5 * aspect, 0.5);
          float distToCenter = length(uv - screenCenter);

          float motionScale = 1.0 - uReducedMotion;

          vec2 mouseDir = uv - mouse;       
          
          // [PERBAIKAN VISUAL] Koreksi aspect ratio agar area interaksi mouse berbentuk lingkaran sempurna
          float mouseDist = length(vec2(mouseDir.x / aspect, mouseDir.y));
          
          float activeFactor = clamp(uMouseVelocity * 0.8, 0.0, 1.0) * motionScale;

          // 1. Directional Fluid Dynamics (bow wave + wake)
          float force = smoothstep(0.35, 0.0, mouseDist) * activeFactor;
          vec2 moveDir = normalize(uMouseDirection + 0.0001);
          
          // Gunakan mouseDir yang belum dinormalisasi aspect agar arahnya sesuai layar
          vec2 pixelDir = normalize(mouseDir + 0.0001);

          float alignment = dot(pixelDir, moveDir);

          vec2 perpDir = vec2(-moveDir.y, moveDir.x);
          float sideSign = sign(dot(pixelDir, perpDir));

          float bowStrength = max(0.0, alignment) * force;
          vec2 bowWave = perpDir * sideSign * bowStrength * 0.14;

          vec2 forwardPush = moveDir * force * 0.07;

          float wakeStrength = max(0.0, -alignment) * force * 0.6;
          vec2 wake = -perpDir * sideSign * wakeStrength * 0.05;

          float wakeAngle = wakeStrength * 0.4 / (mouseDist + 0.15) * motionScale;
          float sv = sin(wakeAngle);
          float cv = cos(wakeAngle);
          mat2 wakeRot = mat2(cv, -sv, sv, cv);

          vec2 displacement = bowWave + forwardPush + wake;

          vec2 fromCenter = uv - screenCenter;
          float scatterAmount = uScrollProgress * 2.5;
          vec2 noiseUv = uv + fromCenter * scatterAmount;

          noiseUv += uTime * uDriftSpeed * motionScale;
          
          if (uIsMobile < 0.5) {
            vec2 localUv = noiseUv - mouse;
            localUv = wakeRot * localUv;
            noiseUv = localUv + mouse;
          }
          
          noiseUv += displacement * 2.5;

          float breathe = 1.0 + (sin(uTime * 0.4) * 0.06 + sin(uTime * 0.17) * 0.04 + sin(uTime * 0.71) * 0.03) * motionScale;

          float fogBank = noise(uv * 1.2 + uTime * 0.02 * motionScale) * 0.3 + 0.7;
          float rawFogDensity = fbm(noiseUv) * breathe * fogBank;

          float heightFade = smoothstep(0.0, 0.6, vUv.y);
          rawFogDensity *= mix(1.0, 0.4, heightFade);

          // 2. Dithering
          vec2 screenPx = vUv * uResolution;
          float dither = bayer4x4(screenPx);
          float pixelFog = smoothstep(dither - 0.15, dither + 0.15, rawFogDensity);
          float fogDensity = mix(rawFogDensity, pixelFog, 0.2);

          // 3. Piercing Through Fog
          float depthMask = smoothstep(0.0, 0.7, distToCenter);
          fogDensity *= mix(0.65, 1.0, depthMask);

          vec2 tearUv = normalize(uv - screenCenter + 0.0001);
          float tearNoise = noise(tearUv * 5.0 + uTime * 0.2 * motionScale) * 0.2
                          + noise(tearUv * 12.0 - uTime * 0.15 * motionScale) * 0.12;
          float scrollHoleRadius = -1.0 + uScrollProgress * 5.5;
          float tornEdge = scrollHoleRadius + tearNoise;
          float tunnelClear = smoothstep(tornEdge, tornEdge + 0.6, distToCenter);

          float scrollSpeed = clamp(uScrollProgress * 2.5, 0.0, 1.0);
          vec2 radialDir = normalize(uv - screenCenter + 0.0001);
          fogDensity *= mix(1.0, noise(uv * 3.0 + radialDir * scrollSpeed * 4.0), scrollSpeed * 0.3);

          float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
          float edgeWisp = smoothstep(0.0, 0.2, edgeDist);
          float wispRetain = mix(1.0, edgeWisp, smoothstep(0.0, 0.35, uScrollProgress));
          
          // Brush Distortion
          float brushNoise = fbm(uv * 12.0 - uTime * 0.8 * motionScale) * 0.15;
          float distortedMouseDist = mouseDist + brushNoise;

          float clearFactor = smoothstep(0.04, 0.19, distortedMouseDist);
          float presenceClear = smoothstep(0.08, 0.22, distortedMouseDist);
          float velocityClear = mix(1.0, clearFactor, activeFactor);
          float mouseClear = min(velocityClear, mix(presenceClear, 1.0, 0.4));
          
          fogDensity *= mouseClear * tunnelClear * wispRetain;

          // 4. Lighting & Rim Light
          float glow = smoothstep(0.3, 0.0, distortedMouseDist) * activeFactor;
          vec3 finalColor = mix(uFogColor, uHighlightColor, glow * 0.4);

          float pulse = 1.0 + sin(uTime * 4.0) * 0.15 * motionScale;
          float rimInner = smoothstep(0.03, 0.08, distortedMouseDist);
          float rimOuter = smoothstep(0.20, 0.12, distortedMouseDist);
          float rimLight = rimInner * rimOuter * uRimIntensity * pulse * activeFactor;
          
          finalColor = clamp(finalColor + uHighlightColor * rimLight, 0.0, 1.0);

          // 5. Chromatic Shift
          if (activeFactor > 0.01) {
            float shift = rimLight * 0.2;
            finalColor.r *= 1.0 + shift;
            finalColor.b *= 1.0 - shift * 0.5;
            finalColor = clamp(finalColor, 0.0, 1.0);
          }

          // 6. Vignette
          float vignetteRadius = mix(1.6, 1.2, uVignetteIntensity);
          float vignetteSmooth = mix(0.5, 0.3, uVignetteIntensity);
          float vignette = smoothstep(vignetteRadius, vignetteSmooth, length(vUv * 2.0 - 1.0));
          
          float alpha = fogDensity * uOpacity * vignette;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
  }, [uniforms]);

  return (
    <mesh ref={meshRef} raycast={() => null}>
      <planeGeometry args={[2, 2]} />
      <primitive object={shaderMaterial} attach="material" ref={matRef} />
    </mesh>
  );
}

// SceneController tetap dipertahankan karena implementasinya sudah sangat baik
export function SceneController({ theme }: { theme: TimeTheme }) {
  const { scene } = useThree();
  const configRef = useRef(THEME_CONFIGS[theme]);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const mainLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);

  const currentBg = useRef(new THREE.Color(THEME_CONFIGS[theme].bgColor));
  const currentFogColor = useRef(new THREE.Color(THEME_CONFIGS[theme].fogColor));
  const currentFogNear = useRef(THEME_CONFIGS[theme].fogNear);
  const currentFogFar = useRef(THEME_CONFIGS[theme].fogFar);

  const targetBgColor = useRef(new THREE.Color(THEME_CONFIGS[theme].bgColor));
  const targetSceneFogColor = useRef(new THREE.Color(THEME_CONFIGS[theme].fogColor));
  const targetAmbientColor = useRef(new THREE.Color(THEME_CONFIGS[theme].ambientColor));
  const targetMainLightColor = useRef(new THREE.Color(THEME_CONFIGS[theme].mainLightColor));
  const targetMainLightPos = useRef(new THREE.Vector3(...THEME_CONFIGS[theme].mainLightPosition));
  const targetFillLightColor = useRef(new THREE.Color(THEME_CONFIGS[theme].fillLightColor));

  useEffect(() => {
    const cfg = THEME_CONFIGS[theme];
    configRef.current = cfg;
    targetBgColor.current.set(cfg.bgColor);
    targetSceneFogColor.current.set(cfg.fogColor);
    targetAmbientColor.current.set(cfg.ambientColor);
    targetMainLightColor.current.set(cfg.mainLightColor);
    targetMainLightPos.current.set(...cfg.mainLightPosition);
    targetFillLightColor.current.set(cfg.fillLightColor);
  }, [theme]);

  useFrame(() => {
    const cfg = configRef.current;
    lerpColor(currentBg.current, targetBgColor.current, LERP_SPEED);
    scene.background = currentBg.current;

    if (scene.fog && scene.fog instanceof THREE.Fog) {
      lerpColor(currentFogColor.current, targetSceneFogColor.current, LERP_SPEED);
      scene.fog.color.copy(currentFogColor.current);
      currentFogNear.current = lerpNum(currentFogNear.current, cfg.fogNear, LERP_SPEED);
      currentFogFar.current = lerpNum(currentFogFar.current, cfg.fogFar, LERP_SPEED);
      scene.fog.near = currentFogNear.current;
      scene.fog.far = currentFogFar.current;
    }

    if (ambientRef.current) {
      lerpColor(ambientRef.current.color, targetAmbientColor.current, LERP_SPEED);
      ambientRef.current.intensity = lerpNum(ambientRef.current.intensity, cfg.ambientIntensity, LERP_SPEED);
    }

    if (mainLightRef.current) {
      lerpColor(mainLightRef.current.color, targetMainLightColor.current, LERP_SPEED);
      mainLightRef.current.intensity = lerpNum(mainLightRef.current.intensity, cfg.mainLightIntensity, LERP_SPEED);
      mainLightRef.current.position.lerp(targetMainLightPos.current, LERP_SPEED);
    }

    if (fillLightRef.current) {
      lerpColor(fillLightRef.current.color, targetFillLightColor.current, LERP_SPEED);
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