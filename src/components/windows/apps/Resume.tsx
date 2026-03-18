"use client";

import { useState } from "react";
import { Frame } from "@react95/core";

const RESUME_TEXT = `
╔════════════════════════════════════════════════════════════╗
║                ANDREW KAMAMI — RESUME.TXT                 ║
║         AI / Machine Learning & Full-Stack Developer      ║
╚════════════════════════════════════════════════════════════╝

CONTACT
───────
Email:    andrewkaranu03@gmail.com
Phone:    438-465-3939
Location: Montreal, QC
GitHub:   github.com/AndrewKaranu
LinkedIn: linkedin.com/in/andrew-karanu

SUMMARY
───────
Bachelor of Computer Science student at Concordia University
(Expected May 2027), focused on AI, machine learning, and
full-stack development. Recipient of the Concordia Aga Khan
Full Tuition Scholarship valued at $120,000.

Hackathon track record includes:
- 2026 Backboard.IO challenge winner (McGill Hacks)
- 2026 SAP challenge winner (ConUHacks)
- 2025 Best AI Project (Databricks Open Source)

EXPERIENCE
──────────
IEEE Lab Supervisor                        Aug 2025 – Present
Concordia University · Montreal, QC
• Managed daily lab operations and safety protocols for
  engineering projects and research activities.

Residential Assistant                      Aug 2024 – Dec 2025
Concordia University · Montreal, QC
• Collaborated with a team of 25 supporting 1,000+ residents
  through conflict resolution and crisis response.

EDUCATION
─────────
Bachelor of Computer Science
Concordia University, Montreal, QC
Expected: May 2027
Relevant coursework: Machine Learning, Data Structures &
Algorithms, Data Analytics, Embedded Systems, Operating
Systems, Advanced Program Design with C++, FRANC 211.

PROJECTS
────────
ModelForge
  End-to-end MLOps platform for custom LLM fine-tuning,
  orchestrating 2200+ models with Backboard.io SDK.
  Stack: Python, PyTorch, Unsloth, Docker, Streamlit

StudyEngine
  Offline ESP32 study device with quiz/flashcard modes,
  AI PDF content generation, and teacher web admin.
  Stack: C++, ESP32, LVGL, FastAPI, Python, Claude AI

ScamShield
  React Native app training users to detect scams through
  realistic simulations and AI voice agents.

Touch Trust Bank
  Java desktop banking app with OpenCV accessibility layer
  and RAG-powered transaction Q&A.

Byte Sized Tech News
  Automated newsletter platform serving 500+ users with
  scraping + ML/NLP pipeline and AWS SES delivery.

SKILLS
──────
Languages: Python, C++, Java, TypeScript, JavaScript,
           SQL, C, HTML/CSS, PHP
AI/ML:     PyTorch, LangChain, LangGraph, RAG, Unsloth,
           Hugging Face, Ollama, OpenCV, Scikit-learn,
           Pandas, NumPy, AutoML
Web/App:   React, React Native, Electron, Node.js,
           Express, Flask, FastAPI, Streamlit, Expo
Cloud:     AWS (Lambda, S3, SES, Aurora), Docker,
           Redis, MongoDB, MySQL, Vercel, Render
Systems:   ESP32, Arduino, I2C/SPI, Linux/Unix Shell

───────────────────────────────────────────────────────────
  References available upon request.
  Last updated: March 2026
───────────────────────────────────────────────────────────
`.trim();

export default function Resume() {
  const [downloadOpen, setDownloadOpen] = useState(false);

  const DOWNLOADS = [
    { label: "Download PDF", href: "/Andrew_Kamami_Resume.pdf", fileName: "Andrew_Kamami_Resume.pdf" },
    { label: "Download Markdown", href: "/AndrewKamamiResume.md", fileName: "AndrewKamamiResume.md" },
    { label: "Download Text", href: "/AndrewKamamiResume.txt", fileName: "AndrewKamamiResume.txt" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Notepad menu bar */}
      <div
        style={{
          background: "#c0c0c0",
          borderBottom: "1px solid #888",
          padding: "2px 8px",
          fontSize: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div>
        <span style={{ marginRight: 16 }}>File</span>
        <span style={{ marginRight: 16 }}>Edit</span>
        <span style={{ marginRight: 16 }}>View</span>
        <span>Help</span>
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDownloadOpen((v) => !v)}
            style={{
              border: "1px outset #fff",
              background: "#c0c0c0",
              fontSize: 11,
              padding: "1px 6px",
              cursor: "pointer",
              fontFamily: "ms sans serif, Arial, sans-serif",
            }}
          >
            ⬇ Download
          </button>

          {downloadOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 2,
                border: "2px outset #fff",
                background: "#c0c0c0",
                minWidth: 170,
                zIndex: 10,
                boxShadow: "2px 2px 0 #666",
              }}
            >
              {DOWNLOADS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  download={item.fileName}
                  onClick={() => setDownloadOpen(false)}
                  style={{
                    display: "block",
                    padding: "6px 8px",
                    color: "black",
                    textDecoration: "none",
                    fontSize: 11,
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notepad content */}
      <Frame
        boxShadow="in"
        style={{ flex: 1, margin: 2, overflow: "auto", background: "white" }}
      >
        <pre
          style={{
            fontFamily: "Courier New, Courier, monospace",
            fontSize: 11,
            lineHeight: 1.6,
            padding: 12,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "#000",
          }}
        >
          {RESUME_TEXT}
        </pre>
      </Frame>

      {/* Status bar */}
      <div style={{ background: "#c0c0c0", borderTop: "1px solid #888", padding: "2px 8px", fontSize: 10, color: "#666", display: "flex", justifyContent: "space-between" }}>
        <span>RESUME.TXT</span>
        <span>Ln 1, Col 1</span>
      </div>
    </div>
  );
}
