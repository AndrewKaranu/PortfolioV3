import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Save Our Rhinos — Andrew Karanu",
  description:
    "An interactive photobook documenting the urgent need to protect northern white rhinos from extinction. Photography by Andrew Karanu.",
  openGraph: {
    title: "Save Our Rhinos — Andrew Karanu",
    description:
      "An interactive photobook documenting the urgent need to protect northern white rhinos from extinction.",
    type: "website",
    images: ["/photography/20190728-IMG_7212.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Save Our Rhinos — Andrew Karanu",
    description: "An interactive photobook about northern white rhino conservation.",
    images: ["/photography/20190728-IMG_7212.jpg"],
  },
};

export default function SaveOurRhinosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
