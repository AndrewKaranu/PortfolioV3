"use client";

import { useState } from "react";
import { PhotobookLanding } from "./_components/PhotobookLanding";
import { PhotobookViewer } from "./_components/PhotobookViewer";

// All rhino/wildlife photos already in /public/photography/
// (ChinaTown.png and Corvette1.png excluded — not wildlife)
export const PHOTOS = [
  "/photography/20190728-IMG_7212.jpg",
  "/photography/20190728-IMG_7220.jpg",
  "/photography/20190728-IMG_7235.jpg",
  "/photography/20190728-IMG_7237-2.jpg",
  "/photography/20190728-IMG_7243.jpg",
  "/photography/20190729-IMG_8284-2.jpg",
  "/photography/20190729-IMG_8285.jpg",
  "/photography/20190729-IMG_8321.jpg",
  "/photography/DSC00291.jpg",
  "/photography/DSC01582.jpg",
  "/photography/DSC01601.jpg",
  "/photography/DSC01630.jpg",
  "/photography/DSC01718.jpg",
  "/photography/DSC02173.jpg",
  "/photography/DSC02186.jpg",
  "/photography/DSC02220.jpg",
  "/photography/DSC02254.jpg",
  "/photography/DSC02260.jpg",
  "/photography/DSC02385.jpg",
  "/photography/DSC02447.jpg",
  "/photography/IMG_20190908_192254.jpg",
];

export default function SaveOurRhinosPage() {
  const [viewing, setViewing] = useState(false);

  return viewing ? (
    <PhotobookViewer photos={PHOTOS} onBack={() => setViewing(false)} />
  ) : (
    <PhotobookLanding photos={PHOTOS} onStart={() => setViewing(true)} />
  );
}
