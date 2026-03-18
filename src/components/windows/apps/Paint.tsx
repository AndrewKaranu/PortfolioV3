"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tool =
  | "select-rect" | "select-free"
  | "eraser" | "fill" | "eyedropper" | "zoom"
  | "pencil" | "brush" | "airbrush" | "text"
  | "line" | "curve" | "rect" | "polygon" | "ellipse" | "rounded-rect";

interface Pt { x: number; y: number }

// ─── Constants ────────────────────────────────────────────────────────────────
const CW = 620;
const CH = 420;

// Win95 Paint 28-color palette (2 rows × 14 cols)
const PALETTE = [
  "#000000","#808080","#800000","#808000","#008000","#008080","#000080","#800080",
  "#808040","#004040","#0080C0","#004080","#8000FF","#804000",
  "#FFFFFF","#C0C0C0","#FF0000","#FFFF00","#00FF00","#00FFFF","#0000FF","#FF00FF",
  "#FFFF80","#00FF80","#80FFFF","#8080FF","#FF0080","#FF8040",
];

const BRUSH_SIZES = [2, 4, 6, 8];

// ─── Tool Definitions (icon SVG path + tooltip) ───────────────────────────────
const TOOLS: { id: Tool; label: string; tip: string }[] = [
  { id: "select-free", label: "✦", tip: "Free-Form Select" },
  { id: "select-rect", label: "⬚", tip: "Select" },
  { id: "eraser",      label: "▭", tip: "Eraser/Color Eraser" },
  { id: "fill",        label: "⬧", tip: "Fill With Color" },
  { id: "eyedropper",  label: "⁋", tip: "Pick Color" },
  { id: "zoom",        label: "⊕", tip: "Magnifier" },
  { id: "pencil",      label: "✏", tip: "Pencil" },
  { id: "brush",       label: "⌇", tip: "Brush" },
  { id: "airbrush",    label: "⋱", tip: "Airbrush" },
  { id: "text",        label: "A", tip: "Text" },
  { id: "line",        label: "╱", tip: "Line" },
  { id: "curve",       label: "∫", tip: "Curve" },
  { id: "rect",        label: "□", tip: "Rectangle" },
  { id: "polygon",     label: "⬠", tip: "Polygon" },
  { id: "ellipse",     label: "○", tip: "Ellipse" },
  { id: "rounded-rect",label: "▢", tip: "Rounded Rectangle" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// BFS flood fill on raw ImageData
function floodFill(
  data: Uint8ClampedArray, w: number, h: number,
  sx: number, sy: number, fillHex: string
) {
  const [fr, fg, fb] = hexToRgb(fillHex);
  const base = (sy * w + sx) * 4;
  const tr = data[base], tg = data[base + 1], tb = data[base + 2];
  if (tr === fr && tg === fg && tb === fb) return;
  const stack = [sy * w + sx];
  const visited = new Uint8Array(w * h);
  while (stack.length) {
    const idx = stack.pop()!;
    if (visited[idx]) continue;
    visited[idx] = 1;
    const p = idx * 4;
    if (data[p] !== tr || data[p + 1] !== tg || data[p + 2] !== tb) continue;
    data[p] = fr; data[p + 1] = fg; data[p + 2] = fb; data[p + 3] = 255;
    const x = idx % w, y = Math.floor(idx / w);
    if (x > 0) stack.push(idx - 1);
    if (x < w - 1) stack.push(idx + 1);
    if (y > 0) stack.push(idx - w);
    if (y < h - 1) stack.push(idx + w);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Paint() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tool,       setTool]      = useState<Tool>("pencil");
  const [fgColor,    setFgColor]   = useState("#000000");
  const [bgColor,    setBgColor]   = useState("#FFFFFF");
  const [brushSize,  setBrushSize] = useState(1); // index into BRUSH_SIZES
  const [shapeFill,  setShapeFill] = useState(0); // 0=outline 1=fill+outline 2=fill-only
  const [zoomLevel,  setZoomLevel] = useState(1);
  const [coords,     setCoords]    = useState<Pt>({ x: 0, y: 0 });
  const [statusTip,  setStatusTip] = useState("For Help, click Help Topics on the Help Menu.");
  const [textInput,  setTextInput] = useState<{ pos: Pt; value: string } | null>(null);
  const [selection,  setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Refs used during mouse events (avoid stale closures)
  const isDrawing     = useRef(false);
  const startPos      = useRef<Pt>({ x: 0, y: 0 });
  const lastPos       = useRef<Pt>({ x: 0, y: 0 });
  const snapshot      = useRef<ImageData | null>(null);
  const undoStack     = useRef<ImageData[]>([]);
  const redoStack     = useRef<ImageData[]>([]);
  const polyPoints    = useRef<Pt[]>([]);
  const freeSelectPoints = useRef<Pt[]>([]);
  const curvePhase    = useRef<0 | 1 | 2>(0);
  const curvePoints   = useRef<{ p1: Pt; p2: Pt; cp: Pt }>({ p1:{x:0,y:0}, p2:{x:0,y:0}, cp:{x:0,y:0} });
  const toolRef       = useRef(tool);
  const fgRef         = useRef(fgColor);
  const bgRef         = useRef(bgColor);
  const sizeRef       = useRef(brushSize);
  const shapeFillRef  = useRef(shapeFill);
  const zoomRef       = useRef(zoomLevel);

  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { fgRef.current = fgColor; }, [fgColor]);
  useEffect(() => { bgRef.current = bgColor; }, [bgColor]);
  useEffect(() => { sizeRef.current = brushSize; }, [brushSize]);
  useEffect(() => { shapeFillRef.current = shapeFill; }, [shapeFill]);
  useEffect(() => { zoomRef.current = zoomLevel; }, [zoomLevel]);

  // Initialize white canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CW, CH);
  }, []);

  const ctx = () => canvasRef.current?.getContext("2d") ?? null;

  const canvasPos = (e: { clientX: number; clientY: number }): Pt => {
    const r = canvasRef.current!.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - r.left) / zoomRef.current),
      y: Math.floor((e.clientY - r.top)  / zoomRef.current),
    };
  };

  const saveSnap = useCallback(() => {
    const c = ctx();
    if (!c) return;
    snapshot.current = c.getImageData(0, 0, CW, CH);
    redoStack.current = [];
    undoStack.current = [...undoStack.current.slice(-19), snapshot.current];
  }, []);

  const restoreSnap = () => {
    const c = ctx();
    if (!c || !snapshot.current) return;
    c.putImageData(snapshot.current, 0, 0);
  };

  const undo = useCallback(() => {
    const c = ctx();
    if (!c) return;
    if (undoStack.current.length === 0) return;
    const currentImage = c.getImageData(0, 0, CW, CH);
    const previousImage = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    redoStack.current = [...redoStack.current.slice(-19), currentImage];
    c.putImageData(previousImage, 0, 0);
  }, []);

  const redo = useCallback(() => {
    const c = ctx();
    if (!c) return;
    if (redoStack.current.length === 0) return;
    const currentImage = c.getImageData(0, 0, CW, CH);
    const nextImage = redoStack.current[redoStack.current.length - 1];
    redoStack.current = redoStack.current.slice(0, -1);
    undoStack.current = [...undoStack.current.slice(-19), currentImage];
    c.putImageData(nextImage, 0, 0);
  }, []);

  // ── Drawing helpers ──────────────────────────────────────────────────────────
  const px = (i: number) => BRUSH_SIZES[i] ?? 2;

  function applyStroke(c: CanvasRenderingContext2D, color: string, size: number) {
    c.strokeStyle = color;
    c.lineWidth = size;
    c.lineCap = "round";
    c.lineJoin = "round";
  }

  function drawLine(c: CanvasRenderingContext2D, p1: Pt, p2: Pt, color: string, size: number) {
    c.save();
    applyStroke(c, color, size);
    c.beginPath(); c.moveTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.stroke();
    c.restore();
  }

  function drawRect(c: CanvasRenderingContext2D, p1: Pt, p2: Pt, fg: string, bg: string, fill: number, size: number, radius = 0) {
    const x = Math.min(p1.x, p2.x), y = Math.min(p1.y, p2.y);
    const w = Math.abs(p2.x - p1.x), h = Math.abs(p2.y - p1.y);
    c.save();
    c.lineWidth = size;
    if (fill === 1 || fill === 2) {
      c.fillStyle = fill === 2 ? fg : bg;
      if (radius > 0) {
        c.beginPath();
        c.roundRect(x, y, w, h, radius);
        c.fill();
      } else {
        c.fillRect(x, y, w, h);
      }
    }
    if (fill !== 2) {
      c.strokeStyle = fg;
      if (radius > 0) {
        c.beginPath();
        c.roundRect(x, y, w, h, radius);
        c.stroke();
      } else {
        c.strokeRect(x, y, w, h);
      }
    }
    c.restore();
  }

  function drawEllipse(c: CanvasRenderingContext2D, p1: Pt, p2: Pt, fg: string, bg: string, fill: number, size: number) {
    const cx=(p1.x+p2.x)/2, cy=(p1.y+p2.y)/2;
    const rx=Math.max(1,Math.abs(p2.x-p1.x)/2), ry=Math.max(1,Math.abs(p2.y-p1.y)/2);
    c.save(); c.lineWidth = size;
    c.beginPath(); c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
    if (fill===1||fill===2) { c.fillStyle = fill===2 ? fg : bg; c.fill(); }
    if (fill!==2) { c.strokeStyle = fg; c.stroke(); }
    c.restore();
  }

  function drawBrushStroke(c: CanvasRenderingContext2D, from: Pt, to: Pt, color: string, size: number) {
    const steps = Math.max(Math.abs(to.x-from.x), Math.abs(to.y-from.y), 1);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = from.x + (to.x - from.x) * t;
      const by = from.y + (to.y - from.y) * t;
      c.fillStyle = color;
      c.beginPath(); c.arc(bx, by, size/2, 0, Math.PI*2); c.fill();
    }
  }

  function drawAirbrush(c: CanvasRenderingContext2D, pos: Pt, color: string, size: number) {
    c.fillStyle = color;
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * size * 3;
      c.fillRect(pos.x + Math.cos(a)*r, pos.y + Math.sin(a)*r, 1, 1);
    }
  }

  function drawSelectionRect(p1: Pt, p2: Pt) {
    const x = Math.min(p1.x,p2.x), y = Math.min(p1.y,p2.y);
    const w = Math.abs(p2.x-p1.x), h = Math.abs(p2.y-p1.y);
    setSelection({ x, y, w, h });
  }

  function drawFreeSelection(c: CanvasRenderingContext2D, points: Pt[], current: Pt) {
    if (points.length === 0) return;
    c.save();
    c.setLineDash([4, 2]);
    c.strokeStyle = "#000";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => c.lineTo(point.x, point.y));
    c.lineTo(current.x, current.y);
    c.stroke();
    c.restore();
  }

  // ── Mouse handlers ────────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = canvasPos(e);
    const c = ctx();
    if (!c) return;
    const right = e.button === 2;
    const color = right ? bgRef.current : fgRef.current;
    const t     = toolRef.current;

    if (t === "eyedropper") {
      const d = c.getImageData(pos.x, pos.y, 1, 1).data;
      const hex = "#" + [d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,"0")).join("");
      if (right) {
        setBgColor(hex);
      } else {
        setFgColor(hex);
      }
      return;
    }
    if (t === "fill") {
      saveSnap();
      const img = c.getImageData(0, 0, CW, CH);
      floodFill(img.data, CW, CH, pos.x, pos.y, color);
      c.putImageData(img, 0, 0);
      return;
    }
    if (t === "zoom") {
      setZoomLevel((z) => {
        if (right) return Math.max(1, z / 2);
        if (z >= 8) return 1;
        return Math.min(8, z * 2);
      });
      return;
    }
    if (t === "text") {
      setTextInput({ pos, value: "" });
      return;
    }
    if (t === "polygon") {
      if (!isDrawing.current) {
        saveSnap();
        isDrawing.current = true;
        polyPoints.current = [pos];
      } else {
        polyPoints.current = [...polyPoints.current, pos];
      }
      return;
    }
    if (t === "curve") {
      if (curvePhase.current === 0) {
        saveSnap();
        curvePoints.current.p1 = pos;
        curvePoints.current.p2 = pos;
        curvePhase.current = 1;
        isDrawing.current = true;
      } else if (curvePhase.current === 2) {
        // Finalize
        curvePhase.current = 0;
        isDrawing.current = false;
      }
      return;
    }
    if (t === "select-free") {
      saveSnap();
      isDrawing.current = true;
      startPos.current = pos;
      lastPos.current = pos;
      freeSelectPoints.current = [pos];
      return;
    }
    if (t === "pencil") {
      saveSnap();
      isDrawing.current = true;
      startPos.current = pos; lastPos.current = pos;
      applyStroke(c, color, 1);
      c.beginPath(); c.moveTo(pos.x, pos.y);
      return;
    }
    saveSnap();
    isDrawing.current = true;
    startPos.current = pos; lastPos.current = pos;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = canvasPos(e);
    setCoords(pos);
    if (!isDrawing.current) return;
    const c = ctx();
    if (!c) return;
    const right  = (e.buttons & 2) === 2;
    const color  = right ? bgRef.current : fgRef.current;
    const size   = px(sizeRef.current);
    const t      = toolRef.current;
    const fill   = shapeFillRef.current;

    switch (t) {
      case "pencil":
        c.lineTo(pos.x, pos.y); c.stroke();
        break;
      case "brush":
        drawBrushStroke(c, lastPos.current, pos, color, size * 2);
        break;
      case "eraser":
        drawBrushStroke(c, lastPos.current, pos, bgRef.current, size * 3);
        break;
      case "airbrush":
        drawAirbrush(c, pos, color, size);
        break;
      case "line":
        restoreSnap();
        drawLine(c, startPos.current, pos, color, size);
        break;
      case "rect":
        restoreSnap();
        drawRect(c, startPos.current, pos, fgRef.current, bgRef.current, fill, size);
        break;
      case "ellipse":
        restoreSnap();
        drawEllipse(c, startPos.current, pos, fgRef.current, bgRef.current, fill, size);
        break;
      case "rounded-rect":
        restoreSnap();
        drawRect(c, startPos.current, pos, fgRef.current, bgRef.current, fill, size, 12);
        break;
      case "select-rect":
        drawSelectionRect(startPos.current, pos);
        break;
      case "select-free":
        freeSelectPoints.current = [...freeSelectPoints.current, pos];
        restoreSnap();
        drawFreeSelection(c, freeSelectPoints.current, pos);
        break;
      case "curve":
        if (curvePhase.current === 1) {
          curvePoints.current.p2 = pos;
          restoreSnap();
          drawLine(c, curvePoints.current.p1, pos, fgRef.current, size);
        } else if (curvePhase.current === 2) {
          curvePoints.current.cp = pos;
          restoreSnap();
          const { p1, p2, cp } = curvePoints.current;
          c.save(); applyStroke(c, fgRef.current, size);
          c.beginPath(); c.moveTo(p1.x,p1.y);
          c.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y); c.stroke();
          c.restore();
        }
        break;
      case "polygon":
        if (polyPoints.current.length > 0) {
          restoreSnap();
          c.save(); applyStroke(c, fgRef.current, size);
          c.beginPath(); c.moveTo(polyPoints.current[0].x, polyPoints.current[0].y);
          polyPoints.current.slice(1).forEach(p => c.lineTo(p.x, p.y));
          c.lineTo(pos.x, pos.y); c.stroke(); c.restore();
        }
        break;
    }
    lastPos.current = pos;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const pos = canvasPos(e);
    const c = ctx();
    if (!c) return;
    const right = e.button === 2;
    const color = right ? bgRef.current : fgRef.current;
    const size  = px(sizeRef.current);
    const t     = toolRef.current;
    const fill  = shapeFillRef.current;

    if (t === "curve") {
      if (curvePhase.current === 1) {
        curvePoints.current.p2 = pos;
        curvePhase.current = 2;
        // Leave isDrawing = true to allow control point drag
      }
      return;
    }
    if (t === "polygon") return; // polygon commits on dblclick

    if (!isDrawing.current) return;
    isDrawing.current = false;

    switch (t) {
      case "pencil":
        c.stroke(); break;
      case "line":
        restoreSnap(); drawLine(c, startPos.current, pos, color, size); break;
      case "rect":
        restoreSnap(); drawRect(c, startPos.current, pos, fgRef.current, bgRef.current, fill, size); break;
      case "ellipse":
        restoreSnap(); drawEllipse(c, startPos.current, pos, fgRef.current, bgRef.current, fill, size); break;
      case "rounded-rect":
        restoreSnap(); drawRect(c, startPos.current, pos, fgRef.current, bgRef.current, fill, size, 12); break;
      case "select-rect":
        drawSelectionRect(startPos.current, pos); break;
      case "select-free": {
        const points = freeSelectPoints.current;
        if (points.length > 0) {
          const allX = points.map((point) => point.x);
          const allY = points.map((point) => point.y);
          const minX = Math.min(...allX);
          const maxX = Math.max(...allX);
          const minY = Math.min(...allY);
          const maxY = Math.max(...allY);
          setSelection({ x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) });
          restoreSnap();
        }
        freeSelectPoints.current = [];
        break;
      }
    }
  };

  const onDoubleClick = () => {
    const c = ctx();
    if (toolRef.current === "polygon" && c && polyPoints.current.length >= 2) {
      const fill = shapeFillRef.current;
      const size = px(sizeRef.current);
      restoreSnap();
      c.save(); c.lineWidth = size;
      c.beginPath(); c.moveTo(polyPoints.current[0].x, polyPoints.current[0].y);
      polyPoints.current.slice(1).forEach(p => c.lineTo(p.x,p.y));
      c.closePath();
      if (fill === 1 || fill === 2) { c.fillStyle = fill===2?fgRef.current:bgRef.current; c.fill(); }
      if (fill !== 2) { c.strokeStyle = fgRef.current; c.stroke(); }
      c.restore();
      isDrawing.current = false; polyPoints.current = [];
    }
    if (toolRef.current === "curve" && curvePhase.current === 2) {
      curvePhase.current = 0; isDrawing.current = false;
    }
  };

  // ── Text commit ───────────────────────────────────────────────────────────────
  const commitText = () => {
    if (!textInput) return;
    const c = ctx(); if (!c) return;
    if (textInput.value.trim()) {
      saveSnap();
      c.fillStyle = fgRef.current;
      c.font = "bold 18px Arial, sans-serif";
      c.fillText(textInput.value, textInput.pos.x, textInput.pos.y + 16);
    }
    setTextInput(null);
  };

  // ── File ops ───────────────────────────────────────────────────────────────────
  const newCanvas = useCallback(() => {
    saveSnap();
    const c = ctx(); if (!c) return;
    c.fillStyle = "#FFFFFF"; c.fillRect(0,0,CW,CH);
    setSelection(null);
  }, [saveSnap]);

  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement("a");
    a.download = "untitled.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }, []);

  const openFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const c = ctx(); if (!c) return;
      saveSnap();
      c.fillStyle = "#FFFFFF"; c.fillRect(0,0,CW,CH);
      c.drawImage(img, 0, 0, Math.min(img.width, CW), Math.min(img.height, CH));
      URL.revokeObjectURL(url);
    };
    img.src = url;
    e.target.value = "";
  };

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
      if ((e.ctrlKey||e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey||e.metaKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) { e.preventDefault(); redo(); }
      if ((e.ctrlKey||e.metaKey) && e.key === "s") { e.preventDefault(); saveCanvas(); }
      if ((e.ctrlKey||e.metaKey) && e.key === "n") { e.preventDefault(); newCanvas(); }
      if (e.key === "Escape") {
        setTextInput(null);
        isDrawing.current = false;
        polyPoints.current = [];
        curvePhase.current = 0;
        setSelection(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    }, [newCanvas, redo, saveCanvas, undo]);

  // ── Cursor ─────────────────────────────────────────────────────────────────────
  const cursor: Record<Tool, string> = {
    "pencil": "crosshair", "brush": "crosshair", "eraser": "cell",
    "fill": "crosshair", "eyedropper": "crosshair", "zoom": "zoom-in",
    "text": "text", "line": "crosshair", "curve": "crosshair",
    "rect": "crosshair", "ellipse": "crosshair", "rounded-rect": "crosshair",
    "polygon": "crosshair", "airbrush": "crosshair",
    "select-rect": "default", "select-free": "default",
  };

  // ── Win95 3D border helpers ────────────────────────────────────────────────────
  const raised: React.CSSProperties = {
    borderTop: "2px solid #ffffff", borderLeft: "2px solid #ffffff",
    borderRight: "2px solid #808080", borderBottom: "2px solid #808080",
  };
  const sunken: React.CSSProperties = {
    borderTop: "2px solid #808080", borderLeft: "2px solid #808080",
    borderRight: "2px solid #ffffff", borderBottom: "2px solid #ffffff",
  };

  // ─── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        height: "100%", display: "flex", flexDirection: "column",
        background: "#c0c0c0", fontFamily: "ms sans serif, Arial, sans-serif",
        fontSize: 11, userSelect: "none",
      }}
    >
      {/* ── Menu bar ── */}
      <div style={{ display: "flex", borderBottom: "1px solid #808080", padding: "1px 2px", flexShrink: 0 }}>
        {["File", "Edit", "View", "Image", "Options", "Help"].map((label) => (
          <button key={label} style={{ fontSize:11, padding:"1px 7px", background:"transparent", border:"none", cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 4px", borderBottom: "1px solid #808080", flexShrink: 0 }}>
        <button
          onClick={newCanvas}
          style={{ fontSize: 11, padding: "1px 7px", background: "#c0c0c0", cursor: "pointer", ...raised }}
        >
          New
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ fontSize: 11, padding: "1px 7px", background: "#c0c0c0", cursor: "pointer", ...raised }}
        >
          Open
        </button>
        <button
          onClick={saveCanvas}
          style={{ fontSize: 11, padding: "1px 7px", background: "#c0c0c0", cursor: "pointer", ...raised }}
        >
          Save
        </button>
        <button
          onClick={undo}
          style={{ fontSize: 11, padding: "1px 7px", background: "#c0c0c0", cursor: "pointer", ...raised }}
        >
          Undo
        </button>
        <button
          onClick={redo}
          style={{ fontSize: 11, padding: "1px 7px", background: "#c0c0c0", cursor: "pointer", ...raised }}
        >
          Redo
        </button>
        <button
          onClick={() => setSelection({ x: 0, y: 0, w: CW, h: CH })}
          style={{ fontSize: 11, padding: "1px 7px", background: "#c0c0c0", cursor: "pointer", ...raised }}
        >
          Select All
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={openFile} />

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>

        {/* ── Left toolbar ── */}
        <div style={{ width: 52, flexShrink: 0, background: "#c0c0c0", borderRight: "2px solid #808080", display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0", gap: 0 }}>
          {/* Tool grid: 2 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "24px 24px", gap: 1, padding: "2px 2px" }}>
            {TOOLS.map(({ id, label, tip }) => (
              <button
                key={id}
                title={tip}
                onClick={() => { setTool(id); setStatusTip(tip); }}
                onMouseEnter={() => setStatusTip(tip)}
                style={{
                  width: 24, height: 24,
                  fontSize: 13, fontWeight: "bold",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: 0,
                  background: "#c0c0c0",
                  ...(tool === id ? sunken : raised),
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 44, height: 2, background: "#808080", margin: "3px 0" }} />

          {/* Brush size / shape-fill options */}
          {(tool === "brush" || tool === "eraser" || tool === "airbrush" || tool === "line") && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: "2px 4px" }}>
              {BRUSH_SIZES.map((s, i) => (
                <button
                  key={i}
                  title={`Size ${s}`}
                  onClick={() => setBrushSize(i)}
                  style={{
                    width: 22, height: 22,
                    background: "#c0c0c0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", padding: 0,
                    ...(brushSize === i ? sunken : raised),
                  }}
                >
                  <div style={{ width: s, height: s, background: "#000", borderRadius: s > 4 ? "50%" : 0 }} />
                </button>
              ))}
            </div>
          )}

          {(tool === "rect" || tool === "ellipse" || tool === "rounded-rect" || tool === "polygon") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "2px 4px" }}>
              {[
                { label: "□", title: "Outline only" },
                { label: "▪□", title: "Fill + outline" },
                { label: "■", title: "Solid fill" },
              ].map(({ label, title }, i) => (
                <button
                  key={i}
                  title={title}
                  onClick={() => setShapeFill(i)}
                  style={{
                    width: 44, height: 16, fontSize: 10,
                    background: "#c0c0c0", cursor: "pointer",
                    ...(shapeFill === i ? sunken : raised),
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ width: 44, height: 2, background: "#808080", margin: "3px 0" }} />

          {/* Foreground / Background color boxes */}
          <div style={{ position: "relative", width: 38, height: 34, margin: "2px 0 4px" }}>
            {/* Background box */}
            <div
              title="Background color (right-click palette)"
              onClick={() => setBgColor(bgColor)}
              style={{
                position: "absolute", right: 0, bottom: 0,
                width: 22, height: 22,
                background: bgColor,
                ...sunken, cursor: "pointer",
              }}
            />
            {/* Foreground box */}
            <div
              title="Foreground color (left-click palette)"
              onClick={() => setFgColor(fgColor)}
              style={{
                position: "absolute", left: 0, top: 0,
                width: 22, height: 22,
                background: fgColor,
                ...raised, cursor: "pointer",
                zIndex: 1,
              }}
            />
          </div>
        </div>

        {/* ── Canvas area ── */}
        <div style={{ flex: 1, overflow: "auto", background: "#808080", display: "flex", alignItems: "flex-start", justifyContent: "flex-start" }}>
          <div
            style={{
              margin: 6,
              position: "relative",
              display: "inline-block",
              boxShadow: "2px 2px 0 #404040",
            }}
          >
            <canvas
              ref={canvasRef}
              width={CW}
              height={CH}
              style={{
                display: "block",
                cursor: cursor[tool],
                touchAction: "none",
                imageRendering: zoomLevel > 1 ? "pixelated" : "auto",
                width:  CW * zoomLevel,
                height: CH * zoomLevel,
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onDoubleClick={onDoubleClick}
              onContextMenu={e => e.preventDefault()}
            />

            {/* Selection rectangle overlay */}
            {selection && (
              <div style={{
                position: "absolute",
                left:   selection.x * zoomLevel,
                top:    selection.y * zoomLevel,
                width:  selection.w * zoomLevel,
                height: selection.h * zoomLevel,
                border: "1px dashed #000",
                outline: "1px dashed #fff",
                pointerEvents: "none",
              }} />
            )}

            {/* Text input overlay */}
            {textInput && (
              <div style={{
                position: "absolute",
                left: textInput.pos.x * zoomLevel,
                top:  textInput.pos.y * zoomLevel,
                zIndex: 10,
              }}>
                <input
                  autoFocus
                  value={textInput.value}
                  onChange={e => setTextInput({ ...textInput, value: e.target.value })}
                  onKeyDown={e => { if (e.key === "Enter") commitText(); if (e.key === "Escape") setTextInput(null); }}
                  onBlur={commitText}
                  style={{
                    background: "transparent",
                    border: "1px dashed #000",
                    outline: "none",
                    fontSize: 18 * zoomLevel,
                    fontFamily: "Arial, sans-serif",
                    fontWeight: "bold",
                    color: fgColor,
                    padding: "0 2px",
                    minWidth: 60,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Color palette row ── */}
      <div
        style={{
          flexShrink: 0,
          background: "#c0c0c0",
          borderTop: "2px solid #808080",
          padding: "3px 6px",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Current colors miniature */}
        <div style={{ position: "relative", width: 30, height: 26, marginRight: 6, flexShrink: 0 }}>
          <div style={{ position:"absolute", right:0, bottom:0, width:18, height:18, background:bgColor, ...sunken }} />
          <div style={{ position:"absolute", left:0,  top:0,    width:18, height:18, background:fgColor, ...raised, zIndex:1 }} />
        </div>

        {/* Palette swatches */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 16px)", gridTemplateRows: "16px 16px", gap: 1 }}>
          {PALETTE.map((color) => (
            <div
              key={color}
              title={color}
              onMouseDown={e => { e.preventDefault(); if (e.button===2) setBgColor(color); else setFgColor(color); }}
              onContextMenu={e => e.preventDefault()}
              style={{
                width: 16, height: 16,
                background: color,
                ...raised,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "2px solid #808080",
          display: "flex",
          alignItems: "center",
          padding: "1px 4px",
          gap: 0,
        }}
      >
        {/* Tip */}
        <div style={{ flex: 1, padding: "0 4px", fontSize: 11, borderRight: "1px solid #808080" }}>
          {statusTip}
        </div>
        {/* Coords */}
        <div style={{ ...sunken, padding: "0 8px", minWidth: 80, fontSize: 11, textAlign: "center" }}>
          {coords.x},{coords.y}
        </div>
        {/* Canvas size */}
        <div style={{ ...sunken, padding: "0 8px", minWidth: 72, fontSize: 11, textAlign: "center", marginLeft: 2 }}>
          {CW}×{CH}
        </div>
      </div>
    </div>
  );
}
