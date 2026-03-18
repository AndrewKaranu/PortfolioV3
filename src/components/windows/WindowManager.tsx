"use client";

import { useWindowStore } from "@/store/windowStore";
import Window from "./Window";

export default function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  const sortedWindows = [...windows].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {sortedWindows.map((win) => (
        <Window key={win.id} window={win} />
      ))}
    </>
  );
}
