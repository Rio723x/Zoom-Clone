import { useEffect } from "react";

/** Zoom-style shortcuts: M toggles mic, V toggles video (ignored while typing). */
export function useMeetingHotkeys(
  onToggleMic: () => void,
  onToggleWebcam: () => void,
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "m") {
        e.preventDefault();
        onToggleMic();
      } else if (key === "v") {
        e.preventDefault();
        onToggleWebcam();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onToggleMic, onToggleWebcam]);
}
