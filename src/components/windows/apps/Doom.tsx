"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
// CSS is loaded as part of the lazy Doom chunk — only fetched when the window opens
import "js-dos/dist/js-dos.css";

// js-dos types (we access the library via dynamic import to keep it out of the initial bundle)
interface DosPlayerInstance {
  run: (url: string) => DosPlayerInstance;
  stop: () => void;
  enableMobileControls?: () => Promise<void> | void;
  disableMobileControls?: () => Promise<void> | void;
}

interface DosCommandInterface {
  sendKeyEvent: (keyCode: number, pressed: boolean) => void;
  simulateKeyPress: (...keyCodes: number[]) => void;
}

interface DosPlayerWithCi extends DosPlayerInstance {
  ciPromise?: Promise<DosCommandInterface>;
}

declare global {
  interface Window {
    // Set by the js-dos module when it initialises
    emulators: { pathPrefix: string };
    Dos: (element: HTMLDivElement, options: Record<string, unknown>) => DosPlayerInstance;
    emulatorsUi?: {
      controls?: {
        domToKeyCode?: (domCode: number) => number;
      };
    };
  }
}

export default function Doom() {
  // containerRef is always rendered so it's available when the effect runs
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef    = useRef<DosPlayerInstance | null>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const [phase, setPhase] = useState<"idle" | "loading" | "running" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showFallbackPad, setShowFallbackPad] = useState(false);

  const keyToDomCode: Record<string, number> = {
    Escape: 27,
    Enter: 13,
    Alt: 18,
    ArrowUp: 38,
    ArrowDown: 40,
    ArrowLeft: 37,
    ArrowRight: 39,
    Shift: 16,
    Control: 17,
    " ": 32,
  };

  const isTouchDevice = () => {
    if (typeof window === "undefined") return false;
    return (
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.matchMedia?.("(pointer: coarse)")?.matches ||
      "ontouchstart" in window
    );
  };

  const toEmulatorKeyCode = (domCode: number) => {
    const convert = window.emulatorsUi?.controls?.domToKeyCode;
    if (typeof convert === "function") {
      const mapped = convert(domCode);
      if (typeof mapped === "number" && mapped > 0) return mapped;
    }
    return domCode;
  };

  const keyDown = (key: string) => {
    if (pressedKeysRef.current.has(key)) return;
    pressedKeysRef.current.add(key);

    const domCode = keyToDomCode[key];
    const code = key === " " ? "Space" : key;
    const targets = [containerRef.current, document, window] as const;

    for (const target of targets) {
      if (!target) continue;
      const event = new KeyboardEvent("keydown", {
        key,
        code,
        bubbles: true,
        cancelable: true,
      });

      try {
        if (typeof domCode === "number") {
          Object.defineProperty(event, "keyCode", { get: () => domCode });
          Object.defineProperty(event, "which", { get: () => domCode });
        }
      } catch {
        // ignore readonly property override errors
      }

      target.dispatchEvent(event);
    }

    const player = playerRef.current as DosPlayerWithCi | null;
    if (typeof domCode === "number" && player?.ciPromise) {
      const emulatorKeyCode = toEmulatorKeyCode(domCode);
      void player.ciPromise
        .then((ci) => ci.sendKeyEvent(emulatorKeyCode, true))
        .catch(() => {});
    }
  };

  const keyUp = (key: string) => {
    if (!pressedKeysRef.current.has(key)) return;
    pressedKeysRef.current.delete(key);

    const domCode = keyToDomCode[key];
    const code = key === " " ? "Space" : key;
    const targets = [containerRef.current, document, window] as const;

    for (const target of targets) {
      if (!target) continue;
      const event = new KeyboardEvent("keyup", {
        key,
        code,
        bubbles: true,
        cancelable: true,
      });

      try {
        if (typeof domCode === "number") {
          Object.defineProperty(event, "keyCode", { get: () => domCode });
          Object.defineProperty(event, "which", { get: () => domCode });
        }
      } catch {
        // ignore readonly property override errors
      }

      target.dispatchEvent(event);
    }

    const player = playerRef.current as DosPlayerWithCi | null;
    if (typeof domCode === "number" && player?.ciPromise) {
      const emulatorKeyCode = toEmulatorKeyCode(domCode);
      void player.ciPromise
        .then((ci) => ci.sendKeyEvent(emulatorKeyCode, false))
        .catch(() => {});
    }
  };

  const pressEscape = () => {
    containerRef.current?.focus?.();
    const player = playerRef.current as DosPlayerWithCi | null;
    if (player?.ciPromise) {
      const escCode = toEmulatorKeyCode(27);
      void player.ciPromise
        .then((ci) => ci.simulateKeyPress(escCode))
        .catch(() => {
          keyDown("Escape");
          window.setTimeout(() => keyUp("Escape"), 30);
        });
      return;
    }

    keyDown("Escape");
    window.setTimeout(() => keyUp("Escape"), 30);
  };

  const pressEnter = () => {
    containerRef.current?.focus?.();
    const player = playerRef.current as DosPlayerWithCi | null;
    if (player?.ciPromise) {
      const enterCode = toEmulatorKeyCode(13);
      void player.ciPromise
        .then((ci) => ci.simulateKeyPress(enterCode))
        .catch(() => {
          keyDown("Enter");
          window.setTimeout(() => keyUp("Enter"), 30);
        });
      return;
    }

    keyDown("Enter");
    window.setTimeout(() => keyUp("Enter"), 30);
  };

  const releaseAllKeys = () => {
    const keys = [...pressedKeysRef.current];
    keys.forEach((key) => keyUp(key));
  };

  const releasePointerState = () => {
    try {
      document.exitPointerLock?.();
    } catch {
      // ignore pointer lock release errors
    }

    const releaseMouse = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      buttons: 0,
    });

    document.dispatchEvent(releaseMouse);
    window.dispatchEvent(releaseMouse);

    if (typeof window.PointerEvent !== "undefined") {
      const releasePointer = new PointerEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
        buttons: 0,
      });
      document.dispatchEvent(releasePointer);
      window.dispatchEvent(releasePointer);
    }

    document.body.style.userSelect = "";
    document.body.style.pointerEvents = "";
  };

  useEffect(() => {
    let cancelled = false;

    const handlePointerLockChange = () => {
      if (!document.pointerLockElement) {
        releasePointerState();
      }
    };

    const handleWindowBlur = () => {
      releasePointerState();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        releasePointerState();
      }
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    async function start() {
      if (!containerRef.current) return;
      setPhase("loading");

      try {
        // ── 1. Lazy-load js-dos (side-effect: sets window.Dos + window.emulators) ──
        await import("js-dos");

        if (cancelled) return;

        // ── 2. Tell js-dos where to find its WASM worker ──────────────────
        //    wdosbox.js and wdosbox.wasm are served from /public
        if (typeof window !== "undefined" && window.emulators) {
          window.emulators.pathPrefix = "/";
        }

        // ── 3. Create the player ───────────────────────────────────────────
        //    The js-dos Browserify bundle always sets window.Dos = DosPlayer
        //    as a side-effect of importing. Turbopack's CJS interop doesn't
        //    reliably surface named exports, so we use the global instead.
        if (!containerRef.current) return;

        const DosPlayer = window.Dos;
        if (typeof DosPlayer !== "function") {
          throw new Error("window.Dos not set — js-dos failed to initialise");
        }

        const player = DosPlayer(containerRef.current, {
          noSideBar:           true,
          noFullscreen:        false,
          noSocialLinks:       true,
          withNetworkingApi:   false,
          withExperimentalApi: false,
          onExit: () => setPhase("idle"),
        });

        playerRef.current = player;

        // run() fetches the 2 MB bundle from /public/doom/doom.jsdos
        player.run("/doom/doom.jsdos");

        if (isTouchDevice()) {
          let builtInControlsActive = false;

          if (typeof player.enableMobileControls === "function") {
            try {
              await player.enableMobileControls();
            } catch {
              // fallback controls handled below
            }
          }

          await new Promise((resolve) => window.setTimeout(resolve, 220));

          if (containerRef.current) {
            builtInControlsActive = Boolean(
              containerRef.current.querySelector(".emulator-button-touch-zone, .emulator-options")
            );
          }

          if (!cancelled) {
            setShowFallbackPad(!builtInControlsActive);
          }
        } else if (!cancelled) {
          setShowFallbackPad(false);
        }

        if (!cancelled) setPhase("running");
      } catch (err) {
        if (!cancelled) {
          console.error("js-dos init error:", err);
          setErrorMsg(err instanceof Error ? err.message : "Failed to start");
          setPhase("error");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      try {
        releaseAllKeys();
        if (typeof playerRef.current?.disableMobileControls === "function") {
          void playerRef.current.disableMobileControls();
        }
        playerRef.current?.stop();
      } catch {
        // ignore errors during teardown
      }
      playerRef.current = null;
      releasePointerState();
    };
  }, []);

  useEffect(() => {
    if (phase !== "running") {
      releaseAllKeys();
    }
  }, [phase]);

  const showSplash = phase === "idle" || phase === "loading";
  const showError  = phase === "error";

  const touchButtonStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 9,
    borderTop: "2px solid #ffffff",
    borderLeft: "2px solid #ffffff",
    borderRight: "2px solid #808080",
    borderBottom: "2px solid #808080",
    background: "rgba(192,192,192,0.92)",
    color: "#000",
    fontFamily: "ms sans serif, Arial, sans-serif",
    fontSize: 15,
    fontWeight: "bold",
    touchAction: "none",
    userSelect: "none",
  };

  return (
    <div style={{ width: "100%", height: "100%", background: "#000", position: "relative" }}>
      {/* js-dos mounts into this div — always in the DOM so containerRef is never null */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", background: "#000" }}
      />

      {/* Splash overlay — shown until the player is ready */}
      {showSplash && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            fontFamily: "'Courier New', monospace",
            color: "#c00",
            zIndex: 10,
          }}
        >
          <Image
            src="/doomlogo.png"
            alt="DOOM"
            width={320}
            height={120}
            style={{ objectFit: "contain", maxWidth: "80%" }}
            priority
          />
          <div
            style={{
              fontSize: 13,
              color: "#c00",
              letterSpacing: 2,
              textTransform: "uppercase",
              animation: "doom-blink 1s step-end infinite",
            }}
          >
            {phase === "loading" ? "Loading…" : "Initializing…"}
          </div>
          <div style={{ fontSize: 11, color: "#600", maxWidth: 300, textAlign: "center" }}>
            Shareware Episode 1: Knee-Deep in the Dead
          </div>
          <style>{`
            @keyframes doom-blink {
              0%, 100% { opacity: 1; }
              50%       { opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Error overlay */}
      {showError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#c00",
            fontFamily: "'Courier New', monospace",
            gap: 8,
            padding: 20,
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: "bold" }}>ERROR LOADING DOOM</div>
          <div style={{ fontSize: 11, color: "#800", textAlign: "center" }}>{errorMsg}</div>
          <div style={{ fontSize: 10, color: "#444", marginTop: 8 }}>
            Check browser console for details.
          </div>
        </div>
      )}

      {/* Fallback touch controls (mobile only if js-dos built-in controls are unavailable) */}
      {phase === "running" && showFallbackPad && isTouchDevice() && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            pointerEvents: "none",
            touchAction: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 12,
              bottom: 12,
              display: "grid",
              gridTemplateColumns: "44px 44px 44px",
              gridTemplateRows: "44px 44px 44px",
              gap: 4,
              pointerEvents: "auto",
            }}
          >
            <div />
            <button
              style={touchButtonStyle}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); keyDown("ArrowUp"); }}
              onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("ArrowUp"); }}
              onPointerCancel={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("ArrowUp"); }}
            >↑</button>
            <div />
            <button
              style={touchButtonStyle}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); keyDown("ArrowLeft"); }}
              onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("ArrowLeft"); }}
              onPointerCancel={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("ArrowLeft"); }}
            >←</button>
            <button
              style={touchButtonStyle}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); keyDown("Shift"); }}
              onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("Shift"); }}
              onPointerCancel={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("Shift"); }}
            >RUN</button>
            <button
              style={touchButtonStyle}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); keyDown("ArrowRight"); }}
              onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("ArrowRight"); }}
              onPointerCancel={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("ArrowRight"); }}
            >→</button>
            <div />
            <button
              style={touchButtonStyle}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); keyDown("ArrowDown"); }}
              onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("ArrowDown"); }}
              onPointerCancel={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("ArrowDown"); }}
            >↓</button>
            <div />
          </div>

          <div
            style={{
              position: "absolute",
              right: 12,
              bottom: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              pointerEvents: "auto",
            }}
          >
            <button
              style={{ ...touchButtonStyle, width: 60, height: 44, fontSize: 12 }}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); keyDown("Control"); }}
              onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("Control"); }}
              onPointerCancel={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("Control"); }}
            >FIRE</button>
            <button
              style={{ ...touchButtonStyle, width: 60, height: 44, fontSize: 12 }}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); keyDown("Alt"); }}
              onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("Alt"); }}
              onPointerCancel={(e) => { e.preventDefault(); e.stopPropagation(); keyUp("Alt"); }}
            >ALT</button>
            <button
              style={{ ...touchButtonStyle, width: 60, height: 44, fontSize: 12 }}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); keyDown(" "); }}
              onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); keyUp(" "); }}
              onPointerCancel={(e) => { e.preventDefault(); e.stopPropagation(); keyUp(" "); }}
            >USE</button>
          </div>
        </div>
      )}

      {/* ESC menu control for mobile (available with built-in or fallback controls) */}
      {phase === "running" && isTouchDevice() && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 21,
            pointerEvents: "none",
            display: "flex",
            gap: 6,
          }}
        >
          <button
            style={{
              ...touchButtonStyle,
              width: 52,
              height: 34,
              fontSize: 11,
              pointerEvents: "auto",
            }}
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); pressEscape(); }}
          >ESC</button>
          <button
            style={{
              ...touchButtonStyle,
              width: 52,
              height: 34,
              fontSize: 11,
              pointerEvents: "auto",
            }}
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); pressEnter(); }}
          >ENT</button>
        </div>
      )}
    </div>
  );
}
