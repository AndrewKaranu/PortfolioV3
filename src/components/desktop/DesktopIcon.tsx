"use client";

import { useState } from "react";
import { AppType } from "@/store/windowStore";

interface Props {
  icon: React.ReactNode;
  label: string;
  app: AppType;
  onOpen: (app: AppType) => void;
}

export default function DesktopIcon({ icon, label, app, onOpen }: Props) {
  const [selected, setSelected] = useState(false);
  const [lastClick, setLastClick] = useState(0);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastClick < 400) {
      // Double click
      onOpen(app);
      setSelected(false);
    } else {
      setSelected(true);
    }
    setLastClick(now);
  };

  return (
    <div
      className={`desktop-icon ${selected ? "selected" : ""}`}
      onClick={handleClick}
      onBlur={() => setSelected(false)}
      tabIndex={0}
    >
      <div
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "scale(1.12)",
          transformOrigin: "center",
        }}
      >
        {icon}
      </div>
      <span className="desktop-icon-label">{label}</span>
    </div>
  );
}
