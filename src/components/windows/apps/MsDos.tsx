"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useWindowStore } from "@/store/windowStore";

interface HistoryEntry {
  type: "input" | "output" | "blank";
  content: string;
}

const PROMPT = "C:\\ANDREW>";

const RESUME_LINES = [
  "ANDREW KAMAMI — RESUME.TXT",
  "AI / Machine Learning & Full-Stack Developer",
  "═══════════════════════════════════════════",
  "",
  "CONTACT:",
  "  Email:    andrewkaranu03@gmail.com",
  "  Phone:    438-465-3939",
  "  GitHub:   github.com/AndrewKaranu",
  "  LinkedIn: linkedin.com/in/andrew-karanu",
  "",
  "EDUCATION:",
  "  B.Sc. Computer Science — Concordia University (Expected May 2027)",
  "  Academic distinction and competitive awards",
  "",
  "EXPERIENCE:",
  "  IEEE Lab Supervisor  · Concordia · Aug 2025–Present",
  "  Residential Assistant · Concordia · Aug 2024–Dec 2025",
  "",
  "KEY PROJECTS:",
  "  ModelForge    — LLM fine-tuning MLOps platform (1st @ McGill Hacks)",
  "  StudyEngine   — ESP32 offline AI study device",
  "  ScamShield    — React Native scam-simulation trainer",
  "  Melody MCP    — 24-tool Spotify MCP server for LLMs",
  "  Touch Trust   — Accessible banking app w/ RAG pipeline",
  "  Byte Sized TN — Automated newsletter: 500+ users, NLP pipeline",
  "",
  "SKILLS:",
  "  Python · C++ · Java · TypeScript · JavaScript · SQL",
  "  PyTorch · LangChain · RAG · Unsloth · OpenCV",
  "  React · Next.js · Node.js · FastAPI · ESP32",
  "  AWS · Docker · MongoDB · Vercel · Git",
];

const PROJECTS_LIST = [
  "Directory of C:\\ANDREW\\PROJECTS",
  "",
  "  <DIR>  ModelForge         [1st Place McGill Hacks 2026]",
  "  <DIR>  StudyEngine        [ESP32 AI Study Device]",
  "  <DIR>  ScamShield         [React Native · AI Voices]",
  "  <DIR>  Melody-MCP         [Spotify MCP Server]",
  "  <DIR>  Touch-Trust-Bank   [Java · OpenCV · RAG]",
  "  <DIR>  Job-Salary-Pred    [AutoML · NLP]",
  "  <DIR>  Save-Our-Rhinos    [React · Donations]",
  "  <DIR>  Match-A-Wish       [Best Use of Databricks]",
  "  <DIR>  AMMATowerDefense   [C++ · Qt]",
  "  <DIR>  Byte-Sized-TN      [500+ Users · AWS SES]",
  "",
  "         10 Dir(s)  ∞ bytes free",
];

const SKILLS_OUTPUT = [
  "SKILLS INVENTORY — ANDREW KAMAMI",
  "══════════════════════════════════",
  "",
  "LANGUAGES:",
  "  Python  C++  Java  TypeScript  JavaScript  SQL  C  PHP  HTML/CSS",
  "",
  "AI & MACHINE LEARNING:",
  "  PyTorch  LangChain  LangGraph  RAG  Unsloth  HuggingFace",
  "  Ollama  OpenCV  Scikit-learn  Pandas  NumPy  AutoML  MCP",
  "",
  "WEB & MOBILE:",
  "  React  React Native  Next.js  Node.js  Express  Flask",
  "  FastAPI  Streamlit  Electron  Expo  LVGL  Qt",
  "",
  "CLOUD & DATABASE:",
  "  AWS (Lambda S3 SES Aurora)  Docker  Redis  MongoDB",
  "  MySQL  Vercel  Render  Git/GitHub",
  "",
  "EMBEDDED:",
  "  ESP32  Arduino  I2C/SPI  Linux/Unix Shell",
];

const EASTER_EGGS: Record<string, string[]> = {
  matrix: [
    "\x1b[32m",
    "01001000 01100101 01101100 01101100 01101111",
    "10101000 11001010 01010101 10101010 11110000",
    "01110100 01101000 01100101 00100000 01001101",
    "11000011 10101110 01100011 01101000 01101001",
    "01101110 01100101 00100000 01101000 01100001",
    "01110011 00100000 01111001 01101111 01110101",
    "",
    "Wake up, Neo...",
    "The portfolio has you.",
    "\x1b[0m",
  ],
  hack: [
    "INITIATING HACK SEQUENCE...",
    "Bypassing firewall... [████████████] DONE",
    "Accessing mainframe... [████████████] DONE",
    "Downloading internet... [████████████] DONE",
    "Installing viruses... just kidding.",
    "",
    "You've been pranked. This is just a portfolio.",
    "But the code IS real. Check github.com/AndrewKaranu",
  ],
  coffee: ["☕ Brewing... please wait.", "", "Error: Out of coffee. Try again tomorrow."],
  sudo: ["Nice try. There is no sudo here.", "This is a portfolio, not a server."],
  ls: PROJECTS_LIST,
  dir: PROJECTS_LIST,
  pwd: ["C:\\ANDREW\\DESKTOP"],
  whoami: [
    "Andrew Kamami",
    "AI/ML & Full-Stack Developer",
    "Concordia University — B.Sc. Computer Science (Expected May 2027)",
    "Montreal, QC, Canada",
    "",
    "Hackathon winner",
    "Creator of Byte Sized Tech News (500+ subscribers)",
  ],
};

