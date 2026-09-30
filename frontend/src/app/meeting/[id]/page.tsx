"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import PreJoin from "@/components/meeting/PreJoin";
import { api, apiErrorMessage, isNotFound } from "@/lib/api";
import { getHostToken, removeHostToken } from "@/lib/hostTokens";
import type { JoinResult } from "@/lib/types";
import { useSessionStore } from "@/store/useSessionStore";
import { useUserStore } from "@/store/useUserStore";

// The video SDK touches browser-only APIs, so the meeting itself never renders on the server.
const MeetingSession = dynamic(() => import("@/components/meeting/MeetingSession"), {
  ssr: false,
});

interface ActiveSession {
  join: JoinResult;
  name: string;
  micOn: boolean;
  webcamOn: boolean;
}

const STALE_HOST_TOKEN = "Invalid host token";

export default function MeetingPage() {
  const params = useParams();
  const meetingId = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const setDisplayName = useUserStore((s) => s.setDisplayName);

  const [session, setSession] = useState<ActiveSession | null>(null);
  const [missing, setMissing] = useState(false);

  // Fail early on a bad link instead of after the user has set up their camera.
  useEffect(() => {
    let cancelled = false;
    api.getMeeting(meetingId).catch((err) => {
      if (!cancelled && isNotFound(err)) setMissing(true);
    });
    return () => {
      cancelled = true;
    };
  }, [meetingId]);

  function leave(reason?: string) {
    if (reason) sessionStorage.setItem("zoom_toast", reason);
    router.push("/");
  }

  async function handleJoin(opts: { micOn: boolean; webcamOn: boolean; name: string }) {
    const name = opts.name.trim();
    setDisplayName(name);

    let join: JoinResult;
    try {
      join = await api.joinMeeting(meetingId, name, getHostToken(meetingId));
    } catch (err) {
      if (apiErrorMessage(err, "") !== STALE_HOST_TOKEN) {
        throw new Error(apiErrorMessage(err, "Unable to join the meeting."));
      }
      // The saved host token no longer matches (e.g. the meeting was recreated): join as a guest.
      removeHostToken(meetingId);
      try {
        join = await api.joinMeeting(meetingId, name, null);
      } catch (retryErr) {
        throw new Error(apiErrorMessage(retryErr, "Unable to join the meeting."));
      }
    }

    useSessionStore.getState().setRole(join.role === "host" ? "host" : "participant");
    setSession({ join, name, micOn: opts.micOn, webcamOn: opts.webcamOn });
  }

  if (missing) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-stage px-4 text-center text-text-primary">
        <h1 className="text-xl font-semibold">Meeting not found</h1>
        <p className="text-sm text-text-secondary">
          Check the meeting ID or link ({meetingId}) and try again.
        </p>
        <button
          onClick={() => router.push("/")}
          className="rounded-md bg-zoom-blue px-6 py-2 text-sm font-medium text-white hover:bg-zoom-blue-hover"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!session) {
    return <PreJoin onJoin={handleJoin} />;
  }

  return (
    <MeetingSession
      key={meetingId}
      join={session.join}
      name={session.name}
      micOn={session.micOn}
      webcamOn={session.webcamOn}
      onLeave={leave}
    />
  );
}
