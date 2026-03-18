"use client";

import { useState, useRef, useCallback } from "react";

const FAVORITES = [
  { label: "Home", url: "/ie/home.html" },
  { label: "Portfolio V1 — Classic (2008)", url: "/ie/portfolio-v1.html" },
  { label: "Portfolio V2 — Modern", url: "/ie/portfolio-v2.html" },
  { label: "GitHub", url: "https://github.com/AndrewKaranu" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/andrew-karanu-998910237" },
];

const HOME_URL = "/ie/home.html";

type MenuAction =
  | "open-prompt"
  | "refresh"
  | "stop"
  | "back"
  | "forward"
  | "home"
  | `favorite:${number}`;

interface MenuItem {
  label: string;
  action?: MenuAction;
  separator?: boolean;
}

const MENU_ITEMS = {
  File: [
    { label: "New Window" },
    { label: "Open...", action: "open-prompt" },
    { label: "─────────────", separator: true },
    { label: "Close" },
  ],
  Edit: [
    { label: "Cut" },
    { label: "Copy" },
    { label: "Paste" },
    { label: "─────────────", separator: true },
    { label: "Select All" },
  ],
  View: [
    { label: "Toolbars" },
    { label: "Status Bar" },
    { label: "─────────────", separator: true },
    { label: "Refresh", action: "refresh" },
    { label: "Stop", action: "stop" },
    { label: "─────────────", separator: true },
    { label: "Source" },
  ],
  Go: [
    { label: "Back", action: "back" },
    { label: "Forward", action: "forward" },
    { label: "─────────────", separator: true },
    { label: "Home", action: "home" },
    { label: "─────────────", separator: true },
    ...FAVORITES.map((f, index) => ({ label: f.label, action: `favorite:${index}` as const })),
  ],
  Favorites: FAVORITES.map((f, index) => ({ label: f.label, action: `favorite:${index}` as const })),
  Help: [
    { label: "Contents and Index" },
    { label: "─────────────", separator: true },
    { label: "About Internet Explorer" },
  ],
} as const satisfies Record<string, readonly MenuItem[]>;

type MenuName = keyof typeof MENU_ITEMS;
const MENU_ORDER: MenuName[] = ["File", "Edit", "View", "Go", "Favorites", "Help"];

const raised = {
  borderTop: "2px solid #ffffff",
  borderLeft: "2px solid #ffffff",
  borderRight: "2px solid #808080",
  borderBottom: "2px solid #808080",
} as const;

const sunken = {
  borderTop: "2px solid #808080",
  borderLeft: "2px solid #808080",
  borderRight: "2px solid #ffffff",
  borderBottom: "2px solid #ffffff",
} as const;

interface ToolButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function ToolButton({ icon, label, onClick, disabled }: ToolButtonProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); if (!disabled) onClick(); }}
      onMouseLeave={() => setPressed(false)}
      disabled={disabled}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 52,
        height: 42,
        background: "#c0c0c0",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        padding: "2px 4px",
        gap: 1,
        ...(pressed && !disabled ? sunken : {}),
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1, pointerEvents: "none" }}>{icon}</span>
      <span style={{ fontSize: 9, fontFamily: "Tahoma, sans-serif", color: "#000", lineHeight: 1, pointerEvents: "none" }}>
        {label}
      </span>
    </button>
  );
}

