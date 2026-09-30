import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import PreJoin from "@/components/meeting/PreJoin";
import LiveMeeting from "@/components/meeting/LiveMeeting";
import DemoMeeting from "@/components/meeting/DemoMeeting";
import { hasToken } from "@/lib/videosdk/token";
import { validateMeeting } from "@/lib/videosdk/api";
import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";

export default function MeetingRoom() {
  const { roomId = "000-000-000" } = useParams();
  const navigate = useNavigate();
  const displayName = useUserStore((s) => s.displayName);
  const [params] = useSearchParams();

  // Deep-linking into a room as host (e.g. a "Start" link) survives a fresh
  // page load, where the in-memory session role would otherwise reset.
  useEffect(() => {
    if (params.get("role") === "host") useSessionStore.getState().setRole("host");
  }, [params]);

  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);

  const leave = (reason?: string) =>
    navigate("/", reason ? { state: { toast: reason } } : undefined);

  // A real VideoSDK room requires a token and a real (non-demo) roomId.
  const isLive = hasToken() && !roomId.startsWith("demo-");

  // For a live room, confirm the id actually exists before entering the meeting,
  // so a mistyped/expired id shows an error instead of dropping into a room that
  // will never connect. Demo rooms are local-only and always joinable. Throwing
  // here surfaces the message inline on the pre-join screen.
  const handleJoin = async ({ micOn: m, webcamOn: w }: { micOn: boolean; webcamOn: boolean }) => {
    setMicOn(m);
    setWebcamOn(w);
    if (isLive && !(await validateMeeting(roomId))) {
      throw new Error("The meeting ID is incorrect. Check the ID and try again.");
    }
    setJoined(true);
  };

  if (!joined) {
    return <PreJoin onJoin={handleJoin} />;
  }

  if (isLive) {
    return (
      <LiveMeeting
        key={roomId}
        roomId={roomId}
        name={displayName}
        micOn={micOn}
        webcamOn={webcamOn}
        onLeave={leave}
      />
    );
  }

  return (
    <DemoMeeting
      roomId={roomId}
      // In demo mode you run your own mock meeting, so you're the host —
      // this keeps host-only features (polls, mute-all) demoable.
      isHost
      initialMicOn={micOn}
      initialWebcamOn={webcamOn}
      onLeave={leave}
    />
  );
}
