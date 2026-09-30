import { MeetingProvider, Constants } from "@videosdk.live/react-sdk";
import { VIDEOSDK_TOKEN } from "@/lib/videosdk/token";
import LiveMeetingView from "./LiveMeetingView";

interface LiveMeetingProps {
  roomId: string;
  name: string;
  micOn: boolean;
  webcamOn: boolean;
  onLeave: (reason?: string) => void;
}

/**
 * Wraps VideoSDK's MeetingProvider for a single room. Keyed by roomId upstream
 * so switching rooms cleanly remounts the provider.
 */
export default function LiveMeeting({
  roomId,
  name,
  micOn,
  webcamOn,
  onLeave,
}: LiveMeetingProps) {
  return (
    // Security enforcement is host-authoritative: the host issues SFU-enforced
    // commands (disableMic / disableWebcam / remove) plus cooperative pubsub.
    // Making it bulletproof against a fully modified client would require
    // per-participant role permissions minted into the JWT server-side, which
    // belongs in the token (not this client config) and needs a token backend —
    // intentionally out of scope for this demo.
    <MeetingProvider
      token={VIDEOSDK_TOKEN}
      config={{
        meetingId: roomId,
        name: name || "Guest",
        micEnabled: micOn,
        webcamEnabled: webcamOn,
        mode: Constants.modes.SEND_AND_RECV as "SEND_AND_RECV",
        multiStream: true,
        debugMode: false,
      }}
      joinWithoutUserInteraction
    >
      <LiveMeetingView
        roomId={roomId}
        initialMicOn={micOn}
        initialWebcamOn={webcamOn}
        onLeave={onLeave}
      />
    </MeetingProvider>
  );
}
