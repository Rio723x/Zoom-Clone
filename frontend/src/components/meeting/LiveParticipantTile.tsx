import { useParticipant, AudioPlayer } from "@videosdk.live/react-sdk";
import { Mic, MicOff, Hand } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ParticipantVideo from "@/components/meeting/ParticipantVideo";
import { cn } from "@/lib/cn";
import { colorForId } from "@/lib/participantVM";

interface LiveParticipantTileProps {
  participantId: string;
  handRaised?: boolean;
  reaction?: string;
}

export default function LiveParticipantTile({
  participantId,
  handRaised = false,
  reaction,
}: LiveParticipantTileProps) {
  const { displayName, webcamOn, micOn, isLocal, isActiveSpeaker } =
    useParticipant(participantId);

  const name = displayName || "Guest";
  const color = colorForId(participantId);

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-tile bg-tile",
        isActiveSpeaker && "ring-2 ring-active-speaker",
      )}
    >
      {webcamOn ? (
        <ParticipantVideo
          participantId={participantId}
          containerStyle={{ height: "100%", width: "100%" }}
          videoStyle={{ height: "100%", width: "100%", objectFit: "cover" }}
        />
      ) : (
        <Avatar name={name} color={color} size={88} />
      )}

      {/* Remote audio (never render local audio -> echo). */}
      {!isLocal && <AudioPlayer participantId={participantId} type="audio" />}

      {handRaised && (
        <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60">
          <Hand className="h-4 w-4 text-raise-hand" />
        </div>
      )}
      {reaction && (
        <div className="absolute right-2 top-2 text-2xl">{reaction}</div>
      )}

      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1.5 rounded bg-black/75 px-2 py-1">
        {micOn ? (
          <Mic className="h-3 w-3 text-white" />
        ) : (
          <MicOff className="h-3 w-3 text-leave-hover" />
        )}
        <span className="text-xs font-medium text-white">
          {name}
          {isLocal && " (You)"}
        </span>
      </div>
    </div>
  );
}
