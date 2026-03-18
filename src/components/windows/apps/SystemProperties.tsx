"use client";

import { useState } from "react";
import { Frame, Button, Tabs, Tab } from "@react95/core";
import { Computer } from "@react95/icons";

const TREE_ITEMS = [
  { label: "💻 Computer", depth: 0, expanded: true },
  { label: "🎨 Display adapters", depth: 1 },
  { label: "   React 19.0 + Next.js 16", depth: 2 },
  { label: "⚙️ Languages", depth: 1 },
  { label: "   Python · TypeScript · C++ · Java · SQL", depth: 2 },
  { label: "🧠 AI & ML Processors", depth: 1 },
  { label: "   PyTorch · LangChain · RAG · Unsloth", depth: 2 },
  { label: "   HuggingFace · OpenCV · Scikit-learn", depth: 2 },
  { label: "🌐 Network Adapters", depth: 1 },
  { label: "   Node.js · Express · FastAPI · Flask", depth: 2 },
  { label: "🗄️ Storage Controllers", depth: 1 },
  { label: "   PostgreSQL · MongoDB · Redis · MySQL", depth: 2 },
  { label: "☁️ Cloud Devices", depth: 1 },
  { label: "   AWS (Lambda · S3 · SES · Aurora)", depth: 2 },
  { label: "   Vercel · Docker · Render", depth: 2 },
  { label: "📱 Mobile/Embedded", depth: 1 },
  { label: "   React Native · Expo · ESP32 · Arduino", depth: 2 },
];

