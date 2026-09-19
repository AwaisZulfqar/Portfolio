"use client";

import { Canvas } from "@react-three/fiber";
import { LanyardScene } from "./scene";

/**
 * The WebGL half of the badge, split from `lanyard.tsx` so three.js lands in
 * its own chunk that only loads once the badge is actually about to be seen.
 */
export default function LanyardCanvas({
  theme,
  wide,
  running,
  onToggle,
  onArmed,
  onGrab,
}: {
  theme: "dark" | "light";
  wide: boolean;
  running: boolean;
  onToggle: () => void;
  onArmed: (armed: boolean) => void;
  onGrab: (grabbing: boolean) => void;
}) {
  return (
    <Canvas
      // Phones gain nothing from a 3× buffer but pay for every pixel of it.
      dpr={[1, wide ? 2 : 1.5]}
      // Scrolled away or in a background tab: stop drawing entirely.
      frameloop={running ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, -0.3, 11.2], fov: 30 }}
      style={{ pointerEvents: "none" }}
    >
      <LanyardScene theme={theme} onToggle={onToggle} onArmed={onArmed} onGrab={onGrab} />
    </Canvas>
  );
}
