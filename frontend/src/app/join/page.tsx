"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, ChevronLeft, Copy, Check } from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export default function JoinPage() {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimId = meetingId.trim();
    if (!trimId || !displayName.trim()) return;
    setLoading(true);
    setError("");

    try {
      await axios.get(`${API_BASE}/meetings/${trimId}`);
      sessionStorage.setItem("zoom_display_name", displayName.trim());
      router.push(`/meeting/${trimId}`);
    } catch {
      setError("Meeting not found. Check the ID and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-portal-bg px-4">
      <div className="w-full max-w-sm">
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
          <h1 className="mb-6 text-center text-xl font-semibold text-text-on-light">
            Join a Meeting
          </h1>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-on-light">
                Meeting ID or Link
              </label>
              <input
                type="text"
                value={meetingId}
                onChange={e => setMeetingId(e.target.value)}
                placeholder="Enter Meeting ID"
                className="w-full rounded-lg border border-portal-border bg-portal-bg px-3.5 py-2.5 text-sm text-text-on-light placeholder:text-text-label outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-on-light">
                Your Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-portal-border bg-portal-bg px-3.5 py-2.5 text-sm text-text-on-light placeholder:text-text-label outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={!meetingId.trim() || !displayName.trim() || loading}
              className="mt-2 w-full rounded-lg bg-zoom-blue py-2.5 text-sm font-semibold text-white hover:bg-zoom-blue-hover disabled:opacity-50 transition-colors"
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </form>

          <button
            onClick={() => router.push("/")}
            className="mt-4 flex w-full items-center justify-center gap-1 text-sm text-text-label hover:text-text-on-light"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
