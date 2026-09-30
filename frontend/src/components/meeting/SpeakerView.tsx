import type { ReactNode } from "react";

interface SpeakerViewProps {
  /** Thumbnail tiles for the top filmstrip (caller-rendered). */
  filmstrip: ReactNode[];
  /** The large main area: active speaker, screen share, or whiteboard. */
  main: ReactNode;
}

/**
 * Speaker-view layout: a horizontal filmstrip of thumbnails on top and one large
 * main area below. Also used for screen-share / whiteboard (they become `main`,
 * participants become the filmstrip).
 */
export default function SpeakerView({ filmstrip, main }: SpeakerViewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-2 p-3">
      {filmstrip.length > 0 && (
        <div className="flex h-[92px] shrink-0 items-center justify-center gap-2 overflow-x-auto md:h-[132px]">
          {filmstrip.map((tile, i) => (
            <div key={i} className="h-full aspect-video shrink-0">
              {tile}
            </div>
          ))}
        </div>
      )}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {main}
      </div>
    </div>
  );
}
