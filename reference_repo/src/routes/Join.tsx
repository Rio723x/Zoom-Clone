import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Video } from "lucide-react";
import Button from "@/components/ui/Button";
import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";

export default function Join() {
  const navigate = useNavigate();
  const { displayName, setDisplayName } = useUserStore();
  const setRole = useSessionStore((s) => s.setRole);
  const [meetingId, setMeetingId] = useState("");
  const [name, setName] = useState(displayName);

  const canJoin = meetingId.trim().length > 0 && name.trim().length > 0;

  function join() {
    if (!canJoin) return;
    setDisplayName(name.trim());
    setRole("participant");
    navigate(`/meeting/${meetingId.trim()}`);
  }

  return (
    <div className="flex min-h-full flex-col bg-portal-bg">
      <header className="flex h-14 items-center border-b border-portal-border bg-portal-card px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Video className="h-6 w-6 text-zoom-blue" />
          <span className="text-lg font-semibold text-text-on-light">Zoom</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 md:px-6">
        <div className="w-full max-w-sm rounded-2xl bg-portal-card p-6 shadow-sm ring-1 ring-portal-border md:p-8">
          <h1 className="mb-6 text-center text-2xl font-semibold text-text-on-light">
            Join a Meeting
          </h1>
          <div className="space-y-3">
            <input
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Meeting ID or Personal Link Name"
              className="w-full rounded-lg border border-portal-border px-4 py-2.5 text-sm text-text-on-light outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full rounded-lg border border-portal-border px-4 py-2.5 text-sm text-text-on-light outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
            />
            <Button
              className="w-full"
              disabled={!canJoin}
              onClick={join}
            >
              Join
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-text-secondary">
            By clicking "Join", you agree to our Terms of Service and Privacy Statement.
          </p>
        </div>
      </main>
    </div>
  );
}
