"use client";

import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: Props) {
  const [blocks, setBlocks] = useState(0);
  const totalBlocks = 12;

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setBlocks(count);
      if (count >= totalBlocks) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <div className="splash-logo-icon">
          <div className="pane pane-1" />
          <div className="pane pane-2" />
          <div className="pane pane-3" />
          <div className="pane pane-4" />
        </div>
        <div>
          <div className="splash-title">Windows 95</div>
          <div style={{ color: "#aaaaff", fontSize: 12, fontStyle: "italic" }}>
            Portfolio Edition
          </div>
        </div>
      </div>

      <div className="splash-subtitle">
        Built by Andrew &nbsp;·&nbsp; Powered by React &amp; Next.js
      </div>

      <div className="splash-bar-container">
        <div className="splash-bar-fill">
          {Array.from({ length: blocks }).map((_, i) => (
            <div key={i} className="splash-bar-block" />
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          color: "#6666aa",
          fontSize: 11,
          fontFamily: "ms sans serif, Arial, sans-serif",
        }}
      >
        Please wait...
      </div>
    </div>
  );
}
