import axios, { isAxiosError } from "axios";
import { API_BASE } from "./config";
import type {
  CreatedMeeting,
  JoinResult,
  MediaCredentials,
  Meeting,
  RecentMeeting,
  ScheduleInput,
} from "./types";

const http = axios.create({ baseURL: API_BASE, timeout: 15_000 });

const hostHeaders = (hostToken: string | null) =>
  hostToken ? { "X-Host-Token": hostToken } : undefined;

/** Best human-readable message from a failed request. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (!err.response) return "Can't reach the server. Check your connection and try again.";
  }
  return fallback;
}

export function isNotFound(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 404;
}

export const api = {
  createInstantMeeting: () =>
    http.post<CreatedMeeting>("/meetings/instant").then((r) => r.data),

  scheduleMeeting: (input: ScheduleInput) =>
    http.post<CreatedMeeting>("/meetings/schedule", input).then((r) => r.data),

  getMeeting: (id: string) => http.get<Meeting>(`/meetings/${id}`).then((r) => r.data),

  listUpcoming: () => http.get<Meeting[]>("/meetings/upcoming").then((r) => r.data),

  listRecent: () => http.get<RecentMeeting[]>("/meetings/recent").then((r) => r.data),

  joinMeeting: (id: string, displayName: string, hostToken: string | null) =>
    http
      .post<JoinResult>(`/meetings/${id}/join`, {
        display_name: displayName,
        host_token: hostToken,
      })
      .then((r) => r.data),

  claimToken: (id: string, participantId: number, sessionKey: string) =>
    http
      .post<MediaCredentials>(`/meetings/${id}/participants/${participantId}/token`, {
        session_key: sessionKey,
      })
      .then((r) => r.data),

  leaveMeeting: (id: string, participantId: number, sessionKey: string) =>
    http
      .post(`/meetings/${id}/leave`, { participant_id: participantId, session_key: sessionKey })
      .then(() => undefined),

  endMeeting: (id: string, hostToken: string | null) =>
    http
      .post(`/meetings/${id}/end`, {}, { headers: hostHeaders(hostToken) })
      .then(() => undefined),

  deleteMeeting: (id: string, hostToken: string | null) =>
    http
      .delete(`/meetings/${id}`, { headers: hostHeaders(hostToken) })
      .then(() => undefined),
};
