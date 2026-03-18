"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, TitleBar } from "@react95/core";
import { useWindowStore, WindowInstance, AppType } from "@/store/windowStore";
import dynamic from "next/dynamic";

const gray = () => <div style={{ flex: 1, background: "#c0c0c0" }} />;

// Lazy load app components
const AppComponents = {
  welcome: dynamic(() => import("./apps/WelcomeScreen"), { loading: gray }),
  aboutMe: dynamic(() => import("./apps/AboutMe"), { loading: gray }),
  projects: dynamic(() => import("./apps/Projects"), { loading: gray }),
  contact: dynamic(() => import("./apps/Contact"), { loading: gray }),
  newsletter: dynamic(() => import("./apps/Newsletter"), { loading: gray }),
  calculator: dynamic(() => import("./apps/Calculator"), { loading: gray }),
  minesweeper: dynamic(() => import("./apps/Minesweeper"), { loading: gray }),
  resume: dynamic(() => import("./apps/Resume"), { loading: gray }),
  msDos: dynamic(() => import("./apps/MsDos"), { loading: gray }),
  systemProps: dynamic(() => import("./apps/SystemProperties"), { loading: gray }),
  mediaPlayer: dynamic(() => import("./apps/MediaPlayer"), { loading: gray }),
  photography: dynamic(() => import("./apps/Photography"), { loading: gray }),
  pictureViewer: dynamic(() => import("./apps/PictureViewer"), { loading: gray }),
  paint: dynamic(() => import("./apps/Paint"), { loading: gray }),
  internetExplorer: dynamic(() => import("./apps/InternetExplorer"), { loading: gray }),
  webcam: dynamic(() => import("./apps/Webcam"), { loading: gray }),
  doom:   dynamic(() => import("./apps/Doom"),   { loading: gray, ssr: false }),
};

const APP_SIZES: Record<AppType, { width: number; height: number }> = {
  welcome: { width: 480, height: 340 },
  aboutMe: { width: 560, height: 460 },
  projects: { width: 620, height: 480 },
  contact: { width: 440, height: 420 },
  newsletter: { width: 560, height: 500 },
  calculator: { width: 220, height: 280 },
  minesweeper: { width: 340, height: 400 },
  resume: { width: 560, height: 500 },
  msDos: { width: 580, height: 380 },
  systemProps: { width: 440, height: 460 },
  mediaPlayer: { width: 680, height: 510 },
  photography: { width: 620, height: 480 },
  pictureViewer: { width: 680, height: 520 },
  paint: { width: 760, height: 580 },
  internetExplorer: { width: 900, height: 620 },
  webcam: { width: 500, height: 420 },
  doom:   { width: 680, height: 520 },
};

interface Props {
  window: WindowInstance;
}

const TASKBAR_HEIGHT = 40;
const WINDOW_MARGIN = 12;
const MOBILE_BREAKPOINT = 768;
const MIN_WINDOW_WIDTH = 220;
const MIN_WINDOW_HEIGHT = 180;

type CornerHandle = "nw" | "ne" | "sw" | "se";

function clampWindowSize(width: number, height: number, maxWidth: number, maxHeight: number) {
  return {
    width: Math.min(Math.max(width, MIN_WINDOW_WIDTH), maxWidth),
    height: Math.min(Math.max(height, MIN_WINDOW_HEIGHT), maxHeight),
  };
}

function forceReleaseDragPointer(event: PointerEvent) {
  const pointerUp = new PointerEvent("pointerup", {
    bubbles: true,
    cancelable: true,
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    isPrimary: event.isPrimary,
    buttons: 0,
  });

  const mouseUp = new MouseEvent("mouseup", {
    bubbles: true,
    cancelable: true,
    buttons: 0,
  });

  const target = event.target as EventTarget | null;
  target?.dispatchEvent(pointerUp);
  document.dispatchEvent(pointerUp);
  window.dispatchEvent(pointerUp);

  target?.dispatchEvent(mouseUp);
  document.dispatchEvent(mouseUp);
  window.dispatchEvent(mouseUp);
}

