import { useState, type ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Video } from "lucide-react";
import Button from "@/components/ui/Button";
import { createMeeting } from "@/lib/videosdk/api";
import { hasToken } from "@/lib/videosdk/token";
import { useMeetingsStore } from "@/store/useMeetingsStore";
import { useUserStore } from "@/store/useUserStore";

function defaultStart(): string {
  // Next top-of-hour, formatted for datetime-local (local time).
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Schedule() {
  const navigate = useNavigate();
  const addMeeting = useMeetingsStore((s) => s.addMeeting);
  const displayName = useUserStore((s) => s.displayName);

  const [topic, setTopic] = useState("My Meeting");
  const [startsAt, setStartsAt] = useState(defaultStart());
  const [duration, setDuration] = useState(30);
  const [videoOn, setVideoOn] = useState(true);
  const [muteOnEntry, setMuteOnEntry] = useState(true);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const roomId = hasToken()
      ? await createMeeting().catch(() => `demo-${Date.now()}`)
      : `demo-${Date.now()}`;
    addMeeting({
      id: crypto.randomUUID(),
      topic: topic.trim() || "My Meeting",
      roomId,
      startsAt: new Date(startsAt).toISOString(),
      durationMinutes: duration,
      hostName: displayName || "Host",
      videoOn,
      muteOnEntry,
    });
    navigate("/");
  }

  return (
    <div className="flex min-h-full flex-col bg-portal-bg">
      <header className="flex h-14 items-center border-b border-portal-border bg-portal-card px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Video className="h-6 w-6 text-zoom-blue" />
          <span className="text-lg font-semibold text-text-on-light">Zoom</span>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 py-8 md:px-6">
        <h1 className="mb-6 text-2xl font-semibold text-text-on-light">
          Schedule a Meeting
        </h1>

        <div className="space-y-5 rounded-2xl bg-portal-card p-5 shadow-sm ring-1 ring-portal-border md:p-6">
          <Field label="Topic">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Start">
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Duration (minutes)">
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input"
              >
                {[15, 30, 45, 60, 90, 120].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium text-text-on-light">
              Video
            </legend>
            <Checkbox
              label="Host video on"
              checked={videoOn}
              onChange={setVideoOn}
            />
            <Checkbox
              label="Mute participants on entry"
              checked={muteOnEntry}
              onChange={setMuteOnEntry}
            />
          </fieldset>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </main>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-portal-border);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: var(--color-text-on-light);
          outline: none;
        }
        .input:focus {
          border-color: var(--color-zoom-blue);
          box-shadow: 0 0 0 1px var(--color-zoom-blue);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text-on-light">
        {label}
      </span>
      {children}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text-on-light">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-zoom-blue"
      />
      {label}
    </label>
  );
}