export default function SystemProperties() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#c0c0c0" }}>
      <Tabs>
        <Tab title="General" onClick={() => setActiveTab(0)} />
        <Tab title="Device Manager" onClick={() => setActiveTab(1)} />
        <Tab title="Hardware Profiles" onClick={() => setActiveTab(2)} />
        <Tab title="Performance" onClick={() => setActiveTab(3)} />
      </Tabs>

      <div style={{ flex: 1, overflow: "auto", padding: 12, background: "#c0c0c0" }}>
        {/* General */}
        {activeTab === 0 && (
          <div style={{ display: "flex", gap: 16 }}>
            {/* Computer icon */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <Computer variant="32x32_4" style={{ width: 60, height: 60 }} />
              <div style={{ fontSize: 10, color: "#333", textAlign: "center", maxWidth: 70 }}>
                Andrew&apos;s Portfolio OS
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <Frame style={{ padding: 10, marginBottom: 8, fontSize: 11 }} boxShadow="in">
                <div style={{ marginBottom: 4 }}>
                  <strong>System:</strong>
                </div>
                <div style={{ paddingLeft: 12 }}>
                  <div>Andrew.OS Portfolio Edition</div>
                  <div>Version 1.0.2026</div>
                  <div>Next.js + React 95 UI Components</div>
                </div>
              </Frame>

              <Frame style={{ padding: 10, marginBottom: 8, fontSize: 11 }} boxShadow="in">
                <div style={{ marginBottom: 4 }}>
                  <strong>Registered to:</strong>
                </div>
                <div style={{ paddingLeft: 12 }}>
                  <div>Andrew Kamami</div>
                  <div>Concordia University — B.Sc. CS</div>
                  <div>Montreal, QC, Canada</div>
                </div>
              </Frame>

              <Frame style={{ padding: 10, fontSize: 11 }} boxShadow="in">
                <div style={{ marginBottom: 4 }}>
                  <strong>Computer:</strong>
                </div>
                <div style={{ paddingLeft: 12 }}>
                  <div>Coffee-Powered Brain (∞ MHz)</div>
                  <div>RAM: Maximum Determination</div>
                  <div>Awards: Hackathon-winning projects</div>
                </div>
              </Frame>
            </div>
          </div>
        )}

        {/* Device Manager */}
        {activeTab === 1 && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <Button style={{ fontSize: 11 }}>
                <input type="radio" defaultChecked style={{ marginRight: 4 }} />
                View devices by type
              </Button>
              <Button style={{ fontSize: 11 }}>
                <input type="radio" style={{ marginRight: 4 }} />
                View by connection
              </Button>
            </div>

            <Frame boxShadow="in" style={{ height: 280, overflow: "auto", background: "white", padding: 4 }}>
              {TREE_ITEMS.map((item, i) => (
                <div
                  key={i}
                  style={{
                    paddingLeft: item.depth * 16,
                    fontSize: 11,
                    lineHeight: "1.8",
                    fontFamily: item.depth === 0 ? "ms sans serif, Arial, sans-serif" : "ms sans serif, Arial, sans-serif",
                    fontWeight: item.depth === 0 ? "bold" : "normal",
                    color: item.depth === 2 ? "#444" : "#000",
                  }}
                >
                  {item.label}
                </div>
              ))}
            </Frame>

            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <Button style={{ fontSize: 11 }}>Properties</Button>
              <Button style={{ fontSize: 11 }}>Refresh</Button>
              <Button style={{ fontSize: 11 }}>Print...</Button>
            </div>
          </div>
        )}

        {/* Hardware Profiles */}
        {activeTab === 2 && (
          <div>
            <Frame style={{ padding: 10, marginBottom: 10, fontSize: 11 }} boxShadow="out">
              <div style={{ fontWeight: "bold", marginBottom: 6 }}>Hardware Profiles</div>
              <div style={{ color: "#666", lineHeight: 1.6 }}>
                You can create hardware profiles to select different hardware configurations when you start your computer.
              </div>
            </Frame>

            <Frame boxShadow="in" style={{ height: 80, overflow: "auto", background: "white", padding: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 11 }}>
                <div style={{ background: "#000080", color: "white", padding: "1px 4px" }}>
                  Original Configuration (Current)
                </div>
              </div>
            </Frame>

            <Frame style={{ padding: 10, fontSize: 11 }} boxShadow="in">
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>Current Loadout:</div>
              <div style={{ lineHeight: 1.8 }}>
                ✅ Hackathon mode: ACTIVE<br />
                ✅ Coffee dependency: ENABLED<br />
                ✅ Late night coding: OPTIMAL<br />
                ✅ Stack overflow: FREQUENT<br />
                ✅ Git push force: DISABLED (learned my lesson)
              </div>
            </Frame>
          </div>
        )}

        {/* Performance */}
        {activeTab === 3 && (
          <div>
            <Frame style={{ padding: 10, marginBottom: 10 }} boxShadow="out">
              <div style={{ fontWeight: "bold", marginBottom: 8, fontSize: 11 }}>Performance status</div>

              {[
                { label: "Memory:", value: "Caffeine: 94% free" },
                { label: "System Resources:", value: "GitHub repos: 94% committed" },
                { label: "File System:", value: "TypeScript: strictly typed" },
                { label: "Virtual Memory:", value: "Imagination: unlimited" },
                { label: "Disk Compression:", value: "Minified in production" },
                { label: "PC Cards (PCMCIA):", value: "No PCMCIA — using Vercel" },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{ display: "flex", gap: 8, fontSize: 11, marginBottom: 4 }}
                >
                  <span style={{ width: 130, color: "#333", flexShrink: 0 }}>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </Frame>

            <Frame boxShadow="in" style={{ padding: 8, height: 80, overflow: "auto", background: "white", marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#333" }}>
                <div>✓ All systems operating at maximum nerd capacity.</div>
                <div>✓ Portfolio loading time: instant (Vercel Edge).</div>
                <div>✓ Bug count: officially zero (in production).</div>
              </div>
            </Frame>

            <Frame style={{ padding: 8 }} boxShadow="out">
              <div style={{ fontWeight: "bold", fontSize: 11, marginBottom: 6 }}>Advanced settings</div>
              <div style={{ display: "flex", gap: 6 }}>
                <Button style={{ fontSize: 11 }}>File System...</Button>
                <Button style={{ fontSize: 11 }}>Graphics...</Button>
                <Button style={{ fontSize: 11 }}>Virtual Memory...</Button>
              </div>
            </Frame>
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "8px 12px", borderTop: "1px solid #888" }}>
        <Button style={{ fontSize: 11, minWidth: 60 }}>OK</Button>
        <Button style={{ fontSize: 11, minWidth: 60 }}>Cancel</Button>
      </div>
    </div>
  );
}
