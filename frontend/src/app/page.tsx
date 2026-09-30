"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Video, Plus, Calendar, Copy, Link2, Clock,
  Trash2, MoreHorizontal, Search, Bell, Menu,
  Settings, HelpCircle, Home, AlignLeft, History,
} from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { getHostToken, removeHostToken, saveHostToken } from "@/lib/hostTokens";
import type { Meeting, RecentMeeting } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────
// ─── Helpers ──────────────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatMeetingTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────
type Tab = "home" | "meetings" | "history";

/**
 * Row actions that appear on hover. Only devices that can hover get the hide-until-hover
 * behaviour; on touch screens (phones, tablets) they stay visible, since there is no hover.
 */
const REVEAL_ON_HOVER =
  "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100";

function Sidebar({
  active,
  onChange,
  open,
  onClose,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  /** Small screens only: whether the off-canvas drawer is showing. */
  open: boolean;
  onClose: () => void;
}) {
  const items: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: "home",     icon: Home,      label: "Home"     },
    { id: "meetings", icon: AlignLeft, label: "Meetings" },
    { id: "history",  icon: History,   label: "History"  },
  ];

  return (
    <>
    {open && (
      <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} aria-hidden="true" />
    )}
    <aside
      aria-label="Main navigation"
      className={`fixed inset-y-0 left-0 z-40 flex h-full w-[220px] shrink-0 flex-col border-r border-portal-border bg-portal-sidebar transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-portal-border">
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#0B5CFF"/>
          <path d="M8 14.5C8 12.567 9.567 11 11.5 11h13C26.433 11 28 12.567 28 14.5v11C28 27.433 26.433 29 24.5 29h-13C9.567 29 8 27.433 8 25.5v-11Z" fill="white"/>
          <path d="M29 16l6-4v16l-6-4V16Z" fill="white"/>
        </svg>
        <span className="text-[18px] font-semibold text-text-on-light tracking-tight">Zoom</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {items.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => {
              onChange(id);
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active === id
                ? "bg-zoom-blue-light text-zoom-blue"
                : "text-text-label hover:bg-portal-hover hover:text-text-on-light"
            }`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="px-3 pb-4 space-y-0.5">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-label hover:bg-portal-hover hover:text-text-on-light">
          <Settings className="h-[18px] w-[18px]" /> Settings
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-label hover:bg-portal-hover hover:text-text-on-light">
          <HelpCircle className="h-[18px] w-[18px]" /> Help
        </button>
      </div>
    </aside>
    </>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────
function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-portal-border bg-portal-sidebar px-3 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-label hover:bg-portal-hover md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative w-full max-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-label" />
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-lg bg-portal-bg py-1.5 pl-9 pr-3 text-sm text-text-on-light placeholder:text-text-label outline-none focus:ring-1 focus:ring-zoom-blue"
          />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-text-label hover:bg-portal-hover">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        {/* Default user avatar */}
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-zoom-blue text-xs font-semibold text-white select-none">
          AJ
        </div>
      </div>
    </header>
  );
}

// ─── Action Tiles (New Meeting / Join / Schedule) ─────────────────────────────
function ActionTiles({
  onNewMeeting,
  onJoin,
  onSchedule,
  starting,
}: {
  onNewMeeting: () => void;
  onJoin: () => void;
  onSchedule: () => void;
  starting: boolean;
}) {
  return (
    <div className="grid max-w-[444px] grid-cols-3 gap-3">
      <button
        onClick={onNewMeeting}
        disabled={starting}
        className="flex flex-col items-center gap-2.5 rounded-2xl bg-portal-card p-4 sm:p-5 w-full shadow-sm border border-portal-border hover:shadow-md transition-shadow disabled:opacity-60"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ff6b35]">
          <Video className="h-7 w-7 text-white" strokeWidth={2} />
        </span>
        <span className="text-[13px] font-medium text-text-on-light">
          {starting ? "Starting…" : "New Meeting"}
        </span>
      </button>

      <button
        onClick={onJoin}
        className="flex flex-col items-center gap-2.5 rounded-2xl bg-portal-card p-4 sm:p-5 w-full shadow-sm border border-portal-border hover:shadow-md transition-shadow"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zoom-blue">
          <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
        </span>
        <span className="text-[13px] font-medium text-text-on-light">Join</span>
      </button>

      <button
        onClick={onSchedule}
        className="flex flex-col items-center gap-2.5 rounded-2xl bg-portal-card p-4 sm:p-5 w-full shadow-sm border border-portal-border hover:shadow-md transition-shadow"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zoom-blue">
          <Calendar className="h-7 w-7 text-white" strokeWidth={1.8} />
        </span>
        <span className="text-[13px] font-medium text-text-on-light">Schedule</span>
      </button>
    </div>
  );
}

