import type { Metadata } from "next";
import "./base.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://andrewkaranu.me"),
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
