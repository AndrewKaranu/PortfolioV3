"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { useWindowStore, PhotoEntry } from "@/store/windowStore";

export const PHOTOS: PhotoEntry[] = [
  { url: "/photography/20190728-IMG_7212.jpg",    name: "IMG_7212.jpg",    date: "Jul 2019" },
  { url: "/photography/20190728-IMG_7220.jpg",    name: "IMG_7220.jpg",    date: "Jul 2019" },
  { url: "/photography/20190728-IMG_7235.jpg",    name: "IMG_7235.jpg",    date: "Jul 2019" },
  { url: "/photography/20190728-IMG_7237-2.jpg",  name: "IMG_7237.jpg",    date: "Jul 2019" },
  { url: "/photography/20190728-IMG_7243.jpg",    name: "IMG_7243.jpg",    date: "Jul 2019" },
  { url: "/photography/20190729-IMG_8284-2.jpg",  name: "IMG_8284.jpg",    date: "Jul 2019" },
  { url: "/photography/20190729-IMG_8285.jpg",    name: "IMG_8285.jpg",    date: "Jul 2019" },
  { url: "/photography/20190729-IMG_8321.jpg",    name: "IMG_8321.jpg",    date: "Jul 2019" },
  { url: "/photography/ChinaTown.png",            name: "ChinaTown.png",   date: "" },
  { url: "/photography/Corvette1.png",            name: "Corvette1.png",   date: "" },
  { url: "/photography/DSC00291.jpg",             name: "DSC00291.jpg",    date: "" },
  { url: "/photography/DSC01582.jpg",             name: "DSC01582.jpg",    date: "" },
  { url: "/photography/DSC01601.jpg",             name: "DSC01601.jpg",    date: "" },
  { url: "/photography/DSC01630.jpg",             name: "DSC01630.jpg",    date: "" },
  { url: "/photography/DSC01718.jpg",             name: "DSC01718.jpg",    date: "" },
  { url: "/photography/DSC02173.jpg",             name: "DSC02173.jpg",    date: "" },
  { url: "/photography/DSC02186.jpg",             name: "DSC02186.jpg",    date: "" },
  { url: "/photography/DSC02220.jpg",             name: "DSC02220.jpg",    date: "" },
  { url: "/photography/DSC02254.jpg",             name: "DSC02254.jpg",    date: "" },
  { url: "/photography/DSC02260.jpg",             name: "DSC02260.jpg",    date: "" },
  { url: "/photography/DSC02385.jpg",             name: "DSC02385.jpg",    date: "" },
  { url: "/photography/DSC02447.jpg",             name: "DSC02447.jpg",    date: "" },
  { url: "/photography/IMG_20190908_192254.jpg",  name: "IMG_192254.jpg",  date: "Sep 2019" },
];

export default function Photography() {
  const { openPictureViewer } = useWindowStore();
  const [selected, setSelected] = useState<string | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (event: React.MouseEvent, photo: PhotoEntry) => {
    event.stopPropagation();

    if (clickTimer.current) {
      // Second click — treat as double-click
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      openPictureViewer(photo, PHOTOS);
    } else {
      // First click — wait to see if second comes
      setSelected(photo.url);
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
      }, 300);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#c0c0c0",
        fontFamily: "ms sans serif, Arial, sans-serif",
        userSelect: "none",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "2px 4px",
          borderBottom: "2px solid #808080",
          background: "#c0c0c0",
          flexShrink: 0,
        }}
      >
        {["File", "Edit", "View", "Help"].map((m) => (
          <button
            key={m}
            style={{
              fontSize: 11,
              padding: "1px 6px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Address bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "2px 6px",
          borderBottom: "1px solid #808080",
          background: "#c0c0c0",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11 }}>📁</span>
        <div
          style={{
            flex: 1,
            background: "#fff",
            border: "2px inset #808080",
            padding: "1px 4px",
            fontSize: 11,
          }}
        >
          C:\My Photos
        </div>
      </div>

      {/* Photo grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 8,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 8,
          alignContent: "start",
        }}
      >
        {PHOTOS.map((photo) => (
          <div
            key={photo.url}
            onClick={(event) => handleClick(event, photo)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: 4,
              cursor: "pointer",
              background:
                selected === photo.url ? "#000080" : "transparent",
              border:
                selected === photo.url
                  ? "1px dotted #fff"
                  : "1px solid transparent",
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                width: 120,
                height: 90,
                background: "#808080",
                border: "2px inset #606060",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <Image
                src={photo.url}
                alt={photo.name}
                fill
                style={{ objectFit: "cover", pointerEvents: "none" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Placeholder icon if no image */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  color: "#606060",
                  pointerEvents: "none",
                }}
              >
                🖼
              </div>
            </div>
            {/* Filename */}
            <span
              style={{
                fontSize: 10,
                color: selected === photo.url ? "#fff" : "#000",
                textAlign: "center",
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                width: "100%",
              }}
            >
              {photo.name}
            </span>
            {photo.date && (
              <span
                style={{
                  fontSize: 9,
                  color: selected === photo.url ? "#ccc" : "#666",
                }}
              >
                {photo.date}
              </span>
            )}
          </div>
        ))}

        {PHOTOS.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#666",
              fontSize: 11,
              padding: 40,
            }}
          >
            <span style={{ fontSize: 32 }}>📷</span>
            <span>No photos yet.</span>
            <span style={{ color: "#888", fontSize: 10 }}>
              Add JPG/PNG files to /public/photos/ and update Photography.tsx
            </span>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        style={{
          borderTop: "2px solid #808080",
          padding: "2px 6px",
          fontSize: 10,
          color: "#000",
          display: "flex",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span>{PHOTOS.length} object(s)</span>
        <span>Double-click to open in Picture Viewer</span>
      </div>
    </div>
  );
}
