"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  photos: string[];
  onStart: () => void;
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <polygon points="5,3 17,10 5,17" />
  </svg>
);
const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);
const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export function PhotobookLanding({ photos, onStart }: Props) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [photos.length]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Cycling photo background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {photos.map((photo, index) => (
          <div
            key={photo}
            style={{
              position: "absolute",
              inset: 0,
              opacity: index === currentPhotoIndex ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          >
            <Image
              src={photo}
              alt=""
              fill
              style={{ objectFit: "cover" }}
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "16px 32px" }}>

          {/* Title + CTA */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1
              style={{
                fontWeight: 700,
                color: "white",
                marginBottom: 24,
                lineHeight: 1.1,
                fontSize: "clamp(3rem, 10vw, 7rem)",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              Save our
              <br />
              Rhinos
            </h1>

            <button
              onClick={onStart}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 40px",
                borderRadius: 9999,
                color: "white",
                fontWeight: 700,
                fontSize: 18,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
                transition: "all 0.3s",
                marginBottom: 32,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.2)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              <PlayIcon />
              Start Experience
            </button>
          </div>

          {/* Three info cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              maxWidth: 1100,
              margin: "0 auto",
            }}
          >
            {/* About Me */}
            <div
              style={{
                borderRadius: 16,
                padding: 24,
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <BookIcon />
                About Me
              </h3>
              <p style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.6, fontSize: 14 }}>
                Hey I&apos;m Andrew! A hobbyist photographer with an endless curiosity and a
                habit of pointing my camera at anything that makes me feel something — not
                just to show what I saw, but to share what I felt. I created this photobook
                when I was just 15 years old as part of my IB MYP Personal Project, believing
                even then that my little experiment could spread awareness for Najin and Fatu.
              </p>
            </div>

            {/* About Project */}
            <div
              style={{
                borderRadius: 16,
                padding: 24,
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <PlayIcon />
                About This Project
              </h3>
              <p style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.6, fontSize: 14 }}>
                Once abundant across Central Africa, today only two northern white rhinos
                remain alive — both female, both living under 24-hour armed guard in Kenya.
                This photobook documents their world: a powerful blend of beauty and grief,
                hope and urgency.
              </p>
            </div>

            {/* Connect & Support */}
            <div
              style={{
                borderRadius: 16,
                padding: 24,
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <HeartIcon />
                Connect &amp; Support
              </h3>

              <p style={{ fontSize: 14, marginBottom: 12, color: "rgba(255,255,255,0.7)" }}>
                Follow my journey:
              </p>
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                {[
                  { href: "https://www.instagram.com/_andrrrwww_/", label: "Instagram", Icon: InstagramIcon },
                  { href: "https://www.linkedin.com/in/andrew-karanu-998910237/", label: "LinkedIn", Icon: LinkedinIcon },
                  { href: "https://github.com/AndrewKaranu", label: "GitHub", Icon: GithubIcon },
                ].map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    style={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      color: "white",
                      background: "rgba(255,255,255,0.1)",
                      transition: "background 0.2s",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)")
                    }
                  >
                    <Icon />
                  </a>
                ))}
              </div>

              <div
                style={{
                  borderRadius: 12,
                  padding: 16,
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(74,222,128,0.3)",
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "rgb(134,239,172)" }}>
                  🦏 Support Conservation:
                </p>
                <a
                  href="https://donate.olpejetaconservancy.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    color: "rgb(187,247,208)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = "rgb(220,252,231)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = "rgb(187,247,208)")
                  }
                >
                  <HeartIcon />
                  Donate to Ol Pejeta Conservancy
                  <ExternalLinkIcon />
                </a>
                <p style={{ fontSize: 14, marginTop: 8, color: "rgba(187,247,208,0.7)" }}>
                  The sanctuary that made this project possible
                </p>
              </div>
            </div>
          </div>

          {/* Photo indicator dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                aria-label={`Photo ${index + 1}`}
                style={{
                  width: index === currentPhotoIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    index === currentPhotoIndex
                      ? "rgba(255,255,255,1)"
                      : "rgba(255,255,255,0.3)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
