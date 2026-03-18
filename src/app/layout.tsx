import type { Metadata } from "next";
import "./globals.css";
import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";
import "@react95/icons/icons.css";

export const metadata: Metadata = {
  title: "Andrew's Portfolio — Windows 95",
  description:
    "A Windows 95-inspired interactive portfolio. Click around, open apps, and explore.",
  openGraph: {
    title: "Andrew's Portfolio — Windows 95",
    description: "An interactive Windows 95-style portfolio experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