export default function Window({ window: win }: Props) {
  const { closeWindow, minimizeWindow, focusWindow } = useWindowStore();
  const AppComponent = AppComponents[win.app];
  const size = APP_SIZES[win.app];
  const isDoomWindow = win.app === "doom";

  const [viewport, setViewport] = useState({ width: 1920, height: 1080 });
  const [windowSize, setWindowSize] = useState(size);
  const [isExpanded, setIsExpanded] = useState(false);

  const resizeSession = useRef<{
    corner: CornerHandle;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const maxWindowSize = useMemo(() => {
    return {
      width: Math.max(MIN_WINDOW_WIDTH, viewport.width - WINDOW_MARGIN * 2),
      height: Math.max(MIN_WINDOW_HEIGHT, viewport.height - TASKBAR_HEIGHT - WINDOW_MARGIN * 2),
    };
  }, [viewport.width, viewport.height]);

  const displayWindowSize = useMemo(
    () =>
      clampWindowSize(
        windowSize.width,
        windowSize.height,
        maxWindowSize.width,
        maxWindowSize.height
      ),
    [windowSize.width, windowSize.height, maxWindowSize.width, maxWindowSize.height]
  );

  const effectiveWindowSize = isDoomWindow && isExpanded
    ? maxWindowSize
    : displayWindowSize;

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!resizeSession.current) return;

      const { corner, startX, startY, startWidth, startHeight } = resizeSession.current;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      let nextWidth = startWidth;
      let nextHeight = startHeight;

      if (corner === "se" || corner === "ne") {
        nextWidth = startWidth + deltaX;
      } else {
        nextWidth = startWidth - deltaX;
      }

      if (corner === "se" || corner === "sw") {
        nextHeight = startHeight + deltaY;
      } else {
        nextHeight = startHeight - deltaY;
      }

      setWindowSize(clampWindowSize(nextWidth, nextHeight, maxWindowSize.width, maxWindowSize.height));
    };

    const onMouseUp = () => {
      resizeSession.current = null;
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [maxWindowSize.width, maxWindowSize.height]);

  useEffect(() => {
    const recoverLostMouseUp = (event: MouseEvent) => {
      if (event.buttons !== 0) return;

      resizeSession.current = null;
      document.body.style.userSelect = "";

      const syntheticMouseUp = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
      });

      document.dispatchEvent(syntheticMouseUp);
      window.dispatchEvent(syntheticMouseUp);
    };

    window.addEventListener("mousemove", recoverLostMouseUp, { passive: true });

    return () => {
      window.removeEventListener("mousemove", recoverLostMouseUp);
    };
  }, []);

  const beginResize = (corner: CornerHandle, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    resizeSession.current = {
      corner,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: displayWindowSize.width,
      startHeight: displayWindowSize.height,
    };

    document.body.style.userSelect = "none";
  };

  const defaultPosition =
    isDoomWindow && isExpanded
      ? {
          x: WINDOW_MARGIN,
          y: WINDOW_MARGIN,
        }
      : viewport.width <= MOBILE_BREAKPOINT
      ? {
          x: Math.max(WINDOW_MARGIN, Math.round((viewport.width - effectiveWindowSize.width) / 2)),
          y: Math.max(
            WINDOW_MARGIN,
            Math.round((viewport.height - TASKBAR_HEIGHT - effectiveWindowSize.height) / 2)
          ),
        }
      : win.defaultPosition;

  return (
    <Modal
      key={win.id}
      title={win.title}
      titleBarOptions={
        <>
          <TitleBar.Minimize onClick={() => minimizeWindow(win.id)} />
          {isDoomWindow && (
            <TitleBar.Maximize onClick={() => setIsExpanded((current) => !current)} />
          )}
          <TitleBar.Close onClick={() => closeWindow(win.id)} />
        </>
      }
      dragOptions={{
        bounds: "body",
        defaultPosition,
        disabled: isDoomWindow && isExpanded,
        cancel: ".window-content, .window-content *",
        onDrag: ({ event }) => {
          if (event.buttons === 0) {
            forceReleaseDragPointer(event);
          }
        },
      }}
      style={{
        width: effectiveWindowSize.width,
        position: "fixed",
        zIndex: win.zIndex,
        visibility: win.isMinimized ? "hidden" : "visible",
        pointerEvents: win.isMinimized ? "none" : "auto",
      }}
      onClick={() => focusWindow(win.id)}
    >
      <div
        className="window-content"
        style={{
          width: "100%",
          height: effectiveWindowSize.height,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <AppComponent />

        {!(isDoomWindow && isExpanded) && (
          <>
            <div
              onMouseDown={(e) => beginResize("nw", e)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 10,
                height: 10,
                cursor: "nwse-resize",
                zIndex: 2,
              }}
            />
            <div
              onMouseDown={(e) => beginResize("ne", e)}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 10,
                height: 10,
                cursor: "nesw-resize",
                zIndex: 2,
              }}
            />
            <div
              onMouseDown={(e) => beginResize("sw", e)}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: 10,
                height: 10,
                cursor: "nesw-resize",
                zIndex: 2,
              }}
            />
            <div
              onMouseDown={(e) => beginResize("se", e)}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                cursor: "nwse-resize",
                zIndex: 2,
              }}
            />
          </>
        )}
      </div>
    </Modal>
  );
}
