"use client";

import { useState } from "react";
import { Button, Input, TextArea, Frame } from "@react95/core";
import { Mail } from "@react95/icons";

type Status = "idle" | "sending" | "sent" | "error";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzwddve";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "white", flexDirection: "column", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>✉️</div>
        <div style={{ fontWeight: "bold", fontSize: 14 }}>Message Sent!</div>
        <Frame style={{ padding: 12, maxWidth: 320, textAlign: "center", fontSize: 12 }} boxShadow="in">
          Thanks for reaching out, {form.name}! I&apos;ll get back to you at {form.email} as soon as possible.
        </Frame>
        <Button onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}>
          Send Another
        </Button>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflow: "auto", background: "white" }}>
      {/* Header */}
      <div style={{ background: "#000080", color: "white", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <Mail variant="16x16_4" />
        <span style={{ fontSize: 12, fontWeight: "bold" }}>New Message — Inbox</span>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: 12 }}>
        {/* To field */}
        <div style={{ borderBottom: "1px solid #ccc", paddingBottom: 6, marginBottom: 6, display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
          <span style={{ fontWeight: "bold", width: 50, color: "#333" }}>To:</span>
          <span>andrewkaranu03@gmail.com</span>
        </div>

        {/* From */}
        <div style={{ borderBottom: "1px solid #ccc", paddingBottom: 6, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontWeight: "bold", width: 50, fontSize: 11, color: "#333", flexShrink: 0 }}>From:</label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            required
            style={{ flex: 1, fontSize: 11 }}
          />
        </div>

        {/* Name */}
        <div style={{ borderBottom: "1px solid #ccc", paddingBottom: 6, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontWeight: "bold", width: 50, fontSize: 11, color: "#333", flexShrink: 0 }}>Name:</label>
          <Input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            required
            style={{ flex: 1, fontSize: 11 }}
          />
        </div>

        {/* Subject */}
        <div style={{ borderBottom: "1px solid #ccc", paddingBottom: 6, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontWeight: "bold", width: 50, fontSize: 11, color: "#333", flexShrink: 0 }}>Subject:</label>
          <Input
            type="text"
            placeholder="What's on your mind?"
            value={form.subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, subject: e.target.value }))
            }
            required
            style={{ flex: 1, fontSize: 11 }}
          />
        </div>

        {/* Message body */}
        <TextArea
          placeholder="Write your message here..."
          value={form.message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, message: e.target.value }))
          }
          required
          rows={8}
          style={{ width: "100%", fontSize: 11, resize: "vertical", marginBottom: 8 }}
        />

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="submit" disabled={status === "sending"} style={{ fontSize: 11 }}>
            {status === "sending" ? "Sending..." : "📤 Send"}
          </Button>
          <Button
            type="button"
            style={{ fontSize: 11 }}
            onClick={() => setForm({ name: "", email: "", subject: "", message: "" })}
          >
            🗑️ Clear
          </Button>
        </div>

        {status === "error" && (
          <Frame style={{ padding: 10, marginTop: 10, fontSize: 11, color: "#a00" }} boxShadow="in">
            Couldn&apos;t send your message right now. Please try again in a moment.
          </Frame>
        )}

        {/* Social links */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #ccc" }}>
          <Frame style={{ padding: 10, marginBottom: 10, fontSize: 11 }} boxShadow="in">
            <div style={{ marginBottom: 3 }}><strong>Phone:</strong> 438-465-3939</div>
            <div><strong>Location:</strong> Montreal, QC</div>
          </Frame>

          <div style={{ fontSize: 11, fontWeight: "bold", marginBottom: 8 }}>Also find me at:</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "🐙 GitHub", url: "https://github.com/AndrewKaranu" },
              { label: "💼 LinkedIn", url: "https://linkedin.com/in/andrew-karanu" },
            ].map((link) => (
              <Button
                key={link.label}
                style={{ fontSize: 11 }}
                onClick={() => window.open(link.url, "_blank")}
              >
                {link.label}
              </Button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
