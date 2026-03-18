"use client";

import { useState, useRef, useEffect } from "react";
import { AppType, useWindowStore } from "@/store/windowStore";
import { MsDos } from "@react95/icons";

interface SubItem {
  label: string;
  app?: AppType;
  icon?: React.ReactNode;
  divider?: boolean;
}

interface MenuItemDef {
  label: string;
  icon: React.ReactNode;
  app?: AppType;
  arrow?: boolean;
  submenu?: SubItem[];
  divider?: boolean;
  bold?: boolean;
}

const MENU_ITEMS: MenuItemDef[] = [
  {
    label: "Programs",
    icon: "📁",
    arrow: true,
    submenu: [
      { label: "About Me", app: "aboutMe", icon: "👤" },
      { label: "My Projects", app: "projects", icon: "📂" },
      { label: "Resume.txt", app: "resume", icon: "📄" },
      { divider: true } as SubItem,
      { label: "Byte Sized Tech News", app: "newsletter", icon: "📰" },
      { divider: true } as SubItem,
      { label: "Calculator", app: "calculator", icon: "🔢" },
      { label: "Minesweeper", app: "minesweeper", icon: "💣" },
      { divider: true } as SubItem,
      { label: "MS-DOS Prompt", app: "msDos", icon: <MsDos variant="16x16_32" /> },
    ],
  },
  {
    label: "Favorites",
    icon: "⭐",
    arrow: true,
    submenu: [
      { label: "GitHub", icon: "🐙" },
      { label: "LinkedIn", icon: "💼" },
    ],
  },
  {
    label: "Documents",
    icon: "📄",
    arrow: true,
    submenu: [
      { label: "My Projects", app: "projects", icon: "📂" },
      { label: "Resume.txt", app: "resume", icon: "📄" },
    ],
  },
  {
    label: "Settings",
    icon: "⚙️",
    arrow: true,
    submenu: [
      { label: "System Properties", app: "systemProps", icon: "🖥️" },
    ],
  },
  {
    label: "Find",
    icon: "🔍",
    app: "contact",
  },
  {
    label: "Help",
    icon: "❓",
    app: "welcome",
  },
  {
    label: "Run...",
    icon: <MsDos variant="16x16_32" />,
    app: "msDos",
  },
];

const POWER_ITEMS: SubItem[] = [
  { label: "Log Off Andrew...", icon: "🔑" },
  { label: "Suspend", icon: "🛌" },
  { label: "Shut Down...", icon: "🔌" },
];

interface Props {
  onClose: () => void;
}

export default function StartMenu({ onClose }: Props) {
  const openWindow = useWindowStore((s) => s.openWindow);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isShuttingDown) return;

    const prevTransition = document.body.style.transition;
    const prevFilter = document.body.style.filter;

    document.body.style.transition = "all 0.4s";
    document.body.style.filter = "brightness(0)";

    const timeout = setTimeout(() => {
      document.body.style.filter = prevFilter;
      document.body.style.transition = prevTransition;
      setIsShuttingDown(false);
    }, 800);

    return () => {
      clearTimeout(timeout);
      document.body.style.filter = prevFilter;
      document.body.style.transition = prevTransition;
    };
  }, [isShuttingDown]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleItem = (item: MenuItemDef | SubItem) => {
    if (item.app) {
      openWindow(item.app);
    } else if ("label" in item && item.label === "GitHub") {
      window.open("https://github.com/AndrewKaranu", "_blank");
    } else if ("label" in item && item.label === "LinkedIn") {
      window.open("https://linkedin.com/in/andrew-karanu", "_blank");
    } else if ("label" in item && item.label === "Shut Down...") {
      setIsShuttingDown(true);
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        bottom: 40,
        left: 0,
        zIndex: 10000,
        display: "flex",
        boxShadow: "2px -2px 0 #fff, -2px 2px 0 #888, 2px 2px 4px rgba(0,0,0,0.5)",
        border: "2px outset #dfdfdf",
        background: "#c0c0c0",
        userSelect: "none",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 28,
          background: "linear-gradient(to bottom, #808080 0%, #404040 60%, #202020 100%)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 8,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            color: "white",
            fontSize: 16,
            fontWeight: "bold",
            letterSpacing: 1,
            textShadow: "1px 1px 2px #000",
            fontFamily: "ms sans serif, Arial, sans-serif",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#d0d0d0", fontSize: 19 }}>Windows</span>
          <span style={{ color: "#a0a0a0", fontSize: 14, fontStyle: "italic" }}>&#8203;95</span>
        </span>
      </div>

      {/* Menu items */}
      <div style={{ minWidth: 190, padding: "2px 0", display: "flex", flexDirection: "column" }}>
        <div>
        {MENU_ITEMS.map((item, i) => {
          if (item.divider) {
            return (
              <div
                key={i}
                style={{ height: 1, background: "#888", margin: "2px 4px", boxShadow: "0 1px 0 #fff" }}
              />
            );
          }

          const isHovered = hoveredIdx === i;
          const hasSubmenu = !!item.submenu;

          return (
            <div
              key={i}
              style={{ position: "relative" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Menu item row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 24px 5px 8px",
                  fontSize: 12,
                  fontFamily: "ms sans serif, Arial, sans-serif",
                  background: isHovered ? "#000080" : "transparent",
                  color: isHovered ? "white" : "black",
                  cursor: "pointer",
                  fontWeight: item.bold ? "bold" : "normal",
                  whiteSpace: "nowrap",
                  position: "relative",
                }}
                onClick={() => !hasSubmenu && handleItem(item)}
              >
                <span style={{ width: 20, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {hasSubmenu && (
                  <span style={{ position: "absolute", right: 6, fontSize: 10 }}>▶</span>
                )}
              </div>

              {/* Submenu */}
              {hasSubmenu && isHovered && item.submenu && (
                <div
                  style={{
                    position: "absolute",
                    left: "100%",
                    top: 0,
                    background: "#c0c0c0",
                    border: "2px outset #dfdfdf",
                    boxShadow: "2px 2px 4px rgba(0,0,0,0.4)",
                    minWidth: 180,
                    zIndex: 10001,
                    padding: "2px 0",
                  }}
                >
                  {item.submenu.map((sub, j) => {
                    if (sub.divider) {
                      return (
                        <div
                          key={j}
                          style={{ height: 1, background: "#888", margin: "2px 4px", boxShadow: "0 1px 0 #fff" }}
                        />
                      );
                    }
                    return (
                      <SubMenuItem
                        key={j}
                        item={sub}
                        onSelect={() => handleItem(sub)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        </div>

        <div style={{ height: 1, background: "#888", margin: "2px 4px", boxShadow: "0 1px 0 #fff" }} />

        <div>
          {POWER_ITEMS.map((item, idx) => (
            <SubMenuItem
              key={`${item.label}-${idx}`}
              item={item}
              onSelect={() => handleItem(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SubMenuItem({ item, onSelect }: { item: SubItem; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 16px 5px 8px",
        fontSize: 12,
        fontFamily: "ms sans serif, Arial, sans-serif",
        background: hovered ? "#000080" : "transparent",
        color: hovered ? "white" : "black",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      <span style={{ width: 20, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {item.icon}
      </span>
      <span>{item.label}</span>
    </div>
  );
}
