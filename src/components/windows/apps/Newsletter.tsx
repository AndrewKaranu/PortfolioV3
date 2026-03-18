"use client";

import { useState } from "react";
import { Button, Input, Frame, Tabs, Tab } from "@react95/core";
import { Mailnews15 } from "@react95/icons";

type SignupStatus = "idle" | "submitting" | "success" | "error";

interface PastIssue {
  id: number;
  title: string;
  date: string;
  preview: string;
  emoji: string;
}

const PAST_ISSUES: PastIssue[] = [
  {
    id: 1,
    title: "The AI Revolution Continues",
    date: "March 8, 2026",
    preview: "This week: GPT-5 drops, Anthropic raises another $2B, and why AI agents are the next big thing...",
    emoji: "🤖",
  },
  {
    id: 2,
    title: "Open Source Wins Big",
    date: "March 1, 2026",
    preview: "Linux turns 35, Meta open-sources a new model, and the top 10 GitHub repos you slept on this month...",
    emoji: "📦",
  },
  {
    id: 3,
    title: "The Web is Dead (Again)",
    date: "Feb 22, 2026",
    preview: "React 20 announced, native browser AI APIs on the horizon, and why everyone is building OS apps now...",
    emoji: "🌐",
  },
  {
    id: 4,
    title: "DevTools of the Future",
    date: "Feb 15, 2026",
    preview: "AI pair programming goes mainstream, Cursor hits 1M users, and the dev tools landscape in 2026...",
    emoji: "🛠️",
  },
  {
    id: 5,
    title: "Cloud Wars 2026",
    date: "Feb 8, 2026",
    preview: "AWS vs Azure vs Google Cloud - who's winning? Plus: serverless hits a new milestone...",
    emoji: "☁️",
  },
];

export default function Newsletter() {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [signupStatus, setSignupStatus] = useState<SignupStatus>("idle");
  const [selectedIssue, setSelectedIssue] = useState<PastIssue | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus("submitting");
    // TODO: Connect to your newsletter backend
    await new Promise((r) => setTimeout(r, 1200));
    setSignupStatus("success");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#c0c0c0" }}>
      {/* Header */}
      <div className="newsletter-hero">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
          <Mailnews15 variant="16x16_4" />
          <span style={{ fontSize: 14, fontWeight: "bold", letterSpacing: 1 }}>BYTE SIZED TECH NEWS</span>
        </div>
        <div style={{ fontSize: 11, color: "#aaaaff" }}>
          The week in tech, bite-sized · Every Saturday
        </div>
      </div>

      <Tabs style={{ margin: "0 0 0 0" }}>
        <Tab title="📬 Subscribe" onClick={() => setActiveTab(0)} />
        <Tab title="📋 Past Issues" onClick={() => setActiveTab(1)} />
      </Tabs>

      <div style={{ flex: 1, overflow: "auto", padding: 12, background: "white" }}>
        {/* Subscribe tab */}
        {activeTab === 0 && (
          <div>
            {signupStatus === "success" ? (
              <div style={{ textAlign: "center", padding: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 8 }}>You&apos;re subscribed!</div>
                <Frame style={{ padding: 12, fontSize: 12 }} boxShadow="in">
                  Welcome to the Byte Sized Tech News family, {name || email}!
                  Check your inbox for a confirmation email.
                </Frame>
                <Button
                  style={{ marginTop: 16, fontSize: 11 }}
                  onClick={() => { setSignupStatus("idle"); setEmail(""); setName(""); }}
                >
                  Subscribe Another Email
                </Button>
              </div>
            ) : (
              <div style={{ maxWidth: 380, margin: "0 auto" }}>
                <Frame style={{ padding: 12, marginBottom: 16, background: "#f0f0ff" }} boxShadow="in">
                  <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                    <strong>📡 What you get:</strong>
                    <ul style={{ marginLeft: 16, marginTop: 6 }}>
                      <li>The biggest tech stories of the week</li>
                      <li>Developer tools & tips you&apos;ll actually use</li>
                      <li>Open source gems & GitHub finds</li>
                      <li>All in 5 minutes or less, every Saturday</li>
                    </ul>
                  </div>
                </Frame>

                <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, marginBottom: 3, fontWeight: "bold" }}>Name (optional):</label>
                    <Input
                      type="text"
                      placeholder="Your first name"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      style={{ width: "100%", fontSize: 11 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, marginBottom: 3, fontWeight: "bold" }}>Email address *:</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      required
                      style={{ width: "100%", fontSize: 11 }}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={signupStatus === "submitting"}
                    style={{ fontSize: 12, padding: "6px 0", marginTop: 4, fontWeight: "bold" }}
                  >
                    {signupStatus === "submitting" ? "⏳ Subscribing..." : "📬 Subscribe for Free"}
                  </Button>
                </form>

                <div style={{ marginTop: 12, fontSize: 10, color: "#888", textAlign: "center" }}>
                  No spam. Unsubscribe anytime. ~2,000 subscribers.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Past issues tab */}
        {activeTab === 1 && (
          <div>
            {selectedIssue ? (
              <div>
                <Button onClick={() => setSelectedIssue(null)} style={{ fontSize: 11, marginBottom: 12 }}>
                  ← Back to Issues
                </Button>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{selectedIssue.emoji}</span>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 13 }}>{selectedIssue.title}</div>
                    <div style={{ fontSize: 11, color: "#666" }}>{selectedIssue.date}</div>
                  </div>
                </div>
                <Frame style={{ padding: 12 }} boxShadow="in">
                  <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                    <p>{selectedIssue.preview}</p>
                    <br />
                    <p style={{ color: "#666", fontStyle: "italic" }}>
                      [Full newsletter content would appear here. Connect your
                      newsletter backend API to load real content.]
                    </p>
                  </div>
                </Frame>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 12, fontWeight: "bold", marginBottom: 10 }}>
                  Recent Issues ({PAST_ISSUES.length}):
                </div>
                {PAST_ISSUES.map((issue) => (
                  <Frame
                    key={issue.id}
                    style={{
                      padding: 10,
                      marginBottom: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                    boxShadow="out"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{issue.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "bold", fontSize: 11, marginBottom: 2 }}>
                        {issue.title}
                      </div>
                      <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>{issue.date}</div>
                      <div style={{ fontSize: 11, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {issue.preview}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: "#000080", flexShrink: 0 }}>Read →</span>
                  </Frame>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
