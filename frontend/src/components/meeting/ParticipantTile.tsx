import { Mic, MicOff, Hand } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import type { ParticipantVM } from "@/lib/participantVM";

interface ParticipantTileProps {
  participant: ParticipantVM;
  isActiveSpeaker?: boolean;
}

export default function ParticipantTile({
  participant,
  isActiveSpeaker = false,
}: ParticipantTileProps) {
  const { name, micOn, webcamOn, handRaised, color, reaction } = participant;
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-tile bg-tile",
        isActiveSpeaker && "ring-2 ring-active-speaker",
      )}
    >
      {webcamOn ? (
        // Static "video" placeholder -- a subtle gradient stands in for a camera feed.
        <div
          className="h-full w-full"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${color}cc, ${color}55 60%, #111 100%)`,
          }}
        />
      ) : (
        <Avatar name={name} color={color} size={88} />
      )}

      {/* Raised hand */}
      {handRaised && (
        <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60">
          <Hand className="h-4 w-4 text-raise-hand" />
        </div>
      )}

      {/* Reaction */}
      {reaction && (
        <div className="absolute right-2 top-2 text-2xl">{reaction}</div>
      )}

      {/* Name pill + mic status (solid black, bottom-left, per Figma) */}
      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1.5 rounded bg-black/75 px-2 py-1">
        {micOn ? (
          <Mic className="h-3 w-3 text-white" />
        ) : (
          <MicOff className="h-3 w-3 text-leave-hover" />
        )}
        <span className="text-xs font-medium text-white">{name}</span>
      </div>
    </div>
  );
}
