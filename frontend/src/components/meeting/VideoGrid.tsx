import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ParticipantTile from "./ParticipantTile";
import { useGalleryTileSize } from "./useGalleryTileSize";
import type { ParticipantVM } from "@/lib/participantVM";

interface VideoGridProps {
  participants: ParticipantVM[];
  activeSpeakerId?: string;
}

const PAGE_SIZE = 25;

export default function VideoGrid({ participants, activeSpeakerId }: VideoGridProps) {
  const [page, setPage] = useState(0);

  const pages = Math.max(1, Math.ceil(participants.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const shown = participants.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const { ref, tileStyle } = useGalleryTileSize(shown.length);

  return (
    <div className="relative flex h-full w-full items-center justify-center p-4">
      <div
        ref={ref}
        className="flex h-full w-full flex-wrap content-center items-center justify-center gap-2"
      >
        {shown.map((p) => (
          <div key={p.id} style={tileStyle}>
            <ParticipantTile
              participant={p}
              isActiveSpeaker={p.id === activeSpeakerId}
            />
          </div>
        ))}
      </div>

      {pages > 1 && (
        <>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-0"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={safePage >= pages - 1}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-0"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
            {safePage + 1} / {pages}
          </div>
        </>
      )}
    </div>
  );
}
