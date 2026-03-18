import { create } from "zustand";

export type AppType =
  | "welcome"
  | "aboutMe"
  | "projects"
  | "contact"
  | "newsletter"
  | "calculator"
  | "minesweeper"
  | "resume"
  | "msDos"
  | "systemProps"
  | "mediaPlayer"
  | "photography"
  | "pictureViewer"
  | "paint"
  | "internetExplorer"
  | "webcam"
  | "doom";

export interface WindowInstance {
  id: string;
  app: AppType;
  title: string;
  isMinimized: boolean;
  defaultPosition: { x: number; y: number };
  zIndex: number;
}

export interface PhotoEntry {
  url: string;
  name: string;
  date?: string;
}

interface WindowStore {
  windows: WindowInstance[];
  activeWindowId: string | null;
  startMenuOpen: boolean;
  topZIndex: number;

  // Picture viewer state
  pictureViewerPhoto: PhotoEntry | null;
  pictureViewerPhotos: PhotoEntry[];

  openWindow: (app: AppType) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  setStartMenuOpen: (open: boolean) => void;
  openPictureViewer: (photo: PhotoEntry, photos: PhotoEntry[]) => void;
}

const APP_TITLES: Record<AppType, string> = {
  welcome: "Welcome",
  aboutMe: "About Me — Notepad",
  projects: "My Projects",
  contact: "Contact — Inbox",
  newsletter: "Byte Sized Tech News",
  calculator: "Calculator",
  minesweeper: "Minesweeper",
  resume: "Resume — Notepad",
  msDos: "MS-DOS Prompt",
  systemProps: "System Properties",
  mediaPlayer: "Windows Media Player",
  photography: "My Photography",
  pictureViewer: "Picture Viewer",
  paint: "untitled - Paint",
  internetExplorer: "Microsoft Internet Explorer",
  webcam: "Webcam",
  doom: "DOOM Shareware",
};

let windowCounter = 0;

function getDefaultPosition(index: number) {
  const base = 60 + index * 28;
  return { x: base, y: base };
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  startMenuOpen: false,
  topZIndex: 100,
  pictureViewerPhoto: null,
  pictureViewerPhotos: [],

  openWindow: (app: AppType) => {
    const existing = get().windows.find((w) => w.app === app);
    if (existing) {
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === existing.id
            ? { ...w, isMinimized: false, zIndex: state.topZIndex + 1 }
            : w
        ),
        activeWindowId: existing.id,
        topZIndex: state.topZIndex + 1,
      }));
      return;
    }

    const id = `window-${++windowCounter}`;
    set((state) => {
      const nextZ = state.topZIndex + 1;
      const newWindow: WindowInstance = {
        id,
        app,
        title: APP_TITLES[app],
        isMinimized: false,
        defaultPosition: getDefaultPosition(state.windows.length),
        zIndex: nextZ,
      };

      return {
        windows: [...state.windows, newWindow],
        activeWindowId: id,
        topZIndex: nextZ,
      };
    });
  },

  openPictureViewer: (photo: PhotoEntry, photos: PhotoEntry[]) => {
    set({ pictureViewerPhoto: photo, pictureViewerPhotos: photos });
    const existing = get().windows.find((w) => w.app === "pictureViewer");
    if (existing) {
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === existing.id
            ? { ...w, isMinimized: false, zIndex: state.topZIndex + 1, title: `Picture Viewer — ${photo.name}` }
            : w
        ),
        activeWindowId: existing.id,
        topZIndex: state.topZIndex + 1,
      }));
      return;
    }
    const id = `window-${++windowCounter}`;
    set((state) => {
      const nextZ = state.topZIndex + 1;
      return {
        windows: [
          ...state.windows,
          {
            id,
            app: "pictureViewer" as AppType,
            title: `Picture Viewer — ${photo.name}`,
            isMinimized: false,
            defaultPosition: getDefaultPosition(state.windows.length),
            zIndex: nextZ,
          },
        ],
        activeWindowId: id,
        topZIndex: nextZ,
      };
    });
  },

  closeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId:
        state.activeWindowId === id ? null : state.activeWindowId,
    }));
  },

  minimizeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
      activeWindowId:
        state.activeWindowId === id ? null : state.activeWindowId,
    }));
  },

  restoreWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isMinimized: false, zIndex: state.topZIndex + 1 }
          : w
      ),
      activeWindowId: id,
      topZIndex: state.topZIndex + 1,
    }));
  },

  focusWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: state.topZIndex + 1 } : w
      ),
      activeWindowId: id,
      topZIndex: state.topZIndex + 1,
    }));
  },

  setStartMenuOpen: (open: boolean) => {
    set({ startMenuOpen: open });
  },
}));
