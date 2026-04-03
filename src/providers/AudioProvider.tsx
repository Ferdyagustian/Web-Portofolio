"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useTheme } from "./TimeThemeProvider";

interface AudioContextType {
  isBgmEnabled: boolean;
  isSfxEnabled: boolean;
  bgmVolume: number;
  sfxVolume: number;
  setBgmVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  toggleBgm: () => void;
  toggleSfx: () => void;
  playSfx: (type: 'hover' | 'click' | 'option') => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within an AudioProvider");
  return context;
};

export default function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [bgmVolume, setBgmVolumeState] = useState(0.4);
  const [sfxVolume, setSfxVolumeState] = useState(0.7);
  const [isMounted, setIsMounted] = useState(false);

  const theme = useTheme();

  // ── BGM (HTML5 Audio — handles long files well) ──────────────────
  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);

  // ── SFX (Web Audio API — instant & polyphonic) ──────────────────
  const webAudioCtxRef = useRef<AudioContext | null>(null);
  const sfxBuffers = useRef<Record<string, AudioBuffer>>({});
  const sfxGainRef = useRef<GainNode | null>(null);
  const sfxFallback = useRef<Record<string, HTMLAudioElement[]>>({});
  const sfxFallbackIdx = useRef<Record<string, number>>({ hover: 0, click: 0, option: 0 });

  // Load saved preferences on mount
  useEffect(() => {
    setIsMounted(true);
    // Load/Initialize states from localStorage
    const storedBgm = localStorage.getItem("audio_bgm");
    const storedSfx = localStorage.getItem("audio_sfx");
    const storedVol = localStorage.getItem("audio_bgm_vol");
    const storedSfxVol = localStorage.getItem("audio_sfx_vol");

    // Defaults: Enable if null or if stored as "true"
    // We forcibly set to true if it was "false" to recover from the previous bug
    const bgmActive = storedBgm === "false" ? (storedVol === "0" ? false : true) : true;
    const sfxActive = storedSfx === "false" ? (storedSfxVol === "0" ? false : true) : true;
    const bgmVol = storedVol ? parseFloat(storedVol) : 0.4;
    const sfxVol = storedSfxVol ? parseFloat(storedSfxVol) : 0.7;

    console.log(`[Audio] Init: BGM=${bgmActive}(${bgmVol}), SFX=${sfxActive}(${sfxVol})`);
    
    setIsBgmEnabled(bgmActive);
    setIsSfxEnabled(sfxActive);
    setBgmVolumeState(bgmVol);
    setSfxVolumeState(sfxVol);
    
    // Recovery: ensure localStorage matches our forced-on defaults
    localStorage.setItem("audio_bgm", bgmActive ? "true" : "false");
    localStorage.setItem("audio_sfx", sfxActive ? "true" : "false");

    // Init BGM players
    audioRef1.current = new Audio();
    audioRef2.current = new Audio();
    audioRef1.current.loop = true;
    audioRef2.current.loop = true;
    audioRef1.current.volume = 0;
    audioRef2.current.volume = 0;

    // Pre-load fallback SFX volumes (client-only — Audio not available on server)
    const vol = storedSfxVol ? parseFloat(storedSfxVol) : 0.7;
    sfxFallback.current = {
      hover:  [new Audio('/audio/hover.wav'),  new Audio('/audio/hover.wav')],
      click:  [new Audio('/audio/click.wav'),  new Audio('/audio/click.wav')],
      option: [new Audio('/audio/option.wav'), new Audio('/audio/option.wav')],
    };
    Object.values(sfxFallback.current).flat().forEach(a => { a.volume = vol; a.load(); });

    // Try to init Web Audio immediately (will silently fail until user interacts)
    const tryInit = async () => {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        webAudioCtxRef.current = ctx;
        const gain = ctx.createGain();
        gain.gain.value = vol;
        gain.connect(ctx.destination);
        sfxGainRef.current = gain;
        const files = { hover: '/audio/hover.wav', click: '/audio/click.wav', option: '/audio/option.wav' };
        await Promise.all(Object.entries(files).map(async ([key, path]) => {
          try {
            const res = await fetch(path);
            const buf = await res.arrayBuffer();
            sfxBuffers.current[key] = await ctx.decodeAudioData(buf);
          } catch {}
        }));
      } catch {}
    };
    tryInit();

    return () => {
      audioRef1.current?.pause();
      audioRef2.current?.pause();
    };
  }, []);

  // ── Initialise Web Audio Context + load SFX buffers ──────────────
  // We do this on first user gesture to bypass autoplay restrictions
  const initWebAudio = useCallback(async () => {
    // If context already exists, just make sure it's resumed
    if (webAudioCtxRef.current) {
      if (webAudioCtxRef.current.state === 'suspended') {
        await webAudioCtxRef.current.resume();
      }
      // If buffers are already loaded, we are good to go!
      if (Object.keys(sfxBuffers.current).length === 3) return;
    }

    try {
      // Create context if it doesn't exist
      if (!webAudioCtxRef.current) {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        webAudioCtxRef.current = ctx;
      }

      const ctx = webAudioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      // Master gain
      if (!sfxGainRef.current) {
        const gain = ctx.createGain();
        gain.gain.value = sfxVolume;
        gain.connect(ctx.destination);
        sfxGainRef.current = gain;
      }

      // Load/Reload missing buffers
      const files = { hover: '/audio/hover.wav', click: '/audio/click.wav', option: '/audio/option.wav' };
      console.log("[Audio] Loading SFX buffers...");
      
      await Promise.all(
        Object.entries(files).map(async ([key, path]) => {
          if (sfxBuffers.current[key]) return; // already loaded
          try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = await res.arrayBuffer();
            sfxBuffers.current[key] = await ctx.decodeAudioData(buf);
            console.log(`[Audio] Decoded: ${key}`);
          } catch (e) {
            console.warn(`[Audio] SFX load failed: ${path}`, e);
          }
        })
      );
    } catch (e) {
      console.warn("[Audio] Web Audio API failed:", e);
    }
  }, [sfxVolume]);

  // Attach ONCE to first user interaction (click anywhere)
  useEffect(() => {
    const unlock = () => {
      initWebAudio();
      // Resume context if it was suspended (mobile browsers)
      if (webAudioCtxRef.current?.state === 'suspended') {
        webAudioCtxRef.current.resume();
      }
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [initWebAudio]);

  // ── Volume setters ────────────────────────────────────────────────
  const setBgmVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setBgmVolumeState(clamped);
    localStorage.setItem("audio_bgm_vol", clamped.toString());
    
    // Auto-enable if volume is high, auto-disable only if truly 0
    if (clamped > 0) {
      setIsBgmEnabled(true);
      localStorage.setItem("audio_bgm", "true");
    } else {
      setIsBgmEnabled(false);
      localStorage.setItem("audio_bgm", "false");
      audioRef1.current?.pause();
      audioRef2.current?.pause();
    }
  }, []);

  const setSfxVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setSfxVolumeState(clamped);
    localStorage.setItem("audio_sfx_vol", clamped.toString());
    
    // Force enable if user interacts with the slider
    if (clamped > 0) {
      setIsSfxEnabled(true);
      localStorage.setItem("audio_sfx", "true");
    } else {
      setIsSfxEnabled(false);
      localStorage.setItem("audio_sfx", "false");
    }

    // Update gain node immediately if it exists
    if (sfxGainRef.current) {
      sfxGainRef.current.gain.setTargetAtTime(clamped, 0, 0.05);
    }
  }, []);

  // Keep BGM volume in sync
  useEffect(() => {
    if (!isMounted) return;
    const cur = activePlayer === 1 ? audioRef1.current : audioRef2.current;
    if (cur) {
      const finalVol = (isBgmEnabled && bgmVolume > 0.01) ? bgmVolume : 0;
      cur.volume = finalVol;
      if (finalVol === 0 && !cur.paused) {
        cur.pause();
        console.log("[Audio] BGM Paused (Volume 0)");
      } else if (finalVol > 0 && cur.paused && isBgmEnabled) {
        cur.play().catch(() => {});
        console.log(`[Audio] BGM Playing at ${finalVol}`);
      }
    }
  }, [bgmVolume, isBgmEnabled, isMounted, activePlayer]);

  // ── Toggles ───────────────────────────────────────────────────────
  const toggleBgm = useCallback(() => {
    setIsBgmEnabled(prev => {
      const next = !prev;
      localStorage.setItem("audio_bgm", String(next));
      if (!next) {
        audioRef1.current?.pause();
        audioRef2.current?.pause();
      }
      return next;
    });
  }, []);

  const toggleSfx = useCallback(() => {
    setIsSfxEnabled(prev => {
      const next = !prev;
      localStorage.setItem("audio_sfx", String(next));
      return next;
    });
  }, []);

  // ── BGM crossfade on theme change ─────────────────────────────────
  useEffect(() => {
    if (!isMounted || !isBgmEnabled) {
      audioRef1.current?.pause();
      audioRef2.current?.pause();
      return;
    }

    const nextSrc = `/audio/bgm${theme}.mp3`;
    const currentAudio = activePlayer === 1 ? audioRef1.current : audioRef2.current;
    const nextAudio = activePlayer === 1 ? audioRef2.current : audioRef1.current;

    if (!currentAudio || !nextAudio) return;

    if (currentAudio.src.includes(nextSrc) && !currentAudio.paused) {
      if (currentAudio.volume < bgmVolume) currentAudio.volume = bgmVolume;
      return;
    }

    nextAudio.src = nextSrc;
    nextAudio.volume = 0;

    const playPromise = nextAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => console.warn("BGM autoplay prevented:", err));
    }

    let fadeStep = 0;
    const fadeInterval = setInterval(() => {
      fadeStep += 0.05;
      if (fadeStep >= 1) {
        clearInterval(fadeInterval);
        currentAudio.pause();
        currentAudio.volume = 0;
        nextAudio.volume = bgmVolume;
        setActivePlayer(prev => prev === 1 ? 2 : 1);
      } else {
        currentAudio.volume = Math.max(0, (1 - fadeStep) * bgmVolume);
        nextAudio.volume = Math.min(bgmVolume, fadeStep * bgmVolume);
      }
    }, 100);

    return () => clearInterval(fadeInterval);
  }, [theme, isBgmEnabled, isMounted, activePlayer, bgmVolume]);

  // ── playSfx: Web Audio → fallback HTML5 pool ─────────────────────
  const playSfx = useCallback((type: 'hover' | 'click' | 'option') => {
    if (!isSfxEnabled) return;

    const ctx = webAudioCtxRef.current;
    const buf = sfxBuffers.current[type];
    const gain = sfxGainRef.current;

    if (ctx && buf && gain) {
      // Best path: Web Audio — instant & polyphonic
      try {
        if (ctx.state === 'suspended') ctx.resume(); // Ensure it's active
        
        const source = ctx.createBufferSource();
        source.buffer = buf;
        source.connect(gain);
        source.start(0);
        console.log(`[SFX] Playing: ${type} (Web Audio)`);
        return;
      } catch (e) {
        console.warn(`[SFX] Web Audio error for ${type}:`, e);
      }
    }

    // Fallback: HTML5 Audio pool (round-robin so rapid hovers don't cut off)
    const pool = sfxFallback.current[type];
    if (pool && pool.length > 0) {
      const idx = sfxFallbackIdx.current[type] % pool.length;
      sfxFallbackIdx.current[type] = idx + 1;
      const el = pool[idx];
      el.volume = sfxVolume;
      el.currentTime = 0;
      el.play()
        .then(() => console.log(`[SFX] Playing: ${type} (Fallback)`))
        .catch((e) => console.warn(`[SFX] Fallback error for ${type}:`, e));
    } else {
      console.warn(`[SFX] No sound available for ${type}.`);
    }

    // Trigger Web Audio reload/unlock for next time if not ready
    initWebAudio();
  }, [isSfxEnabled, sfxVolume, initWebAudio]);

  return (
    <AudioContext.Provider value={{ isBgmEnabled, isSfxEnabled, bgmVolume, sfxVolume, setBgmVolume, setSfxVolume, toggleBgm, toggleSfx, playSfx }}>
      {children}
    </AudioContext.Provider>
  );
}
