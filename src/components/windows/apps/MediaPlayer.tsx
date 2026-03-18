"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
} from "react";
import Image from "next/image";
import {
  Logo,
  Mplayer10,
  Globe,
  CdMusic,
  Folder,
  Network,
  Phone2,
  Mspaint,
  Listicon,
  Mplayer110,
} from "@react95/icons";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  type: "audio" | "video";
  url: string;
}

type NavPanel = "nowPlaying" | "library" | "guide" | "cdAudio" | "radio" | "portable" | "skin";

// ─── Playlist ─────────────────────────────────────────────────────────────────
// Audio files live in /public/music/ — they are static CDN assets, NOT bundled
// into JavaScript. The browser only fetches a file when its <audio> src is set
// and the user presses play, so only one ~3-5 MB track is streamed at a time.

const DEFAULT_TRACKS: Track[] = [
  { id: "1",  title: "Hot Slow",       artist: "Berlioz",      cover: "/music/hot-slow.jpg",      type: "audio", url: "/music/hot-slow.mp3" },
  { id: "2",  title: "Dance On Me",    artist: "",             cover: "/music/dance-on-me.jpg",   type: "audio", url: "/music/dance-on-me.mp3" },
  { id: "3",  title: "Left For USA",   artist: "",             cover: "/music/left-for-usa.jpg",  type: "audio", url: "/music/left-for-usa.mp3" },
  { id: "4",  title: "Throw It In",    artist: "Lil Wayne",    cover: "/music/throw-it-in.jpg",   type: "audio", url: "/music/throw-it-in.mp3" },
  { id: "5",  title: "Locked In Love", artist: "Saam Sultan",  cover: "/music/locked-in-love.jpg",type: "audio", url: "/music/locked-in-love.mp3" },
  { id: "6",  title: "Midnight Train", artist: "Sauti Sol",    cover: "/music/midnight-train.jpg",type: "audio", url: "/music/midnight-train.mp3" },
  { id: "7",  title: "Bleu",           artist: "Pierre Bourne",cover: "/music/bleu.jpg",          type: "audio", url: "/music/bleu.mp3" },
  { id: "8",  title: "Ebasini",        artist: "Tyler ICU",    cover: "/music/ebasini.jpg",       type: "audio", url: "/music/ebasini.mp3" },
  { id: "9",  title: "Lucid Dreams",   artist: "Juice WRLD",   cover: "/music/lucid-dreams.jpg",  type: "audio", url: "/music/lucid-dreams.mp3" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const raised: React.CSSProperties = {
  borderTop: "2px solid #e8e8e8",
  borderLeft: "2px solid #e8e8e8",
  borderRight: "2px solid #606060",
  borderBottom: "2px solid #606060",
};
const sunken: React.CSSProperties = {
  borderTop: "2px solid #606060",
  borderLeft: "2px solid #606060",
  borderRight: "2px solid #e8e8e8",
  borderBottom: "2px solid #e8e8e8",
};

// ─── SVG Transport Icons ──────────────────────────────────────────────────────

const PlayIcon  = () => <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><polygon points="1,0 11,6 1,12"/></svg>;
const PauseIcon = () => <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><rect x="0" y="0" width="4" height="12"/><rect x="7" y="0" width="4" height="12"/></svg>;
const StopIcon  = () => <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor"><rect x="0" y="0" width="11" height="11"/></svg>;
const PrevIcon  = () => <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor"><polygon points="14,0 6,6 14,12"/><rect x="0" y="0" width="4" height="12"/></svg>;
const NextIcon  = () => <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor"><polygon points="0,0 8,6 0,12"/><rect x="10" y="0" width="4" height="12"/></svg>;
const RwdIcon   = () => <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor"><polygon points="14,0 8,6 14,12"/><polygon points="7,0 1,6 7,12"/></svg>;
const FfwdIcon  = () => <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor"><polygon points="0,0 6,6 0,12"/><polygon points="7,0 13,6 7,12"/></svg>;
const VolumeIcon = ({ muted }: { muted: boolean }) => (
  <svg width="16" height="13" viewBox="0 0 16 13" fill="currentColor">
    <polygon points="0,4 4,4 8,0 8,13 4,9 0,9"/>
    {!muted && <path d="M10,2 Q14,6.5 10,11" stroke="currentColor" strokeWidth="1.5" fill="none"/>}
    {muted  && <><line x1="10" y1="2" x2="15" y2="11" stroke="currentColor" strokeWidth="1.5"/><line x1="15" y1="2" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5"/></>}
  </svg>
);

// ─── Nav Sidebar ──────────────────────────────────────────────────────────────

const NAV_ITEMS: [NavPanel, string, React.ReactNode][] = [
  ["nowPlaying", "Now\nPlaying",    <Mplayer10 key="np"  variant="16x16_4" />],
  ["library",    "Media\nLibrary",  <Folder    key="lib" variant="16x16_4" />],
  ["guide",      "Media\nGuide",    <Globe     key="g"   variant="16x16_4" />],
  ["cdAudio",    "CD\nAudio",       <CdMusic   key="cd"  variant="16x16_4" />],
  ["radio",      "Radio\nTuner",    <Network   key="rad" variant="16x16_4" />],
  ["portable",   "Portable\nDevice",<Phone2    key="por" variant="16x16_4" />],
  ["skin",       "Skin\nChooser",   <Mspaint   key="sk"  variant="16x16_4" />],
];

// ─── Vinyl Library ────────────────────────────────────────────────────────────

function VinylDisc() {
  return (
    <div style={{
      width: "100%", height: "100%", borderRadius: "50%",
      background: `
        radial-gradient(circle at 50% 50%, #888 0%, #888 4%, #1a1a1a 4.5%,
          #1a1a1a 20%, #2a2a2a 21%, #1a1a1a 23%,
          #1a1a1a 35%, #2a2a2a 36%, #1a1a1a 38%,
          #1a1a1a 50%, #2a2a2a 51%, #1a1a1a 53%,
          #1a1a1a 65%, #2a2a2a 66%, #1a1a1a 68%,
          #0d0d0d 68%, #0d0d0d 100%)
      `,
      boxShadow: "0 2px 8px rgba(0,0,0,0.8)",
    }} />
  );
}

function VinylCard({ track, index, isActive, isPlaying, onPlay }: {
  track: Track; index: number; isActive: boolean; isPlaying: boolean;
  onPlay: (index: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const slideOut = hovered || (isActive && isPlaying);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(index)}
      title={`${track.artist ? track.artist + " — " : ""}${track.title}`}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", width: 110 }}
    >
      {/* Record + cover assembly */}
      <div style={{ position: "relative", width: 110, height: 96, flexShrink: 0 }}>
        {/* Vinyl disc — slides out to the right on hover */}
        <div style={{
          position: "absolute",
          left: slideOut ? 38 : 18,
          top: 0,
          width: 96, height: 96,
          transition: "left 0.22s ease",
          zIndex: 0,
          filter: isActive ? "drop-shadow(0 0 6px rgba(140,100,255,0.7))" : "none",
        }}>
          <VinylDisc />
        </div>
        {/* Album cover */}
        <div style={{
          position: "absolute",
          left: 0, top: 0,
          width: 84, height: 84,
          zIndex: 1,
          outline: isActive ? "2px solid #6644ff" : hovered ? "2px solid #888" : "2px solid #333",
          transition: "outline 0.15s",
          overflow: "hidden",
          boxShadow: isActive ? "0 0 12px rgba(100,68,255,0.5)" : "2px 2px 6px rgba(0,0,0,0.7)",
          marginTop: 6,
        }}>
          {track.cover
            ? <Image src={track.cover} alt={track.title} fill style={{ objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "#222", display: "flex", alignItems: "center", justifyContent: "center" }}><CdMusic variant="32x32_4" /></div>
          }
          {/* Now-playing overlay */}
          {isActive && isPlaying && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="white" style={{ filter: "drop-shadow(0 0 3px #fff)" }}>
                <polygon points="5,3 19,11 5,19" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Track info */}
      <div style={{ width: "100%", textAlign: "center" }}>
        <div style={{
          fontSize: 10, fontWeight: "bold",
          color: isActive ? "#d0c0ff" : "#ddd",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          maxWidth: 108,
        }}>
          {track.title}
        </div>
        {track.artist && (
          <div style={{ fontSize: 9, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 108 }}>
            {track.artist}
          </div>
        )}
      </div>
    </div>
  );
}

function VinylLibrary({ playlist, currentIndex, isPlaying, onPlay }: {
  playlist: Track[]; currentIndex: number; isPlaying: boolean;
  onPlay: (index: number) => void;
}) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(160deg, #1a1008 0%, #120c04 50%, #0e0a04 100%)",
      overflowY: "auto",
      padding: "14px 12px",
    }}>
      {/* Shelf header */}
      <div style={{
        fontSize: 9, letterSpacing: 3, textTransform: "uppercase",
        color: "#5a4a2a", marginBottom: 14, fontFamily: "ms sans serif, Arial, sans-serif",
        borderBottom: "1px solid #2a1e0a", paddingBottom: 6,
      }}>
        My Vinyl Collection — {playlist.length} records
      </div>

      {/* Vinyl grid */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "18px 10px",
      }}>
        {playlist.map((track, i) => (
          <VinylCard
            key={track.id}
            track={track}
            index={i}
            isActive={i === currentIndex}
            isPlaying={isPlaying}
            onPlay={onPlay}
          />
        ))}
      </div>

      {/* Shelf edge decoration */}
      <div style={{ marginTop: 20, height: 4, background: "linear-gradient(to right, #3a2810, #6a4820, #3a2810)", borderRadius: 2, opacity: 0.6 }} />

      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0e0a04; }
        ::-webkit-scrollbar-thumb { background: #3a2810; border-radius: 4px; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function NavBtn({ label, icon, active, onClick }: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", height: 62,
        display: "flex", alignItems: "center",
        padding: 0, gap: 0,
        background: active
          ? "linear-gradient(to bottom, #a8a8a8, #c0c0c0)"
          : hovered
          ? "linear-gradient(to bottom, #d8d8d8, #c8c8c8)"
          : "linear-gradient(to bottom, #c8c8c8, #b8b8b8)",
        borderTop: active ? "2px solid #606060" : "2px solid #e0e0e0",
        borderBottom: active ? "2px solid #e0e0e0" : "2px solid #707070",
        borderLeft: "none", borderRight: "none",
        cursor: "pointer", flexShrink: 0,
      }}
    >
      <div style={{
        width: 48, height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, borderRight: "1px solid #aaa",
        background: active
          ? "linear-gradient(to bottom, #989898, #b0b0b0)"
          : "linear-gradient(to bottom, #c0c0c0, #b0b0b0)",
      }}>
        {icon}
      </div>
      <div style={{
        flex: 1, fontSize: 10,
        fontFamily: "ms sans serif, Arial, sans-serif",
        fontWeight: "bold", color: active ? "#000" : "#222",
        textAlign: "center", lineHeight: 1.3, whiteSpace: "pre-line",
      }}>
        {label}
      </div>
    </button>
  );
}

