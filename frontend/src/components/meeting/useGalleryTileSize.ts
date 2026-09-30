import { useCallback, useRef, useState, type CSSProperties } from "react";

const GAP = 8; // px, matches gap-2
const ASPECT = 16 / 9;

/** Columns per count so trailing rows center nicely (matches Figma tiling). */
export function columnsFor(count: number): number {
  if (count <= 1) return 1;
  if (count <= 4) return 2; // 2 → row, 3 → 2+1 centered, 4 → 2×2
  if (count <= 9) return 3;
  if (count <= 16) return 4;
  return 5;
}

/**
 * Column count that yields the largest 16:9 tile for a given container. The
 * fixed `columnsFor` table is tuned for landscape (desktop); on a tall, narrow
 * container (a phone in portrait) it wastes most of the height -- 3 people at 2
 * columns leaves the bottom two-thirds of the screen empty. Here we just try
 * every column count and keep whichever fills the most area.
 */
function bestColumnsForArea(count: number, w: number, h: number): number {
  const tileWidthFor = (c: number) => {
    const rows = Math.ceil(count / c);
    const wByWidth = (w - (c - 1) * GAP) / c;
    const hByHeight = (h - (rows - 1) * GAP) / rows;
    return Math.min(wByWidth, hByHeight * ASPECT);
  };

  const best = Math.max(...Array.from({ length: count }, (_, i) => tileWidthFor(i + 1)));
  // Among near-optimal layouts, prefer more columns so we fill the width rather
  // than leaving a lone narrow column with big side margins. A single column
  // only wins when it is decisively bigger (e.g. 3 people → 3 full-width rows).
  let chosen = 1;
  for (let c = 1; c <= count; c++) {
    if (tileWidthFor(c) >= best * 0.9) chosen = c;
  }
  return chosen;
}

/**
 * Size gallery tiles so a fixed 16:9 grid always fits its container. Tiles are
 * sized by width alone would overflow vertically once a second row appears (a
 * 3-up layout is 2 rows), clipping the trailing row under the control bar.
 * Measuring the area lets us cap each tile to the smaller of the column-width
 * and row-height budgets, so every row stays visible for any participant count.
 *
 * Attach `ref` to the flex-wrap container and spread `tileStyle` on each tile
 * wrapper. Callers keep their own keyed wrappers so video tiles never remount.
 *
 * `ref` is a callback ref so the observer re-attaches whenever the container
 * mounts -- the gallery is conditionally rendered (speaker/gallery toggle), so a
 * mount-only effect would miss it after a view switch.
 */
export function useGalleryTileSize(count: number) {
  const observerRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const ref = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(node);
    observerRef.current = ro;
  }, []);

  // Landscape (desktop) keeps the Figma tiling; a portrait container (phone)
  // picks the column count that best fills the tall, narrow space.
  const portrait = size.w > 0 && size.h > size.w;
  const cols = portrait
    ? bestColumnsForArea(count, size.w, size.h)
    : columnsFor(count);
  const rows = Math.ceil(Math.max(count, 1) / cols);

  let tileW = 0;
  let tileH = 0;
  if (size.w > 0 && size.h > 0) {
    const wByWidth = (size.w - (cols - 1) * GAP) / cols;
    const hByHeight = (size.h - (rows - 1) * GAP) / rows;
    tileW = Math.min(wByWidth, hByHeight * ASPECT);
    tileH = tileW / ASPECT;
  }

  // Before the first measurement, fall back to width-only sizing to avoid a
  // zero-size flash; the ResizeObserver corrects it on the next frame.
  const tileStyle: CSSProperties =
    tileW > 0
      ? { width: tileW, height: tileH }
      : {
          width: `calc((100% - ${(cols - 1) * GAP}px) / ${cols})`,
          aspectRatio: "16 / 9",
        };

  return { ref, tileStyle, cols };
}