const HELP_LINES = [
  "Andrew.OS Command Interpreter v1.0",
  "",
  "Available commands:",
  "",
  "  help              Show this help",
  "  whoami            About me",
  "  resume            View my full resume",
  "  skills            List my technical skills",
  "  projects / dir    List my projects",
  "  contact           Show contact information",
  "  ver               Show system version",
  "  date              Show current date",
  "  cls / clear       Clear the screen",
  "  echo [text]       Print text",
  "  gui               Return to desktop",
  "",
  "  Try also: matrix, hack, coffee, sudo, ls, pwd",
];

export default function MsDos() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: "output", content: "Microsoft(R) Andrew.OS [Version 1.0.2026]" },
    { type: "output", content: "(C) Andrew Kamami 2026. All rights reserved." },
    { type: "blank", content: "" },
    { type: "output", content: 'Type "help" for available commands.' },
    { type: "blank", content: "" },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openWindow = useWindowStore((s) => s.openWindow);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const pushLines = useCallback((lines: string[]) => {
    setHistory((h) => [
      ...h,
      ...lines.map((l) => ({ type: "output" as const, content: l })),
    ]);
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim().toLowerCase();
      const parts = raw.trim().split(/\s+/);

      // Add to command history
      if (raw.trim()) {
        setCmdHistory((prev) => [raw.trim(), ...prev]);
      }
      setCmdHistoryIdx(-1);

      // Echo input line
      setHistory((h) => [
        ...h,
        { type: "input", content: `${PROMPT} ${raw}` },
      ]);

      if (!cmd) return;

      if (cmd === "cls" || cmd === "clear") {
        setHistory([]);
        return;
      }

      if (cmd === "help") { pushLines(HELP_LINES); return; }
      if (cmd === "whoami") { pushLines(EASTER_EGGS.whoami); return; }
      if (cmd === "resume") { pushLines(RESUME_LINES); return; }
      if (cmd === "skills") { pushLines(SKILLS_OUTPUT); return; }
      if (cmd === "ls" || cmd === "dir") { pushLines(PROJECTS_LIST); return; }
      if (cmd === "pwd") { pushLines(EASTER_EGGS.pwd); return; }
      if (cmd === "matrix") { pushLines(EASTER_EGGS.matrix); return; }
      if (cmd === "hack") { pushLines(EASTER_EGGS.hack); return; }
      if (cmd === "coffee") { pushLines(EASTER_EGGS.coffee); return; }
      if (cmd.startsWith("sudo")) { pushLines(EASTER_EGGS.sudo); return; }

      if (cmd === "contact") {
        pushLines([
          "CONTACT INFORMATION",
          "═══════════════════",
          "  Email:    andrewkaranu03@gmail.com",
          "  Phone:    438-465-3939",
          "  GitHub:   github.com/AndrewKaranu",
          "  LinkedIn: linkedin.com/in/andrew-karanu",
          "  Location: Montreal, QC",
        ]);
        return;
      }

      if (cmd === "ver") {
        pushLines([
          "",
          "Andrew.OS [Version 1.0.2026]",
          "Built with Next.js 16 + React 19 + TypeScript",
          "Hosted on Vercel · Styled with React95 v9",
          "",
        ]);
        return;
      }

      if (cmd === "date") {
        pushLines([`The current date is: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`]);
        return;
      }

      if (cmd === "time") {
        pushLines([`The current time is: ${new Date().toLocaleTimeString()}`]);
        return;
      }

      if (parts[0] === "echo") {
        pushLines([parts.slice(1).join(" ")]);
        return;
      }

      if (cmd === "gui") {
        pushLines(["Returning to desktop...", ""]);
        setTimeout(() => openWindow("welcome"), 500);
        return;
      }

      if (cmd.startsWith("cd ")) {
        const dir = parts.slice(1).join(" ");
        pushLines([`C:\\ANDREW\\${dir.toUpperCase()}>`]);
        return;
      }

      if (cmd === "exit") {
        pushLines(["Closing MS-DOS Prompt..."]);
        return;
      }

      // Unknown command
      pushLines([
        `'${parts[0]}' is not recognized as an internal or external command,`,
        "operable program or batch file.",
      ]);
    },
    [pushLines, openWindow]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = cmdHistoryIdx + 1;
      if (next < cmdHistory.length) {
        setCmdHistoryIdx(next);
        setInput(cmdHistory[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = cmdHistoryIdx - 1;
      if (next >= 0) {
        setCmdHistoryIdx(next);
        setInput(cmdHistory[next]);
      } else {
        setCmdHistoryIdx(-1);
        setInput("");
      }
    }
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#000",
        color: "#c0c0c0",
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 13,
        display: "flex",
        flexDirection: "column",
        padding: 4,
        cursor: "text",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output area */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {history.map((entry, i) => (
          <div
            key={i}
            style={{
              lineHeight: "1.4",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              color:
                entry.type === "input"
                  ? "#ffffff"
                  : entry.content.startsWith("\x1b[32m")
                  ? "#00ff00"
                  : "#c0c0c0",
              minHeight: entry.type === "blank" ? "1.4em" : undefined,
            }}
          >
            {entry.content.replace(/\x1b\[\d+m/g, "")}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input line */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
        <span style={{ color: "#ffffff", whiteSpace: "nowrap" }}>{PROMPT}&nbsp;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#ffffff",
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 13,
            caretColor: "#ffffff",
            padding: 0,
          }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
