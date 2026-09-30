import { useState } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { MoreHorizontal, MicOff, VideoOff, UserX } from "lucide-react";

/** Host-only per-participant controls (mute, stop video, remove) for a remote participant. */
export default function LiveParticipantRowActions({
  participantId,
  onRemove,
}: {
  participantId: string;
  /** Tells the server first, so the removed person can't fetch a new media token. */
  onRemove: () => void;
}) {
  const { disableMic, disableWebcam, remove, micOn, webcamOn } =
    useParticipant(participantId);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-hover"
        aria-label="Participant actions"
      >
        <MoreHorizontal className="h-4 w-4 text-white" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-7 z-20 w-40 overflow-hidden rounded-lg bg-panel-2 py-1 shadow-lg ring-1 ring-panel-border">
            <MenuItem
              icon={MicOff}
              label="Mute"
              disabled={!micOn}
              onClick={() => {
                disableMic();
                setOpen(false);
              }}
            />
            <MenuItem
              icon={VideoOff}
              label="Stop Video"
              disabled={!webcamOn}
              onClick={() => {
                disableWebcam();
                setOpen(false);
              }}
            />
            <MenuItem
              icon={UserX}
              label="Remove"
              danger
              onClick={() => {
                onRemove();
                remove();
                setOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
  disabled,
}: {
  icon: typeof MicOff;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-hover disabled:opacity-40 ${
        danger ? "text-leave-hover" : "text-text-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
