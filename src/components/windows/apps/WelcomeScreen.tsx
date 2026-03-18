"use client";

import { Frame, Button } from "@react95/core";
import { Computer } from "@react95/icons";
import { useWindowStore } from "@/store/windowStore";

export default function WelcomeScreen() {
  const openWindow = useWindowStore((s) => s.openWindow);

  return (
    <div style={{ padding: 16, background: "white", height: "100%", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Computer variant="32x32_4" />
        <div>
          <div style={{ fontWeight: "bold", fontSize: 14 }}>Welcome to Andrew&apos;s OS</div>
          <div style={{ color: "#666", fontSize: 11 }}>Windows 95 Portfolio Edition</div>
        </div>
      </div>

      <Frame
        style={{ padding: 12, marginBottom: 12, background: "#f0f0f0" }}
        boxShadow="in"
      >
        <p style={{ fontSize: 12, lineHeight: 1.6 }}>
          Welcome! This is my interactive portfolio, built as a Windows 95-style
          operating system. Double-click icons on the desktop or use the Start
          menu to explore.
        </p>
      </Frame>

      <div style={{ fontSize: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>Quick Launch:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Button onClick={() => openWindow("aboutMe")} style={{ fontSize: 11 }}>
            👤 About Me
          </Button>
          <Button onClick={() => openWindow("projects")} style={{ fontSize: 11 }}>
            📁 My Projects
          </Button>
          <Button onClick={() => openWindow("contact")} style={{ fontSize: 11 }}>
            ✉️ Contact
          </Button>
          <Button onClick={() => openWindow("newsletter")} style={{ fontSize: 11 }}>
            📰 Newsletter
          </Button>
        </div>
      </div>

      <Frame style={{ padding: 8, background: "#ffffd0", border: "1px solid #ccc" }}>
        <div style={{ fontSize: 11, color: "#333" }}>
          <strong>Tip:</strong> Double-click desktop icons to open applications.
          Drag windows by their title bars. Use the Start menu for all programs.
        </div>
      </Frame>
    </div>
  );
}