// ─── Chrome Sphere Button ─────────────────────────────────────────────────────

function SphereBtn({ children, onClick, title, size = 44 }: {
  children: React.ReactNode; onClick?: () => void; title?: string; size?: number;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      title={title} onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: pressed
          ? "radial-gradient(circle at 60% 65%, #f0f0f0, #909090 45%, #585858)"
          : "radial-gradient(circle at 35% 35%, #f8f8f8, #b0b0b0 45%, #686868)",
        border: pressed ? "2px solid #505050" : "2px solid #808080",
        boxShadow: pressed
          ? "inset 2px 2px 5px rgba(0,0,0,0.4)"
          : "2px 2px 6px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "#222",
        fontSize: size > 38 ? 18 : 14, flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function FlatBtn({ children, onClick, title }: {
  children: React.ReactNode; onClick?: () => void; title?: string;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      title={title} onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: "none", border: "none", padding: "2px 5px",
        cursor: "pointer", color: pressed ? "#666" : "#333",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, opacity: pressed ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ─── Visualizer ───────────────────────────────────────────────────────────────

function Visualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 32, padding: "3px 6px", background: "#0a140a" }}>
      {Array.from({ length: 24 }, (_, i) => (
        <div key={i} style={{
          flex: 1,
          background: isPlaying ? `hsl(${105 + i * 3}, 80%, 42%)` : "#1a2e1a",
          borderRadius: 1,
          animation: isPlaying ? `wmpBar${(i % 5) + 1} ${0.35 + (i % 7) * 0.07}s ease-in-out infinite alternate` : "none",
          height: isPlaying ? `${25 + Math.sin(i) * 18}%` : "10%",
          transition: "height 0.3s",
        }} />
      ))}
      <style>{`
        @keyframes wmpBar1 { 0%{height:12%} 100%{height:85%} }
        @keyframes wmpBar2 { 0%{height:28%} 100%{height:65%} }
        @keyframes wmpBar3 { 0%{height:8%}  100%{height:92%} }
        @keyframes wmpBar4 { 0%{height:38%} 100%{height:72%} }
        @keyframes wmpBar5 { 0%{height:18%} 100%{height:78%} }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MediaPlayer() {
  const audioRef    = useRef<HTMLAudioElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const fileInputRef= useRef<HTMLInputElement>(null);

  const [playlist, setPlaylist]     = useState<Track[]>(DEFAULT_TRACKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const [volume, setVolume]         = useState(0.8);
  const [isMuted, setIsMuted]       = useState(false);
  const [activeNav, setActiveNav]   = useState<NavPanel>("nowPlaying");
  const [isLooping, setIsLooping]   = useState(false);
  const [isShuffle, setIsShuffle]   = useState(false);
  const [hasError, setHasError]     = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const currentTrack = playlist[currentIndex];
  const isVideo = currentTrack?.type === "video";

  useEffect(() => {
    const el = isVideo ? videoRef.current : audioRef.current;
    if (!el) return;
    el.volume = isMuted ? 0 : volume;
    el.loop = isLooping;
  }, [volume, isMuted, isLooping, isVideo]);

  const play = useCallback(async () => {
    const el = isVideo ? videoRef.current : audioRef.current;
    if (!el) return;
    try { await el.play(); setIsPlaying(true); setHasError(false); }
    catch { setHasError(true); }
  }, [isVideo]);

  const pause = useCallback(() => {
    (isVideo ? videoRef.current : audioRef.current)?.pause();
    setIsPlaying(false);
  }, [isVideo]);

  const stop = useCallback(() => {
    const el = isVideo ? videoRef.current : audioRef.current;
    if (!el) return;
    el.pause(); el.currentTime = 0;
    setIsPlaying(false); setCurrentTime(0);
  }, [isVideo]);

  const nextTrack = useCallback(() => {
    setCurrentIndex(isShuffle ? Math.floor(Math.random() * playlist.length) : (i) => (i + 1) % playlist.length);
    setIsPlaying(false);
  }, [isShuffle, playlist.length]);

  const prevTrack = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + playlist.length) % playlist.length);
    setIsPlaying(false);
  }, [playlist.length]);

  const seek = (e: ChangeEvent<HTMLInputElement>) => {
    const el = isVideo ? videoRef.current : audioRef.current;
    if (!el) return;
    const t = parseFloat(e.target.value);
    el.currentTime = t; setCurrentTime(t);
  };

  const handleTimeUpdate = () => {
    const el = isVideo ? videoRef.current : audioRef.current;
    if (!el) return;
    setCurrentTime(el.currentTime); setDuration(el.duration || 0);
  };

  const handleEnded = () => { if (!isLooping) nextTrack(); };

  const handleFileOpen = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newTracks: Track[] = files.map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      title: f.name.replace(/\.[^.]+$/, ""),
      artist: "Local File",
      cover: "",
      type: f.type.startsWith("video") ? "video" : "audio",
      url: URL.createObjectURL(f),
    }));
    setPlaylist((prev) => [...prev, ...newTracks]);
    setCurrentIndex(playlist.length);
  };

  const silverBg = "linear-gradient(160deg, #d0d0d0 0%, #c0c0c0 40%, #b8b8b8 100%)";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#c0c0c0", fontFamily: "ms sans serif, Arial, sans-serif", userSelect: "none" }}>

      {/* Menu bar */}
      <div style={{ display: "flex", background: "#c0c0c0", borderBottom: "1px solid #808080", padding: "1px 2px", flexShrink: 0 }}>
        {["File", "View", "Play", "Tools", "Help"].map((m) => (
          <button key={m} style={{ fontSize: 11, fontFamily: "ms sans serif, Arial, sans-serif", padding: "1px 7px", background: "transparent", border: "none", cursor: "pointer", color: "#000" }}>{m}</button>
        ))}
      </div>

      {/* Player body */}
      <div style={{ flex: 1, background: silverBg, display: "flex", flexDirection: "column", padding: 6, gap: 4, overflow: "hidden", ...raised }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 144 }}>
          {([
            { icon: <Mplayer110 variant="16x16_4" />, tip: "Equalizer" },
            { icon: <Listicon   variant="16x16_4" />, tip: "Playlist Editor", action: () => setShowPlaylist((v) => !v) },
            { icon: <Mspaint    variant="16x16_4" />, tip: "Skin Chooser",    action: () => setActiveNav("skin") },
          ] as { icon: React.ReactNode; tip: string; action?: () => void }[]).map((btn, i) => (
            <button key={i} title={btn.tip} onClick={btn.action} style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #e8e8e8, #b0b0b0 50%, #808080)",
              border: "2px solid #707070",
              boxShadow: "1px 1px 3px rgba(0,0,0,0.3), inset 1px 1px 1px rgba(255,255,255,0.6)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {btn.icon}
            </button>
          ))}
          <div style={{ width: 6 }} />
          {/* Track name field */}
          <div style={{ flex: 1, height: 22, background: "#fff", display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 11, color: "#333", overflow: "hidden", ...sunken }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentTrack ? `${currentTrack.artist ? currentTrack.artist + " — " : ""}${currentTrack.title}` : "No media loaded"}
            </span>
          </div>
          <button onClick={() => fileInputRef.current?.click()} title="Open file" style={{ fontSize: 11, padding: "2px 8px", height: 22, background: "#c0c0c0", cursor: "pointer", fontFamily: "ms sans serif, Arial, sans-serif", flexShrink: 0, ...raised }}>
            Open
          </button>
          <input ref={fileInputRef} type="file" accept="audio/*,video/*" multiple style={{ display: "none" }} onChange={handleFileOpen} />
        </div>

        {/* Content row */}
        <div style={{ flex: 1, display: "flex", gap: 4, minHeight: 0 }}>

          {/* Left nav sidebar */}
          <div style={{ width: 140, flexShrink: 0, display: "flex", flexDirection: "column", background: "linear-gradient(to right, #b8b8b8, #c8c8c8)", ...sunken, overflow: "hidden" }}>
            {NAV_ITEMS.map(([key, label, icon]) => (
              <NavBtn key={key} label={label} icon={icon} active={activeNav === key} onClick={() => setActiveNav(key)} />
            ))}
          </div>

          {/* Center display */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, gap: 0 }}>
            <div style={{ flex: 1, background: "#000", borderRadius: 6, position: "relative", overflow: "hidden", ...sunken, boxShadow: "inset 4px 4px 10px rgba(0,0,0,0.9)" }}>

              {/* Vinyl library overlay */}
              {activeNav === "library" && (
                <VinylLibrary
                  playlist={playlist}
                  currentIndex={currentIndex}
                  isPlaying={isPlaying}
                  onPlay={(i) => {
                    setCurrentIndex(i);
                    setIsPlaying(false);
                    setActiveNav("nowPlaying");
                    setTimeout(() => play(), 80);
                  }}
                />
              )}

              {/* Video element */}
              <video ref={videoRef} src={isVideo ? currentTrack?.url : undefined}
                onTimeUpdate={handleTimeUpdate} onEnded={handleEnded}
                onLoadedMetadata={handleTimeUpdate} onError={() => setHasError(true)}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: isVideo && activeNav !== "library" ? "block" : "none" }}
              />
              {/* Hidden audio element */}
              <audio ref={audioRef} src={!isVideo ? currentTrack?.url : undefined}
                onTimeUpdate={handleTimeUpdate} onEnded={handleEnded}
                onLoadedMetadata={handleTimeUpdate} onError={() => setHasError(true)}
              />

              {/* Audio display: album art */}
              {!isVideo && currentTrack && activeNav !== "library" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
                  {currentTrack.cover ? (
                    <div style={{
                      width: 130, height: 130, flexShrink: 0, position: "relative",
                      boxShadow: isPlaying ? "0 0 28px rgba(100,80,255,0.5)" : "0 4px 16px rgba(0,0,0,0.8)",
                      borderRadius: 2,
                      animation: isPlaying ? "wmpPulse 2s ease-in-out infinite alternate" : "none",
                      transition: "box-shadow 0.4s",
                    }}>
                      <Image src={currentTrack.cover} alt={currentTrack.title} fill style={{ objectFit: "cover", borderRadius: 2 }} />
                    </div>
                  ) : (
                    <div style={{
                      width: 110, height: 110, borderRadius: "50%",
                      background: isPlaying
                        ? "radial-gradient(circle at 35% 35%, #6644ff 0%, #220066 50%, #000 100%)"
                        : "radial-gradient(circle, #1a1a2a 0%, #0a0a0a 100%)",
                      animation: isPlaying ? "wmpPulse 1.2s ease-in-out infinite alternate" : "none",
                      boxShadow: isPlaying ? "0 0 40px #4433ff66" : "none",
                      transition: "all 0.5s",
                    }} />
                  )}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: "bold", color: "#fff" }}>{currentTrack.title}</div>
                    {currentTrack.artist && <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{currentTrack.artist}</div>}
                  </div>
                </div>
              )}

              {hasError && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ff4444", fontSize: 11, gap: 6 }}>
                  <span style={{ fontSize: 20, color: "#ff4444" }}>!</span>
                  <span>Cannot open file.</span>
                </div>
              )}

              <style>{`@keyframes wmpPulse { 0%{transform:scale(0.97);opacity:0.85} 100%{transform:scale(1.03);opacity:1} }`}</style>
            </div>

            <Visualizer isPlaying={isPlaying && !isVideo} />
          </div>

          {/* Playlist panel */}
          {showPlaylist && (
            <div style={{ width: 160, flexShrink: 0, display: "flex", flexDirection: "column", ...sunken, background: "#f0f0f0" }}>
              <div style={{ padding: "3px 5px", fontSize: 10, fontWeight: "bold", background: "#d0d0d0", borderBottom: "1px solid #aaa", display: "flex", justifyContent: "space-between" }}>
                <span>Playlist</span><span style={{ color: "#666" }}>{playlist.length}</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {playlist.map((track, i) => (
                  <div key={track.id}
                    onDoubleClick={() => { setCurrentIndex(i); setIsPlaying(false); setTimeout(() => play(), 80); }}
                    style={{ padding: "3px 5px", fontSize: 10, background: i === currentIndex ? "#0000aa" : "transparent", color: i === currentIndex ? "#fff" : "#000", cursor: "pointer", borderBottom: "1px solid #ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {i === currentIndex && isPlaying ? "▶ " : ""}{track.title}
                  </div>
                ))}
              </div>
              <div style={{ padding: "3px", display: "flex", gap: 2, borderTop: "1px solid #aaa", background: "#d0d0d0" }}>
                {[
                  { label: "+", tip: "Add",     action: () => fileInputRef.current?.click() },
                  { label: "−", tip: "Remove",  action: () => { setPlaylist((p) => p.filter((_, idx) => idx !== currentIndex)); setCurrentIndex((i) => Math.max(0, i - 1)); } },
                  { label: "⇄", tip: "Shuffle", action: () => setIsShuffle((s) => !s) },
                  { label: "↺", tip: "Loop",    action: () => setIsLooping((l) => !l) },
                ].map(({ label, tip, action }) => (
                  <button key={tip} title={tip} onClick={action} style={{ flex: 1, height: 18, fontSize: 11, cursor: "pointer", background: "#c0c0c0", ...raised }}>{label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seek / status area */}
        <div style={{ background: "#000", padding: "2px 6px 0", ...sunken }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: isPlaying ? "#00ff00" : "#006600", flexShrink: 0, boxShadow: isPlaying ? "0 0 5px #00ff00" : "none", display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "#00cc00", fontFamily: "Courier New, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                {isPlaying ? `${currentTrack?.title ?? "Unknown"}` : hasError ? "Error — Cannot play file" : currentTrack ? currentTrack.title : "Windows Media Player"}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#00cc00", fontFamily: "Courier New, monospace", flexShrink: 0, marginLeft: 8 }}>
              {formatTime(currentTime)}{duration > 0 ? ` / ${formatTime(duration)}` : ""}
            </span>
          </div>
          <input type="range" min={0} max={duration || 100} value={currentTime} step={0.1} onChange={seek}
            style={{ width: "100%", height: 4, accentColor: "#00cc00", cursor: "pointer", display: "block", marginBottom: 3 }} />
        </div>

        {/* Transport controls */}
        <div style={{ background: silverBg, display: "flex", alignItems: "center", gap: 4, padding: "4px 6px", flexShrink: 0 }}>
          {/* WMP logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginRight: 4, flexShrink: 0, width: 44 }}>
            <Logo variant="16x16_4" />
            <div style={{ fontSize: 7, color: "#333", textAlign: "center", lineHeight: 1.1, marginTop: 1, fontWeight: "bold" }}>Windows<br />Media</div>
          </div>

          {/* Play/Pause sphere */}
          <SphereBtn title={isPlaying ? "Pause" : "Play"} onClick={isPlaying ? pause : play} size={48}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </SphereBtn>

          {/* Stop sphere */}
          <SphereBtn title="Stop" onClick={stop} size={34}>
            <StopIcon />
          </SphereBtn>

          {/* Volume */}
          <FlatBtn title={isMuted ? "Unmute" : "Mute"} onClick={() => setIsMuted((m) => !m)}>
            <VolumeIcon muted={isMuted} />
          </FlatBtn>
          <input type="range" min={0} max={1} step={0.02} value={isMuted ? 0 : volume}
            onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); const el = isVideo ? videoRef.current : audioRef.current; if (el) el.volume = parseFloat(e.target.value); }}
            style={{ width: 64, accentColor: "#555", cursor: "pointer" }} />

          {/* Separator */}
          <div style={{ width: 1, height: 24, background: "#808080", margin: "0 4px", flexShrink: 0 }} />
          <div style={{ width: 1, height: 24, background: "#e0e0e0", flexShrink: 0 }} />

          {/* Transport row */}
          <FlatBtn title="Previous" onClick={prevTrack}><PrevIcon /></FlatBtn>
          <FlatBtn title="Rewind 5s" onClick={() => { const el = isVideo ? videoRef.current : audioRef.current; if (el) el.currentTime = Math.max(0, el.currentTime - 5); }}><RwdIcon /></FlatBtn>
          <FlatBtn title={isPlaying ? "Pause" : "Play"} onClick={isPlaying ? pause : play}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</FlatBtn>
          <FlatBtn title="Fast Forward 5s" onClick={() => { const el = isVideo ? videoRef.current : audioRef.current; if (el) el.currentTime = Math.min(duration, el.currentTime + 5); }}><FfwdIcon /></FlatBtn>
          <FlatBtn title="Next" onClick={nextTrack}><NextIcon /></FlatBtn>

          <div style={{ flex: 1 }} />

          {/* WMP diamond */}
          <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#999"><polygon points="10,1 19,10 10,19 1,10" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
