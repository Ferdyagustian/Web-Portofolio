"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TimeTheme } from '../../../lib/useTimeTheme';
import { THEME_CONFIGS } from '../../../lib/themeConfig';
import { LERP_SPEED, frameLerp, lerpColor, lerpNum } from './utils';

export const FOG_THEME_PARAMS: Record<TimeTheme, {
  highlightColor: string;
  overlayFogColor: string; // P2: lighter variant of fogColor for screen-space layer
  maxDensity: number;
  driftSpeed: [number, number]; // [speedX, speedY]
  rimIntensity: number;
  vignetteIntensity: number; // P3: 0=mild, 1=heavy edge darkening
}> = {
  pagi: {
    highlightColor: '#ffd700', // Warm Gold
    overlayFogColor: '#d8c4a8', // Lighter warm tone
    maxDensity: 0.85,
    driftSpeed: [0.02, 0.06], // Evaporating morning mist (rising vertically)
    rimIntensity: 0.7,
    vignetteIntensity: 0.3,
  },
  siang: {
    highlightColor: '#e0f7fa', // Sunbeam Cyan
    overlayFogColor: '#c0d8f0', // Lighter blue
    maxDensity: 0.65, // Thickened to be more visible
    driftSpeed: [0.01, 0.01], // Extremely calm drift
    rimIntensity: 0.4,
    vignetteIntensity: 0.2,
  },
  sore: {
    highlightColor: '#ff6a00', // Glowing Sunset Orange
    overlayFogColor: '#4a2040', // Lighter purple-dark
    maxDensity: 0.90, // Heavy sunset twilight haze
    driftSpeed: [0.07, -0.04], // Swirling/tumbling dust particles
    rimIntensity: 1.1,
    vignetteIntensity: 0.5,
  },
  malam: {
    highlightColor: '#88ddff', // Bioluminescent Cyan
    overlayFogColor: '#3d5a6a', // Lighter dark teal
    maxDensity: 0.95, // Mystical, dense ground forest fog
    driftSpeed: [0.05, 0.00], // Smooth horizontal creeping fog
    rimIntensity: 1.3,
    vignetteIntensity: 0.7,
  },
};

