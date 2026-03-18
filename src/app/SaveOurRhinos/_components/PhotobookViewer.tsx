"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface Props {
  photos: string[];
  onBack: () => void;
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const ChevronLeft  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>;
const ChevronRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>;
const PlayIcon     = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17" /></svg>;
const PauseIcon    = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><rect x="3" y="2" width="5" height="16"/><rect x="12" y="2" width="5" height="16"/></svg>;
const HomeIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ZoomInIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
const ZoomOutIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;

// ─── Reusable icon button ─────────────────────────────────────────────────────
function IconBtn({
  onClick, disabled = false, children, title,
}: {
  onClick: () => void; disabled?: boolean; children: React.ReactNode; title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 40, height: 40,
        borderRadius: 8,
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.3 : 1,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.5)";
      }}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PhotobookViewer({ photos, onBack }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const autoplayRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentPage, setCurrentPage]   = useState(0);
  const [isAutoplay, setIsAutoplay]     = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const [zoom, setZoom]                 = useState(1);
  const [isZoomed, setIsZoomed]         = useState(false);

  const total = photos.length;

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goTo = useCallback((index: number) => {
    setCurrentPage(index);
    setAutoProgress(0);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((p) => {
      const next = Math.min(p + 1, total - 1);
      setAutoProgress(0);
      return next;
    });
  }, [total]);

  const prevPage = useCallback(() => {
    setCurrentPage((p) => {
      const prev = Math.max(p - 1, 0);
      setAutoProgress(0);
      return prev;
    });
  }, []);

  // ── Zoom ────────────────────────────────────────────────────────────────────
  const zoomIn  = useCallback(() => { setZoom((z) => Math.min(z + 0.5, 3)); setIsZoomed(true); }, []);
  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(z - 0.5, 0.5);
      if (next <= 1) setIsZoomed(false);
      return next;
    });
  }, []);
  const resetZoom = useCallback(() => { setZoom(1); setIsZoomed(false); }, []);

  // ── Autoplay ────────────────────────────────────────────────────────────────
  const AUTOPLAY_DURATION = 4000;

  useEffect(() => {
    if (autoplayRef.current) clearTimeout(autoplayRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    if (!isAutoplay) {
      setAutoProgress(0);
      return;
    }

    progressRef.current = setInterval(() => {
      setAutoProgress((p) => Math.min(p + 100 / (AUTOPLAY_DURATION / 100), 100));
    }, 100);

    autoplayRef.current = setTimeout(() => {
      if (currentPage < total - 1) {
        nextPage();
      } else {
        setIsAutoplay(false);
      }
    }, AUTOPLAY_DURATION);

    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isAutoplay, currentPage, nextPage, total]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":  prevPage(); break;
        case "ArrowRight":
        case " ":          e.preventDefault(); nextPage(); break;
        case "p": case "P": setIsAutoplay((a) => !a); break;
        case "Escape":
          if (isZoomed) resetZoom();
          else onBack();
          break;
        case "+": case "=": zoomIn(); break;
        case "-": zoomOut(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevPage, nextPage, isZoomed, resetZoom, onBack, zoomIn, zoomOut]);

  // ── Touch / swipe ────────────────────────────────────────────────────────────
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = startX - e.changedTouches[0].clientX;
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx > 0 ? nextPage() : prevPage();
      }
    };
    const el = containerRef.current;
    el?.addEventListener("touchstart", onTouchStart);
    el?.addEventListener("touchend", onTouchEnd);
    return () => {
      el?.removeEventListener("touchstart", onTouchStart);
      el?.removeEventListener("touchend", onTouchEnd);
    };
  }, [nextPage, prevPage]);

  const overallProgress = total > 1 ? (currentPage / (total - 1)) * 100 : 100;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed", inset: 0,
        background: "#000",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* ── Progress bars ─────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30 }}>
        {/* Overall progress */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.15)" }}>
          <div style={{ height: "100%", width: `${overallProgress}%`, background: "white", transition: "width 0.4s ease" }} />
        </div>
        {/* Autoplay progress */}
        {isAutoplay && (
          <div style={{ height: 3, background: "rgba(255,255,255,0.1)", marginTop: 2 }}>
            <div style={{ height: "100%", width: `${autoProgress}%`, background: "rgba(255,255,255,0.6)", transition: "width 0.1s linear" }} />
          </div>
        )}
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, right: 0,
          padding: "16px 20px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
          zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "white" }}>Save Our Rhinos</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
            A photobook by Andrew Karanu
          </div>
        </div>
        <IconBtn onClick={onBack} title="Back to home">
          <HomeIcon />
        </IconBtn>
      </div>

      {/* ── Slides ────────────────────────────────────────────────────────── */}
      {/* CSS transform replaces GSAP — same visual result, no extra dependency */}
      <div
        style={{
          display: "flex",
          height: "100%",
          width: `${total * 100}vw`,
          transform: `translateX(-${currentPage * 100}vw)`,
          transition: "transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo}
            style={{
              width: "100vw", height: "100%",
              flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "80px 40px 100px",
            }}
          >
            <div
              onClick={isZoomed ? resetZoom : zoomIn}
              style={{
                position: "relative",
                maxWidth: "min(95vw, 1400px)",
                maxHeight: "calc(100vh - 180px)",
                width: "100%", height: "100%",
                transform: `scale(${zoom})`,
                transition: "transform 0.3s ease",
                cursor: isZoomed ? "zoom-out" : "zoom-in",
              }}
            >
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                fill
                style={{ objectFit: "contain", imageRendering: "auto" }}
                sizes="100vw"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", bottom: 32, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 8,
          zIndex: 20,
        }}
      >
        <IconBtn onClick={prevPage} disabled={currentPage === 0} title="Previous (←)">
          <ChevronLeft />
        </IconBtn>
        <IconBtn onClick={() => setIsAutoplay((a) => !a)} title="Toggle autoplay (P)">
          {isAutoplay ? <PauseIcon /> : <PlayIcon />}
        </IconBtn>
        <IconBtn onClick={nextPage} disabled={currentPage === total - 1} title="Next (→)">
          <ChevronRight />
        </IconBtn>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.2)", margin: "0 4px" }} />

        <IconBtn onClick={zoomOut} disabled={zoom <= 0.5} title="Zoom out (-)">
          <ZoomOutIcon />
        </IconBtn>
        <IconBtn onClick={zoomIn} disabled={zoom >= 3} title="Zoom in (+)">
          <ZoomInIcon />
        </IconBtn>
      </div>

      {/* ── Page counter ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", bottom: 80, right: 20,
          background: "rgba(0,0,0,0.5)",
          color: "white", fontSize: 13,
          padding: "6px 12px", borderRadius: 8,
          zIndex: 20,
        }}
      >
        {currentPage + 1} / {total}
      </div>

      {/* ── Thumbnail strip ───────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: 6, zIndex: 20,
          display: "flex", gap: 2, padding: "0 2px 2px",
        }}
      >
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              flex: 1, height: "100%",
              background: i === currentPage ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
              border: "none", padding: 0, cursor: "pointer",
              borderRadius: 2,
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {/* ── Keyboard hint ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", bottom: 32, left: 20,
          color: "rgba(255,255,255,0.5)", fontSize: 11,
          zIndex: 20, lineHeight: 1.6,
          display: "none",
        }}
        className="sm:block"
      >
        ← → Navigate &nbsp;•&nbsp; Space: Next &nbsp;•&nbsp; P: Autoplay
        <br />
        Click image to zoom &nbsp;•&nbsp; +/- keys
      </div>
    </div>
  );
}
