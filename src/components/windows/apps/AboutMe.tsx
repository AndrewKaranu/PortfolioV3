"use client";

import { Frame } from "@react95/core";

export default function AboutMe() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#c0c0c0" }}>
      <div style={{ flex: 1, overflow: "auto", padding: 12, background: "white" }}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>Andrew Kamami</div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
              AI / ML & Full-Stack Developer
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>📍 Montreal, QC</div>
          </div>

          <Frame style={{ padding: 12, marginBottom: 12 }} boxShadow="in">
            <div style={{ fontSize: 12, lineHeight: 1.8 }}>
              <p>
                I&apos;m a Bachelor of Computer Science student at Concordia University,
                expected to graduate in May 2027. I specialize in AI,
                machine learning, and full-stack development.
              </p>
              <br />
              <p>
                I&apos;ve won multiple hackathon challenges, including Backboard.IO at
                McGill Hacks 2026, SAP at ConUHacks 2026, and Best AI Project
                with Databricks Open Source in 2025.
              </p>
            </div>
          </Frame>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
            <Frame style={{ padding: 8 }} boxShadow="in">
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>🎓 Education</div>
              <div>Bachelor of Computer Science</div>
              <div style={{ color: "#666" }}>Concordia University · Expected May 2027</div>
            </Frame>
            <Frame style={{ padding: 8 }} boxShadow="in">
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>📧 Contact</div>
              <div>andrewkaranu03@gmail.com</div>
              <div style={{ color: "#666" }}>github.com/AndrewKaranu</div>
            </Frame>
          </div>
        </div>
      </div>
    </div>
  );
}
