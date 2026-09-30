import { useState, type ReactNode } from "react";
import { Mic, MicOff, Video, VideoOff, Hand, MoreHorizontal, Check } from "lucide-react";
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
              className="flex h-9 items-center gap-1.5 rounded-full bg-[#2b2b2e] px-5 text-xs font-semibold hover:bg-[#38383c]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-zoom-blue" /> Copied
                </>
              ) : (
                "Invite"
              )}
            </button>
            <button
              onClick={onMuteAll}
              className="h-9 rounded-full bg-[#2b2b2e] px-5 text-xs font-semibold hover:bg-[#38383c]"
            >
              Mute All
            </button>
            <button className="h-9 rounded-full border-2 border-[#2d8cff] px-6 text-xs font-semibold hover:bg-white/5">
              More
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={copyInviteLink}
              className="flex h-9 items-center gap-1.5 rounded-full bg-[#2b2b2e] px-5 text-xs font-semibold hover:bg-[#38383c]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-zoom-blue" /> Copied
                </>
              ) : (
                "Invite"
              )}
            </button>
            <button
              onClick={onRaiseHand}
              className="flex h-9 items-center gap-1.5 rounded-full bg-[#2b2b2e] px-5 text-xs font-semibold hover:bg-[#38383c]"
            >
              <Hand className="h-4 w-4" /> Raise Hand
            </button>
          </div>
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
              className="flex items-center gap-3 px-4 py-2 hover:bg-white/5"
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
            className="group flex items-center gap-3 px-4 py-2 hover:bg-white/5"
          >
            <Avatar name={p.name} color={p.color} size={32} />
            <div className="min-w-0 flex-1 truncate text-sm text-text-primary">
              {p.name}
              {(p.isHost || p.isLocal) && (
                <span>
                  ({[p.isHost && "Host", p.isLocal && "me"].filter(Boolean).join(", ")})
                </span>
              )}
            </div>
            {p.handRaised && <Hand className="h-4 w-4 text-raise-hand" />}
            {p.micOn ? (
              <Mic className="h-4 w-4 text-white/80" />
            ) : (
              <MicOff className="h-4 w-4 text-[#f0587a]" />
            )}
            {p.webcamOn ? (
              <Video className="h-4 w-4 text-white/80" />
            ) : (
              <VideoOff className="h-4 w-4 text-[#f0587a]" />
            )}
            {isHost && !p.isLocal && renderRowActions ? (
              renderRowActions(p.id)
            ) : (
              <button
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/10"
                aria-label="More"
              >
                <MoreHorizontal className="h-4 w-4 text-white" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </SidePanel>
  );
}
