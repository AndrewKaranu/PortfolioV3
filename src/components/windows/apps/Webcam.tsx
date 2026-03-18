"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type FilterType =
  | "normal"
  | "grayscale"
  | "sepia"
  | "invert"
  | "pixelate"
  | "ascii"
  | "8bit"
  | "scanlines";

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "normal",    label: "Normal"   },
  { id: "grayscale", label: "B&W"      },
  { id: "sepia",     label: "Sepia"    },
  { id: "invert",    label: "Invert"   },
  { id: "pixelate",  label: "Pixelate" },
  { id: "ascii",     label: "ASCII Art" },
  { id: "8bit",      label: "8-Bit"    },
  { id: "scanlines", label: "CRT"      },
];

// Luminance-mapped chars, dark → light
const ASCII_CHARS = "@#MW8&%Oo+=-:. ";

// Internal canvas resolution (small = faster pixel ops, still looks fine scaled)
const CANVAS_W = 320;
const CANVAS_H = 240;

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

export default function Webcam() {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const offRef      = useRef<HTMLCanvasElement | null>(null); // offscreen for pixelate/ascii
  const rafRef      = useRef<number>(0);
  const streamRef   = useRef<MediaStream | null>(null);
  const filterRef   = useRef<FilterType>("normal");
  const activeRef   = useRef(false);

  const [filter,   setFilter]   = useState<FilterType>("normal");
  const [cameraOn, setCameraOn] = useState(false);
  const [status,   setStatus]   = useState("Press \u25B6 Start Camera to begin");
  const [error,    setError]    = useState<string | null>(null);

  // Keep filterRef in sync so renderLoop (stable closure) sees latest value
  useEffect(() => { filterRef.current = filter; }, [filter]);

  const drawNoSignal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(CANVAS_W, CANVAS_H);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 180);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(CANVAS_W / 2 - 62, CANVAS_H / 2 - 13, 124, 26);
    ctx.fillStyle = "#ccc";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("NO SIGNAL", CANVAS_W / 2, CANVAS_H / 2);
  }, []);

  // Mount: create offscreen canvas + draw initial static
  useEffect(() => {
    const off = document.createElement("canvas");
    off.width  = CANVAS_W;
    off.height = CANVAS_H;
    offRef.current = off;
    drawNoSignal();
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [drawNoSignal]);

  const renderLoop = useCallback(function loop() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const off    = offRef.current;
    if (!activeRef.current || !video || !canvas || !off) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const f = filterRef.current;

    if (f === "pixelate") {
      const BLOCK = 8;
      const sw = Math.floor(CANVAS_W / BLOCK);
      const sh = Math.floor(CANVAS_H / BLOCK);
      const offCtx = off.getContext("2d")!;
      offCtx.drawImage(video, 0, 0, sw, sh);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, sw, sh, 0, 0, CANVAS_W, CANVAS_H);
      ctx.imageSmoothingEnabled = true;

    } else if (f === "ascii") {
      const CW = 5, CH = 9;
      const cols = Math.floor(CANVAS_W / CW);
      const rows = Math.floor(CANVAS_H / CH);
      const offCtx = off.getContext("2d")!;
      offCtx.drawImage(video, 0, 0, cols, rows);
      const pixels = offCtx.getImageData(0, 0, cols, rows);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.font = `bold ${CH}px "Courier New", monospace`;
      ctx.textBaseline = "top";
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = (row * cols + col) * 4;
          const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
          const lum  = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const char = ASCII_CHARS[Math.floor(lum * (ASCII_CHARS.length - 1))];
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillText(char, col * CW, row * CH);
        }
      }

    } else if (f === "scanlines") {
      ctx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H);
      // horizontal scanlines
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      for (let y = 0; y < CANVAS_H; y += 2) ctx.fillRect(0, y, CANVAS_W, 1);
      // slight green phosphor tint
      ctx.fillStyle = "rgba(0,22,0,0.12)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    } else {
      ctx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H);
      if (f !== "normal") {
        const img = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          if (f === "grayscale") {
            d[i] = d[i + 1] = d[i + 2] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          } else if (f === "sepia") {
            d[i]     = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          } else if (f === "invert") {
            d[i] = 255 - r; d[i + 1] = 255 - g; d[i + 2] = 255 - b;
          } else if (f === "8bit") {
            // Quantize to ~5 levels per channel — chunky retro palette feel
            d[i]     = Math.round(r / 64) * 64;
            d[i + 1] = Math.round(g / 64) * 64;
            d[i + 2] = Math.round(b / 64) * 64;
          }
        }
        ctx.putImageData(img, 0, 0);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const startCamera = useCallback(async () => {
    if (activeRef.current) return;
    setError(null);
    setStatus("Requesting camera access...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: CANVAS_W }, height: { ideal: CANVAS_H }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      activeRef.current = true;
      setCameraOn(true);
      setStatus("Live");
      rafRef.current = requestAnimationFrame(renderLoop);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera access denied";
      setError(msg);
      setStatus(`Error: ${msg}`);
      drawNoSignal();
    }
  }, [renderLoop, drawNoSignal]);

  const stopCamera = useCallback(() => {
    activeRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setStatus("Camera off");
    drawNoSignal();
  }, [drawNoSignal]);

  const takeSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeRef.current) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `webcam-${Date.now()}.png`;
    a.click();
    setStatus("Snapshot saved!");
    setTimeout(() => setStatus("Live"), 2000);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#c0c0c0",
        fontFamily: "Tahoma, Arial, sans-serif",
        fontSize: 12,
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 6px",
          borderBottom: "1px solid #808080",
          flexShrink: 0,
          height: 40,
        }}
      >
        <button
          onClick={cameraOn ? stopCamera : startCamera}
          style={{
            ...raised,
            background: "#c0c0c0",
            padding: "4px 14px",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "Tahoma, sans-serif",
          }}
        >
          {cameraOn ? "\u25A0  Stop" : "\u25B6  Start Camera"}
        </button>
        <button
          onClick={takeSnapshot}
          disabled={!cameraOn}
          style={{
            ...raised,
            background: "#c0c0c0",
            padding: "4px 14px",
            cursor: cameraOn ? "pointer" : "default",
            fontSize: 12,
            fontFamily: "Tahoma, sans-serif",
            opacity: cameraOn ? 1 : 0.5,
          }}
        >
          📷  Snapshot
        </button>
        {cameraOn && (
          <div style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#f00",
                boxShadow: "0 0 5px #f00",
              }}
            />
            <span style={{ color: "#900", fontWeight: "bold", letterSpacing: 1 }}>LIVE</span>
          </div>
        )}
      </div>

      {/* Main area: viewport + filter sidebar */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: "6px 6px 0", gap: 6 }}>
        {/* Camera viewport */}
        <div
          style={{
            ...sunken,
            flex: 1,
            background: "#000",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <video ref={videoRef} style={{ display: "none" }} playsInline muted />
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
              imageRendering: "pixelated",
            }}
          />
        </div>

        {/* Filter sidebar */}
        <div style={{ display: "flex", flexDirection: "column", width: 82, flexShrink: 0, gap: 4 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: "bold",
              textAlign: "center",
              padding: "2px 0",
              borderBottom: "1px solid #808080",
            }}
          >
            Filters
          </div>
          <div
            style={{
              ...sunken,
              flex: 1,
              background: "#c0c0c0",
              padding: "4px 3px",
              display: "flex",
              flexDirection: "column",
              gap: 3,
              overflowY: "auto",
            }}
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  ...(filter === f.id ? sunken : raised),
                  background: filter === f.id ? "#000080" : "#c0c0c0",
                  color: filter === f.id ? "#fff" : "#000",
                  padding: "5px 3px",
                  cursor: "pointer",
                  fontSize: 10,
                  fontFamily: "Tahoma, sans-serif",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 22,
          padding: "0 4px",
          gap: 4,
          flexShrink: 0,
          marginTop: 6,
        }}
      >
        <div
          style={{
            ...sunken,
            flex: 1,
            padding: "1px 6px",
            fontSize: 11,
            background: "#c0c0c0",
            display: "flex",
            alignItems: "center",
          }}
        >
          {error ? `\u26A0 ${error}` : status}
        </div>
        <div
          style={{
            ...sunken,
            padding: "1px 8px",
            fontSize: 11,
            background: "#c0c0c0",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {FILTERS.find((f) => f.id === filter)?.label}
        </div>
      </div>
    </div>
  );
}
