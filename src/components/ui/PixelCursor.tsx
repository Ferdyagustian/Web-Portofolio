"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function PixelCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !cursorRef.current) return;

    // Use quickTo for high performance mouse tracking
    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.1, ease: "power3" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.1, ease: "power3" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX - 10); // Center the 20x20 cursor
      yTo(e.clientY - 10);
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "20px",
        height: "20px",
        backgroundColor: "var(--color-pixel-leaf)",
        border: "2px solid var(--color-forest-dark)",
        pointerEvents: "none",
        zIndex: 99999,
        // Removed mixBlendMode for performance
        boxShadow: "2px 2px 0 0 rgba(0,0,0,0.5)",
      }}
      className="pixel-cursor"
    />
  );
}
