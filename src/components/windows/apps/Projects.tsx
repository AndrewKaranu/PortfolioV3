"use client";

import Image from "next/image";
import { useState } from "react";
import { Frame, Button } from "@react95/core";
import { Folder, FolderOpen } from "@react95/icons";

interface Project {
  id: string;
  name: string;
  description: string;
  tech: string[];
  links?: { label: string; url: string }[];
  accolade?: string;
  image?: string;
  year: string;
}

const PROJECTS: Project[] = [
  {
    id: "1",
    name: "ModelForge",
    description:
      "End-to-end MLOps platform for custom LLM fine-tuning with 2200+ models, Unsloth + QLORA optimization for consumer GPUs, and a containerized Model Arena for benchmarking adapters against base models.",
    tech: ["Python", "PyTorch", "Unsloth", "Docker", "Streamlit"],
    accolade: "1st Place Backboard.IO McGill Hacks challenge",
    links: [
      { label: "Live Demo", url: "https://modelforgepipeline.streamlit.app" },
      { label: "Source Code", url: "https://github.com/AndrewKaranu/ModelForge" },
    ],
    image: "/Screenshot%202026-03-11%20012343.png",
    year: "2026",
  },
  {
    id: "2",
    name: "StudyEngine",
    description:
      "Portable offline-capable ESP32 study device with quiz/flashcard modes, AI-powered content generation from PDFs, voice transcript processing, and a web admin interface for teachers.",
    tech: ["C++", "ESP32", "LVGL", "FastAPI", "Python", "Claude AI", "SQLite"],
    links: [{ label: "Source Code", url: "https://github.com/AndrewKaranu/StudyEngine" }],
    image: "/studyengine.jpeg",
    year: "2026",
  },
  {
    id: "3",
    name: "ScamShield",
    description:
      "React Native app training users to recognize scams through realistic simulations of calls, texts, and emails with AI voice agents, scoring, and safe phishing practice.",
    tech: ["React Native", "Expo", "TypeScript", "xAI Grok", "ElevenLabs", "AI Voice"],
    links: [{ label: "Source Code", url: "https://github.com/AndrewKaranu/ScamShield" }],
    image: "/scamshield.png",
    year: "2026",
  },
  {
    id: "4",
    name: "Melody & Melody MCP Server",
    description:
      "MERN app with AI-powered Spotify tooling plus a MCP server exposing 24 playback tools for LLMs and music discovery integrations through Last.fm.",
    tech: ["JavaScript", "Node.js", "MCP", "Spotify API", "OpenAI", "Last.fm API", "React", "MongoDB", "Express"],
    links: [
      { label: "MCP Server", url: "https://github.com/AndrewKaranu/Melody-MCP-Server" },
      { label: "Playlist App", url: "https://github.com/AndrewKaranu/MELODY-Playlist-App" },
    ],
    image: "/melody.png",
    year: "2025",
  },
  {
    id: "5",
    name: "Touch Trust Bank",
    description:
      "Desktop banking app with secure account management and transactions, multimodal accessibility via OpenCV + TTS, and a RAG pipeline grounding Gemini responses in transaction history.",
    tech: ["Java", "JavaFX", "OpenCV", "Google Gemini", "MySQL", "Google TTS", "CMU Sphinx"],
    links: [{ label: "Source Code", url: "https://github.com/AndrewKaranu/Touch-Trust-Bank/tree/main" }],
    image: "/TouchTrust.png",
    year: "2025",
  },
  {
    id: "6",
    name: "Job Salary Predictor",
    description:
      "AutoML-driven salary estimation system using NLP feature synthesis and a hybrid dataset enriched with web scraping and LLAMA 8B (Ollama) based missing-value imputation.",
    tech: ["Python", "Pandas", "Scikit-learn", "AutoML", "Ollama", "Web Scraping"],
    image: "/jobsalary.png",
    year: "2025",
  },
  {
    id: "7",
    name: "Save Our Rhinos",
    description:
      "Interactive digital photobook documenting rhino conservation with direct donation integration.",
    tech: ["React", "TypeScript", "Tailwind"],
    links: [{ label: "Live Demo", url: "https://andrewkaranu.github.io/Save-Our-Rhinos/" }],
    image: "/saverhinos.png",
    year: "2024",
  },
  {
    id: "8",
    name: "Match A Wish",
    description:
      "Full-stack donor-to-hospital toy matching platform using an OpenAI embedding matching algorithm. Won Best Use of Databricks.",
    tech: ["React", "Node.js", "Databricks SQL", "OpenAI Embeddings"],
    links: [{ label: "Devpost", url: "https://devpost.com/software/match-a-wish" }],
    accolade: "Best Use of Databricks",
    image: "/match-a-wish.png",
    year: "2025",
  },
  {
    id: "9",
    name: "AMMATower Defense",
    description:
      "Complete tower defense game with interactive GUI using Qt, custom map generation, and pathfinding.",
    tech: ["C++", "Qt", "CMake"],
    links: [{ label: "Source Code", url: "https://github.com/AndrewKaranu/Tower-Defense-Game-Comp-345" }],
    image: "/TowerDefense.png",
    year: "2024",
  },
  {
    id: "10",
    name: "Byte Sized Tech News",
    description:
      "Automated tech newsletter platform serving 500+ users with scraping, ML/NLP classification + summarization, and distributed deployment on Vercel/Render with AWS SES delivery.",
    tech: ["Python", "Flask", "React", "NLP", "AWS SES", "Selenium", "SQL", "Machine Learning"],
    links: [{ label: "Source Code", url: "https://github.com/AndrewKaranu/Byte-Size-Tech-News" }],
    image: "/bytesized.png",
    year: "2026",
  },
];

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);

  if (selected) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "white" }}>
        {/* Toolbar */}
        <div style={{ borderBottom: "1px solid #999", padding: "4px 8px", display: "flex", gap: 8, alignItems: "center", background: "#c0c0c0" }}>
          <Button onClick={() => setSelected(null)} style={{ fontSize: 11 }}>
            ← Back
          </Button>
          <span style={{ fontSize: 11 }}>My Projects / {selected.name}</span>
        </div>

        <div style={{ borderBottom: "1px solid #ccc", padding: "2px 8px", fontSize: 11, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#666" }}>Address:</span>
          <Frame style={{ flex: 1, padding: "1px 4px", fontSize: 11 }} boxShadow="in">
            C:\My Documents\Projects\{selected.name}
          </Frame>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <FolderOpen variant="32x32_4" />
            <div style={{ fontSize: 16, fontWeight: "bold" }}>{selected.name}</div>
          </div>

          {selected.image && (
            <Frame style={{ padding: 8, marginBottom: 12 }} boxShadow="in">
              <div style={{ position: "relative", width: "100%", height: 200, background: "#efefef" }}>
                <Image
                  src={selected.image}
                  alt={`${selected.name} screenshot`}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </Frame>
          )}

          <Frame style={{ padding: 12, marginBottom: 12 }} boxShadow="in">
            <div style={{ fontWeight: "bold", marginBottom: 6, fontSize: 11 }}>Description:</div>
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>{selected.description}</div>
          </Frame>

          <Frame style={{ padding: 12, marginBottom: 12 }} boxShadow="in">
            <div style={{ fontWeight: "bold", marginBottom: 6, fontSize: 11 }}>Technologies:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selected.tech.map((t) => (
                <Frame key={t} style={{ padding: "2px 8px", fontSize: 11 }}>
                  {t}
                </Frame>
              ))}
            </div>
          </Frame>

          {selected.accolade && (
            <Frame style={{ padding: 12, marginBottom: 12, background: "#ffffd0" }} boxShadow="in">
              <div style={{ fontWeight: "bold", marginBottom: 4, fontSize: 11 }}>Accolade:</div>
              <div style={{ fontSize: 11 }}>{selected.accolade}</div>
            </Frame>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            {selected.links?.map((link) => (
              <Button
                key={link.url}
                style={{ fontSize: 11 }}
                onClick={() => window.open(link.url, "_blank")}
              >
                🔗 {link.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Toolbar */}
      <div style={{ borderBottom: "1px solid #999", padding: "4px 8px", fontSize: 11, background: "#c0c0c0", display: "flex", alignItems: "center", gap: 8 }}>
        <Folder variant="16x16_4" />
        <span>📁 My Projects — {PROJECTS.length} items</span>
      </div>

      {/* Address bar */}
      <div style={{ borderBottom: "1px solid #ccc", padding: "2px 8px", fontSize: 11, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#666" }}>Address:</span>
        <Frame style={{ flex: 1, padding: "1px 4px", fontSize: 11 }} boxShadow="in">
          C:\My Documents\Projects
        </Frame>
      </div>

      {/* Project grid */}
      <div className="projects-grid" style={{ flex: 1, overflow: "auto" }}>
        {PROJECTS.map((project) => (
          <div
            key={project.id}
            className="project-folder"
            onClick={() => setSelected(project)}
          >
            <Folder variant="32x32_4" />
            <span style={{ fontSize: 10, textAlign: "center", maxWidth: 80, wordBreak: "break-word" }}>
              {project.name}
            </span>
            <span style={{ fontSize: 9, color: "#666" }}>{project.year}</span>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div style={{ borderTop: "1px solid #999", padding: "2px 8px", fontSize: 10, color: "#666" }}>
        {PROJECTS.length} object(s) · Click folder to open
      </div>
    </div>
  );
}
