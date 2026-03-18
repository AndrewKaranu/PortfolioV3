"use client";

import { useState } from "react";
import { PhotobookLanding } from "./_components/PhotobookLanding";
import { PhotobookViewer } from "./_components/PhotobookViewer";

// The 12 rhino photos from the original Save Our Rhinos project
export const PHOTOS = [
  "/photography/20190728-IMG_7212.jpg",
  "/photography/20190728-IMG_7220.jpg",
  "/photography/20190728-IMG_7235.jpg",
  "/photography/20190728-IMG_7237-2.jpg",
  "/photography/20190728-IMG_7243.jpg",
  "/photography/20190728-IMG_7647.jpg",
  "/photography/20190729-IMG_8251-2.jpg",
  "/photography/20190729-IMG_8267.jpg",
  "/photography/20190729-IMG_8284-2.jpg",
  "/photography/20190729-IMG_8285.jpg",
  "/photography/20190729-IMG_8321.jpg",
  "/photography/IMG_20190908_192254.jpg",
];

export default function SaveOurRhinosPage() {
  const [viewing, setViewing] = useState(false);

  return viewing ? (
    <PhotobookViewer onBack={() => setViewing(false)} />
  ) : (
    <PhotobookLanding photos={PHOTOS} onStart={() => setViewing(true)} />
  );
}