export default function InternetExplorer() {
  const [history, setHistory] = useState<string[]>([HOME_URL]);
  const [histIdx, setHistIdx] = useState(0);
  const [addressInput, setAddressInput] = useState(HOME_URL);
  const [status, setStatus] = useState("Done");
  const [loading, setLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMenuBar, setShowMenuBar] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentUrl = history[histIdx];

  const navigate = useCallback((url: string) => {
    const newHistory = [...history.slice(0, histIdx + 1), url];
    setHistory(newHistory);
    setHistIdx(newHistory.length - 1);
    setAddressInput(url);
    setLoading(true);
    setStatus(`Opening page ${url}...`);
    setShowFavorites(false);
    setShowMenuBar(null);
  }, [history, histIdx]);

  const goBack = useCallback(() => {
    if (histIdx > 0) {
      const newIdx = histIdx - 1;
      setHistIdx(newIdx);
      setAddressInput(history[newIdx]);
      setLoading(true);
      setStatus("Going back...");
    }
  }, [histIdx, history]);

  const goForward = useCallback(() => {
    if (histIdx < history.length - 1) {
      const newIdx = histIdx + 1;
      setHistIdx(newIdx);
      setAddressInput(history[newIdx]);
      setLoading(true);
      setStatus("Going forward...");
    }
  }, [histIdx, history]);

  const refresh = useCallback(() => {
    if (iframeRef.current) {
      setLoading(true);
      setStatus("Refreshing...");
      iframeRef.current.src = currentUrl;
    }
  }, [currentUrl]);

  const stop = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = "about:blank";
      setLoading(false);
      setStatus("Stopped.");
    }
  }, []);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(addressInput);
  };

  const runMenuAction = useCallback((action?: MenuAction) => {
    if (!action) return;
    if (action.startsWith("favorite:")) {
      const index = Number(action.split(":")[1]);
      if (!Number.isNaN(index) && FAVORITES[index]) {
        navigate(FAVORITES[index].url);
      }
      return;
    }

    switch (action) {
      case "open-prompt": {
        const url = prompt("Open URL:");
        if (url) navigate(url);
        break;
      }
      case "refresh":
        refresh();
        break;
      case "stop":
        stop();
        break;
      case "back":
        goBack();
        break;
      case "forward":
        goForward();
        break;
      case "home":
        navigate(HOME_URL);
        break;
    }
  }, [goBack, goForward, navigate, refresh, stop]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#c0c0c0",
        fontFamily: "Tahoma, Arial, sans-serif",
        fontSize: 12,
        userSelect: "none",
        position: "relative",
      }}
      onClick={() => { setShowFavorites(false); setShowMenuBar(null); }}
    >
      {/* Menu Bar */}
      <div style={{ display: "flex", alignItems: "center", paddingLeft: 4, borderBottom: "1px solid #808080", background: "#c0c0c0", height: 22, flexShrink: 0 }}>
        {MENU_ORDER.map((menuName) => (
          <div key={menuName} style={{ position: "relative" }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenuBar(showMenuBar === menuName ? null : menuName); setShowFavorites(false); }}
              style={{
                background: showMenuBar === menuName ? "#000080" : "transparent",
                color: showMenuBar === menuName ? "#fff" : "#000",
                border: "none",
                padding: "2px 8px",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "Tahoma, Arial, sans-serif",
                height: 20,
              }}
            >
              {menuName}
            </button>
            {showMenuBar === menuName && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  top: 20,
                  left: 0,
                  background: "#c0c0c0",
                  ...raised,
                  zIndex: 1000,
                  minWidth: 180,
                  boxShadow: "2px 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                {(MENU_ITEMS[menuName] as MenuItem[]).map((item, i) =>
                  item.separator ? (
                    <div key={i} style={{ borderTop: "1px solid #808080", borderBottom: "1px solid #fff", margin: "2px 4px" }} />
                  ) : (
                    <div
                      key={i}
                      onClick={() => { runMenuAction(item.action); setShowMenuBar(null); }}
                      style={{
                        padding: "3px 20px",
                        cursor: item.action ? "pointer" : "default",
                        color: item.action ? "#000" : "#808080",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => { if (item.action) (e.currentTarget as HTMLDivElement).style.background = "#000080"; (e.currentTarget as HTMLDivElement).style.color = item.action ? "#fff" : "#808080"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = item.action ? "#000" : "#808080"; }}
                    >
                      {item.label}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", padding: "2px 4px", borderBottom: "1px solid #808080", background: "#c0c0c0", flexShrink: 0, gap: 0 }}>
        <ToolButton icon="◀" label="Back" onClick={goBack} disabled={histIdx === 0} />
        <ToolButton icon="▶" label="Forward" onClick={goForward} disabled={histIdx >= history.length - 1} />
        <ToolButton icon="✕" label="Stop" onClick={stop} disabled={!loading} />
        <ToolButton icon="↻" label="Refresh" onClick={refresh} />
        <ToolButton icon="🏠" label="Home" onClick={() => navigate(HOME_URL)} />
        <div style={{ width: 1, height: 38, background: "#808080", margin: "0 2px" }} />
        <ToolButton icon="🔍" label="Search" onClick={() => {}} />
        <div
          style={{ position: "relative" }}
          onClick={(e) => { e.stopPropagation(); setShowFavorites(!showFavorites); setShowMenuBar(null); }}
        >
          <ToolButton icon="⭐" label="Favorites" onClick={() => {}} />
          {showFavorites && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: 44,
                left: 0,
                background: "#c0c0c0",
                ...raised,
                zIndex: 1000,
                minWidth: 240,
                boxShadow: "2px 2px 4px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ padding: "4px 8px", fontWeight: "bold", fontSize: 11, borderBottom: "1px solid #808080" }}>Favorites</div>
              {FAVORITES.map((f, i) => (
                <div
                  key={i}
                  onClick={() => navigate(f.url)}
                  style={{ padding: "4px 12px", cursor: "pointer", whiteSpace: "nowrap", fontSize: 12 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#000080"; (e.currentTarget as HTMLDivElement).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "#000"; }}
                >
                  ⭐ {f.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <ToolButton icon="📜" label="History" onClick={() => {}} />
        <ToolButton icon="✉" label="Mail" onClick={() => {}} />
        <ToolButton icon="🖨" label="Print" onClick={() => { if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.print(); }} />

        {/* IE spinning globe logo */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingRight: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              background: loading
                ? "conic-gradient(from 0deg, #003399, #6699ff, #003399)"
                : "radial-gradient(circle at 40% 35%, #6699ff, #003399 60%, #001166)",
              borderRadius: "50%",
              border: "1px solid #446",
              animation: loading ? "ie-spin 1s linear infinite" : "none",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontSize: 12 }}>🌐</span>
          </div>
        </div>
      </div>

      {/* Address Bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "3px 4px", borderBottom: "1px solid #808080", background: "#c0c0c0", gap: 6, flexShrink: 0, height: 28 }}>
        <span style={{ fontSize: 12, fontWeight: "bold", flexShrink: 0 }}>Address</span>
        <form onSubmit={handleAddressSubmit} style={{ display: "flex", flex: 1, gap: 4 }}>
          <div style={{ flex: 1, ...sunken, background: "#fff", display: "flex", alignItems: "center" }}>
            <input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 12,
                fontFamily: "Tahoma, Arial, sans-serif",
                padding: "1px 4px",
                background: "transparent",
              }}
            />
            <span style={{ fontSize: 10, paddingRight: 4, color: "#808080" }}>▼</span>
          </div>
          <button
            type="submit"
            style={{
              ...raised,
              background: "#c0c0c0",
              padding: "2px 12px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "Tahoma, Arial, sans-serif",
            }}
          >
            Go
          </button>
        </form>
      </div>

      {/* Content iframe */}
      <div style={{ flex: 1, ...sunken, overflow: "hidden", position: "relative" }}>
        <iframe
          ref={iframeRef}
          src={currentUrl}
          style={{ width: "100%", height: "100%", border: "none", display: "block", background: "#fff" }}
          onLoad={() => {
            setLoading(false);
            setStatus("Done");
          }}
          title="Internet Explorer Content"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
        {loading && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(to right, #003399 0%, #6699ff 50%, transparent 100%)",
              animation: "ie-progress 1.5s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Status Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #fff",
          background: "#c0c0c0",
          height: 22,
          flexShrink: 0,
          padding: "0 4px",
          gap: 4,
        }}
      >
        <div style={{ flex: 1, ...sunken, padding: "1px 6px", fontSize: 11, background: "#c0c0c0", minHeight: 16, display: "flex", alignItems: "center" }}>
          {loading ? `Opening: ${currentUrl}` : status}
        </div>
        <div style={{ ...sunken, padding: "1px 8px", fontSize: 11, background: "#c0c0c0", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <span>🌐</span>
          <span>Internet zone</span>
        </div>
      </div>

      <style>{`
        @keyframes ie-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ie-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
