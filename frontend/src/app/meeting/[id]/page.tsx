"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PreJoin from "@/components/meeting/PreJoin";
import RealMeeting from "@/components/meeting/RealMeeting";
import dynamic from "next/dynamic";
const LiveMeeting = dynamic(() => import("@/components/meeting/LiveMeeting"), { ssr: false });
import { hasToken } from "@/lib/videosdk/token";
import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export default function MeetingPage() {
  const params = useParams();
  const roomId = typeof params.id === "string" ? params.id : "000-000-000";
  const router = useRouter();
  const searchParams = useSearchParams();

  const { displayName, setDisplayName } = useUserStore();

  useEffect(() => {
    if (searchParams?.get("role") === "host") {
      useSessionStore.getState().setRole("host");
    }
  }, [searchParams]);

  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);
  const [resolvedName, setResolvedName] = useState("");

  // Only use VideoSDK live rooms when a token is properly configured
  const isLive = hasToken() && !roomId.startsWith("demo-");

  function leave(reason?: string) {
    if (reason) sessionStorage.setItem("zoom_toast", reason);
    router.push("/");
  }

  async function handleJoin(opts: { micOn: boolean; webcamOn: boolean; name: string }) {
    const name = opts.name.trim() || displayName || "Guest";

    // Persist chosen name
    setDisplayName(name);
    setResolvedName(name);
    setMicOn(opts.micOn);
    setWebcamOn(opts.webcamOn);

    // Validate meeting exists in our backend
    try {
      await axios.get(`${API_BASE}/meetings/${roomId}`);
    } catch {
      // If meeting doesn't exist in our DB, that's OK for instant rooms
      // that were created outside the normal flow (e.g. direct URL).
      // We still let them in — they just won't have a record.
    }

    setJoined(true);
  }

  if (!joined) {
    return <PreJoin onJoin={handleJoin} />;
  }

  // Live multi-user mode (requires VideoSDK token in .env.local)
  if (isLive) {
    return (
      <LiveMeeting
        key={roomId}
        roomId={roomId}
        name={resolvedName || displayName}
        micOn={micOn}
        webcamOn={webcamOn}
        onLeave={leave}
      />
    );
  }

  // Real local meeting using your actual camera + mic (no fake participants)
  return (
    <RealMeeting
      roomId={roomId}
      displayName={resolvedName || displayName || "Guest"}
      initialMicOn={micOn}
      initialWebcamOn={webcamOn}
      onLeave={leave}
    />
  );
}
