"use client";

import Image from "next/image";
import { useWindowStore } from "@/store/windowStore";
import DesktopIcon from "./DesktopIcon";
import Taskbar, { TASKBAR_HEIGHT } from "./Taskbar";
import WindowManager from "../windows/WindowManager";
import Clippy from "../clippy/Clippy";
import {
  User,
  Folder,
  Mail,
  Notepad,
  Calculator,
  Sol1,
  Mailnews15,
  RecycleEmpty,
  Computer,
  MsDos,
  Mplayer10,
  Camera,
  Mspaint,
  Explorer100,
  MediaVideo,
  Joy102,
} from "@react95/icons";

const DESKTOP_ICONS = [
  { icon: <Computer variant="32x32_4" />, label: "My Computer", app: "welcome" as const },
  { icon: <User variant="32x32_4" />, label: "About Me", app: "aboutMe" as const },
  { icon: <Folder variant="32x32_4" />, label: "My Projects", app: "projects" as const },
  { icon: <Mail variant="32x32_4" />, label: "Contact", app: "contact" as const },
  { icon: <Notepad variant="32x32_4" />, label: "Resume.txt", app: "resume" as const },
  { icon: <Mailnews15 variant="32x32_4" />, label: "Byte Sized News", app: "newsletter" as const },
  { icon: <Camera variant="32x32_4" />, label: "My Photography", app: "photography" as const },
  { icon: <Mspaint variant="32x32_4" />, label: "Paint", app: "paint" as const },
  { icon: <Explorer100 variant="32x32_4" />, label: "Internet Explorer", app: "internetExplorer" as const },
  { icon: <MediaVideo variant="32x32_4" />, label: "Webcam", app: "webcam" as const },
  { icon: <Joy102 variant="32x32_4" />, label: "DOOM", app: "doom" as const },
  { icon: <Mplayer10 variant="32x32_4" />, label: "Media Player", app: "mediaPlayer" as const },
  { icon: <Calculator variant="32x32_4" />, label: "Calculator", app: "calculator" as const },
  { icon: <Sol1 variant="32x32_4" />, label: "Minesweeper", app: "minesweeper" as const },
  { icon: <MsDos variant="32x32_32" />, label: "MS-DOS Prompt", app: "msDos" as const },
  { icon: <RecycleEmpty variant="32x32_4" />, label: "Recycle Bin", app: "welcome" as const },
];

export default function Desktop() {
  const { openWindow } = useWindowStore();
  const iconAreaHeight = `calc(100dvh - ${TASKBAR_HEIGHT}px - env(safe-area-inset-bottom))`;

  return (
    <div
      className="win95-desktop"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(0,0,60,0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0,60,60,0.3) 0%, transparent 50%)
        `,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          opacity: 0.9,
          zIndex: 0,
        }}
      >
        <Image
          src="/Logo.png"
          alt="Andrew logo"
          width={220}
          height={220}
          priority
        />
      </div>

      {/* Desktop icons grid */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          gap: 8,
          paddingTop: 16,
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          height: iconAreaHeight,
          alignContent: "flex-start",
          position: "relative",
          zIndex: 1,
        }}
      >
        {DESKTOP_ICONS.map((item, i) => (
          <DesktopIcon
            key={i}
            icon={item.icon}
            label={item.label}
            app={item.app}
            onOpen={openWindow}
          />
        ))}
      </div>

      {/* Open windows */}
      <WindowManager />
      <Clippy />

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
}
