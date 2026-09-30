"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy, Check } from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

const DURATION_OPTIONS = [
  { value: 15,  label: "15 minutes" },
  { value: 30,  label: "30 minutes" },
  { value: 45,  label: "45 minutes" },
  { value: 60,  label: "1 hour" },
  { value: 90,  label: "1 hour 30 minutes" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
];

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function SchedulePage() {
  const router = useRouter();
  const [title, setTitle] = useState("My Meeting");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTomorrow());
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [scheduled, setScheduled] = useState<{ id: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const res = await axios.post(`${API_BASE}/meetings/schedule`, {
        title: title.trim(),
        description: description.trim() || null,
        scheduled_at: scheduledAt,
        duration,
      });
      setScheduled(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!scheduled) return;
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${scheduled.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (scheduled) {
    const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/meeting/${scheduled.id}`;
    return (
      <div className="flex min-h-screen items-center justify-center bg-portal-bg px-4">
        <div className="w-full max-w-sm rounded-2xl border border-portal-border bg-portal-card px-8 py-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="h-7 w-7" />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-text-on-light">Meeting Scheduled!</h2>
          <p className="mb-5 text-sm text-text-label">{title}</p>

          <div className="mb-4 rounded-xl bg-portal-bg px-4 py-3 text-left">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-label">Meeting ID</p>
            <p className="font-mono text-sm font-semibold text-text-on-light">{scheduled.id}</p>
          </div>

          <div className="mb-6 rounded-xl bg-portal-bg px-4 py-3 text-left">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-label">Invite Link</p>
            <p className="break-all font-mono text-xs text-text-on-light">{inviteLink}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-portal-border py-2 text-sm font-medium text-text-on-light hover:bg-portal-hover"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 rounded-lg bg-zoom-blue py-2 text-sm font-semibold text-white hover:bg-zoom-blue-hover"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-portal-bg px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#0B5CFF"/>
            <path d="M8 14.5C8 12.567 9.567 11 11.5 11h13C26.433 11 28 12.567 28 14.5v11C28 27.433 26.433 29 24.5 29h-13C9.567 29 8 27.433 8 25.5v-11Z" fill="white"/>
            <path d="M29 16l6-4v16l-6-4V16Z" fill="white"/>
          </svg>
          <span className="text-2xl font-semibold text-text-on-light">Zoom</span>
        </div>

        <div className="rounded-2xl border border-portal-border bg-portal-card px-8 py-8 shadow-sm">
          <h1 className="mb-6 text-xl font-semibold text-text-on-light">Schedule a Meeting</h1>

          <form onSubmit={handleSchedule} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-on-light">Topic <span className="text-leave">*</span></label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-lg border border-portal-border bg-portal-bg px-3.5 py-2.5 text-sm text-text-on-light outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-on-light">Description <span className="text-text-label text-xs">(optional)</span></label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Add a description…"
                className="w-full resize-none rounded-lg border border-portal-border bg-portal-bg px-3.5 py-2.5 text-sm text-text-on-light placeholder:text-text-label outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-on-light">Date <span className="text-leave">*</span></label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-portal-border bg-portal-bg px-3.5 py-2.5 text-sm text-text-on-light outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-on-light">Time <span className="text-leave">*</span></label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full rounded-lg border border-portal-border bg-portal-bg px-3.5 py-2.5 text-sm text-text-on-light outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-on-light">Duration</label>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-portal-border bg-portal-bg px-3.5 py-2.5 text-sm text-text-on-light outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
              >
                {DURATION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 rounded-lg border border-portal-border py-2.5 text-sm font-medium text-text-on-light hover:bg-portal-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !date || !time}
                className="flex-1 rounded-lg bg-zoom-blue py-2.5 text-sm font-semibold text-white hover:bg-zoom-blue-hover disabled:opacity-50 transition-colors"
              >
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
