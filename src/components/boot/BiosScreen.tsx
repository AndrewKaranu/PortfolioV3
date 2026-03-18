"use client";

import { useEffect, useState } from "react";

const BIOS_LINES = [
  { text: "Award Modular BIOS v4.51PG, An Energy Star Ally", class: "bios-header" },
  { text: "Copyright (C) 1984-2026, Award Software, Inc.", class: "bios-header" },
  { text: "", class: "bios-line" },
  { text: "  ANDREW.OS Personal Portfolio System BIOS v1.0", class: "bios-brand" },
  { text: "", class: "bios-line" },
  { text: "CPU : Next.js 16 / React 19              Speed: ∞ MHz", class: "bios-line" },
  { text: "Extended Memory: 640K           [████████████████] OK", class: "bios-line" },
  { text: "", class: "bios-line" },
  { text: "Detecting Primary Master   ......... TypeScript 5.0", class: "bios-line" },
  { text: "Detecting Secondary Master ......... TailwindCSS 4.0", class: "bios-line" },
  { text: "Detecting Secondary Slave  ......... React95 v9.6", class: "bios-line" },
  { text: "", class: "bios-line" },
  { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", class: "bios-line" },
  { text: "Loading REACT.SYS ..................", class: "bios-line", suffix: "OK", suffixClass: "bios-ok" },
  { text: "Loading NEXTJS.SYS .................", class: "bios-line", suffix: "OK", suffixClass: "bios-ok" },
  { text: "Loading TYPESCRIPT.SYS .............", class: "bios-line", suffix: "OK", suffixClass: "bios-ok" },
  { text: "Loading TAILWIND.SYS ...............", class: "bios-line", suffix: "OK", suffixClass: "bios-ok" },
  { text: "Loading ZUSTAND.SYS ................", class: "bios-line", suffix: "OK", suffixClass: "bios-ok" },
  { text: "Loading REACT95.SYS ................", class: "bios-line", suffix: "OK", suffixClass: "bios-ok" },
  { text: "Loading VERCEL.SYS .................", class: "bios-line", suffix: "OK", suffixClass: "bios-ok" },
  { text: "Loading PORTFOLIO.EXE ..............", class: "bios-line", suffix: "OK", suffixClass: "bios-ok" },
  { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", class: "bios-line" },
  { text: "", class: "bios-line" },
  { text: "Starting ANDREW.OS...", class: "bios-header" },
];

interface Props {
  onComplete: () => void;
}

export default function BiosScreen({ onComplete }: Props) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setVisibleLines(index);
      if (index >= BIOS_LINES.length) {
        clearInterval(interval);
        setTimeout(onComplete, 600);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="bios-screen">
      {BIOS_LINES.slice(0, visibleLines).map((line, i) => (
        <div key={i} className={`bios-line ${line.class}`}>
          {line.text}
          {line.suffix && (
            <span className={line.suffixClass}> [{line.suffix}]</span>
          )}
        </div>
      ))}
    </div>
  );
}