/* ===== Interactive 3D Fog (UI/UX Pro Max) ===== */
export function InteractiveFog({
  theme,
  scrollProgress,
  reducedMotion = false,
  isStarted = false,
  isLowQuality = false,
}: {
  theme: TimeTheme;
  scrollProgress: React.RefObject<number>;
  reducedMotion?: boolean;
  isStarted?: boolean;
  isLowQuality?: boolean;
}) {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Velocity tracking refs
  const prevPointer = useRef(new THREE.Vector2());
  const mouseVelocity = useRef(0);
  const isPointerDown = useRef(false);

  // Active theme parameters (current interpolated values)
  const currentParams = useRef({
    fogColor: new THREE.Color(FOG_THEME_PARAMS[theme].overlayFogColor),
    highlightColor: new THREE.Color(FOG_THEME_PARAMS[theme].highlightColor),
    maxDensity: FOG_THEME_PARAMS[theme].maxDensity,
    driftSpeed: new THREE.Vector2(...FOG_THEME_PARAMS[theme].driftSpeed),
    rimIntensity: FOG_THEME_PARAMS[theme].rimIntensity,
    vignetteIntensity: FOG_THEME_PARAMS[theme].vignetteIntensity,
    opacity: 0.0, // Mulai dari 0 (tak kasat mata) saat pertama kali load
  });

  // P0: Cached target values — updated only on theme change, not per-frame
  const targetFogColor = useRef(new THREE.Color(FOG_THEME_PARAMS[theme].overlayFogColor));
  const targetHighlightColor = useRef(new THREE.Color(FOG_THEME_PARAMS[theme].highlightColor));
  const targetDriftSpeed = useRef(new THREE.Vector2(...FOG_THEME_PARAMS[theme].driftSpeed));

  useEffect(() => {
    const params = FOG_THEME_PARAMS[theme];
    targetFogColor.current.set(params.overlayFogColor);
    targetHighlightColor.current.set(params.highlightColor);
    targetDriftSpeed.current.set(...params.driftSpeed);
  }, [theme]);

  // Pointer Drag Interaction Sensor
  useEffect(() => {
    const onDown = () => (isPointerDown.current = true);
    const onUp = () => (isPointerDown.current = false);
    
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('touchstart', onDown);
    window.addEventListener('touchend', onUp);
    
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  // Shader uniforms memoization
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouseVelocity: { value: 0.0 },
    uScrollProgress: { value: 0.0 },
    uOpacity: { value: 1.0 },
    uFogColor: { value: new THREE.Color(FOG_THEME_PARAMS[theme].overlayFogColor) },
    uHighlightColor: { value: new THREE.Color(FOG_THEME_PARAMS[theme].highlightColor) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uDriftSpeed: { value: new THREE.Vector2(...FOG_THEME_PARAMS[theme].driftSpeed) },
    uRimIntensity: { value: FOG_THEME_PARAMS[theme].rimIntensity },
    uIsMobile: { value: isMobile ? 1.0 : 0.0 },
    uVignetteIntensity: { value: FOG_THEME_PARAMS[theme].vignetteIntensity },
    uReducedMotion: { value: reducedMotion ? 1.0 : 0.0 },
    uPointerDown: { value: 0.0 },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update resolution on size change
  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uResolution.value.set(size.width, size.height);
      matRef.current.uniforms.uIsMobile.value = isMobile ? 1.0 : 0.0;
    }
  }, [size.width, size.height, isMobile]);

  useFrame((state, delta) => {
    // 1. Calculate Target Opacity based on scroll
    const sp = scrollProgress.current ?? 0;
    const rawFade = Math.max(0, 1.0 - sp * 2.5);
    const desktopOpacity = rawFade * rawFade; // P2: quadratic easing for natural fade
    const mobileOpacity = rawFade * rawFade * 0.4; // P1: reduced density for mobile perf
    const targetOpacity = isMobile ? mobileOpacity : desktopOpacity;

    const params = FOG_THEME_PARAMS[theme];
    const cp = currentParams.current;

    // 2. Interpolate opacity — frame-rate independent
    if (!isStarted) {
      cp.opacity = 0.0;
    } else if (cp.opacity < targetOpacity * cp.maxDensity - 0.05) {
      cp.opacity += delta * 0.15; // Kecepatan muncul perlahan (setelah klik start)
    } else {
      cp.opacity = lerpNum(cp.opacity, targetOpacity * cp.maxDensity, frameLerp(LERP_SPEED * 1.5, delta));
    }

    // GPU Warm-up: Turn on shader slightly earlier (sp < 0.45)
    // even when opacity is 0, to absorb compilation/fill-rate spikes before fog is visible.
    const isWarmingUp = sp < 0.45;

    // 3. Performance Guard — only hide if both target and current opacity are practically invisible AND not warming up
    if (targetOpacity <= 0.001 && cp.opacity <= 0.005 && !isWarmingUp) {
      if (meshRef.current) meshRef.current.visible = false;
      return; // Skip heavy uniform updates to save GPU
    }

    if (meshRef.current) meshRef.current.visible = true;

    // 4. Interpolate Theme Values smoothly — frame-rate independent
    const fl = frameLerp(LERP_SPEED, delta);
    lerpColor(cp.fogColor, targetFogColor.current, fl);
    lerpColor(cp.highlightColor, targetHighlightColor.current, fl);
    cp.maxDensity = lerpNum(cp.maxDensity, params.maxDensity, fl);
    cp.driftSpeed.lerp(targetDriftSpeed.current, fl);
    cp.rimIntensity = lerpNum(cp.rimIntensity, params.rimIntensity, fl);
    cp.vignetteIntensity = lerpNum(cp.vignetteIntensity, params.vignetteIntensity, fl);

    // 5. Update uniforms
    if (matRef.current) {
      const u = matRef.current.uniforms;
      u.uTime.value = state.clock.getElapsedTime();
      u.uScrollProgress.value = sp;

      // Calculate mouse velocity — frame-rate independent decay
      const dt = Math.max(0.001, delta);
      const dist = state.pointer.distanceTo(prevPointer.current);
      const currentVel = dist / dt;
      mouseVelocity.current = lerpNum(mouseVelocity.current, currentVel, frameLerp(LERP_SPEED * 2.0, delta));
      prevPointer.current.copy(state.pointer);

      u.uMouseVelocity.value = mouseVelocity.current;

      // Interpolate mouse vector to prevent jerky motion on sudden moves — frame-rate independent
      u.uMouse.value.lerp(state.pointer, frameLerp(0.08, delta));

      u.uOpacity.value = cp.opacity;
      u.uFogColor.value.copy(cp.fogColor);
      u.uHighlightColor.value.copy(cp.highlightColor);
      u.uDriftSpeed.value.copy(cp.driftSpeed);
      u.uRimIntensity.value = cp.rimIntensity;
      u.uVignetteIntensity.value = cp.vignetteIntensity;
      u.uReducedMotion.value = reducedMotion ? 1.0 : 0.0;

      // Lerp drag state for smooth blast interaction
      const targetPointerDown = isPointerDown.current ? 1.0 : 0.0;
      u.uPointerDown.value = lerpNum(u.uPointerDown.value, targetPointerDown, frameLerp(LERP_SPEED * 2.5, delta));
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
        uniform float uRimIntensity;
        uniform float uIsMobile;
        uniform float uVignetteIntensity;
        uniform float uReducedMotion;
        uniform float uPointerDown;
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

        // Simplified Shader (Option 3): No loops to drastically boost framerate
        float fbm(vec2 p) {
          // Hanya satu layer noise sederhana
          float v = noise(p) * 0.6;
          
          // Tambah satu layer ekstra yang murah HANYA untuk desktop
          if (uIsMobile < 0.5) {
             v += noise(p * 2.0 + vec2(12.3)) * 0.3;
          }
          
          return v * 1.2; // Normalisasi densitas
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

          // P4: Reduced motion scale — disables all animations when active
          float motionScale = 1.0 - uReducedMotion;

          // --- Mouse Vector ---
          vec2 mouseDir = uv - mouse;       
          float mouseDist = length(mouseDir);
          
          float activeFactor = clamp(uMouseVelocity * 0.8, 0.0, 1.0) * motionScale;

          // --- 1. Mouse Displacement & Fluid Vortex Physics ---
          float baseForce = smoothstep(0.3, 0.0, mouseDist) * activeFactor;

          // Multiply force by 4x when dragged!
          float dragForce = baseForce * (1.0 + uPointerDown * 3.0); 

          // Linear displacement
          vec2 displacement = normalize(mouseDir + 0.0001) * dragForce * 0.08;
          
          // Vortex Rotation (twist around cursor) — disabled when reduced motion
          float swirlStrength = dragForce * 0.15 * motionScale;
          float s = sin(swirlStrength);
          float c = cos(swirlStrength);
          mat2 rot = mat2(c, -s, s, c);

          // Z-Scale Parallax (Zoom in saat scroll)
          float zoomScale = 3.5 - (uScrollProgress * 5.0); 
          vec2 noiseUv = uv * max(0.5, zoomScale);

          // Base Drift — disabled when reduced motion
          noiseUv += uTime * uDriftSpeed * motionScale;
          
          // Apply Vortex Twist (skip on mobile for perf — P1)
          if (uIsMobile < 0.5) {
            vec2 localUv = noiseUv - (mouse * max(0.5, zoomScale));
            localUv = rot * localUv;
            noiseUv = localUv + (mouse * max(0.5, zoomScale));
          }
          
          // Add Outward Push
          noiseUv += displacement * 2.5;

          // P3: Breathing Animation — fog density pulsates organically
          float breathe = 1.0 + sin(uTime * 0.5) * 0.08 * motionScale;
          float rawFogDensity = fbm(noiseUv) * breathe;

          // --- 2. Pixelated Dithered Fog ---
          vec2 screenPx = vUv * uResolution;
          float dither = bayer4x4(screenPx);
          float pixelFog = smoothstep(dither - 0.2, dither + 0.2, rawFogDensity);
          float fogDensity = mix(rawFogDensity, pixelFog, 0.15);

          // --- 3. Pseudo-Depth Integration (P4) ---
          // Fog thins near screen center to reveal 3D content beneath
          float depthMask = smoothstep(0.0, 0.6, distToCenter);
          fogDensity *= mix(0.7, 1.0, depthMask);

          // --- 4. Transisi Tunneling + Curtain Split ---
          float baseRadius = 0.04;
          float scrollHoleRadius = uScrollProgress * 4.0; 
          
          // Brush Distortion (memecah bentuk lingkaran kursor menjadi partikel/asap)
          float brushNoise = fbm(uv * 12.0 - uTime * 0.8 * motionScale) * 0.15;
          float distortedMouseDist = mouseDist + brushNoise;

          // Mouse clearing — P1: with Presence Mode (subtle idle clear)
          // Increase clearing hole massively when dragging
          float expandedRadius = baseRadius + (uPointerDown * 0.15);
          float clearFactor = smoothstep(expandedRadius, expandedRadius + 0.15, distortedMouseDist);
          float presenceClear = smoothstep(0.08, 0.22 + (uPointerDown * 0.1), distortedMouseDist); // always-active subtle clear
          float velocityClear = mix(1.0, clearFactor, clamp(activeFactor + uPointerDown * 0.5, 0.0, 1.0));
          // Blend presence (always active) with velocity (movement-based)
          float mouseClear = min(velocityClear, mix(presenceClear, 1.0, 0.4));
          
          // Scroll tunneling clearing
          float tunnelClear = smoothstep(scrollHoleRadius, scrollHoleRadius + 0.80, distToCenter);

          // P3: Dynamic Curtain Split Effect
          // Waktu transisi disinkronkan sempurna dengan jarak waypoint Hero (0.0) ke About (0.25)
          float curtainOpen = smoothstep(0.0, 0.25, uScrollProgress);
          
          // Horizontal part (Membelah ke samping saat turun, Menutup ke tengah saat naik)
          float curtainX = abs(vUv.x - 0.5);
          float curtainMask = smoothstep(curtainOpen * 0.5, curtainOpen * 0.5 + 0.1, curtainX);

          float scrollClear = min(tunnelClear, mix(1.0, curtainMask, curtainOpen));
          
          fogDensity *= (mouseClear * scrollClear);

          // --- 5. Breathing Rim-Light & Chromatic Purity ---
          float glow = smoothstep(0.3, 0.0, distortedMouseDist) * activeFactor;
          vec3 finalColor = mix(uFogColor, uHighlightColor, glow * 0.4);

          // Breathing Pulse
          float pulse = 1.0 + sin(uTime * 4.0) * 0.15 * motionScale;
          float rimInner = smoothstep(0.03, 0.08, distortedMouseDist);
          float rimOuter = smoothstep(0.20, 0.12, distortedMouseDist);
          float rimLight = rimInner * rimOuter * uRimIntensity * pulse * activeFactor;
          
          finalColor += uHighlightColor * rimLight;

          // Chromatic Aberration — perf guard: skip if not active or on mobile
          if ((activeFactor > 0.01 || uPointerDown > 0.01) && uIsMobile < 0.5) {
            vec2 chromaOffset = normalize(mouseDir + 0.0001) * 0.015 * dragForce;
            float rChannel = fbm((noiseUv + chromaOffset) * 1.0);
            float gChannel = rawFogDensity; 
            float bChannel = fbm((noiseUv - chromaOffset) * 1.0);
            vec3 chromaticFog = vec3(rChannel, gChannel, bChannel);
            finalColor += chromaticFog * rimLight * 0.7;
          }

          // --- 6. Cinematic Vignette Framing (P3: per-theme intensity) ---
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

  // Fullscreen quad using custom shader that bypasses view/projection matrices.
  // Using args={[2, 2]} ensures vertices go from -1 to 1 in both axes (filling the NDC space completely).
  return (
    <mesh ref={meshRef} raycast={() => null}>
      <planeGeometry args={[2, 2]} />
      <primitive object={shaderMaterial} attach="material" ref={matRef} />
    </mesh>
  );
}

/* ===== Scene Controller — manages lighting, fog, background ===== */
export function SceneController({ theme }: { theme: TimeTheme }) {
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

  // Cached target values — updated only on theme change, not per-frame
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

  useFrame((_state, delta) => {
    const cfg = configRef.current;
    const fl = frameLerp(LERP_SPEED, delta);

    // Lerp background — frame-rate independent
    lerpColor(currentBg.current, targetBgColor.current, fl);
    scene.background = currentBg.current;

    // Lerp fog
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      lerpColor(currentFogColor.current, targetSceneFogColor.current, fl);
      scene.fog.color.copy(currentFogColor.current);
      currentFogNear.current = lerpNum(currentFogNear.current, cfg.fogNear, fl);
      currentFogFar.current = lerpNum(currentFogFar.current, cfg.fogFar, fl);
      scene.fog.near = currentFogNear.current;
      scene.fog.far = currentFogFar.current;
    }

    // Lerp ambient light
    if (ambientRef.current) {
      lerpColor(ambientRef.current.color, targetAmbientColor.current, fl);
      ambientRef.current.intensity = lerpNum(ambientRef.current.intensity, cfg.ambientIntensity, fl);
    }

    // Lerp main directional light
    if (mainLightRef.current) {
      lerpColor(mainLightRef.current.color, targetMainLightColor.current, fl);
      mainLightRef.current.intensity = lerpNum(mainLightRef.current.intensity, cfg.mainLightIntensity, fl);
      mainLightRef.current.position.lerp(targetMainLightPos.current, fl);
    }

    // Lerp fill light
    if (fillLightRef.current) {
      lerpColor(fillLightRef.current.color, targetFillLightColor.current, fl);
      fillLightRef.current.intensity = lerpNum(fillLightRef.current.intensity, cfg.fillLightIntensity, fl);
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