// ─── Upcoming Meeting Card ────────────────────────────────────────────────────
function UpcomingCard({
  meeting,
  onStart,
  onCopyLink,
  onDelete,
}: {
  meeting: Meeting;
  onStart: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <div className="group flex flex-col gap-3 rounded-xl bg-portal-card px-4 py-3.5 shadow-sm border border-portal-border sm:flex-row sm:items-center sm:justify-between">
      {/* Left: time bar */}
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex w-16 shrink-0 flex-col items-center rounded-lg border border-portal-border bg-portal-bg py-1.5 text-center">
          <span className="text-[11px] font-medium uppercase text-text-label">
            {new Date(meeting.scheduled_at!).toLocaleDateString([], { month: "short" })}
          </span>
          <span className="text-xl font-bold text-text-on-light leading-tight">
            {new Date(meeting.scheduled_at!).getDate()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-text-on-light">{meeting.title}</p>
          <p className="mt-0.5 text-xs text-text-label">
            {formatMeetingTime(meeting.scheduled_at!)} · {meeting.duration ?? 60} min
          </p>
          <p className="mt-0.5 text-xs text-text-label">
            Meeting ID: <span className="font-mono">{meeting.id}</span>
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className={`flex shrink-0 items-center gap-2 transition-opacity ${REVEAL_ON_HOVER}`}>
        <button
          onClick={onCopyLink}
          title="Copy invite link"
          className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-portal-border px-2.5 text-xs font-medium text-text-label hover:bg-portal-hover"
        >
          <Link2 className="h-3.5 w-3.5" /> Copy Link
        </button>
        <button
          onClick={onStart}
          className="rounded-lg bg-zoom-blue px-4 py-1.5 text-xs font-semibold text-white hover:bg-zoom-blue-hover"
        >
          Start
        </button>
        <div className="relative">
          <button
            onClick={() => setMenu(v => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-label hover:bg-portal-hover"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl bg-portal-card shadow-lg border border-portal-border py-1">
                <button
                  onClick={() => { setMenu(false); onDelete(); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-leave hover:bg-portal-hover"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Recent Meeting Row ───────────────────────────────────────────────────────
function RecentRow({ meeting }: { meeting: RecentMeeting }) {
  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl bg-portal-card px-4 py-3 border border-portal-border">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zoom-blue-light text-zoom-blue">
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-on-light">{meeting.title}</p>
          <p className="text-xs text-text-label">
            {formatRelative(meeting.ended_at)}
            {meeting.duration_minutes ? ` · ${meeting.duration_minutes} min` : ""}
            {" · "}ID: <span className="font-mono">{meeting.meeting_id}</span>
          </p>
        </div>
      </div>
      <button
        onClick={() => copyText(`${window.location.origin}/meeting/${meeting.meeting_id}`)}
        className={`flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-portal-border px-2 text-xs text-text-label hover:bg-portal-hover transition-opacity ${REVEAL_ON_HOVER}`}
      >
        <Copy className="h-3.5 w-3.5" /> Copy Link
      </button>
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────
function HomeTab({
  upcoming,
  recent,
  onNewMeeting,
  onJoin,
  onSchedule,
  onStart,
  onDelete,
  starting,
}: {
  upcoming: Meeting[];
  recent: RecentMeeting[];
  onNewMeeting: () => void;
  onJoin: () => void;
  onSchedule: () => void;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  starting: boolean;
}) {
  const now = useClock();

  const time = now?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "";
  const date = now?.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }) ?? "";

  return (
    <div className="space-y-8">
      {/* Clock + actions */}
      <div>
        <div className="mb-6">
          <p className="text-sm text-text-label">{date}</p>
          <p className="text-5xl font-light tabular-nums text-text-on-light">{time}</p>
        </div>
        <ActionTiles
          onNewMeeting={onNewMeeting}
          onJoin={onJoin}
          onSchedule={onSchedule}
          starting={starting}
        />
      </div>

      {/* Upcoming today/soon */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-text-label">
            Upcoming Meetings
          </h2>
          <div className="space-y-2">
            {upcoming.slice(0, 3).map(m => (
              <UpcomingCard
                key={m.id}
                meeting={m}
                onStart={() => onStart(m.id)}
                onCopyLink={() => copyText(`${window.location.origin}/meeting/${m.id}`)}
                onDelete={() => onDelete(m.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <section>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-text-label">
            Recent Meetings
          </h2>
          <div className="space-y-2">
            {recent.slice(0, 3).map(r => (
              <RecentRow key={r.id} meeting={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Meetings Tab (full upcoming list) ────────────────────────────────────────
function MeetingsTab({
  upcoming,
  onStart,
  onDelete,
  onSchedule,
}: {
  upcoming: Meeting[];
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  onSchedule: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-text-on-light">Upcoming Meetings</h1>
        <button
          onClick={onSchedule}
          className="flex items-center gap-2 rounded-lg bg-zoom-blue px-4 py-2 text-sm font-semibold text-white hover:bg-zoom-blue-hover"
        >
          <Plus className="h-4 w-4" /> Schedule a Meeting
        </button>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-portal-border bg-portal-card py-16 text-center">
          <Calendar className="mb-3 h-10 w-10 text-text-label" />
          <p className="text-sm font-medium text-text-on-light">No upcoming meetings</p>
          <p className="mt-1 text-xs text-text-label">Click &quot;Schedule a Meeting&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map(m => (
            <UpcomingCard
              key={m.id}
              meeting={m}
              onStart={() => onStart(m.id)}
              onCopyLink={() => copyText(`${window.location.origin}/meeting/${m.id}`)}
              onDelete={() => onDelete(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ recent }: { recent: RecentMeeting[] }) {
  return (
    <div>
      <h1 className="mb-5 text-xl font-semibold text-text-on-light">Meeting History</h1>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-portal-border bg-portal-card py-16 text-center">
          <History className="mb-3 h-10 w-10 text-text-label" />
          <p className="text-sm font-medium text-text-on-light">No meeting history</p>
          <p className="mt-1 text-xs text-text-label">Meetings you attend will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map(r => (
            <RecentRow key={r.id} meeting={r} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onDismiss }: { msg: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-[#1a1a2e] px-5 py-3 text-sm text-white shadow-xl">
      <span>{msg}</span>
      <button onClick={onDismiss} className="text-white/60 hover:text-white">✕</button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [recent, setRecent] = useState<RecentMeeting[]>([]);
  const [starting, setStarting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchData = useCallback(async () => {
    const [upcomingMeetings, recentMeetings] = await Promise.all([
      api.listUpcoming().catch(() => null),
      api.listRecent().catch(() => null),
    ]);
    if (upcomingMeetings) setUpcoming(upcomingMeetings);
    if (recentMeetings) setRecent(recentMeetings);
    if (!upcomingMeetings || !recentMeetings) {
      showToast("Couldn't load your meetings. Is the server running?");
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
    // Check for toast from meeting leave
    const msg = sessionStorage.getItem("zoom_toast");
    if (msg) { showToast(msg); sessionStorage.removeItem("zoom_toast"); }
  }, [fetchData, showToast]);

  async function handleNewMeeting() {
    setStarting(true);
    try {
      const meeting = await api.createInstantMeeting();
      // Remember we created it, so we join as its host.
      saveHostToken(meeting.id, meeting.host_token);
      router.push(`/meeting/${meeting.id}`);
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't start a meeting. Please try again."));
      setStarting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteMeeting(id, getHostToken(id));
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't delete the meeting."));
      return;
    }
    removeHostToken(id);
    setUpcoming(prev => prev.filter(m => m.id !== id));
    showToast("Meeting deleted.");
  }

  return (
    <div className="flex h-screen bg-portal-bg">
      <Sidebar active={tab} onChange={setTab} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onMenu={() => setMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
          <div className="mx-auto max-w-2xl">
            {tab === "home" && (
              <HomeTab
                upcoming={upcoming}
                recent={recent}
                onNewMeeting={handleNewMeeting}
                onJoin={() => router.push("/join")}
                onSchedule={() => router.push("/schedule")}
                onStart={id => router.push(`/meeting/${id}`)}
                onDelete={handleDelete}
                starting={starting}
              />
            )}
            {tab === "meetings" && (
              <MeetingsTab
                upcoming={upcoming}
                onStart={id => router.push(`/meeting/${id}`)}
                onDelete={handleDelete}
                onSchedule={() => router.push("/schedule")}
              />
            )}
            {tab === "history" && <HistoryTab recent={recent} />}
          </div>
        </main>
      </div>

      {toast && <Toast msg={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
