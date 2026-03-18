"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Dynamically import heavy components (no SSR needed)
const BiosScreen = dynamic(() => import("@/components/boot/BiosScreen"), { ssr: false });
const SplashScreen = dynamic(() => import("@/components/boot/SplashScreen"), { ssr: false });
const Desktop = dynamic(() => import("@/components/desktop/Desktop"), { ssr: false });

type BootPhase = "bios" | "splash" | "desktop";

export default function Home() {
  const [phase, setPhase] = useState<BootPhase>("bios");

  const handleBiosDone = useCallback(() => setPhase("splash"), []);
  const handleSplashDone = useCallback(() => setPhase("desktop"), []);

  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {phase === "bios" && <BiosScreen onComplete={handleBiosDone} />}
      {phase === "splash" && <SplashScreen onComplete={handleSplashDone} />}
      {phase === "desktop" && <Desktop />}
    </main>
  );
}
