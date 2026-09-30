import { useEffect } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";

interface MicEnforcerProps {
  participantId: string;
  /** When true, this remote participant is force-muted whenever their mic turns on. */
  enforced: boolean;
}

/**
 * Render-null host-side backstop for the "Unmute Themselves" restriction.
 *
 * The meeting-level render only re-runs on join/leave, not when a remote's
 * `micOn` flips, so a plain effect in LiveMeetingView can't observe a guest
 * un-muting. Mounting one of these per remote subscribes to that participant's
 * media via `useParticipant`, so when they unmute while enforced we immediately
 * force-mute them again — authoritative because `disableMic()` is SFU-enforced.
 */
export default function MicEnforcer({ participantId, enforced }: MicEnforcerProps) {
  const { micOn, disableMic } = useParticipant(participantId);

  useEffect(() => {
    if (enforced && micOn) {
      try {
        disableMic();
      } catch {
        /* participant may have already left */
      }
    }
  }, [enforced, micOn, disableMic]);

  return null;
}
