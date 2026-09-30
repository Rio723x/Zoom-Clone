import { useState, type ReactNode } from "react";
import { Mic, MicOff, Video, VideoOff, Hand, MoreHorizontal, UserPlus, Check } from "lucide-react";
import SidePanel from "./SidePanel";
import Avatar from "@/components/ui/Avatar";
import type { ParticipantVM } from "@/lib/participantVM";

interface WaitingParticipant {
  id: string;
  name: string;
}

interface ParticipantsPanelProps {
  participants: ParticipantVM[];
  isHost: boolean;
  onClose: () => void;
  onMuteAll?: () => void;
  onRaiseHand?: () => void;
  /** Host-only per-row controls for remote participants (live mode). */
  renderRowActions?: (participantId: string) => ReactNode;
  /** Host-only Waiting Room queue. */
  waiting?: WaitingParticipant[];
  onAdmit?: (id: string) => void;
  onDeny?: (id: string) => void;
}

export default function ParticipantsPanel({
  participants,
  isHost,
  onClose,
  onMuteAll,
  onRaiseHand,
  renderRowActions,
  waiting = [],
  onAdmit,
  onDeny,
}: ParticipantsPanelProps) {
  const showWaiting = isHost && waiting.length > 0;
  const [copied, setCopied] = useState(false);

  const copyInviteLink = async () => {
    // Guest invite link: the meeting URL itself (host status comes from the host token, not the URL).
    const link = window.location.origin + window.location.pathname;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for browsers/contexts without the async clipboard API.
      const el = document.createElement("textarea");
      el.value = link;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SidePanel
      title={`Participants (${participants.length})`}
      onClose={onClose}
      footer={
        isHost ? (
          <div className="flex items-center justify-between">
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-1.5 rounded-md border border-panel-border px-3 py-1.5 text-xs font-medium hover:bg-hover"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-zoom-blue" /> Copied
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Invite
                </>
              )}
            </button>
            <button
              onClick={onMuteAll}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-zoom-blue hover:bg-hover"
            >
              Mute All
            </button>
          </div>
        ) : (
          <button
            onClick={onRaiseHand}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-panel-border px-3 py-1.5 text-xs font-medium hover:bg-hover"
          >
            <Hand className="h-4 w-4" /> Raise Hand
          </button>
        )
      }
    >
      {showWaiting && (
        <div className="border-b border-panel-border pb-1">
          <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Waiting Room ({waiting.length})
          </p>
          {waiting.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-3 px-4 py-2 hover:bg-hover/50"
            >
              <Avatar name={w.name} color="#6b7280" size={32} />
              <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                {w.name}
              </span>
              <button
                onClick={() => onDeny?.(w.id)}
                className="rounded border border-panel-border px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-hover"
              >
                Remove
              </button>
              <button
                onClick={() => onAdmit?.(w.id)}
                className="rounded bg-zoom-blue px-2.5 py-1 text-xs font-medium text-white hover:bg-zoom-blue-hover"
              >
                Admit
              </button>
            </div>
          ))}
        </div>
      )}
      <ul>
        {participants.map((p) => (
          <li
            key={p.id}
            className="group flex items-center gap-3 px-4 py-2 hover:bg-hover/50"
          >
            <Avatar name={p.name} color={p.color} size={32} />
            <div className="min-w-0 flex-1">
              <span className="text-sm text-text-primary">
                {p.name}
                {p.isLocal && <span className="text-text-secondary"> (You)</span>}
              </span>
              {p.isHost && (
                <span className="ml-1 text-xs text-text-secondary">Host</span>
              )}
            </div>
            {p.handRaised && <Hand className="h-4 w-4 text-raise-hand" />}
            {p.micOn ? (
              <Mic className="h-4 w-4 text-text-secondary" />
            ) : (
              <MicOff className="h-4 w-4 text-leave-hover" />
            )}
            {p.webcamOn ? (
              <Video className="h-4 w-4 text-text-secondary" />
            ) : (
              <VideoOff className="h-4 w-4 text-leave-hover" />
            )}
            {isHost && !p.isLocal && (
              renderRowActions ? (
                renderRowActions(p.id)
              ) : (
                <button className="flex h-6 w-6 items-center justify-center rounded opacity-0 hover:bg-hover group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4 text-text-secondary" />
                </button>
              )
            )}
          </li>
        ))}
      </ul>
    </SidePanel>
  );
}
