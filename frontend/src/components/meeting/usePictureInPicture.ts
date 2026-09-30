import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

// Fixed 16:9 canvas the PiP window renders. Kept modest so the composite grid
// stays crisp in a small floating window without wasting fill work.
const CANVAS_W = 640;
const CANVAS_H = 360;

/**
 * Draw a video into a cell using `object-fit: cover` semantics (crop to fill,
 * centered), so mismatched aspect ratios never letterbox or stretch.
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;
  const scale = Math.max(dw / vw, dh / vh);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (vw - sw) / 2;
  const sy = (vh - sh) / 2;
  ctx.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh);
}

/**
 * Browser-native Picture-in-Picture for the live meeting.
 *
 * Uses the standard approach: composite the live participant `<video>`
 * elements found inside `stageRef` into an off-screen canvas, expose the canvas
 * as a `MediaStream` via `captureStream()`, feed that into a hidden `<video>`,
 * and pop it out with `requestPictureInPicture()`. A `requestAnimationFrame`
 * loop keeps the grid redrawing while PiP is open. Only `<video>`s that are
 * actually playing frames are drawn, so the grid naturally tracks camera-on
 * participants as they toggle, join, and leave.
 *
 * `pipSupported` is false in browsers without programmatic PiP (e.g. Firefox);
 * callers should hide the toggle in that case.
 */
export function usePictureInPicture(stageRef: RefObject<HTMLElement | null>) {
  const [pipActive, setPipActive] = useState(false);
  const [pipSupported] = useState(
    () =>
      typeof document !== "undefined" &&
      "pictureInPictureEnabled" in document &&
      document.pictureInPictureEnabled,
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // One frame of the composite grid; re-schedules itself while PiP is open.
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const pipVideo = videoRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !pipVideo) return;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const videos = Array.from(
      stageRef.current?.querySelectorAll("video") ?? [],
    ).filter((v) => v.readyState >= 2 && v.videoWidth > 0);

    const n = videos.length;
    if (n > 0) {
      const cols = Math.ceil(Math.sqrt(n));
      const rows = Math.ceil(n / cols);
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
      videos.forEach((v, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        drawCover(ctx, v, col * cellW, row * cellH, cellW, cellH);
      });
    }

    if (document.pictureInPictureElement === pipVideo) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, [stageRef]);

  // Tear down the RAF loop, stop the captured stream, and drop the hidden video.
  const cleanup = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const pipVideo = videoRef.current;
    if (pipVideo) {
      const stream = pipVideo.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      pipVideo.srcObject = null;
      pipVideo.remove();
    }
    videoRef.current = null;
    canvasRef.current = null;
    setPipActive(false);
  }, []);

  const togglePip = useCallback(async () => {
    if (!pipSupported) return;

    // Already open → close and let the leave handler clean up.
    if (document.pictureInPictureElement || videoRef.current) {
      try {
        await document.exitPictureInPicture();
      } catch {
        /* window already gone */
      }
      cleanup();
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Prime one black frame so the captured stream has content immediately
      // and `loadedmetadata` can fire.
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    canvasRef.current = canvas;

    const pipVideo = document.createElement("video");
    pipVideo.muted = true;
    pipVideo.autoplay = true;
    pipVideo.playsInline = true;
    pipVideo.srcObject = canvas.captureStream();
    videoRef.current = pipVideo;

    pipVideo.addEventListener("enterpictureinpicture", () => {
      setPipActive(true);
      draw();
    });
    pipVideo.addEventListener("leavepictureinpicture", () => {
      cleanup();
    });
    pipVideo.onloadedmetadata = () => {
      pipVideo.requestPictureInPicture().catch(() => cleanup());
    };

    try {
      await pipVideo.play();
    } catch {
      cleanup();
    }
  }, [pipSupported, draw, cleanup]);

  // Never leak a PiP window or camera-canvas stream when the view unmounts.
  useEffect(() => {
    return () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }
      cleanup();
    };
  }, [cleanup]);

  return { pipActive, pipSupported, togglePip };
}
