"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useWindowStore, AppType } from "@/store/windowStore";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}
interface ClippyAction {
  type: "open_window";
  app: string;
}

// ─── Border helpers ───────────────────────────────────────────────────────────
const raised = {
  borderTop:    "2px solid #fff",
  borderLeft:   "2px solid #fff",
  borderRight:  "2px solid #808080",
  borderBottom: "2px solid #808080",
} as const;

const sunken = {
  borderTop:    "2px solid #808080",
  borderLeft:   "2px solid #808080",
  borderRight:  "2px solid #fff",
  borderBottom: "2px solid #fff",
} as const;

// ─── Clippy image ─────────────────────────────────────────────────────────────
function ClippyImage() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icon_clippy_01@2x.png"
      alt="Clippy"
      width={80}
      height={80}
      draggable={false}
      style={{ display: "block", userSelect: "none", flexShrink: 0 }}
    />
  );
}

// ─── Suggestion chips ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Show me your projects",
  "Tell me about Andrew",
  "How can I contact you?",
  "Show me your resume",
];

// ─── Main component ───────────────────────────────────────────────────────────
const VALID_APPS = new Set<AppType>([
  "welcome", "aboutMe", "projects", "contact", "newsletter",
  "calculator", "minesweeper", "resume", "msDos", "systemProps",
  "mediaPlayer", "photography", "pictureViewer", "paint",
  "internetExplorer", "webcam",
]);

export default function Clippy() {
  const { openWindow } = useWindowStore();

  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        'Hi! It looks like you\'re browsing a portfolio! I\'m Clippy, your helpful guide. Ask me anything about Andrew, or try one of the suggestions below. 📎',
    },
  ]);
  const [loading,  setLoading]  = useState(false);
  const [showSugg, setShowSugg] = useState(true);

  const msgEndRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const executeActions = useCallback(
    (actions: ClippyAction[]) => {
      actions.forEach((action, i) => {
        setTimeout(() => {
          if (action.type === "open_window" && VALID_APPS.has(action.app as AppType)) {
            openWindow(action.app as AppType);
          }
        }, i * 350);
      });
    },
    [openWindow]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setInput("");
      setShowSugg(false);
      setLoading(true);

      const userMsg: Message = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);

      // Send the conversation history (excluding initial greeting, capped)
      const historyForApi = nextMessages.slice(1, -1).slice(-6);

      try {
        const res = await fetch("/api/clippy", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ message: trimmed, history: historyForApi }),
        });

        const data = await res.json() as { message?: string; actions?: ClippyAction[]; error?: string };

        if (!res.ok || data.error) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.error ?? "Oops! Something went wrong. Try again!" },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.message ?? "I'm here to help!" },
          ]);
          if (data.actions?.length) {
            executeActions(data.actions);
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Hmm, I seem to be having connection issues. Check your network and try again!",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, executeActions]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage(input);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 50,
        right: 20,
        zIndex: 9900,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 0,
        pointerEvents: "none", // only the children capture events
      }}
    >
      {/* ── Speech bubble ───────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            width: 296,
            background: "#c0c0c0",
            ...raised,
            marginBottom: 8,
            display: "flex",
            flexDirection: "column",
            pointerEvents: "all",
            fontFamily: "Tahoma, Arial, sans-serif",
          }}
        >
          {/* Title bar */}
          <div
            style={{
              background: "#000080",
              color: "#fff",
              padding: "3px 6px",
              fontSize: 11,
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
              cursor: "default",
            }}
          >
            <span>📎 Clippy — Ask me anything!</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                ...raised,
                background: "#c0c0c0",
                border: "none",
                width: 16,
                height: 14,
                fontSize: 9,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                color: "#000",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              ...sunken,
              background: "#fff",
              margin: 6,
              padding: "6px 8px",
              height: 190,
              overflowY: "auto",
              fontSize: 11,
              lineHeight: 1.55,
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <div
                  key={i}
                  style={{
                    alignSelf: "flex-end",
                    background: "#000080",
                    color: "#fff",
                    padding: "3px 8px",
                    maxWidth: "82%",
                    fontSize: 11,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              ) : (
                <div key={i} style={{ alignSelf: "flex-start", maxWidth: "90%" }}>
                  <span
                    style={{
                      color: "#000080",
                      fontWeight: "bold",
                      fontSize: 10,
                      marginRight: 2,
                    }}
                  >
                    Clippy:
                  </span>
                  {msg.content}
                </div>
              )
            )}

            {loading && (
              <div style={{ color: "#808080", fontStyle: "italic", fontSize: 11 }}>
                Clippy is thinking
                <span style={{ letterSpacing: 2 }}>...</span>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Suggestion chips (visible only at start) */}
          {showSugg && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "0 6px 4px" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    ...raised,
                    background: "#c0c0c0",
                    border: "none",
                    padding: "3px 7px",
                    fontSize: 10,
                    fontFamily: "Tahoma, sans-serif",
                    cursor: "pointer",
                    color: "#000080",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ display: "flex", gap: 4, padding: "0 6px 6px" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask me anything…"
              maxLength={500}
              style={{
                flex: 1,
                ...sunken,
                border: "none",
                background: "#fff",
                padding: "3px 6px",
                fontSize: 11,
                fontFamily: "Tahoma, Arial, sans-serif",
                outline: "none",
                opacity: loading ? 0.6 : 1,
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                ...raised,
                background: "#c0c0c0",
                border: "none",
                padding: "3px 10px",
                fontSize: 14,
                cursor: loading || !input.trim() ? "default" : "pointer",
                opacity: loading || !input.trim() ? 0.4 : 1,
              }}
            >
              →
            </button>
          </div>

          {/* Disclaimer */}
          <div
            style={{
              padding: "0 6px 5px",
              fontSize: 9,
              color: "#808080",
              textAlign: "center",
            }}
          >
            Rate limited · Responses may be inaccurate
          </div>
        </div>
      )}

      {/* ── Clippy character button ──────────────────────────────────────── */}
      <div style={{ pointerEvents: "all" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          title={open ? "Close Clippy" : "Ask Clippy!"}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <ClippyImage />
          {!open && (
            <div
              style={{
                background: "#ffffe1",
                border: "1px solid #808080",
                padding: "2px 6px",
                fontSize: 9,
                fontFamily: "Tahoma, sans-serif",
                whiteSpace: "nowrap",
                boxShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                color: "#000",
              }}
            >
              Ask me!
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
