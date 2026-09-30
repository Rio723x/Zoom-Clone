"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { WS_BASE } from "@/lib/config";
import {
  CLOSE_REPLACED,
  CLOSE_UNAUTHORIZED,
  type ClientEvent,
  type ServerEvent,
} from "@/lib/socketEvents";
import { initialRoomState, roomReducer, type RoomState } from "./roomState";

const MAX_RECONNECT_ATTEMPTS = 8;
const backoffMs = (attempt: number) => Math.min(1000 * 2 ** attempt, 10_000);

/** What the meeting UI receives: live room state plus a way to talk to the server. */
export interface MeetingSocket {
  room: RoomState;
  send: (event: ClientEvent) => boolean;
}

/** Events that don't change room state; the caller reacts to them directly. */
export interface TransientHandlers {
  onReaction?: (participantId: number, emoji: string) => void;
  onError?: (code: string) => void;
}

interface Options extends TransientHandlers {
  meetingId: string;
  participantId: number;
  sessionKey: string;
}

/**
 * Realtime channel to the FastAPI backend: presence, chat, polls, reactions and host
 * controls. Reconnects with backoff after a dropped connection; each reconnect is
 * re-synced by the server's `state` snapshot.
 */
export function useMeetingSocket({
  meetingId,
  participantId,
  sessionKey,
  onReaction,
  onError,
}: Options): MeetingSocket {
  const [room, dispatch] = useReducer(roomReducer, initialRoomState);
  const socketRef = useRef<WebSocket | null>(null);

  // Handlers change every render; keep the latest in a ref so they never force a reconnect.
  const handlersRef = useRef<TransientHandlers>({});
  useEffect(() => {
    handlersRef.current = { onReaction, onError };
  });

  useEffect(() => {
    let disposed = false;
    let terminal = false; // server told us we're out (removed, denied, meeting ended)
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      const query = new URLSearchParams({
        participant_id: String(participantId),
        key: sessionKey,
      });
      const ws = new WebSocket(`${WS_BASE}/ws/${meetingId}?${query}`);
      socketRef.current = ws;

      ws.onopen = () => {
        attempt = 0;
      };

      ws.onmessage = (message) => {
        let event: ServerEvent;
        try {
          event = JSON.parse(message.data) as ServerEvent;
        } catch {
          return;
        }
        if (event.type === "denied" || event.type === "removed" || event.type === "meeting-ended") {
          terminal = true;
        }
        if (event.type === "reaction") handlersRef.current.onReaction?.(event.participant_id, event.emoji);
        else if (event.type === "error") handlersRef.current.onError?.(event.code);
        dispatch(event);
      };

      ws.onclose = (closeEvent) => {
        if (socketRef.current === ws) socketRef.current = null;
        if (disposed || terminal) return;
        if (closeEvent.code === CLOSE_UNAUTHORIZED) {
          return dispatch({ type: "closed", reason: "rejected" });
        }
        if (closeEvent.code === CLOSE_REPLACED) {
          return dispatch({ type: "closed", reason: "replaced" });
        }
        if (attempt >= MAX_RECONNECT_ATTEMPTS) {
          return dispatch({ type: "closed", reason: "connection-lost" });
        }
        dispatch({ type: "reconnecting" });
        retryTimer = setTimeout(connect, backoffMs(attempt++));
      };
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [meetingId, participantId, sessionKey]);

  const send = useCallback((event: ClientEvent) => {
    const ws = socketRef.current;
    if (ws?.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(event));
    return true;
  }, []);

  return { room, send };
}
