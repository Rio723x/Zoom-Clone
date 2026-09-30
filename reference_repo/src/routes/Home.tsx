import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Video, Plus, Calendar, Clock, X } from "lucide-react";
import ActionTile from "@/components/home/ActionTile";
import { createMeeting } from "@/lib/videosdk/api";
import { hasToken } from "@/lib/videosdk/token";
import { useMeetingsStore } from "@/store/useMeetingsStore";
import { useSessionStore } from "@/store/useSessionStore";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const now = useClock();
  const meetings = useMeetingsStore((s) => s.meetings);
  const setRole = useSessionStore((s) => s.setRole);
  const [starting, setStarting] = useState(false);

  // A toast set by the meeting route when a guest is bounced (lock / removed).
  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null,
  );
  useEffect(() => {
    if (!toast) return;
    // Clear the history state so a refresh doesn't re-show the toast.
    window.history.replaceState({}, "");
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  async function startInstant() {
    setStarting(true);
    setRole("host");
    try {
      const roomId = hasToken() ? await createMeeting() : `demo-${Date.now()}`;
      navigate(`/meeting/${roomId}`);
    } catch {
      // Fall back to a demo room if the token is missing/expired.
      navigate(`/meeting/demo-${Date.now()}`);
    }
  }

  return (
    <div className="min-h-screen bg-portal-bg">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-leave px-4 py-2.5 text-sm text-white shadow-lg">
          <span>{toast}</span>
          <button
            onClick={() => setToast(null)}
            className="rounded p-0.5 hover:bg-white/20"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* Top nav */}
      <header className="flex h-14 items-center justify-between border-b border-portal-border bg-portal-card px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Video className="h-6 w-6 text-zoom-blue" />
          <span className="text-lg font-semibold text-text-on-light">Zoom</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zoom-blue text-sm font-medium text-white">
          Z
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        {/* Clock */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 text-text-secondary">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{date}</span>
          </div>
          <div className="mt-1 text-4xl font-light tabular-nums text-text-on-light md:text-6xl">
            {time}
          </div>
        </div>

        {/* Action tiles */}
        <div className="mx-auto grid max-w-xl grid-cols-3 gap-4">
          <ActionTile
            icon={Video}
            label="New Meeting"
            color="#f56b3d"
            onClick={startInstant}
          />
          <ActionTile
            icon={Plus}
            label="Join"
            color="#2d8cff"
            onClick={() => navigate("/join")}
          />
          <ActionTile
            icon={Calendar}
            label="Schedule"
            color="#2d8cff"
            onClick={() => navigate("/schedule")}
          />
        </div>

        {starting && (
          <p className="mt-4 text-center text-sm text-text-secondary">
            Creating meeting…
          </p>
        )}

        {/* Upcoming meetings */}
        <section className="mx-auto mt-12 max-w-2xl">
          <h2 className="mb-3 text-sm font-semibold text-text-on-light">
            Upcoming meetings
          </h2>
          {meetings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-portal-border bg-portal-card p-8 text-center text-sm text-text-secondary">
              No upcoming meetings. Click <span className="font-medium">Schedule</span> to plan one.
            </div>
          ) : (
            <ul className="space-y-2">
              {meetings
                .slice()
                .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
                .map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-xl bg-portal-card p-4 shadow-sm ring-1 ring-portal-border"
                  >
                    <div>
                      <p className="font-medium text-text-on-light">{m.topic}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(m.startsAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {m.durationMinutes} min · ID {m.roomId}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setRole("host");
                        navigate(`/meeting/${m.roomId}`);
                      }}
                      className="rounded-md bg-zoom-blue px-4 py-1.5 text-sm font-medium text-white hover:bg-zoom-blue-hover"
                    >
                      Start
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
