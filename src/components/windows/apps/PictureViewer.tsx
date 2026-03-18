"use client";

import Image from "next/image";
import { useState } from "react";
import { useWindowStore, PhotoEntry } from "@/store/windowStore";
import { PHOTOS } from "./Photography";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const raised: React.CSSProperties = {
  borderTop: "2px solid #fff",
  borderLeft: "2px solid #fff",
  borderRight: "2px solid #808080",
  borderBottom: "2px solid #808080",
};
const sunken: React.CSSProperties = {
  borderTop: "2px solid #808080",
  borderLeft: "2px solid #808080",
  borderRight: "2px solid #fff",
  borderBottom: "2px solid #fff",
};

function ToolBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        width: 24,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        background: "#c0c0c0",
        cursor: "pointer",
        flexShrink: 0,
        ...(pressed ? sunken : raised),
      }}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PictureViewer() {
  const { pictureViewerPhoto, pictureViewerPhotos, openPictureViewer } =
    useWindowStore();

  // Fall back to PHOTOS if no inter-window data was set
  const photos: PhotoEntry[] =
    pictureViewerPhotos.length > 0 ? pictureViewerPhotos : PHOTOS;
  const [localPhoto, setLocalPhoto] = useState<PhotoEntry | null>(
    pictureViewerPhoto ?? (photos[0] ?? null)
  );
  const [stretch, setStretch] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [fullView, setFullView] = useState(false);
  const currentPhoto = pictureViewerPhoto ?? localPhoto;

  const currentIndex = photos.findIndex((p) => p.url === currentPhoto?.url);

  const goTo = (idx: number) => {
    const p = photos[idx];
    if (p) {
      setLocalPhoto(p);
      setZoom(1);
      openPictureViewer(p, photos);
    }
  };

  const now = new Date();
  const dateStr = `${(now.getMonth() + 1).toString().padStart(2, "0")}/${now
    .getDate()
    .toString()
    .padStart(2, "0")}/${String(now.getFullYear()).slice(2)}`;
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  if (fullView && currentPhoto) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#000",
          fontFamily: "ms sans serif, Arial, sans-serif",
          userSelect: "none",
        }}
      >
        {/* Back bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "3px 6px",
            background: "#c0c0c0",
            borderBottom: "2px solid #808080",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setFullView(false)}
            style={{
              fontSize: 11,
              padding: "2px 10px",
              background: "#c0c0c0",
              cursor: "pointer",
              fontFamily: "ms sans serif, Arial, sans-serif",
              ...raised,
            }}
          >
            ◀ Back
          </button>
          <span style={{ fontSize: 11, color: "#333" }}>
            {currentPhoto.name}
            {currentPhoto.date ? ` — ${currentPhoto.date}` : ""}
          </span>
          <div style={{ flex: 1 }} />
          <ToolBtn title="Previous" onClick={() => goTo(Math.max(0, currentIndex - 1))}>◀</ToolBtn>
          <ToolBtn title="Next" onClick={() => goTo(Math.min(photos.length - 1, currentIndex + 1))}>▶</ToolBtn>
          <span style={{ fontSize: 11, color: "#555", marginLeft: 4 }}>
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        {/* Full image */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src={currentPhoto.url}
            alt={currentPhoto.name}
            fill
            style={{ objectFit: "contain" }}
            unoptimized
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#c0c0c0",
        fontFamily: "ms sans serif, Arial, sans-serif",
        fontSize: 11,
        userSelect: "none",
      }}
    >
      {/* ── Menu bar ── */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #808080",
          padding: "1px 2px",
          flexShrink: 0,
        }}
      >
        {["File", "Edit", "Slide Show", "Help"].map((m) => (
          <button
            key={m}
            style={{
              fontSize: 11,
              padding: "1px 7px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "2px 4px",
          borderBottom: "2px solid #808080",
          flexShrink: 0,
        }}
      >
        <ToolBtn title="Open file" onClick={() => {}}>📂</ToolBtn>
        <ToolBtn title="Previous" onClick={() => goTo(Math.max(0, currentIndex - 1))}>◀</ToolBtn>
        <ToolBtn title="Next" onClick={() => goTo(Math.min(photos.length - 1, currentIndex + 1))}>▶</ToolBtn>
        <ToolBtn title="Zoom in" onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}>🔍</ToolBtn>
        <ToolBtn title="Zoom out" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}>🔎</ToolBtn>
        <div style={{ width: 1, height: 18, background: "#808080", margin: "0 2px" }} />
        <ToolBtn title="Rotate left">↺</ToolBtn>
        <ToolBtn title="Rotate right">↻</ToolBtn>
        <ToolBtn title="Print">🖨</ToolBtn>
        <ToolBtn title="Delete">🗑</ToolBtn>
      </div>

      {/* ── Main body: left panel + right display ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* ── Left panel: folder tree + file list ── */}
        <div
          style={{
            width: 160,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            borderRight: "2px solid #808080",
          }}
        >
          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom: "2px solid #808080",
              flexShrink: 0,
            }}
          >
            {["path", "filename"].map((h) => (
              <div
                key={h}
                style={{
                  padding: "1px 4px",
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#00f",
                  background: "#c0c0c0",
                  borderRight: "1px solid #808080",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Folder tree */}
          <div
            style={{
              flex: "0 0 100px",
              background: "#fff",
              ...sunken,
              padding: 4,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
              <span>📁</span>
              <span style={{ fontWeight: "bold" }}>C:\</span>
            </div>
            <div style={{ paddingLeft: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  background: "#000080",
                  color: "#fff",
                  padding: "0 2px",
                }}
              >
                <span>📂</span>
                <span>Photography</span>
              </div>
            </div>
          </div>

          {/* Drive tabs */}
          <div
            style={{
              display: "flex",
              gap: 2,
              padding: "2px 4px",
              borderBottom: "1px solid #808080",
              flexShrink: 0,
            }}
          >
            {["c", "d"].map((d) => (
              <div
                key={d}
                style={{
                  padding: "1px 6px",
                  fontSize: 11,
                  background: "#c0c0c0",
                  ...raised,
                  cursor: "pointer",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* File list */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              ...sunken,
              overflowY: "auto",
            }}
          >
            {photos.map((photo, i) => (
              <div
                key={photo.url}
                onClick={() => goTo(i)}
                style={{
                  padding: "1px 4px",
                  fontSize: 11,
                  cursor: "pointer",
                  background:
                    photo.url === currentPhoto?.url ? "#000080" : "transparent",
                  color:
                    photo.url === currentPhoto?.url ? "#fff" : "#000",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {photo.name}
              </div>
            ))}
          </div>

          {/* File type filter */}
          <div
            style={{
              padding: "2px 4px",
              borderTop: "1px solid #808080",
              flexShrink: 0,
            }}
          >
            <select
              style={{
                width: "100%",
                fontSize: 10,
                background: "#fff",
                ...sunken,
                height: 20,
              }}
            >
              <option>Image Files (*.jpg, *.png)</option>
            </select>
          </div>
        </div>

        {/* ── Right: image display ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Picture path bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 6px",
              borderBottom: "1px solid #808080",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: "bold", whiteSpace: "nowrap" }}>
              Picture Text:
            </span>
            <div
              style={{
                flex: 1,
                background: "#fff",
                ...sunken,
                padding: "1px 4px",
                fontSize: 11,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentPhoto ? `C:\\Photography\\${currentPhoto.name}` : "—"}
            </div>
            <ToolBtn title="Browse">📂</ToolBtn>
          </div>

          {/* Main image area */}
          <div
            style={{
              flex: 1,
              background: "#808080",
              ...sunken,
              margin: "4px 6px 0",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {currentPhoto ? (
              <div
                style={{
                  width: stretch ? "100%" : `${zoom * 100}%`,
                  height: stretch ? "100%" : `${zoom * 100}%`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={currentPhoto.url}
                  alt={currentPhoto.name}
                  fill
                  style={{ objectFit: stretch ? "contain" : "none" }}
                  unoptimized
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  color: "#444",
                  fontSize: 11,
                }}
              >
                <span style={{ fontSize: 32 }}>🖼</span>
                <span>No image selected</span>
              </div>
            )}
          </div>

          {/* Controls row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 6px",
              flexShrink: 0,
            }}
          >
            <button
              style={{
                fontSize: 11,
                padding: "2px 10px",
                background: "#c0c0c0",
                cursor: "pointer",
                fontFamily: "ms sans serif, Arial, sans-serif",
                ...raised,
              }}
              onClick={() => setFullView(true)}
            >
              Full View
            </button>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={stretch}
                onChange={(e) => setStretch(e.target.checked)}
                style={{ margin: 0 }}
              />
              Stretch
            </label>
            <div style={{ width: 1, height: 16, background: "#808080", margin: "0 2px" }} />
            <ToolBtn title="Zoom in" onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}>🔍+</ToolBtn>
            <ToolBtn title="Zoom out" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}>🔍−</ToolBtn>
            <div style={{ flex: 1 }} />
            <ToolBtn title="Previous" onClick={() => goTo(Math.max(0, currentIndex - 1))}>⏮</ToolBtn>
            <ToolBtn title="Prev" onClick={() => goTo(Math.max(0, currentIndex - 1))}>◀</ToolBtn>
            <ToolBtn title="Next" onClick={() => goTo(Math.min(photos.length - 1, currentIndex + 1))}>▶</ToolBtn>
            <ToolBtn title="Last" onClick={() => goTo(photos.length - 1)}>⏭</ToolBtn>
          </div>

          {/* Bottom row: thumbnail + transport + datetime */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 6px 4px",
              flexShrink: 0,
            }}
          >
            {/* Thumbnail preview */}
            <div
              style={{
                width: 70,
                height: 56,
                background: "#606060",
                ...sunken,
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {currentPhoto && (
                <Image
                  src={currentPhoto.url}
                  alt="thumb"
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              )}
            </div>

            {/* Slideshow transport */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {["⏮", "⏸", "⏹", "⏭"].map((icon, i) => (
                  <ToolBtn key={i} onClick={i === 3 ? () => goTo(photos.length - 1) : undefined}>
                    {icon}
                  </ToolBtn>
                ))}
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {["⏪", "▶", "⏩", "🔁"].map((icon, i) => (
                  <ToolBtn
                    key={i}
                    onClick={
                      i === 1
                        ? () => goTo((currentIndex + 1) % photos.length)
                        : undefined
                    }
                  >
                    {icon}
                  </ToolBtn>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Date/time + close */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 2,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  ...sunken,
                  padding: "1px 6px",
                  fontSize: 10,
                  textAlign: "right",
                  minWidth: 72,
                }}
              >
                {dateStr}
                <br />
                {timeStr}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div
        style={{
          borderTop: "2px solid #808080",
          padding: "2px 6px",
          fontSize: 10,
          display: "flex",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span>
          {currentPhoto
            ? `${currentIndex + 1} of ${photos.length}`
            : "No image"}
        </span>
        <span>
          {currentPhoto ? currentPhoto.name : ""}
        </span>
      </div>
    </div>
  );
}
