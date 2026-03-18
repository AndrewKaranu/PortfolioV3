"use client";

import { useEffect, useRef, useState } from "react";
import { Frame } from "@react95/core";
import { Logo } from "@react95/icons";
import { useWindowStore } from "@/store/windowStore";
import StartMenu from "./StartMenu";

export const TASKBAR_HEIGHT = 40;

export default function Taskbar() {
  const {
    windows,
    activeWindowId,
    startMenuOpen,
    setStartMenuOpen,
    restoreWindow,
    minimizeWindow,
    focusWindow,
  } = useWindowStore();

  const [time, setTime] = useState("");
  const taskbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    };
    update();
    const t = setInterval(update, 10000);
    return () => clearInterval(t);
  }, []);

  const handleWindowButton = (id: string) => {
    const win = windows.find((w) => w.id === id);
    if (!win) return;
    if (win.isMinimized) {
      restoreWindow(id);
    } else if (activeWindowId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartMenuOpen(!startMenuOpen);
  };

  return (
    <>
      {startMenuOpen && (
        <StartMenu onClose={() => setStartMenuOpen(false)} />
      )}

      {/* Custom taskbar — plain div so we fully control it */}
      <div
        ref={taskbarRef}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: TASKBAR_HEIGHT,
          zIndex: 9999,
          background: "#c0c0c0",
          borderTop: "2px solid #fff",
          boxShadow: "inset 0 1px 0 #dfdfdf",
          display: "flex",
          alignItems: "center",
          padding: "0 3px",
          gap: 3,
        }}
      >
        {/* Start button */}
        <button
          onClick={handleStartClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            height: 30,
            minWidth: 90,
            fontWeight: "bold",
            fontSize: 12,
            fontFamily: "ms sans serif, Arial, sans-serif",
            background: "#c0c0c0",
            border: startMenuOpen
              ? "2px inset #888"
              : "2px outset #fff",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Logo
            variant="32x32_4"
            style={{
              width: 16,
              height: 16,
              display: "block",
              imageRendering: "pixelated",
              flexShrink: 0,
            }}
          />
          <span>Start</span>
        </button>

        {/* Separator */}
        <div style={{ width: 1, height: 24, background: "#888", flexShrink: 0 }} />
        <div style={{ width: 1, height: 24, background: "#fff", marginRight: 2, flexShrink: 0 }} />

        {/* Window buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {windows.map((win) => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <button
                key={win.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleWindowButton(win.id);
                }}
                title={win.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  height: 28,
                  maxWidth: 160,
                  minWidth: 80,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontFamily: "ms sans serif, Arial, sans-serif",
                  fontWeight: isActive ? "bold" : "normal",
                  background: "#c0c0c0",
                  border: isActive ? "2px inset #888" : "2px outset #fff",
                  cursor: "pointer",
                  flexShrink: 0,
                  textAlign: "left",
                  color: win.isMinimized ? "#555" : "#000",
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {win.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* System tray */}
        <Frame
          boxShadow="in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "0 8px",
            height: 28,
            flexShrink: 0,
          }}
        >
          <span title="Network" style={{ fontSize: 14, cursor: "pointer" }}>🖥️</span>
          <span title="Volume" style={{ fontSize: 14, cursor: "pointer" }}>🔊</span>
          <div
            style={{
              fontSize: 11,
              fontFamily: "ms sans serif, Arial, sans-serif",
              minWidth: 46,
              textAlign: "center",
              paddingLeft: 6,
              borderLeft: "1px solid #999",
            }}
          >
            {time}
          </div>
        </Frame>
      </div>
    </>
  );
}
